import { Box, VStack } from '../../elements/LayoutPrimitives'
import { useMemo } from 'react'
import { SuggestionBox, SuggestionAction } from '../../elements/SuggestionBox'
import { DEFAULT_HEADER_HEIGHT } from './HeaderSpacer'
import { EmptyLibraryIcon } from '../../elements/icons/EmptyLibraryNotes'
import { EmptyHighlightsIcon } from '../../elements/icons/EmptyHighlightsIcon'
import { EmptyTrashIcon } from '../../elements/icons/EmptyTrashIcon'
import { useGetSubscriptions } from '../../../lib/networking/subscriptions/useGetSubscriptions'

type EmptyLibraryProps = {
  folder: string | undefined
  onAddLinkClicked?: () => void | undefined
}

const Icon = (props: EmptyLibraryProps) => {
  console.log('empty icon:', props.folder)
  switch (props.folder) {
    case 'highlights':
      return <EmptyHighlightsIcon />
    case 'trash':
      return <EmptyTrashIcon />
    default:
      return <EmptyLibraryIcon />
  }
}

const Title = (props: EmptyLibraryProps) => {
  // If its the subscriptions folder we fetch the subscriptions
  // to prevent a better message
  const { data: subscriptions, isLoading } = useGetSubscriptions(
    {},
    props.folder == 'subscriptions'
  )

  const titleText = (folder: string | undefined) => {
    switch (folder) {
      case 'highlights':
        return 'You do not have any highlights yet.'
      case 'trash':
        return 'Your trash is empty.'
      case 'archive':
        return 'You do not have any archived items.'
      case 'following':
        if (isLoading || (subscriptions?.length ?? 0) > 0) {
          return 'No subscription items found.'
        }
        return 'You do not have any subscriptions.'
      case 'home':
        return 'Your homepage is empty.'
    }
    return 'No results found.'
  }
  return (
    <Box
      css={{
        display: 'flex',
        marginBlockStart: '0px',
        marginBlockEnd: '10px',
        lineHeight: '125%',
        fontSize: '23px',
        fontFamily: '$inter',
        fontWeight: 'bold',
        textAlign: 'center',
      }}
    >
      {titleText(props.folder)}
    </Box>
  )
}

const Subtitle = (props: EmptyLibraryProps) => {
  // If its the subscriptions folder we fetch the subscriptions
  // to prevent a better message
  const { data: subscriptions, isLoading } = useGetSubscriptions(
    {},
    props.folder == 'subscriptions'
  )
  const titleText = (folder: string | undefined) => {
    switch (folder) {
      case 'home':
        return 'All your newly saved items and subscriptions will appear in your home section.'
      case 'inbox':
        return 'Items you have saved using the mobile apps and browser extensions, along with subscriptions you have moved into your library will appear here'
      case 'highlights':
        return 'Highlight text while reading to start building your highlights library.'
      case 'trash':
        return 'Deleted items will appear here before they are permanently deleted.'
      case 'archive':
        return 'Archived items are hidden from your library but saved forever. You can always access them here.'
      case 'following':
        if (isLoading || (subscriptions?.length ?? 0) > 0) {
          return 'No subscription items found.'
        }
        return 'Get started by subscribing to newsletters or feeds from the settings menu.'
    }
    return 'No results found.'
  }
  return (
    <Box
      css={{
        fontSize: '17px',
        fontFamily: '$inter',
        color: '$thNotebookSubtle',
        textAlign: 'center',
      }}
    >
      {titleText(props.folder)}
    </Box>
  )
}

export const EmptyLibrary = (props: EmptyLibraryProps) => {
  return (
    <VStack
      alignment="center"
      distribution="center"
      css={{
        gap: '5px',
        width: '100%',
        height: '100%',
        pb: '100px',
        px: '25px',
        maxWidth: '520px',
        color: '$thLibraryMenuSecondary',
        minHeight: `calc(100vh - ${DEFAULT_HEADER_HEIGHT})`,
      }}
    >
      <Icon {...props} />
      <Title {...props} />
      <Subtitle {...props} />
    </VStack>
  )
}
