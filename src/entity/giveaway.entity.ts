import { BaseEntity } from '../helpers/persistence/base.entity'

export type GiveawayEntityStateData = {
    state: string;
}

export type GiveawayEntityData = {
    title: string;
    description: string;
    type: string;
    config: string;
    publicKey: string;
    version: string;
}

export type GiveawayEntity = BaseEntity & GiveawayEntityData & GiveawayEntityStateData;