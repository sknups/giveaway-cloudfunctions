import { Request } from '@google-cloud/functions-framework';
import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { CreateClaimRequestDto } from '../dto/create-claim-request.dto';
import { GiveawayEntity } from '../entity/giveaway.entity';
import { saveEntity } from '../helpers/datastore/datastore.helper';
import logger from '../helpers/logger';
import { parseAndValidateRequestData } from '../helpers/validation';
import { ALL_SKUS_OUT_OF_STOCK, AppError, ENTITY_NOT_FOUND, ITEM_MANUFACTURE_ERROR, LIMIT_REACHED, V1_NOT_SUPPORTED, V2_NOT_SUPPORTED } from '../app.errors';
import { GiveawayConfig, parseConfig } from '../mapper/giveaway-config-json-parser';
import { ClaimEntity } from '../entity/claim.entity';
import { createItem, getItemForRetailer, ItemDto } from '../client/item.client';
import { AllConfig } from '../config/all-config';
import { DropLinkData } from '../helpers/drop-links';
import { decodeClaimV1, decodeClaimV2, sortFortuneSkus } from '../helpers/giveaway';
import { GiveawayRepository } from '../persistence/giveaway-repository';
import { ClaimRepository } from '../persistence/claim-repository';

export class CreateClaim {

  public static giveawayRepository = new GiveawayRepository();
  public static claimRepository = new ClaimRepository();

  public static async handler(req: Request, res: Response, config: AllConfig): Promise<void> {
    if (req.method != 'POST') {
      res.status(StatusCodes.METHOD_NOT_ALLOWED).send(`${req.method} not allowed`);
      return;
    }

    const requestDto: CreateClaimRequestDto = await parseAndValidateRequestData(CreateClaimRequestDto, req);

    /**
     * Attempt to auto detect whether a v1 or v2 giveaway is being claimed.
     * 
     * A lucu (v1) is typically VERY long, much longer than 100 characters.
     * A claim code (v2) is typically reasonably short, much less than 100 characters.
     * 
     * Current expectation for v2 length is that it will be 26 characters or lower.
     **/
    const isLucu = requestDto.claim.length > 100;

    logger.debug(`Received ${isLucu ? 'v1' : 'v2'} request for claim-create for giveaway ${requestDto.giveaway}`);

    // Retrieve giveaway data
    const giveaway: GiveawayEntity | null = await CreateClaim.giveawayRepository.byCode(requestDto.giveaway);

    if (!giveaway || giveaway.state != 'ACTIVE') {
      throw new AppError(ENTITY_NOT_FOUND('giveaway', requestDto.giveaway));
    }

    // parse/verify claim
    let dropLinkData: DropLinkData;
    if (isLucu) {
      if (!giveaway.publicKey) {
        throw new AppError(V1_NOT_SUPPORTED(requestDto.giveaway));
      }

      dropLinkData = await decodeClaimV1(requestDto.giveaway, requestDto.claim, giveaway.publicKey);
    } else {
      if (!giveaway.secret) {
        throw new AppError(V2_NOT_SUPPORTED(requestDto.giveaway));
      }

      dropLinkData = await decodeClaimV2(requestDto.giveaway, requestDto.claim, giveaway.secret);
    }

    logger.debug(`Processing claim with identifier ${dropLinkData.identifier}`);

    // Look for existing claim
    const result = await CreateClaim.claimRepository.findExisting(dropLinkData.identifier,requestDto.giveaway,requestDto.user);

    if (result !=null) {
      const item = await getItemForRetailer(
        config,
        'SKN', //We don't know which platform. 
        result.code
      );

      res.status(StatusCodes.OK).json(item);
      return;
    }

    // Check claim limit not exceeded
    if (dropLinkData.limit) {
      const count = await CreateClaim.claimRepository.count(dropLinkData.identifier,requestDto.giveaway)

      if (count >= dropLinkData.limit) {
        throw new AppError(LIMIT_REACHED(dropLinkData.limit, requestDto.giveaway, dropLinkData.identifier));
      }
    }

    // determine sku order
    const giveawayConfig: GiveawayConfig = parseConfig(giveaway.config);

    let skus: string[];

    switch (giveaway.type) {
      case 'SIMPLE':
        skus = giveawayConfig.skuEntries.map(sku => sku.code);
        break;
      case 'FORTUNE':
        skus = sortFortuneSkus(giveawayConfig.skuEntries);
        break;
      default:
        throw new Error(`Unsupported giveaway type: ${giveaway.type}`);
    }

    // Manufacture item
    let item: ItemDto | null = null;

    for (let i = 0; i < skus.length && !item; i++) {
      const sku = skus[i];

      try {
        item = await createItem(
          {
            giveaway: requestDto.giveaway,
            sku,
            user: requestDto.user,
          },
          config,
        );
      } catch (e) {
        const isOutOfStockError = e.response?.data?.code == 'ITEM_00008'; //SKU_OUT_OF_STOCK
        if (isOutOfStockError) {
          if (i == skus.length - 1) {
            logger.info(`${sku} is out of stock, no more SKUs to try`);
          } else {
            logger.debug(`${sku} is out of stock, retrying with next SKU`);
          }
        } else {
          throw new AppError(ITEM_MANUFACTURE_ERROR(requestDto.giveaway, sku), e);
        }
      }
    }

    if (!item) {
      throw new AppError(ALL_SKUS_OUT_OF_STOCK(requestDto.giveaway));
    }

    logger.debug(`Manufactured item ${item.token} from ${item.sku} for giveaway ${requestDto.giveaway} and claim identifier ${dropLinkData.identifier}`);

    // Register claim
    const claim: ClaimEntity = {
      code: item.token,
      dropLinkIdentifier: dropLinkData.identifier,
      giveawayCode: requestDto.giveaway,
      user: requestDto.user,
    };

    await saveEntity('claim', claim);

    // Return data
    res.status(StatusCodes.CREATED).json(item);
  }
}
