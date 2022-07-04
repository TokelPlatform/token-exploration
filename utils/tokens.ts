import { Sort, Wildcard, elasticQuery, get, update } from "./elastic";

import Joi from "joi";
import { index } from "config";

//*** Validation schemas  */
export const tokenIdSchema = Joi.object({
  id: Joi.string().length(64).hex().required(),
});

export const tokenUpdateSchema = Joi.object({
  featured: Joi.boolean().optional(),
});

//[{ height: { order: "asc" } }];
const sortSchema = Joi.object({
  height: {
    order: Joi.string().valid("asc", "desc"),
  },
});

//{"dataAsJson.arbitrary.collection_name":"cyber"}
const searchSchema = Joi.object()
  .optional()
  .pattern(Joi.string(), Joi.string());

export const searchQuerySchema = Joi.object({
  sort: sortSchema.optional().default({ height: { order: "desc" } }),
  search: searchSchema,
  page: Joi.number().optional(),
  limit: Joi.number().optional(),
});

//*** Types  */

type TokenType = {
  featured: boolean;
};

const validate = (schema: Joi.ObjectSchema<any>, object: any) => {
  const valid = schema.validate(object);
  if (valid.error) {
    console.log(valid);
    throw new Error(valid.error.toString());
  }
};

export const getTokens = async (
  page: number,
  limit: number,
  sort: Sort,
  search: Wildcard
) => {
  const r = validate(searchQuerySchema, { page, limit, sort, search });
  console.log("validated");
  console.log(r);
  return elasticQuery(page, limit, sort, search);
};

/**
 *
 * @param id tokenid, hex string
 * @returns
 */
export const getToken = async (id: string) => {
  validate(tokenIdSchema, { id });
  const doc = await get(index.TOKENS, id.toString());
  return doc._source ? doc._source : doc;
};

/**
 *
 * @param id tokenid, hex string
 * @param body parameters to update
 * @returns
 */
export const editToken = async (id: string, body: TokenType) => {
  validate(tokenIdSchema, { id });
  return update(index.TOKENS, id, body);
};
