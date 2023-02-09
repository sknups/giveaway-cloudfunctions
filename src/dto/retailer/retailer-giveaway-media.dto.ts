/**
 * The giveaway media exposed to retailers.
 *
 * This is built from the first sku code stored in the giveaway's config skuEntries property stored in datastore.
 */
export class RetailerGiveawayMediaDto {

    /**
     * Links to social media, used in metadata tags for unfurling.
     *
     * Supports images.
     */
    social: SocialMediaDto;

}

/**
 * Links to image media for different image/ mime types.
 *
 * It is assumed that we always publish the same set of file types.
 */
export class ImageMediaUrlsDto {

    jpeg: string;

    png: string;

    webp: string;

}


export class SocialMediaDto {

    default: {
        image: ImageMediaUrlsDto
    };

    snapchat: {
        image: ImageMediaUrlsDto
    };

}
