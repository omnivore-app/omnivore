import Link from 'next/link'
import { Book } from 'phosphor-react'
import { Button } from '../../elements/Button'
import { Box, HStack, SpanBox, VStack } from '../../elements/LayoutPrimitives'
import { StyledText } from '../../elements/StyledText'
import { theme } from '../../tokens/stitches.config'
import { useMemo } from 'react'
import { searchQuery } from '../../../lib/networking/queries/search'
import { LIBRARY_LEFT_MENU_WIDTH } from './LibraryFilterMenu'
import { LayoutType } from './HomeFeedContainer'
import { ArrowRightIcon } from '../../elements/icons/ArrowRightIcon'

type EmptyLibraryProps = {
  searchTerm: string | undefined
  onAddLinkClicked: () => void

  layoutType: LayoutType
}

type MessageType = 'feed' | 'newsletter' | 'library'

type HelpMessageProps = {
  type: MessageType
}

const HelpMessage = (props: HelpMessageProps) => {
  switch (props.type) {
    case 'library':
      return (
        <>
          You can add a link or read more about Omnivore&apos;s{' '}
          <a
            href="https://docs.omnivore.app/using/search.html"
            target="_blank"
            rel="noreferrer"
          >
            advanced search
          </a>
          .
        </>
      )
    case 'feed':
      return (
        <>
          You can subscribe to RSS feeds using the{' '}
          <Link href="/settings/feeds" passHref>
            feeds page
          </Link>
          . Learn more about feeds at &apos;s{' '}
          <a
            href="https://docs.omnivore.app/using/feeds.html"
            target="_blank"
            rel="noreferrer"
          >
            docs.omnivore.app/using/feeds.html
          </a>
          .
        </>
      )
    case 'newsletter':
      return (
        <>
          Create email addresses that can be used to subscribe to newsletters on
          the{' '}
          <Link href="/settings/emails" passHref>
            emails page
          </Link>
          . Learn more about reading newsletters in Omnivore at &apos;s{' '}
          <a
            href="https://docs.omnivore.app/using/inbox.html"
            target="_blank"
            rel="noreferrer"
          >
            docs.omnivore.app/using/inbox.html
          </a>
          .
        </>
      )
  }
  return <></>
}

export const ErrorBox = (props: HelpMessageProps) => {
  const errorTitle = useMemo(() => {
    switch (props.type) {
      case 'feed':
        return 'You do not have any feed items matching this query.'
      case 'newsletter':
        return 'You do not have any newsletter item matching this query.'
    }
    return 'No results found for this query.'
  }, [props.type])

  return (
    <Box
      css={{
        width: 'fit-content',
        borderRadius: '5px',
        background: 'rgba(255, 59, 48, 0.3)',
        fontSize: '15px',
        fontFamily: '$inter',
        fontWeight: '500',
        color: '$thTextContrast',
        padding: '10px',
        '@smDown': {
          width: '100%',
        },
        '@xlgDown': {
          justifyContent: 'flex-start',
        },
      }}
    >
      {errorTitle}
    </Box>
  )
}

export const SuggestionBox = (props: HelpMessageProps) => {
  const helpMessage = useMemo(() => {
    switch (props.type) {
      case 'feed':
        return 'Want to add an RSS or Atom Subscription?'
      case 'newsletter':
        return 'Create an Omnivore email address and subscribe to newsletters.'
    }
    return "Add a link or read more about Omnivore's Advanced Search."
  }, [props.type])

  const helpTarget = useMemo(() => {
    switch (props.type) {
      case 'feed':
        return '/settings/feeds'
      case 'newsletter':
        return '/settings/emails'
    }
    return 'https://docs.omnivore.app/'
  }, [props.type])

  return (
    <HStack
      css={{
        gap: '10px',
        width: 'fit-content',
        borderRadius: '5px',
        background: '$thBackground3',
        fontSize: '15px',
        fontFamily: '$inter',
        fontWeight: '500',
        color: '$thTextContrast',
        padding: '10px',
        justifyContent: 'flex-start',
        '@smDown': {
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%',
        },
      }}
    >
      {helpMessage}
      <SpanBox css={{ cursor: 'pointer' }}>
        <Link href={helpTarget} passHref>
          <SpanBox
            css={{
              display: 'flex',
              alignItems: 'center',
              color: '$omnivoreCtaYellow',
              gap: '2px',
              '&:hover': {
                textDecoration: 'underline',
              },
            }}
          >
            <>Click Here</>
            <ArrowRightIcon
              size={25}
              color={theme.colors.omnivoreCtaYellow.toString()}
            />
          </SpanBox>
        </Link>
      </SpanBox>
    </HStack>
  )
}

export const EmptyLibrary = (props: EmptyLibraryProps) => {
  const type = useMemo<MessageType>(() => {
    if (props.searchTerm) {
      switch (props.searchTerm) {
        case 'label:RSS':
          return 'feed'
        case 'label:Newsletter':
          return 'newsletter'
      }
    }
    return 'library'
  }, [props])

  return (
    <Box
      css={{
        display: 'inline-flex',
        color: '$grayTextContrast',
        gap: '10px',
        pl: '0px',

        width: '100%',
        '@media (max-width: 1300px)': {
          flexDirection: 'column',
        },

        '@media (max-width: 768px)': {
          p: '15px',
        },

        '@media (min-width: 768px)': {
          pl: '15px',
          width: `calc(100vw - ${LIBRARY_LEFT_MENU_WIDTH})`,
        },
        '@media (min-width: 930px)': {
          pl: '0px',
          width: props.layoutType == 'GRID_LAYOUT' ? '660px' : '640px',
        },
        '@media (min-width: 1280px)': {
          pl: '0px',
          width: '1000px',
        },
        '@media (min-width: 1600px)': {
          pl: '0px',
          width: '1340px',
        },
      }}
    >
      <ErrorBox type={type} />
      <SuggestionBox type={type} />
    </Box>
  )
}
