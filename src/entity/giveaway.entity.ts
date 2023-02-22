import { BaseEntity } from '../helpers/persistence/base.entity'

export type GiveawayEntityData = {
    title: string;
    description: string;
    type: string;
    state?: string;
    config: string;
    publicKey: string;
    version: string;
}

export type GiveawayEntity = BaseEntity & GiveawayEntityData;