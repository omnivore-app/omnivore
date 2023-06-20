import { gql } from 'graphql-request'

export type LabelColor =
  | '#FF5D99'
  | '#7CFF7B'
  | '#FFD234'
  | '#7BE4FF'
  | '#CE88EF'
  | '#EF8C43'
  | '#000000'

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
  createdAt: Date
}
