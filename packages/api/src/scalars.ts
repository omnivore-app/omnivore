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
    minLength?: number,
    pattern?: string
  ) {
    super({
      // Names must match /^[_a-zA-Z][_a-zA-Z0-9]*$/ as per graphql-js
      name: `SanitizedString_${allowedTags}_${maxLength}_${minLength}_${pattern}`.replace(
        /\W/g,
        ''
      ),
      description: 'Source string that was sanitized',

      serialize(value: string) {
        return value
      },

      // invoked when a query is passed as a JSON object (for example, when Apollo Client makes a request
      parseValue(value) {
        checkLength(value)
        if (pattern && !new RegExp(pattern).test(value)) {
          throw new Error(`Specified value does not match pattern`)
        }
        return sanitize(value, { allowedTags: allowedTags || [] })
      },

      // invoked when a query is passed as a string
      parseLiteral(ast) {
        const value = type.parseLiteral(ast, {})
        checkLength(value)
        if (pattern && !new RegExp(pattern).test(value)) {
          throw new Error(`Specified value does not match pattern`)
        }
        return sanitize(value, { allowedTags: allowedTags || [] })
      },
    })

    function checkLength(value: any) {
      if (maxLength && maxLength < value.length) {
        throw new Error(
          `Specified value cannot be longer than ${maxLength} characters`
        )
      }
      if (minLength && minLength > value.length) {
        throw new Error(
          `Specified value cannot be shorter than ${minLength} characters`
        )
      }
    }
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
