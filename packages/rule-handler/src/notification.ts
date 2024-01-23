import axios from 'axios'

interface RequestData {
  body: string
  title?: string
  data?: Record<string, string>
  image?: string
  notificationType?: string
}

export interface NotificationData {
  body: string
  title?: string
  image?: string
  data?: Record<string, string>
}

export const sendNotification = async (
  apiEndpoint: string,
  auth: string,
  { body, title, image, data }: NotificationData
) => {
  const requestData: RequestData = {
    body,
    title,
    // image,
    notificationType: 'rule',
    data,
  }

  try {
    return await axios.post(`${apiEndpoint}/notification/send`, requestData, {
      headers: {
        Cookie: `auth=${auth};`,
        'Content-Type': 'application/json',
      },
    })
  } catch (e) {
    console.error(e)
  }
}
