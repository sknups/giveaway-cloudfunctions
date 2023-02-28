import { BaseEntity } from '../helpers/persistence/base.entity'

export type ClaimEntityData = {
  dropLinkIdentifier: string;
  giveawayCode: string;
  user: string;
}

export type ClaimEntity = BaseEntity & ClaimEntityData;
