import { GiveawayState } from '../giveaway-state.dto';
import { GiveawayType } from '../giveaway-type.dto';
import { GiveawayDto } from '../giveaway.dto';

/**
 * Extension of GiveawayDto to provide additional fields for internal consumption.
 *
 * This is intended to be exposed to other internal SKNUPS services.
 *
 * It MUST NOT be exposed to retailers over retailer API.
 */

export class InternalGiveawayDto extends GiveawayDto {

    code: string;
    type: GiveawayType;
    state: GiveawayState;
    config: string;
    secret: string;

}
