import {AbstractGiveawayMapper} from '../giveaway-mapper';
import {InternalGiveawayDto} from '../../dto/internal/internal-giveaway.dto';
import {GiveawayDto} from '../../dto/giveaway.dto';
import {GiveawayEntity} from '../../entity/giveaway.entity';

export class InternalGiveawayMapper extends AbstractGiveawayMapper<InternalGiveawayDto> {

    protected toDtoFromBaseDto(entity: GiveawayEntity, baseDto: GiveawayDto): InternalGiveawayDto {
        return baseDto;
    }

}
