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
      name: `SanitizedString_${allowedTags}_${maxLength}_${minLength}_${pattern}`.replace(
        /\W/g,
        ''
      ),
      description: 'Source string that was sanitized',

      serialize(value: unknown) {
        return String(value)
      },

      parseValue(value: unknown) {
        if (typeof value !== 'string') {
          throw new Error('Value must be a string')
        }
        checkLength(value)
        if (pattern && !new RegExp(pattern).test(value)) {
          throw new Error(`Specified value does not match pattern`)
        }
        return sanitize(value, { allowedTags: allowedTags || [] })
      },

      parseLiteral(ast) {
        const value = type.parseLiteral(ast, {}) as string
        checkLength(value)
        if (pattern && !new RegExp(pattern).test(value)) {
          throw new Error(`Specified value does not match pattern`)
        }
        return sanitize(value, { allowedTags: allowedTags || [] })
      },
    })

    function checkLength(value: string) {
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
    description: 'Date custom scalar type',
    serialize(value: unknown) {
      if (value instanceof Date) {
        return value.toISOString()
      }
      if (typeof value === 'string') {
        const date = new Date(value)
        if (!isNaN(date.getTime())) {
          return date.toISOString()
        }
      }
      throw new Error(`Date resolver error - invalid date value: ${value}`)
    },
    parseValue(value: unknown) {
      if (value instanceof Date) {
        return value
      }
      if (typeof value === 'string') {
        const date = new Date(value)
        if (!isNaN(date.getTime())) {
          return date
        }
      }
      throw new Error('Invalid date value')
    },
    parseLiteral(ast) {
      if (ast.kind === 'StringValue') {
        const date = new Date(ast.value)
        if (!isNaN(date.getTime())) {
          return date
        }
      }
      throw new Error('Invalid date literal')
    },
  }),
}

export default ScalarResolvers
