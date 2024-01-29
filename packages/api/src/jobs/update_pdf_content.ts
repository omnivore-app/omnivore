import {
  isUpdateContentMessage,
  updateContentForFileItem,
} from '../services/update_pdf_content'
import { logger } from '../utils/logger'

export const updatePDFContentJob = async (data: unknown): Promise<boolean> => {
  if (isUpdateContentMessage(data)) {
    return await updateContentForFileItem(data)
  }
  logger.info('update_pdf_content data is not a update message', { data })
  return false
}
