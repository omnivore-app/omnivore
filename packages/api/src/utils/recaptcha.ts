import axios from 'axios'

type RecaptchaResponse = {
  success: boolean
  hostname: string
  score?: number
  action?: string
}

export const isRecaptchaResponse = (data: any): data is RecaptchaResponse => {
  return 'success' in data && 'hostname' in data
}

export const verifyChallengeRecaptcha = async (
  token: string
): Promise<boolean> => {
  if (!process.env.RECAPTCHA_CHALLENGE_SECRET_KEY) {
    return false
  }

  const url = `https://www.google.com/recaptcha/api/siteverify`
  const params = new URLSearchParams({
    secret: process.env.RECAPTCHA_CHALLENGE_SECRET_KEY,
    response: token,
  })

  try {
    const response = await axios.post(url, params)
    console.log('recaptcha response: ', response.data)

    if (isRecaptchaResponse(response.data)) {
      return response.data.success
    }
    return false
  } catch (error) {
    console.error('Error verifying reCAPTCHA:', error)
    return false
  }
}
