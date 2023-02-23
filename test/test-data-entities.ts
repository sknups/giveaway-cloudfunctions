import { GiveawayEntity } from '../src/entity/giveaway.entity';

const GIVEAWAY_V2: GiveawayEntity = {
    "code": "GIVEAWAY-123456789",
    "title": "123456789 SKNUPS Giveaway",
    "description": "Amazing SKNUPS Giveaway Description",
    "type": "SIMPLE",
    "state": "ACTIVE",
    "config": "{\"skuEntries\":[{\"code\":\"SKU-123456789\",\"weight\":null}]}",
    "publicKey": "-----BEGIN PUBLIC KEY-----\n" +
        "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEArYbgztS/BDpFeoVHbfxJ\n" +
        "Dsuqfltk0B88uSNFpzrv+EtA7Q7CksDafr99aj+uv6Dhwa86p11fqi+CagElyCyn\n" +
        "JmEOjF4nw+cqQy3YjcLvVioZwExFDxk75NfajsdjajdndUNPBSgBdyw5UXJhnlBLlw4FnrD3um\n" +
        "o0sNQJIOlgOvGImkQYi8uvJPrHBeXdTjQOPLi9xQgDR64plxC0aPs3ngTCXWlLm1\n" +
        "CwIDAQAB\n" +
        "-----END PUBLIC KEY-----",
    "version": "2"
};

export const TEST_ENTITIES = {
    v2: GIVEAWAY_V2
}
