import { AppError, CLAIM_CODE_DECODE_ERROR, LUCU_DECODE_ERROR } from '../app.errors';
import { SkuEntry } from '../mapper/giveaway-config-json-parser';
const droplinksLegacy = import('@sknups/drop-links-legacy');
const droplinks = import('@sknups/drop-links');

/**
 * Given a list of weighted SKU, sorts them randomly with a bias towards the weight.
 * 
 * This logic replicates the Java claim-service.
 * See: https://github.com/sknups/claim-service/blob/00b67e28819ee13d9fa3b62e70964f9f2ecaa66b/claim-service-impl/src/main/java/com/sknups/claim/api/service/FortuneSkuAllocator.java
 * 
 * @param skuEntries a list of weighted SKU
 * @param randomProvider a function to generate a random number from 0 to less than 1. Defaults to Math.random().
 * @returns an ordered list of sku codes taken from the supplied skuEntries
 */
export function sortFortuneSkus(
  skuEntries: SkuEntry[],
  randomProvider = () => Math.random(),
): string[] {

  if (skuEntries.length == 1) {

    // Only 1 SKU, just return it 
    return [skuEntries[0].code];

  } else {

    const result: string[] = [];

    const sorted = [...skuEntries].sort((a, b) => (a.weight || 1) - (b.weight || 1));

    while (sorted.length > 0) {
      const total = sorted.reduce((prev, curr) => prev + (curr.weight || 1), 0);
      let random = Math.floor(randomProvider() * total);
      for (let i = 0; i < sorted.length; i++) {
        const candidate = sorted[i];
        if (random < (candidate.weight || 1)) {
          result.push(candidate.code);
          sorted.splice(i, 1);
          break;
        } else {
          random -= (candidate.weight || 1);
        }
      }
    }

    return result;

  }

}

export type DropLinkData = {

  identifier: string,
  limit?: number,

}

/**
 * Function used to decode a claim.
 * 
 * Accepts the following arguments:
 *   - giveaway: the unique giveaway code
 *   - claim: the claim code containing the encoded claim data
 *   - key: the key required to decode and verify the claim code
 * 
 * Returns the decoded claim data.
 */
export type ClaimDecoder = (
  giveaway: string,
  claim: string,
  key: string,
) => Promise<DropLinkData>;

/**
 * Decodes a v1 drop link (lucu).
 */
export const decodeClaimV1: ClaimDecoder = async (giveaway, lucu, key) => {

  const lib = await droplinksLegacy;

  try {
    const decodedClaim = lib.LegacyDropLinks.decode(giveaway, key, lucu);

    const result: DropLinkData = { identifier: decodedClaim.identifier };

    if (decodedClaim instanceof lib.LimitedLegacyDropLink) {
      result.limit = decodedClaim.limit;
    }

    return result;
  } catch (e) {
    throw new AppError(LUCU_DECODE_ERROR(e.message), e);
  }

};

/**
 * Decodes a v2 drop link (claim code).
 */
export const decodeClaimV2: ClaimDecoder = async (giveaway, claim, key) => {

  const lib = await droplinks;

  try {
    const decodedClaim = lib.DropLinks.decode(giveaway, claim, key);

    let result: DropLinkData;

    const hexIdentifier = decodedClaim.identifier.toString(16);

    if (decodedClaim instanceof lib.UnrestrictedDropLink) {
      result = {
        identifier: `unrestricted-${hexIdentifier}`,
      }
    } else {
      result = {
        identifier: `limited-${hexIdentifier.padStart(5, '0')}`,
        limit: decodedClaim.limit,
      }
    }

    return result;
  } catch (e) {
    throw new AppError(CLAIM_CODE_DECODE_ERROR(claim, e.message), e);
  }

};
