import { Datastore, Entity, PathType, Transaction } from '@google-cloud/datastore';
import { BaseEntity, EntityKey } from '../persistence/base.entity';

let _datastoreNamespace: string;
let _datastore: Datastore;

/**
 * Wraps the underlying datastore object and possible transaction.
 */
export type DatastoreContext = {
    datastore: Datastore;
    tx?: Transaction;
}

export function createContext(namespace: string): DatastoreContext {
    if (_datastore) {
        if (_datastoreNamespace !== namespace) {
            throw new Error(`Datastore context already initialised for namespace ${_datastoreNamespace}, cannot re-initialise for ${namespace}`)
        }
    } else {
        _datastore = new Datastore({ namespace });
        _datastoreNamespace = namespace;
    }

    return { datastore: _datastore };
}

export async function getEntity<T extends BaseEntity>(context: DatastoreContext, kind: string, key: EntityKey): Promise<T | null> {
    const ds = context.tx ?? context.datastore;

    const [entity] = await ds.get(context.datastore.key(_keyPath(kind, key)));

    if (!entity) {
        return null;
    }

    return _mapFromDatastoreEntity<T>(entity);
}

function _keyPath(kind: string, key: EntityKey): PathType[] {
    return key ? [kind, key] : [kind];
}

function _mapFromDatastoreEntity<T extends BaseEntity>(entity: Entity): T {
    const mapped = { ...entity };

    // replace the Datastore.KEY with a 'key' property
    mapped.key = mapped[Datastore.KEY].name ?? mapped[Datastore.KEY].id;
    delete mapped[Datastore.KEY];

    // convert created and updated from number to Date if found
    // this is due to Datastore projection queries returning dates as numeric (microsecond) values
    if (typeof mapped.created === 'number') {
        mapped.created = new Date(mapped.created / 1000);
    }
    if (typeof mapped.updated === 'number') {
        mapped.updated = new Date(mapped.updated / 1000);
    }

    return mapped as T;
}
