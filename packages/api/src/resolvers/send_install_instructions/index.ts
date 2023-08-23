import { User } from '../../entity/user'
import { env } from '../../env'
import {
  SendInstallInstructionsError,
  SendInstallInstructionsErrorCode,
  SendInstallInstructionsSuccess,
} from '../../generated/graphql'
import { AppDataSource } from '../../data-source'
import { authorized } from '../../utils/helpers'
import { sendEmail } from '../../utils/sendEmail'

const INSTALL_INSTRUCTIONS_EMAIL_TEMPLATE_ID =
  'd-c576bdc3b9a849dab250655ba14c7794'

export const sendInstallInstructionsResolver = authorized<
  SendInstallInstructionsSuccess,
  SendInstallInstructionsError
>(async (_parent, _args, { claims, log }) => {
  try {
    const user = await AppDataSource.getRepository(User).findOneBy({
      id: claims.uid,
    })

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
