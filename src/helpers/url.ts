import { Request } from "@google-cloud/functions-framework";
import { AppError, CODE_NOT_FOUND_IN_PATH } from "../app.errors";
import {match}  from "path-to-regexp";

/**
 * Extract the code from the end of the request path.
 * 
 * 
 * @param resource - the resource related to the code
 * @param req - the Request
 * @returns - the code
 */
export function getCodeFromPath(resource: string, req: Request): string {
  return getCodeFromRoute('(.*)/:code',resource, req);
}

/**
 * Extract the code from the request path that may end with sub resource
 * 
 * Paths supported 
 * '*'/:code
 * '*'/:code/sub-resource
 * 
 * e.g
 * 
 * sku/ABC/state or sku/ABC
 * 
 * 
 * @param resource - the resource related to the code
 * @param subResource - the sub resource that could be at the end of the path
 * @param req - the Request
 * @returns - the code
 */
export function getCodeFromPathWithOptionalSubResource(resource: string, subResource: string, req: Request): string {
  return getCodeFromRoute(`(.*)/:code((?!${subResource})[^/]+)/(${subResource})?`,resource, req);
}

/**
 * Extract 'code' for a resource from request path, using a route template
 * 
 * @param template - the route template to use, must have :code variable. Example '(.*)/:code'
 * @param resource - the resource related to the code
 * @param req - the Request
 * @returns - the code
 */
export function getCodeFromRoute(template: string, resource: string, req: Request): string {

    type PathWithCode ={
      code:string
    }

    const matcher = match<PathWithCode>(template, { decode: decodeURIComponent })
    const result = matcher(req.path)

    if (result === false) {
      throw new AppError(CODE_NOT_FOUND_IN_PATH(resource));
    } 

    const {code} = result.params; 
 
    if (!code || code.length === 0) {
      throw new AppError(CODE_NOT_FOUND_IN_PATH(resource));
    }
  
    return code;
  }

/**
 * @param req the Request
 * @returns true if the request path contains retailer
 */
export function isRetailerRequest(req: Request): boolean {
  const parts = req.path.split("/");
  return parts.includes("retailer");
}
