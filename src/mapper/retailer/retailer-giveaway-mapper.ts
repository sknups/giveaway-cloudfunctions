import { GiveawayDto } from '../../dto/giveaway.dto';
import { RetailerGiveawayMediaMapper } from './retailer-giveaway-media-mapper';
import { GiveawayEntity } from '../../entity/giveaway.entity';
import { RetailerGiveawayDto } from '../../dto/retailer/retailer-giveaway.dto';
import { AbstractGiveawayMapper } from '../giveaway-mapper';

export class RetailerGiveawayMapper extends AbstractGiveawayMapper<RetailerGiveawayDto> {

    private mediaMapper: RetailerGiveawayMediaMapper;

    constructor(private readonly flexHost: string) {
        super();
        this.mediaMapper = new RetailerGiveawayMediaMapper(flexHost);
    }

    protected toDtoFromBaseDto(entity: GiveawayEntity, baseDto: GiveawayDto): Promise<RetailerGiveawayDto> {

        return Promise.resolve({
            ...baseDto,
            media: this.mediaMapper.toDTO(entity)
        });

    }

}
