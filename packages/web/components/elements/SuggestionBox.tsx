import Link from 'next/link'
import { HStack, SpanBox, VStack } from './LayoutPrimitives'
import { ArrowRightIcon } from './icons/ArrowRightIcon'
import { theme } from '../tokens/stitches.config'
import { ReactNode } from 'react'
import { Button } from './Button'
import { CloseIcon } from './icons/CloseIcon'

export type SuggestionAction = {
  url: string
  text: string
}

type SuggestionBoxProps = {
  helpMessage: string
  suggestions: SuggestionAction[]

  size?: 'large' | 'small'
  background?: string

  dismissible?: boolean
  onDismiss?: () => void
}

type InternalOrExternalLinkProps = {
  link: string
  children: ReactNode
}

const InternalOrExternalLink = (props: InternalOrExternalLinkProps) => {
  const isExternal = props.link.startsWith('https')

  return (
    <SpanBox
      css={{
        cursor: 'pointer',
        a: {
          color: '$omnivoreCtaYellow',
        },
      }}
    >
      {!isExternal ? (
        <Link href={props.link} legacyBehavior>
          {props.children}
        </Link>
      ) : (
        <a href={props.link} target="_blank" rel="noreferrer">
          {props.children}
        </a>
      )}
    </SpanBox>
  )
}

export const SuggestionBox = (props: SuggestionBoxProps) => {
  return (
    <HStack
      css={{
        gap: '10px',
        display: 'flex',
        flexDirection: props.size == 'large' ? 'column' : 'row',
        width: 'fit-content',
        borderRadius: '5px',
        background: props.background ?? 'unset',
        fontSize: '15px',
        fontFamily: '$inter',
        fontWeight: '500',
        color: '$thTextContrast',
        px: '15px',
        py: props.size == 'large' ? '15px' : '10px',
        justifyContent: 'flex-start',
        '@smDown': {
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%',
        },
      }}
    >
      <VStack>
        {props.dismissible && (
          <SpanBox
            css={{
              marginLeft: 'auto',
              lineHeight: '2',
            }}
          >
            <Button
              style="plainIcon"
              css={{
                fontSize: '10',
                fontWeight: '600',
              }}
            >
              <CloseIcon size={2} color="white" />
            </Button>
          </SpanBox>
        )}
        {props.helpMessage}
        {props.suggestions.map((suggestion, idx) => {
          return (
            <InternalOrExternalLink
              key={`suggestions-${idx}`}
              link={suggestion.url}
            >
              <SpanBox
                css={{
                  display: 'flex',
                  alignItems: 'center',
                  color: '$omnivoreCtaYellow',
                  pt: '15px',
                  gap: '2px',
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                }}
              >
                <>{suggestion.text}</>
                <ArrowRightIcon
                  size={25}
                  color={theme.colors.omnivoreCtaYellow.toString()}
                />
              </SpanBox>
            </InternalOrExternalLink>
          )
        })}
      </VStack>
    </HStack>
  )
}
