import * as Joi from 'joi';
import base, { BaseConfig } from './base-config';
import giveaway, { GiveawayConfig } from './giveaway-config';

export type AllConfig = BaseConfig & GiveawayConfig;

const ALL_FRAGMENTS = [
    base,
    giveaway
];

const CONFIG_SCHEMA = Joi.object(ALL_FRAGMENTS.map(f => f.schema).reduce((a, b) => {
    return { ...a, ...b }
}));

function _loadAllConfig(envConfig: NodeJS.Dict<string>): AllConfig {
    return ALL_FRAGMENTS.map(f => f.load(envConfig)).reduce((a, b) => {
        return { ...a, ...b };
    }) as AllConfig;
}

export async function loadConfig(env): Promise<AllConfig> {
    const result = CONFIG_SCHEMA.validate(env, { allowUnknown: true });
    if (result.error) {
        throw new Error(`Config validation failed: ${result.error.message}`);
    }

    return _loadAllConfig(result.value);
}
