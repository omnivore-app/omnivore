/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/ban-types */
declare module '*.graphql' {
  import { DocumentNode } from 'graphql'
  const schema: DocumentNode

  export = schema
}

declare module 'knex-stringcase' {
  import * as Knex from 'knex'

  type StringCase =
    | 'camelcase'
    | 'capitalcase'
    | 'constcase'
    | 'cramcase'
    | 'decapitalcase'
    | 'dotcase'
    | 'enumcase'
    | 'lowercase'
    | 'pascalcase'
    | 'pathcase'
    | 'sentencecase'
    | 'snakecase'
    | 'spacecase'
    | 'spinalcase'
    | 'titlecase'
    | 'trimcase'
    | 'uppercase'

  interface KnexStringCaseConfig extends Knex.Config {
    appStringcase?: StringCase | StringCase[]
    dbStringcase?: StringCase | StringCase[]
    /* eslint-disable @typescript-eslint/no-explicit-any */
    beforePostProcessResponse?(
      result: any[] | object,
      queryContext: object
    ): any[] | object
    beforeWrapIdentifier?(value: string, queryContext: object): string
    /* eslint-enable @typescript-eslint/no-explicit-any */
    ignoreStringcase?(obj: object): boolean
  }

  function knexStringcase(config: KnexStringCaseConfig): Knex.Config
  export = knexStringcase
}

declare module 'voca/slugify' {
  function slugify(subject?: string): string

  export = slugify
}
