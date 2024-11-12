import { gql } from 'graphql-request'
import { labelFragment } from '../fragments/labelFragment'

export const GQL_GET_LABELS = gql`
  query GetLabels {
    labels {
      ... on LabelsSuccess {
        labels {
          ...LabelFields
        }
      }
      ... on LabelsError {
        errorCodes
      }
    }
  }
  ${labelFragment}
`

export const GQL_CREATE_LABEL = gql`
  mutation CreateLabel($input: CreateLabelInput!) {
    createLabel(input: $input) {
      ... on CreateLabelSuccess {
        label {
          id
          name
          color
          description
          createdAt
        }
      }
      ... on CreateLabelError {
        errorCodes
      }
    }
  }
`

export const GQL_DELETE_LABEL = gql`
  mutation DeleteLabel($id: ID!) {
    deleteLabel(id: $id) {
      ... on DeleteLabelSuccess {
        label {
          id
        }
      }
      ... on DeleteLabelError {
        errorCodes
      }
    }
  }
`

export const GQL_UPDATE_LABEL = gql`
  mutation UpdateLabel($input: UpdateLabelInput!) {
    updateLabel(input: $input) {
      ... on UpdateLabelSuccess {
        label {
          id
          name
          color
          description
          createdAt
        }
      }
      ... on UpdateLabelError {
        errorCodes
      }
    }
  }
`
