/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { GraphQLScalarType } from 'graphql'
import sanitize from 'sanitize-html'

export class SanitizedString extends GraphQLScalarType {
  constructor(
    type: GraphQLScalarType,
    allowedTags?: string[],
    maxLength?: number,
    pattern?: RegExp
  ) {
    super({
      name: `SanitizedString_${allowedTags}_${maxLength}_${pattern}`,
      description: 'Source string that was sanitized',

      serialize(value: string) {
        return value
      },

      // invoked when a query is passed as a JSON object (for example, when Apollo Client makes a request
      parseValue(value) {
        if (maxLength && maxLength < value.length) {
          throw new Error(
            `Specified value cannot be longer than ${maxLength} characters`
          )
        }
        if (pattern && !pattern.test(value)) {
          throw new Error(`Specified value does not match pattern`)
        }
        return sanitize(value, { allowedTags: allowedTags || [] })
      },

      // invoked when a query is passed as a string
      parseLiteral(ast) {
        const value = type.parseLiteral(ast, {})
        if (maxLength && maxLength < value.length) {
          throw new Error(
            `Specified value cannot be longer than ${maxLength} characters`
          )
        }
        if (pattern && !pattern.test(value)) {
          throw new Error(`Specified value does not match pattern`)
        }
        return sanitize(value, { allowedTags: allowedTags || [] })
      },
    })
  }
}

const ScalarResolvers = {
  Date: new GraphQLScalarType({
    name: 'Date',
    description: 'Date',
    serialize(value) {
      const timestamp = Date.parse(value)
      if (!isNaN(timestamp)) {
        return new Date(timestamp).toJSON()
      } else {
        throw new Error(
          `Date resolver error - value provided is not a valid date: ${value}`
        )
      }
    },
  }),
}

export default ScalarResolvers
