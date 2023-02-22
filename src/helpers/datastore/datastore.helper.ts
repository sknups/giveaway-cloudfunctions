import { Datastore, Entity, Transaction } from '@google-cloud/datastore';
import { BaseEntity } from '../persistence/base.entity';

let _datastoreNamespace: string;
let _datastore: Datastore;

export function datastore() {
    if (!_datastore) {
        _datastore = new Datastore({ namespace: 'giveaway' });
    }
    return _datastore;
}

/**
 * Wraps the underlying datastore object and possible transaction.
 */
export type DatastoreContext = {
    datastore: Datastore;
    tx?: Transaction;
}


/**
 * Wraps the native transaction.
 *
 * This type exists to discourage use of the transaction object outside
 * of the exported transaction related functions defined below.
 */
type TransactionWrapper = {
    tx: unknown;
}


function _datastoreOrTx(tx?: TransactionWrapper) {
    return tx?.tx as Transaction || datastore();
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

export async function getEntity<T extends BaseEntity>(kind: string, code: string, tx?: TransactionWrapper): Promise<T | null> {
    const ds = _datastoreOrTx(tx);

    const [entity] = await ds.get(datastore().key([kind, code]));

    if (!entity) {
        return null
    }

    return _mapFromDatastoreEntity<T>(entity);
}

/**
 * Starts a new datastore transaction.
 *
 * Use commitTransaction(tx) or rollbackTransaction(tx) to finalise it.
 *
 * @returns a wrapped transaction
 */
export async function startTransaction(): Promise<TransactionWrapper> {
    const tx: Transaction = datastore().transaction();
    await tx.run();
    return { tx };
}

/**
 * Commits a transaction.
 *
 * @param tx the wrapped transaction returned by startTransaction
 */
export async function commitTransaction(tx: TransactionWrapper): Promise<void> {
    await (tx.tx as Transaction).commit();
}

export async function insertEntity(context: DatastoreContext, kind: string, entity: BaseEntity): Promise<void> {
    const ds = context.tx ?? context.datastore;

    await ds.insert(_mapToDatastoreEntity(kind, entity));
}

/**
 * Rolls back a transaction.
 *
 * @param tx the wrapped transaction returned by startTransaction
 */
export async function rollbackTransaction(tx: TransactionWrapper): Promise<void> {
    await (tx.tx as Transaction).rollback();
}

export async function saveEntity(kind: string, entity: BaseEntity, tx?: TransactionWrapper): Promise<void> {
    const ds = _datastoreOrTx(tx);

    await ds.save(_mapToDatastoreEntity(kind, entity));
}

export async function updateEntity(kind: string, entity: BaseEntity, tx?: TransactionWrapper): Promise<void> {
    const ds = _datastoreOrTx(tx);

    const temp = _mapToDatastoreEntity(kind, entity)

    await ds.update(temp);
}

export async function updateEntityState(kind: string, entity: BaseEntity, tx?: TransactionWrapper): Promise<void> {
    const ds = _datastoreOrTx(tx);

    await ds.update(_mapToDatastoreEntity(kind, entity));
}

function _mapFromDatastoreEntity<T extends BaseEntity>(entity: Entity): T {
    const mapped = { ...entity };

    // replace the Datastore.KEY with a 'key' property
    mapped.code = mapped[Datastore.KEY].name ?? mapped[Datastore.KEY].id;
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

function _mapToDatastoreEntity(kind: string, obj: BaseEntity) {

    // console.log(obj.code)
    const datastoreEntity = {
        key: datastore().key([kind, obj.code]), // use obj.code as the datastore key
        data: { ...obj },
    };
    delete datastoreEntity.data.code; // we don't want to persist the key as an additional 'code' column

    return datastoreEntity;
}
