/* eslint-disable @typescript-eslint/restrict-template-expressions */
// import { SchemaDirectiveVisitor } from 'apollo-server-express'
// import { GraphQLInputField, GraphQLScalarType } from 'graphql'
// import { SanitizedString } from './scalars'
// import { GraphQLNonNull } from 'graphql/type/definition'

// export class SanitizeDirective extends SchemaDirectiveVisitor {
//   visitInputFieldDefinition(
//     field: GraphQLInputField
//   ): GraphQLInputField | void | null {
//     const { allowedTags, maxLength } = this.args
//     if (
//       field.type instanceof GraphQLNonNull &&
//       field.type.ofType instanceof GraphQLScalarType
//     ) {
//       field.type = new GraphQLNonNull(
//         new SanitizedString(field.type.ofType, allowedTags, maxLength)
//       )
//     } else if (field.type instanceof GraphQLScalarType) {
//       field.type = new SanitizedString(field.type, allowedTags, maxLength)
//     } else {
//       throw new Error(`Not a scalar type: ${field.type}`)
//     }
//   }
// }

import { mapSchema, getDirective, MapperKind } from '@graphql-tools/utils'
import { GraphQLNonNull, GraphQLScalarType, GraphQLSchema } from 'graphql'
import { SanitizedString } from './scalars'

export const sanitizeDirectiveTransformer = (
  schema: GraphQLSchema
): GraphQLSchema => {
  return mapSchema(schema, {
    [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
      const deprecatedDirective = getDirective(
        schema,
        fieldConfig,
        'sanitize'
      )?.[0]
      if (deprecatedDirective) {
        //     const { allowedTags, maxLength } = this.args
        const allowedTags = undefined
        const maxLength = undefined
        if (
          fieldConfig.type instanceof GraphQLNonNull &&
          fieldConfig.type.ofType instanceof GraphQLScalarType
        ) {
          fieldConfig.type = new GraphQLNonNull(
            new SanitizedString(fieldConfig.type.ofType, allowedTags, maxLength)
          )
        } else if (fieldConfig.type instanceof GraphQLScalarType) {
          fieldConfig.type = new SanitizedString(
            fieldConfig.type,
            allowedTags,
            maxLength
          )
        } else {
          throw new Error(`Not a scalar type: ${fieldConfig.type}`)
        }
      }
      return fieldConfig
    },
  })
}
