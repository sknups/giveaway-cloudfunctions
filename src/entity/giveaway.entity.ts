import { NamedKeyEntity } from '../helpers/persistence/base.entity';

export type GiveawayEntity = NamedKeyEntity & {

    title: string;
    description: string;
    type: string;
    state: string;
    config: string;
    publicKey: string;
    version: string;

}
