import { VStack } from '../components/elements/LayoutPrimitives'
import { ExportDataButton } from '../components/templates/ExportDataForm'

export default function AccountArchivedPage(): JSX.Element {
  return (
    <VStack alignment="center" distribution="center">
      <h1>Your account has been archived</h1>
      <p>
        Your account has been archived. If you would like to reactivate your
        account, please contact support.
      </p>

      <ExportDataButton />
    </VStack>
  )
}
