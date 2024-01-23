/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/ban-types */
declare module '*.graphql' {
  import { DocumentNode } from 'graphql'
  const schema: DocumentNode

  export = schema
}

declare module 'voca/slugify' {
  function slugify(subject?: string): string

  export = slugify
}
