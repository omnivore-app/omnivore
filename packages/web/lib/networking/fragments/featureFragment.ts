import { gql } from 'graphql-request'

export const featureFragment = gql`
  fragment FeatureFields on Feature {
    id
    name
    createdAt
    updatedAt
    grantedAt
    expiresAt
  }
`

export interface Feature {
  id: string
  name: string
  createdAt: Date
  updatedAt?: Date
  grantedAt?: Date
  expiresAt?: Date
}
