import { gql } from "graphql-request"

export type SavedSearch = {
  id: string
  name: string
  filter: string
  position: number
  visible: boolean
  defaultFilter: boolean
  folder: string
  category: string
}

export const savedSearchFragment = gql`
  fragment FiltersFragment on Filter {
    id
    name
    filter
    position
    visible
    defaultFilter
    folder
    category
  }
`
