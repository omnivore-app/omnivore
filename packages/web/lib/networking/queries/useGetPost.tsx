import useSWR from 'swr'
import { publicGqlFetcher } from '../networkHelpers'
import dayjs from 'dayjs'
import { fetchEndpoint } from '../../appConfig'

type Post = {
  username: string
  displayName: string
  userAvatar: string
  content: string
  createdAt: string
}

type PostResponse = {
  post: Post | undefined
  error: any
  isLoading: boolean
  isValidating: boolean
}

export function useGetPostQuery(
  postId: string | undefined
): PostResponse | undefined {
  if (!postId) {
    return {
      error: undefined,
      post: undefined,
      isLoading: true,
      isValidating: true,
    }
  }

  const fetcher = (url: string) => {
    return fetch(url).then((r) => r.json())
  }

  const { data, error, isValidating } = useSWR(
    `${fetchEndpoint}/social/posts/${postId}`,
    fetcher
  )

  return {
    error,
    post: data as Post,
    isLoading: !error && !data,
    isValidating,
  }
}
