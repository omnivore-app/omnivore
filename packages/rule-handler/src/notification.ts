import axios from 'axios'
import { getAuthToken } from './index'

interface NotificationData {
  body: string
  title?: string
  data?: Record<string, string>
  image?: string
  notificationType?: string
}

export const sendNotification = async (
  userId: string,
  apiEndpoint: string,
  jwtSecret: string,
  message: string,
  title?: string,
  image?: string
) => {
  const auth = await getAuthToken(userId, jwtSecret)

  const data: NotificationData = {
    body: message,
    title: title || message,
    image,
    notificationType: 'rule',
  }

  await axios.post(`${apiEndpoint}/notification/send`, data, {
    headers: {
      Cookie: `auth=${auth};`,
      'Content-Type': 'application/json',
    },
  })
}
