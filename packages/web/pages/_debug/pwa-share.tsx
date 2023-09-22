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
    <form action={`${webBaseURL}/share-target`} method="POST">
      <VStack
        alignment="center"
        css={{
          padding: '16px',
          background: 'white',
          minWidth: '340px',
          width: '70vw',
          maxWidth: '576px',
          borderRadius: '8px',
          border: '1px solid #3D3D3D',
          boxShadow: '#B1B1B1 9px 9px 9px -9px',
        }}
      >
        <StyledText style="subHeadline" css={{ color: '$omnivoreGray' }}>
          Debug the share-target PWA feature
        </StyledText>
        <VStack
          css={{ width: '100%', minWidth: '320px', gap: '16px', pb: '16px' }}
        >
          <SpanBox css={{ width: '100%' }}>
            <FormLabel>URL</FormLabel>
            <BorderedFormInput
              key="url"
              type="url"
              name="url"
              placeholder="URL"
              autoFocus={true}
              css={{ bg: 'white', color: 'black' }}
            />
          </SpanBox>
        </VStack>

        <Button type="submit" style="ctaDarkYellow" css={{ my: '$2' }}>
          Submit
        </Button>
      </VStack>
    </form>
  )
}
