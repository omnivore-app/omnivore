import { apiPoster } from '../networkHelpers'

export interface DigestRequest {
  schedule: string
  voices: string[]
}

export const scheduleDigest = async (
  request: DigestRequest
): Promise<boolean> => {
  try {
    const response = await apiPoster(`/api/digest/v1/`, request)
    return (
      response.status == 202 || response.status == 201 || response.status == 200
    )
  } catch (error) {
    console.log('error scheduling job: ', error)
    return false
  }
}
