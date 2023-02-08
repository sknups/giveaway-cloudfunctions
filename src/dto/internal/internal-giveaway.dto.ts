import { GiveawayDto } from '../giveaway.dto';

/**
 * Extension of GiveawayDto to provide additional fields for internal consumption.
 *
 * This is intended to be exposed to other internal SKNUPS services.
 *
 * It MUST NOT be exposed to retailers over retailer API.
 */

export class InternalGiveawayDto extends GiveawayDto {

}
