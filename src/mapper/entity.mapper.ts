import { BaseEntity } from '../helpers/persistence/base.entity';

/**
 * Maps between DTO and entity objects.
 * 
 * Generic types:
 * - E: the entity type
 * - S: a partial DTO which is usually PUT by a client when saving
 * - F: the full response DTO
 */
export interface EntityMapper<E extends BaseEntity, S, F> {

  /**
   * Determines where to persist the data.
   * 
   * @returns the entity 'kind' used to persist the entity
   */
  entityKind(): string;

  /**
   * Converts an entity into a DTO
   * 
   * @param entity the entity to be mapped to a DTO.
   * @returns the DTO
   */
  entityToDto(entity: E): Promise<F>;

  /**
   * Converts a "save" DTO into a full entity.
   * 
   * This is used when the entity does not yet exist and therefore returns all entity properties.
   * 
   * @param code the unique identifier for the new entity
   * @param dto the "save" DTO to be mapped to an entity
   * @returns the full entity
   */
  dtoToNewEntity(code: string, dto: S): Promise<E>;

  /**
   * Converts a "save" DTO into a partial entity.
   * 
   * This is used when the entity already exists and returns only the properties of the entity that can be updated.
   * 
   * @param dto the "save" DTO to be mapped to a partial entity
   * @returns the partial entity
   */
  dtoToUpdateEntity(dto: S): Promise<Partial<E>>;

}