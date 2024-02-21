import { BaseEntity } from '../helpers/persistence/base.entity'

export type GiveawayEntityStateData = {
  state: string;
}

export type GiveawayEntityData = {
  title: string;
  description: string;
  type: string;
  config: string;
  secret: string;
}

export type GiveawayEntity = BaseEntity & GiveawayEntityData & GiveawayEntityStateData;


export type ClaimEntity = BaseEntity & {
  dropLinkIdentifier: string;
  giveawayCode: string;
  user: string;
}
