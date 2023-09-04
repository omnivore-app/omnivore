import { Box } from '../../elements/LayoutPrimitives'
import { useMemo } from 'react'
import { LIBRARY_LEFT_MENU_WIDTH } from './LibraryFilterMenu'
import { LayoutType } from './HomeFeedContainer'
import { SuggestionBox, SuggestionAction } from '../../elements/SuggestionBox'

type EmptyLibraryProps = {
  searchTerm: string | undefined
  onAddLinkClicked: () => void

  layoutType: LayoutType
}

type MessageType =
  | 'inbox'
  | 'continue'
  | 'non-feed'
  | 'highlight'
  | 'unlabeled'
  | 'files'
  | 'archive'
  | 'feed'
  | 'subscription'
  | 'newsletter'
  | 'library'

type HelpMessageProps = {
  type: MessageType
}

export const ErrorBox = (props: HelpMessageProps) => {
  const errorTitle = useMemo(() => {
    switch (props.type) {
      case 'inbox':
        return 'Your inbox is empty. The inbox will contain all your non-archived saved items.'
      case 'continue':
        return "No continue reading items. Continue Reading items are items you have started but haven't finished reading."
      case 'non-feed':
        return "No non-feed items found. Non-feed items are items you've add to the library using the mobile apps, browser extensions, or Add Link button. Not newsletter or feed items."
      case 'highlight':
        return 'No highlights found. Add highlights to your library by highlighting text in the reader view.'
      case 'unlabeled':
        return 'No unlabeled items found. Items without labels can be found here. Use this query to easily triage your library.'
      case 'archive':
        return 'You do not have any archived items.'
      case 'files':
        return 'No files found.'
      case 'feed':
        return 'You do not have any feed items matching this query.'
      case 'subscription':
        return 'You do not have any subscriptions.'
      case 'newsletter':
        return 'You do not have any newsletter items matching this query.'
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

type SuggestionMessage = {
  message: string
  actions: SuggestionAction[]
}

export const Suggestion = (props: HelpMessageProps) => {
  const helpMessage = useMemo<SuggestionMessage>(() => {
    switch (props.type) {
      case 'feed':
        return {
          message: 'Want to add an RSS or Atom Subscription?',
          actions: [
            { text: 'Add an RSS or Atom feed', url: '/settings/feeds' },
          ],
        }
      case 'archive':
        return {
          message:
            'When you are done reading something archive it and it will be saved in Omnivore forever.',
          actions: [
            {
              text: 'Read the docs',
              url: 'https://docs.omnivore.app/using/saving',
            },
          ],
        }
      case 'files':
        return {
          message:
            'Drag PDFs into the library to add them to your Omnivore account.',
          actions: [],
        }
      case 'newsletter':
        return {
          message:
            'Create an Omnivore email address and subscribe to newsletters.',
          actions: [
            {
              text: 'Create an email address for newsletters',
              url: '/settings/emails',
            },
          ],
        }
      case 'subscription':
        return {
          message:
            'Create an Omnivore email address and subscribe to newsletters or add a feed from the Feeds page.',
          actions: [
            { text: 'Add an RSS or Atom feed', url: '/settings/feeds' },
            {
              text: 'Create an email address for newsletters',
              url: '/settings/emails',
            },
          ],
        }
    }
    return {
      message: "Add a link or read more about Omnivore's Advanced Search.",
      actions: [
        {
          text: 'Read the Docs',
          url: 'https://docs.omnivore.app/using/search.html',
        },
      ],
    }
  }, [props.type])

  return (
    <>
      {helpMessage ? (
        <SuggestionBox
          helpMessage={helpMessage.message}
          suggestions={helpMessage.actions}
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
        case 'in:inbox':
          return 'inbox'
        case 'in:inbox sort:read-desc is:unread':
          return 'continue'
        case 'in:library':
          return 'non-feed'
        case 'has:highlights mode:highlights':
          return 'highlight'
        case 'no:label':
          return 'unlabeled'
        case 'type:file':
          return 'files'
        case 'in:archive':
          return 'archive'
        case 'label:RSS':
          return 'feed'
        case 'in:subscription':
          return 'subscription'
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
