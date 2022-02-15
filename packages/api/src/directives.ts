import { mapSchema, getDirective, MapperKind } from '@graphql-tools/utils'
import { GraphQLNonNull, GraphQLScalarType, GraphQLSchema } from 'graphql'
import { SanitizedString } from './scalars'

export const sanitizeDirectiveTransformer = (schema: GraphQLSchema) => {
  return mapSchema(schema, {
    [MapperKind.FIELD]: (fieldConfig) => {
      const sanitizeDirective = getDirective(
        schema,
        fieldConfig,
        'sanitize'
      )
      if (!sanitizeDirective || sanitizeDirective.length < 1) {
        return fieldConfig
      }

      const maxLength = sanitizeDirective[0].maxLength
      const allowedTags = sanitizeDirective[0].allowedTags

      if (fieldConfig.type instanceof GraphQLNonNull && fieldConfig.type.ofType instanceof GraphQLScalarType) {
        fieldConfig.type = new GraphQLNonNull(
          new SanitizedString(fieldConfig.type.ofType, allowedTags, maxLength)
        )
      } else if (fieldConfig.type instanceof GraphQLScalarType) {
        fieldConfig.type = new SanitizedString(fieldConfig.type, allowedTags, maxLength)
      } else {
        throw new Error(`Not a scalar type: ${fieldConfig.type}`)
      }
      return fieldConfig
    },
  })
}
