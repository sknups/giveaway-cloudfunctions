import { Request } from '@google-cloud/functions-framework';
import { ClassConstructor } from 'class-transformer';
import { AppError, CODE_NOT_FOUND_IN_PATH, HTTP_METHOD_NOT_ALLOWED, ENTITY_NOT_FOUND } from '../app.errors';
import { SaveResponseDto } from '../dto/save-response.dto';
import { EntityMapper } from '../mapper/entity.mapper';
import { BaseEntity } from './persistence/base.entity';
import { commitTransaction, getEntity, rollbackTransaction, saveEntity, startTransaction } from './datastore/datastore.helper';
import { diffPartial } from './diff';
import logger from './logger';
import { parseAndValidateRequestData } from './validation';

export function getCodeFromPath(kind: string, req: Request): string {
    const code: string | undefined = req.path.split('/').pop();

    if (!code || code.length === 0) {
        throw new AppError(CODE_NOT_FOUND_IN_PATH(kind));
    }

    return code;
}

/**
 * Generic helper to process a "get" request and return a mapped DTO.
 *
 * The generic types typically are derived by the supplied mapper and therefore
 * do not need to be explicitly included in <>.
 *
 * @param req the HTTP request, used to extract the "code"
 * @param mapper maps between entity and DTO types
 */
export async function getAndMapEntity<
    E extends BaseEntity,
    F,
>(
    req: Request,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mapper: EntityMapper<E, any, F>,
) {

    if (req.method != 'GET') {
        throw new AppError(HTTP_METHOD_NOT_ALLOWED(req.method));
    }



    const kind: string = mapper.entityKind();
    const code: string = getCodeFromPath(kind, req);


    logger.debug(`Received get ${kind} request for '${code}'`);

    const entity: E | null = await getEntity(mapper.entityKind(), code);


    if (!entity) {
        throw new AppError(ENTITY_NOT_FOUND(kind, code));
    }

    return await mapper.entityToDto(entity);

}


/**
 * Generic helper to process a "save" request and upsert into datastore.
 * 
 * The generic types typically are derived by the arguments and therefore
 * do not need to be explicitly included in <>.
 * 
 * - E: the entity type to be persisted to datastore
 * - S: the DTO of the save request
 * - F: the DTO of a fully hydrated entity including read-only properties,
 *      required to convert a saved entity (type E) into a response DTO. 
 * 
 * @param dtoType a reference to the DTO constructor used to parse and validate
 * @param req the HTTP request
 * @param mapper maps between entity and DTO types
 * @returns a fully hydated DTO describing the saved entity
 */
export async function saveInTransaction<
    E extends BaseEntity,
    S extends object,
    F extends S,
>(
    dtoType: ClassConstructor<S>,
    req: Request,
    mapper: EntityMapper<E, S, F>,
): Promise<SaveResponseDto<F>> {

    if (req.method != 'PUT') {
        throw new AppError(HTTP_METHOD_NOT_ALLOWED(req.method));
    }

    const kind = mapper.entityKind();
    const code: string = getCodeFromPath(kind, req);

    const dto = await parseAndValidateRequestData(dtoType, req);

    logger.debug(`Received save ${kind} request for '${code}'`);

    const tx = await startTransaction();

    let entity: E | null;
    let created = false;
    let updated = true;


    try {
        entity = await getEntity(kind, code, tx);

        if (entity) {
            const updateEntity = await mapper.dtoToUpdateEntity(dto);
            const diff = diffPartial(entity, updateEntity);

            if (diff.match) {
                logger.debug(`No changes detected for ${kind} ${code}`);

                updated = false;
            } else {
                logger.info(`Updating ${kind} ${code}`, { diff });

                entity = {
                    ...entity, // take the current entity
                    ...diff.newValues, // apply the detected differences
                };
                await saveEntity(kind, entity, tx);

                updated = true;
            }
        } else {
            logger.info(`Creating ${kind} ${code}`);

            entity = await mapper.dtoToNewEntity(code, dto);
            await saveEntity(kind, entity, tx);

            created = true;
        }

        await commitTransaction(tx);

        const data: F = await mapper.entityToDto(entity);
        return { created, updated, data };
    } catch (e) {
        await rollbackTransaction(tx);
        throw e;
    }

}
