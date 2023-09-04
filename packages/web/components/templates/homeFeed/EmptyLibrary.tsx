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
import { SuggestionBox } from '../../elements/SuggestionBox'

type EmptyLibraryProps = {
  searchTerm: string | undefined
  onAddLinkClicked: () => void

  layoutType: LayoutType
}

type MessageType =
  | 'inbox'
  | 'files'
  | 'archive'
  | 'feed'
  | 'newsletter'
  | 'library'

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
      case 'inbox':
        return 'Your inbox is empty.'
      case 'archive':
        return 'You do not have any archived items.'
      case 'files':
        return 'No files found.'
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
        py: '10px',
        px: '15px',
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

export const Suggestion = (props: HelpMessageProps) => {
  const helpMessage = useMemo(() => {
    switch (props.type) {
      case 'feed':
        return ['Want to add an RSS or Atom Subscription?', 'Click Here']
      case 'archive':
        return [
          'When you are done reading something archive it and it will be saved in Omnivore forever.',
          'Read the Docs',
        ]
      case 'files':
        return [
          'Drag PDFs into the library to add them to your Omnivore account.',
          undefined,
        ]
      case 'newsletter':
        return [
          'Create an Omnivore email address and subscribe to newsletters.',
          'Click Here',
        ]
    }
    return [
      "Add a link or read more about Omnivore's Advanced Search.",
      'Read the Docs',
    ]
  }, [props.type])

  const helpTarget = useMemo(() => {
    switch (props.type) {
      case 'feed':
        return '/settings/feeds'
      case 'archive':
      case 'files':
        return undefined
      case 'archive':
      case 'inbox':
        return 'https://docs.omnivore.app/using/saving'
      case 'newsletter':
        return '/settings/emails'
    }
    return 'https://docs.omnivore.app/'
  }, [props.type])

  const helpTargetWindow = useMemo(() => {
    switch (props.type) {
      case 'archive':
      case 'inbox':
        return '_blank'
    }
    return undefined
  }, [props.type])

  return (
    <>
      {helpMessage[0] ? (
        <SuggestionBox
          helpMessage={helpMessage[0]}
          helpCTAText={helpMessage[1]}
          helpTarget={helpTarget}
        />
      ) : (
        <></>
      )}
    </>
  )
}

export const EmptyLibrary = (props: EmptyLibraryProps) => {
  const type = useMemo<MessageType>(() => {
    if (props.searchTerm) {
      switch (props.searchTerm) {
        case 'in:archive':
          return 'archive'
        case 'in:inbox':
          return 'inbox'
        case 'type:file':
          return 'files'
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
        flexDirection: 'column',

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
      <Suggestion type={type} />
    </Box>
  )
}
