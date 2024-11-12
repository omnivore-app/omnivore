import { useQuery } from '@tanstack/react-query'
import { gqlFetcher } from '../networkHelpers'
import { featureFragment } from '../fragments/featureFragment'
import { gql } from 'graphql-request'
import { UserBasicData } from '../queries/useGetViewerQuery'

export function useGetViewer() {
  return useQuery({
    queryKey: ['viewer'],
    staleTime: Infinity,
    queryFn: async () => {
      const response = (await gqlFetcher(GQL_GET_VIEWER)) as ViewerData
      if (!response.me) {
        throw new Error('no user found')
      }
      return response.me
    },
  })
}

type ViewerData = {
  me?: UserBasicData
}

const GQL_GET_VIEWER = gql`
  query Viewer {
    me {
      id
      name
      isFullUser
      profile {
        id
        username
        pictureUrl
        bio
      }
      email
      source
      intercomHash
      featureList {
        ...FeatureFields
      }
    }
  }
  ${featureFragment}
`
