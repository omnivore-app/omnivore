import { HStack, SpanBox, VStack } from './LayoutPrimitives'
import { ArrowRightIcon } from './icons/ArrowRightIcon'
import { theme } from '../tokens/stitches.config'
import { Button } from './Button'
import { CloseIcon } from './icons/CloseIcon'
import { HelpfulOwlImage } from './images/HelpfulOwlImage'
import { ArrowSquareOut } from 'phosphor-react'

type FeatureHelpBoxProps = {
  helpTitle: string
  helpMessage: string

  helpCTAText?: string
  onClickCTA?: () => void

  docsMessage: string
  docsDestination: string

  onDismiss: () => void
}

export const FeatureHelpBox = (props: FeatureHelpBoxProps) => {
  return (
    <HStack
      css={{
        gap: '10px',
        my: '40px',
        display: 'flex',
        width: 'fit-content',
        borderRadius: '5px',
        background: '$thBackground5',
        fontSize: '15px',
        fontFamily: '$inter',
        fontWeight: '500',
        color: '$grayText',
        px: '20px',
        py: '20px',
        justifyContent: 'flex-start',
        '@smDown': {
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%',
        },
      }}
    >
      <HStack css={{ gap: '30px' }}>
        <SpanBox css={{ pt: '7px', alignSelf: 'center' }}>
          <HelpfulOwlImage width={254} height={333} />
        </SpanBox>
        <HelpSection {...props} />
      </HStack>
    </HStack>
  )
}

const HelpSection = (props: FeatureHelpBoxProps) => {
  return (
    <VStack css={{ gap: '20px' }}>
      <HStack css={{ width: '100%', gap: '20px' }} distribution="between">
        <SpanBox
          css={{
            fontSize: '22px',
            fontFamily: '$display',
            color: '$thTextContrast2',
          }}
        >
          {props.helpTitle}
        </SpanBox>
        <Button
          style="plainIcon"
          title="Hide this tip"
          css={{ pt: '7px' }}
          onClick={(event) => {
            props.onDismiss()
            event.preventDefault()
          }}
        >
          <CloseIcon
            size={25}
            color={theme.colors.thTextContrast2.toString()}
          />
        </Button>
      </HStack>
      <SpanBox>{props.helpMessage}</SpanBox>
      <HStack css={{ gap: '20px' }}>
        {props.helpCTAText && props.onClickCTA && (
          <Button
            style="ctaDarkYellow"
            onClick={(event) => {
              if (props.onClickCTA) {
                props.onClickCTA()
                event.preventDefault()
              }
            }}
          >
            {props.helpCTAText}
          </Button>
        )}
        <Button
          style="ctaLightGray"
          onClick={(event) => {
            window.open(props.docsDestination, '_blank', 'noreferrer')
            event.preventDefault()
          }}
          css={{ display: 'flex', flexDirection: 'row', gap: '10px' }}
        >
          {props.docsMessage}
          <SpanBox css={{ alignSelf: 'center' }}>
            <ArrowSquareOut
              size={12}
              color={theme.colors.thTextContrast2.toString()}
            />
          </SpanBox>
        </Button>
      </HStack>
    </VStack>
  )
}
