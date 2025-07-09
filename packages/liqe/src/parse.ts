import nearley from 'nearley'
import { SyntaxError } from './errors'
import grammar from './grammar'
import { hydrateAst } from './hydrateAst'
import type { LiqeQuery, ParserAst } from './types'

const rules = nearley.Grammar.fromCompiled(grammar as nearley.CompiledRules)
const MESSAGE_RULE = /Syntax error at line (\d+) col (\d+)/

export const parse = (query: string): LiqeQuery => {
  if (query.trim() === '') {
    return {
      location: {
        end: 0,
        start: 0,
      },
      type: 'EmptyExpression',
    }
  }

  const parser = new nearley.Parser(rules)

  let results

  try {
    results = parser.feed(query).results as unknown as ParserAst[]
  } catch (error: any) {
    if (
      typeof error?.message === 'string' &&
      typeof error?.offset === 'number'
    ) {
      const match = error.message.match(MESSAGE_RULE)

      if (!match) {
        throw error
      }

      throw new SyntaxError(
        `Syntax error at line ${match[1]} column ${match[2]}`,
        error.offset,
        Number(match[1]),
        Number(match[2])
      )
    }

    throw error
  }

  if (results.length === 0) {
    throw new Error('Found no parsings.')
  }

  if (results.length > 1) {
    // check if all results are the same
    const firstResult = JSON.stringify(results[0])

    for (const result of results) {
      if (JSON.stringify(result) !== firstResult) {
        throw new Error('Ambiguous results.')
      }
    }
  }

  const hydratedAst = hydrateAst(results[0])

  return hydratedAst
}
