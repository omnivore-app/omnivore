import { apiPoster } from '../networkHelpers'

export interface DigestRequest {
  schedule: string
  voices: string[]
}

export const scheduleDigest = async (
  request: DigestRequest
): Promise<boolean> => {
  try {
    const result = await apiPoster(`/api/digest/v1/`, request)
    console.log('RESULT: ', result)
    return true
  } catch (error) {
    console.log('error scheduling job: ', error)
    return false
  }
}
