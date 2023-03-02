export type SkuEntry = {
    code: string;
    weight: number | null;
}

export type GiveawayConfig = {
    skuEntries: SkuEntry[];
}

export function parseConfig(config: string): GiveawayConfig {
    return JSON.parse(config);
}
