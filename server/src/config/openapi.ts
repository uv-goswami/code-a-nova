// Loads the OpenAPI contract once. Also exposes dropdown enums from it so
// models, validation and /meta/options can never drift apart (ADR-0003).
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import type { OpenAPIV3 } from 'express-openapi-validator/dist/framework/types';

// Resolves to server/openapi/openapi.yaml from both src/config (dev/test) and dist/config (build).
export const specPath = path.resolve(__dirname, '../../openapi/openapi.yaml');
export const spec = yaml.load(fs.readFileSync(specPath, 'utf8')) as OpenAPIV3.DocumentV3;

const schemas = spec.components?.schemas ?? {};
const schemaOf = (name: string) => schemas[name] as OpenAPIV3.SchemaObject;
const enumOf = (name: string) => schemaOf(name).enum as string[];
const teamSizeSchema = (schemaOf('RegistrationRequest').properties?.teamSize ?? {}) as OpenAPIV3.SchemaObject;

export const options = {
  colleges: enumOf('College'),
  courses: enumOf('Course'),
  branches: enumOf('Branch'),
  yearsOfStudy: enumOf('YearOfStudy'),
  domains: enumOf('Domain'),
  teamSize: { min: teamSizeSchema.minimum as number, max: teamSizeSchema.maximum as number },
};
