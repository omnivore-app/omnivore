import { getDirective, MapperKind, mapSchema } from '@graphql-tools/utils'
import { GraphQLNonNull, GraphQLScalarType, GraphQLSchema } from 'graphql'
import { SanitizedString } from './scalars'

export const sanitizeDirectiveTransformer = (schema: GraphQLSchema) => {
  return mapSchema(schema, {
    [MapperKind.FIELD]: (fieldConfig) => {
      const sanitizeDirective = getDirective(
        schema,
        fieldConfig,
        'sanitize'
      )?.[0]
      if (!sanitizeDirective) {
        return fieldConfig
      }

      const maxLength = sanitizeDirective.maxLength as number | undefined
      const minLength = sanitizeDirective.minLength as number | undefined
      const allowedTags = sanitizeDirective.allowedTags as string[] | undefined
      const pattern = sanitizeDirective.pattern as string | undefined

      if (
        fieldConfig.type instanceof GraphQLNonNull &&
        fieldConfig.type.ofType instanceof GraphQLScalarType
      ) {
        fieldConfig.type = new GraphQLNonNull(
          new SanitizedString(
            fieldConfig.type.ofType,
            allowedTags,
            maxLength,
            minLength,
            pattern
          )
        )
      } else if (fieldConfig.type instanceof GraphQLScalarType) {
        fieldConfig.type = new SanitizedString(
          fieldConfig.type,
          allowedTags,
          maxLength,
          minLength,
          pattern
        )
      } else {
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        throw new Error(`Not a scalar type: ${fieldConfig.type}`)
      }
      return fieldConfig
    },
    [MapperKind.ARGUMENT]: (argConfig) => {
      const sanitizeDirective = getDirective(schema, argConfig, 'sanitize')?.[0]
      if (!sanitizeDirective) {
        return argConfig
      }

      const maxLength = sanitizeDirective.maxLength as number | undefined
      const minLength = sanitizeDirective.minLength as number | undefined
      const allowedTags = sanitizeDirective.allowedTags as string[] | undefined
      const pattern = sanitizeDirective.pattern as string | undefined

      if (
        argConfig.type instanceof GraphQLNonNull &&
        argConfig.type.ofType instanceof GraphQLScalarType
      ) {
        argConfig.type = new GraphQLNonNull(
          new SanitizedString(
            argConfig.type.ofType,
            allowedTags,
            maxLength,
            minLength,
            pattern
          )
        )
      } else if (argConfig.type instanceof GraphQLScalarType) {
        argConfig.type = new SanitizedString(
          argConfig.type,
          allowedTags,
          maxLength,
          minLength,
          pattern
        )
      } else {
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        throw new Error(`Not a scalar type: ${argConfig.type}`)
      }
      return argConfig
    },
  })
}
