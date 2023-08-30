import { gql } from "graphql-request"

export type SavedSearch = {
  id: string
  name: string
  filter: string
  position: number
  visible: boolean
  defaultFilter: boolean
}

export const savedSearchFragment = gql`
  fragment FiltersFragment on Filter {
    id
    name
    filter
    position
    visible
    defaultFilter
  }
`
