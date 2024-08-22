import { Button } from '../../components/elements/Button'
import {
  BorderedFormInput,
  FormLabel,
} from '../../components/elements/FormElements'
import { SpanBox, VStack } from '../../components/elements/LayoutPrimitives'
import { StyledText } from '../../components/elements/StyledText'
import { webBaseURL } from '../../lib/appConfig'

export default function DebugShareTarget(): JSX.Element {
  return (
    <Button
      type="submit"
      style="ctaDarkYellow"
      css={{ my: '$2' }}
      onClick={(event) => {
        throw new Error('test error for sentry')
      }}
    >
      Submit
    </Button>
  )
}
