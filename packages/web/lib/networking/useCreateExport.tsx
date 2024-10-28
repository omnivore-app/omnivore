import { apiFetcher } from './networkHelpers'

export const createExport = async (): Promise<boolean> => {
  try {
    const response = await apiFetcher(`/api/export/`)
    return true
  } catch (error) {
    console.log('error scheduling export. ')
    return false
  }
}
