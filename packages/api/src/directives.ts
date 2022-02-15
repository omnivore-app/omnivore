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
