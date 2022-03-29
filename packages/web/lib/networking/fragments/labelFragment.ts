import { gql } from 'graphql-request'

export const labelFragment = gql`
  fragment LabelFields on Label {
    id
    name
    color
    description
    createdAt
  }
`

export type Label = {
  id: string
  name: string
  color: string
  description?: string
  createdAt: string
}
