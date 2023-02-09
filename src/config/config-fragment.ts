import * as Joi from 'joi';

export type ConfigFragment<T> = {
    schema: Joi.PartialSchemaMap<unknown>,
    load: (envConfig: NodeJS.Dict<string>) => T,
}
