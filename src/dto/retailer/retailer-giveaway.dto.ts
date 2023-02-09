import { GiveawayDto } from '../giveaway.dto';
import { RetailerGiveawayMediaDto } from './retailer-giveaway-media.dto';

/**
 * Extension of GiveawayDto to provide additional fields for retailer consumption.
 *
 * This is intended to be exposed to retailers.
 */

export class RetailerGiveawayDto extends GiveawayDto {

    media: RetailerGiveawayMediaDto;
}
