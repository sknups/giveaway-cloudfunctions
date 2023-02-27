import { GiveawayEntity, GiveawayEntityData } from '../entity/giveaway.entity';
import { GiveawayDto } from '../dto/giveaway.dto';
import { EntityMapper } from './entity.mapper';
import { SaveGiveawayRequestDto } from '../dto/save-giveaway-request.dto';
import { GiveawayState } from '../dto/giveaway-state.dto';

export abstract class AbstractGiveawayMapper<T extends GiveawayDto> implements EntityMapper<GiveawayEntity, SaveGiveawayRequestDto, T>{

  entityKind(): string {
    return 'giveaway';
  }

  public entityToDto(entity: GiveawayEntity): Promise<T> {
    const baseDto: GiveawayDto = this.toBaseDto(entity);
    return this.toDtoFromBaseDto(entity, baseDto);
  }

  protected abstract toDtoFromBaseDto(entity: GiveawayEntity, baseDto: GiveawayDto): Promise<T>;

  private toBaseDto(entity: GiveawayEntity): GiveawayDto {

    return {
      title: entity.title,
      description: entity.description
    };

  }

  async dtoToNewEntity(code: string, dto: SaveGiveawayRequestDto): Promise<GiveawayEntity> {

    const state = GiveawayState.ACTIVE;

    return {
      ...(await this.dtoToUpdateEntity(dto)),
      code: code,
      state
    }
  }

  async dtoToUpdateEntity(dto: SaveGiveawayRequestDto): Promise<GiveawayEntityData> {

    return {
      title: dto.title,
      description: dto.description,
      type: dto.type,
      config: dto.config,
      publicKey: dto.publicKey
    };
  }
}