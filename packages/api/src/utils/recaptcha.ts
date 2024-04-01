import axios from 'axios'

type RecaptchaResponse = {
  success: Boolean
  hostname: string
  score?: number
  action?: string
}

const isRecaptchaResponse = (data: any): data is RecaptchaResponse => {
  return 'success' in data && 'hostname' in data
}

export const verifyChallengeRecaptcha = async (
  token: string
): Promise<Boolean> => {
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
    console.log('recaptcha response: ', response)

    if (!response.data || !response.data.success) {
      throw new Error('Failed to verify reCAPTCHA')
    }

    const json = response.data
    if (!isRecaptchaResponse(json)) {
      return false
    }
    return json.success
  } catch (error) {
    console.error('Error verifying reCAPTCHA:', error)
    return false
  }
}
