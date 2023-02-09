import { RetailerGiveawayDto } from '../src/dto/retailer/retailer-giveaway.dto';

const GIVEAWAY_V2: RetailerGiveawayDto = {
    "title": "123456789 SKNUPS Giveaway",
    "description": "Amazing SKNUPS Giveaway Description",
    "media": {
        "social": {
            "default": {
                "image": {
                    "jpeg": "https://flex-dev.sknups.com/sku/v1/card/og/SKU-123456789.jpg",
                    "png": "https://flex-dev.sknups.com/sku/v1/card/og/SKU-123456789.png",
                    "webp": "https://flex-dev.sknups.com/sku/v1/card/og/SKU-123456789.webp"
                }
            },
            "snapchat": {
                "image": {
                    "jpeg": "https://flex-dev.sknups.com/sku/v1/card/snapsticker/SKU-123456789.jpg",
                    "png": "https://flex-dev.sknups.com/sku/v1/card/snapsticker/SKU-123456789.png",
                    "webp": "https://flex-dev.sknups.com/sku/v1/card/snapsticker/SKU-123456789.webp"
                }
            }
        }
    }
};

export const TEST_DTOS = {
    v2: {
        retailer: GIVEAWAY_V2
    }
}
