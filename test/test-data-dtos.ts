import { RetailerGiveawayDto } from '../src/dto/retailer/retailer-giveaway.dto';

const TEST_GIVEAWAY_RETAILER: RetailerGiveawayDto = {
  "title": "SKNUPS Giveaway",
  "description": "Claim your free SKN now",
  "media": {
    "social": {
      "default": {
        "image": {
          "jpeg": "https://flex-dev.sknups.com/sku/v1/card/og/TEST-TETRAHEDRON-GIVEAWAY.jpg",
          "png": "https://flex-dev.sknups.com/sku/v1/card/og/TEST-TETRAHEDRON-GIVEAWAY.png",
          "webp": "https://flex-dev.sknups.com/sku/v1/card/og/TEST-TETRAHEDRON-GIVEAWAY.webp"
        }
      },
      "snapchat": {
        "image": {
          "jpeg": "https://flex-dev.sknups.com/sku/v1/card/snapsticker/TEST-TETRAHEDRON-GIVEAWAY.jpg",
          "png": "https://flex-dev.sknups.com/sku/v1/card/snapsticker/TEST-TETRAHEDRON-GIVEAWAY.png",
          "webp": "https://flex-dev.sknups.com/sku/v1/card/snapsticker/TEST-TETRAHEDRON-GIVEAWAY.webp"
        }
      }
    }
  }
};

export const TEST_DTOS = {
  giveaway: {
    retailer: {
      'test-giveaway': TEST_GIVEAWAY_RETAILER,
    }
  }
}
