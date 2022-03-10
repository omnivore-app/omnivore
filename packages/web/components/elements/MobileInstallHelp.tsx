import { VStack } from '../elements/LayoutPrimitives'
import { StyledText } from '../elements/StyledText'

export default function MobileInstallHelp(): JSX.Element {
  return (
    <VStack
      css={{
        px: '$1',
        py: '$3',
        maxWidth: '30em',
      }}
    >
      <StyledText style="boldHeadline">Install Omnivore for iOS</StyledText>
      <StyledText style="body" css={{ width: '100%' }}>
      With the Omnivore iOS app installed you can save any link using our share extension.
      Learn more about the share extension <a href="https://omnivore.app/help/saving-links#savingfromyouriphone">here.</a>
      </StyledText>
      <VStack alignment="center" css={{ mt: '16px', width: '100%' }}>
        <a href="https://omnivore.app/install/ios" style={{ display: 'inlineBlock', overflow: 'hidden', borderTopLeftRadius: '13px', borderTopRightRadius: '13px', borderBottomRightRadius: '13px', borderBottomLeftRadius: '13px', width: '250px', height: '83px' }}>
          <img src="https://tools.applemediaservices.com/api/badges/download-on-the-app-store/black/en-us?size=250x83&amp;releaseDate=1628121600&h=2bbc629b0455dbea136257c9f518e4b3" alt="Download on the App Store" style={{ borderTopLeftRadius: '13px', borderTopRightRadius: '13px', borderBottomRightRadius: '13px', borderBottomLeftRadius: '13px', width: '250px', height: '83px'}} />
        </a>
      </VStack>
    </VStack>
  )
}
