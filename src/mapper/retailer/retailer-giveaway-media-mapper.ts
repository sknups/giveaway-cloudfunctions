
import {ImageMediaUrlsDto, RetailerGiveawayMediaDto} from '../../dto/retailer/retailer-giveaway-media.dto';
import {GiveawayEntity} from '../../entity/giveaway.entity';
import {GiveawayConfig, parseConfig} from '../giveaway-config-json-parser';

function _getImageBlock(baseUrl: string): ImageMediaUrlsDto {
    return {
        jpeg: `${baseUrl}.jpg`,
        png: `${baseUrl}.png`,
        webp: `${baseUrl}.webp`,
    }
}

export class RetailerGiveawayMediaMapper {

    constructor(private readonly flexHost: string) {}

    toDTO(entity: GiveawayEntity): RetailerGiveawayMediaDto {
        const config: GiveawayConfig = parseConfig(entity.config);
        const skuCode: string = config.skuEntries[0].code;

        return {
            social: {
                default: {
                    image: _getImageBlock(`${this.flexHost}/sku/v1/card/og/${skuCode}`),
                },
                snapchat: {
                    image: _getImageBlock(`${this.flexHost}/sku/v1/card/snapsticker/${skuCode}`),
                },
            }
        };

    }

}
