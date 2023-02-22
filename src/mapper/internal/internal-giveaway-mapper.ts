import { AbstractGiveawayMapper } from '../giveaway-mapper';
import { InternalGiveawayDto } from '../../dto/internal/internal-giveaway.dto';
import { GiveawayDto } from '../../dto/giveaway.dto';
import { GiveawayEntity } from '../../entity/giveaway.entity';
import { GiveawayState } from '../../dto/giveaway-state.dto';
import { GiveawayType } from '../../dto/giveaway-type.dto';

export class InternalGiveawayMapper extends AbstractGiveawayMapper<InternalGiveawayDto> {

     toDtoFromBaseDto(entity: GiveawayEntity, baseDto: GiveawayDto): Promise<InternalGiveawayDto> {
 
        const state = GiveawayState[entity.state];
    
        return Promise.resolve({
          ...baseDto,
          key: entity.code,
          type: GiveawayType[entity.type],
          state,
          config: entity.config,
          publicKey: entity.publicKey,
          version: entity.version
        })
    }

}
