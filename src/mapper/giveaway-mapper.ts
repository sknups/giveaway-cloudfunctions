import { GiveawayDto } from '../dto/giveaway.dto';
import { GiveawayEntity } from '../entity/giveaway.entity';

export abstract class AbstractGiveawayMapper<T extends GiveawayDto> {

    public toDto(entity: GiveawayEntity): T {

        const baseDto: GiveawayDto = this.toBaseDto(entity);

        return this.toDtoFromBaseDto(entity, baseDto);

    }

    protected abstract toDtoFromBaseDto(entity: GiveawayEntity, baseDto: GiveawayDto): T;

    private toBaseDto(entity: GiveawayEntity): GiveawayDto {

        return {
            title: entity.title,
            description: entity.description
        };

    }

}
