import { env } from '../../env'
import {
  SendInstallInstructionsError,
  SendInstallInstructionsErrorCode,
  SendInstallInstructionsSuccess,
} from '../../generated/graphql'
import { userRepository } from '../../repository/user'
import { authorized } from '../../utils/gql-utils'
import { sendEmail } from '../../utils/sendEmail'

const INSTALL_INSTRUCTIONS_EMAIL_TEMPLATE_ID =
  'd-c576bdc3b9a849dab250655ba14c7794'

export const sendInstallInstructionsResolver = authorized<
  SendInstallInstructionsSuccess,
  SendInstallInstructionsError
>(async (_parent, _args, { uid, log }) => {
  try {
    const user = await userRepository.findById(uid)

    if (!user) {
      return { errorCodes: [SendInstallInstructionsErrorCode.Unauthorized] }
    }

    const sendInstallInstructions = await sendEmail({
      from: env.sender.message,
      templateId:
        env.sendgrid.installationTemplateId ||
        INSTALL_INSTRUCTIONS_EMAIL_TEMPLATE_ID,
      to: user?.email,
    })

    return {
      sent: sendInstallInstructions,
    }
  } catch (e) {
    log.info(e)

    return {
      errorCodes: [SendInstallInstructionsErrorCode.BadRequest],
    }
  }
})
