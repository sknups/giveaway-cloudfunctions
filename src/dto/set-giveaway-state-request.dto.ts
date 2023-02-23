import { IsEnum, IsNotEmpty } from 'class-validator';
import { GiveawayState } from './giveaway-state.dto';

export class SetGiveawayStateRequestDto {

    @IsEnum(GiveawayState)
    @IsNotEmpty()
    public readonly state: GiveawayState;
}

