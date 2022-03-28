import { gql } from 'graphql-request'

export const highlightFragment = gql`
  fragment HighlightFields on Highlight {
    id
    shortId
    quote
    prefix
    suffix
    patch
    annotation
    createdByMe
    updatedAt
    sharedAt
  }
`

export type Highlight = {
  id: string
  shortId: string
  quote: string
  prefix?: string
  suffix?: string
  patch: string
  annotation?: string
  createdByMe: boolean
  updatedAt: string
  sharedAt: string
}

export type User = {
  id: string
  name: string
  profile: {
    id: string
    pictureUrl?: string
    username: string
  }
}
