import { Request } from '@google-cloud/functions-framework';
import { validate, validateSync, ValidatorOptions, ValidationError as ValidationErrorCv } from 'class-validator';
import { ClassConstructor, plainToClass } from 'class-transformer';

export class ValidationError extends Error {
    constructor(public readonly errorMessages: string[]) {
        super(`Validation error: ${JSON.stringify(errorMessages)}`);
    }
}

/**
 * Parses the request body and performs validation.
 *
 * @param dtoType a reference to the DTO constructor used to parse and validate
 * @param req the request object used to read the raw request data
 * @returns the parsed, transformed and validated object
 * @throws ValidationError if the validation fails
 */
export async function parseAndValidateRequestData<T extends object>(dtoType: ClassConstructor<T>, req: Request): Promise<T> {
    const requestObject: T = plainToClass(dtoType, req.body);
    await validateOrThrow(requestObject);
    return requestObject;
}

/**
 * Maps a set of ValidationErrors into an array of string messages.
 *
 * This is called recursively to include all "child" error messages.
 *
 * It will return:
 *   - The error messages found in the 'constraints' property of each ValidationError
 *   - The error messages (recursively) found in each 'children[*].constraints'
 *
 * Child messages include a prefix to identify the property name in the parent, eg: "propInParent/propInChild must be a string"
 *
 * @param validationErrs the set of validation errors to be mapped
 * @param messagePrefix a prefix used to identify the property being validated (only required for children)
 * @returns an array of error messages
 */
function _recursiveMapValidationErrorMessages(validationErrs: ValidationErrorCv[], messagePrefix = ''): string[] {
    const messages = validationErrs.filter(ve => ve.constraints)
        .map(ve => ve.constraints as {[type: string]: string})
        .map(constraints => Object.values(constraints))
        .flat()
        .map(msg => `${messagePrefix}${msg}`);

    return messages.concat(
        validationErrs.filter(ve => ve.children)
            .map(ve => _recursiveMapValidationErrorMessages(ve.children as ValidationErrorCv[], `${messagePrefix}${ve.property}/`))
            .flat()
    );
}

function _throwIfValidationErrors(validationErrs: ValidationErrorCv[]): void {
    if (validationErrs.length > 0) {
        throw new ValidationError(_recursiveMapValidationErrorMessages(validationErrs));
    }
}

/**
 * Validates the supplied object.
 *
 * @param o the object to be validated
 * @throws ValidationError if the validation fails
 */
export async function validateOrThrow(o: object, validatorOptions?: ValidatorOptions): Promise<void> {
    const validationErrs = await validate(o, validatorOptions);
    _throwIfValidationErrors(validationErrs);
}

/**
 * Validates the supplied object.
 *
 * @param o the object to be validated
 * @throws ValidationError if the validation fails
 */
export function validateSyncOrThrow(o: object, validatorOptions?: ValidatorOptions): void {
    const validationErrs = validateSync(o, validatorOptions);
    _throwIfValidationErrors(validationErrs);
}
