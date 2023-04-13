/**
 * See: https://sknups.atlassian.net/browse/PLATFORM-3657
 *
 * This helper exists to ensure the drop links libraries are loaded dynamically exactly ONCE.
 *
 * Until we migrate cloud functions to be ESM modules they can only load other ESM modules in this way.
 *
 * Unfortunately, jest only supports ESM with some experimental flags and has a tedency to crash.
 * It will rash with error: Segmentation fault (core dumped)
 *
 * This is a widley reported issue. Some claim using --maxWorkers=1 helps, but it does not appear reliable.
 *
 * If you look here, different users are reporting different "fixes": https://github.com/facebook/jest/issues/10662
 *
 * The current theory is that loading the same library twice can cause issues.
 * Some users have reported the problem is due to a bug in the V8 javascript engine: https://bugs.chromium.org/p/v8/issues/detail?id=10284
 *
 * Prior to this helper the library would be loaded by jest
 *   - In the actual cloud function
 *   - By the test itself
 *
 * This sometimes, but not always, would cause the above error.
 *
 * Limited testing suggests only accessing the ESM modules through this helper resolves the issue.
 */
const droplinksLegacy = import('@sknups/drop-links-legacy');
const droplinks = import('@sknups/drop-links');

export type DropLinkData = {

  identifier: string,
  limit?: number,

}

export async function decode(giveaway: string, claim: string, key: string): Promise<DropLinkData> {

  const lib = await droplinks;
  const dropLink = lib.DropLinks.decode(giveaway, claim, key);

  let result: DropLinkData;


  if (dropLink instanceof lib.UnrestrictedDropLink) {
    if (dropLink.identifier === 0) {
      // So strong is our assumption that a campaign will have at most one Unlimited Drop Link,
      // we special case the serialized Drop Link Identifier to not have a suffix.
      return {
        identifier: 'unrestricted',
      }
    } else {
      // Technically, a campaign could have multiple Unlimited Drop Links.
      // The data structure of a Unlimited Drop Link allocates 4 bits for an identifier.
      // However, we don't advertise this possibility - it's just future-proofing.
      // This might remain a dead code path.
      const hex = dropLink.identifier.toString(16);
      result = {
        identifier: `unrestricted-${hex}`,
      }
    }
  } else {
    const hex = dropLink.identifier.toString(16);
    result = {
      identifier: `limited-${hex.padStart(5, '0')}`,
      limit: dropLink.limit,
    }
  }

  return result;

}

export async function createUnrestrictedDropLink(key: string, giveaway: string, identifier?: number): Promise<string> {

  const lib = await droplinks;
  const dropLink = lib.DropLinks.createUnrestrictedDropLink(key, giveaway, identifier);

  return dropLink.claim;

}

export async function createLimitedDropLink(key: string, giveaway: string, identifier: number | undefined, limit: number): Promise<string> {

  const lib = await droplinks;
  const dropLink = lib.DropLinks.createLimitedDropLink(key, giveaway, identifier, limit);

  return dropLink.claim;

}

export async function decodeLegacy(giveaway: string, key: string, lucu: string): Promise<DropLinkData> {

  const lib = await droplinksLegacy;
  const dropLink = lib.LegacyDropLinks.decode(giveaway, key, lucu);

  const result: DropLinkData = { identifier: dropLink.identifier };

  if (dropLink instanceof lib.LimitedLegacyDropLink) {
    result.limit = dropLink.limit;
  }

  return result;

}

export async function createUnrestrictedDropLinkLegacy(key: string, giveaway: string, identifier: string): Promise<string> {

  const lib = await droplinksLegacy;
  const dropLink = lib.LegacyDropLinks.createUnrestrictedDropLink(key, giveaway, identifier);

  return dropLink.lucu;

}

export async function createLimitedDropLinkLegacy(key: string, giveaway: string, identifier: string, limit: number): Promise<string> {

  const lib = await droplinksLegacy;
  const dropLink = lib.LegacyDropLinks.createLimitedDropLink(key, giveaway, identifier, limit);

  return dropLink.lucu;

}
