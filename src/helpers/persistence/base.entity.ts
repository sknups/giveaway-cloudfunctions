type NamedKey = string;
type AutoGeneratedNumericKey = number | null; // When creating a new entity the value will initially be null

export type EntityKey = NamedKey | AutoGeneratedNumericKey;

/**
 * Base Entity, everything else inherits from here.
 */
export type BaseEntity<K = EntityKey> = {

    /**
     * Unique identifier of the entity, used as the primary key.
     */
    code: string
}

export type NamedKeyEntity = BaseEntity<NamedKey>;
