import axios from 'axios'

interface NotificationData {
  body: string
  title?: string
  data?: Record<string, string>
  image?: string
  notificationType?: string
}

export const sendNotification = async (
  apiEndpoint: string,
  auth: string,
  message: string,
  title?: string,
  image?: string
) => {
  const data: NotificationData = {
    body: message,
    title: title || message,
    image,
    notificationType: 'rule',
  }

  try {
    await axios.post(`${apiEndpoint}/notification/send`, data, {
      headers: {
        Cookie: `auth=${auth};`,
        'Content-Type': 'application/json',
      },
    })
  } catch (e) {
    console.error(e)
  }
}
