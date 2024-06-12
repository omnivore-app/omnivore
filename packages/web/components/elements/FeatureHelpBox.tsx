import { HStack, SpanBox, VStack } from './LayoutPrimitives'
import { theme } from '../tokens/stitches.config'
import { Button } from './Button'
import { CloseIcon } from './icons/CloseIcon'
import { HelpfulSlothImage } from './images/HelpfulSlothImage'
import { ArrowSquareOut } from '@phosphor-icons/react'
import { useEffect, useState } from 'react'

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
  const [display, setDisplay] = useState(false)

  useEffect(() => {
    setDisplay(true)
  }, [])

  if (!display) {
    return <></>
  }

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
      }}
      alignment="start"
      distribution="start"
    >
      <HStack css={{ gap: '30px' }}>
        <SpanBox
          css={{
            pt: '7px',
            alignSelf: 'center',
            '@smDown': { display: 'none' },
          }}
        >
          <HelpfulSlothImage />
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
            css={{ '@smDown': { display: 'none' } }}
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
