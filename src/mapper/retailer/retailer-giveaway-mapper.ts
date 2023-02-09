import {GiveawayDto} from '../../dto/giveaway.dto';
import {RetailerGiveawayMediaMapper} from './retailer-giveaway-media-mapper';
import {AbstractGiveawayMapper} from '../giveaway-mapper';
import {GiveawayEntity} from '../../entity/giveaway.entity';
import {RetailerGiveawayDto} from '../../dto/retailer/retailer-giveaway.dto';

export class RetailerGiveawayMapper extends AbstractGiveawayMapper<RetailerGiveawayDto> {

    private mediaMapper: RetailerGiveawayMediaMapper;

    constructor(private readonly flexHost: string) {
        super();
        this.mediaMapper = new RetailerGiveawayMediaMapper(flexHost);
    }

    protected toDtoFromBaseDto(entity: GiveawayEntity, baseDto: GiveawayDto): RetailerGiveawayDto {

        return {
            ...baseDto,
            media: this.mediaMapper.toDTO(entity)
        };

    }

}
