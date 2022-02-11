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
    createdAt
    updatedAt
    sharedAt
    user {
      id
      name
      profile {
        id
        pictureUrl
        username
      }
    }
    createdByMe
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
  createdAt: string
  updatedAt: string
  user: User
  createdByMe: boolean
  sharedAt?: string
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
