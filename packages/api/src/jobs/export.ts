import axios from 'axios'
import jwt from 'jsonwebtoken'
import { env } from '../env'
import { findActiveUser } from '../services/user'
import { logger } from '../utils/logger'

export interface ExportJobData {
  userId: string
}

export const EXPORT_JOB_NAME = 'export'

export const exportJob = async (jobData: ExportJobData) => {
  const { userId } = jobData
  const user = await findActiveUser(userId)
  if (!user) {
    logger.error('user not found', {
      userId,
    })
    return
  }

  logger.info('exporting all items...', {
    userId,
  })

  const token = jwt.sign(
    {
      uid: userId,
    },
    env.server.jwtSecret,
    { expiresIn: '1d' }
  )

  await axios.post(env.queue.exportTaskHandlerUrl, undefined, {
    headers: {
      OmnivoreAuthorizationHeader: token,
    },
  })
}
