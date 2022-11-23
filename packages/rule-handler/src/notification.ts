import axios from 'axios'

interface RequestData {
  body: string
  title?: string
  data?: Record<string, string>
  image?: string
  notificationType?: string
}

export const sendNotification = async (
  apiEndpoint: string,
  auth: string,
  body: string,
  title?: string,
  image?: string,
  data?: Record<string, string>
) => {
  const requestData: RequestData = {
    body,
    title,
    image,
    notificationType: 'rule',
    data,
  }

  try {
    return axios.post(`${apiEndpoint}/notification/send`, requestData, {
      headers: {
        Cookie: `auth=${auth};`,
        'Content-Type': 'application/json',
      },
    })
  } catch (e) {
    console.error(e)
  }
}
