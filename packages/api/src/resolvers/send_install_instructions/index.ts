import {
  SendInstallInstructionsError,
  SendInstallInstructionsErrorCode,
  SendInstallInstructionsSuccess,
} from '../../generated/graphql'
import { authorized } from '../../utils/helpers'
import { sendEmail } from '../../utils/sendEmail'
import { AppDataSource } from '../../server'
import { User } from '../../entity/user'

const INSTALL_INSTRUCTIONS_EMAIL_TEMPLATE_ID =
  'd-c576bdc3b9a849dab250655ba14c7794'

export const sendInstallInstructionsResolver = authorized<
  SendInstallInstructionsSuccess,
  SendInstallInstructionsError
>(async (_parent, _args, { claims }) => {
  try {
    const user = await AppDataSource.getRepository(User).findOneBy({
      id: claims.uid,
    })

    if (!user) {
      return { errorCodes: [SendInstallInstructionsErrorCode.Unauthorized] }
    }

    const sendInstallInstructions = await sendEmail({
      from: 'msgs@omnivore.app',
      templateId: INSTALL_INSTRUCTIONS_EMAIL_TEMPLATE_ID,
      to: user?.email,
    })

    return {
      sent: sendInstallInstructions,
    }
  } catch (e) {
    console.log(e)

    return {
      errorCodes: [SendInstallInstructionsErrorCode.BadRequest],
    }
  }
})
