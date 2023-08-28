import Link from 'next/link'
import { Book } from 'phosphor-react'
import { Button } from '../../elements/Button'
import { VStack } from '../../elements/LayoutPrimitives'
import { StyledText } from '../../elements/StyledText'
import { theme } from '../../tokens/stitches.config'
import { useMemo } from 'react'
import { searchQuery } from '../../../lib/networking/queries/search'

type EmptyLibraryProps = {
  searchTerm: string | undefined
  onAddLinkClicked: () => void
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
          <a href="/settings/feeds">feeds page</a>. Learn more about feeds at
          &apos;s{' '}
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
          the <a href="/settings/feeds">emails page</a>. Learn more about
          reading newsletters in Omnivore at &apos;s{' '}
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

  const helpTitle = useMemo(() => {
    switch (type) {
      case 'feed':
        return 'You do not have any feed items matching this query.'
      case 'newsletter':
        return 'You do not have any newsletter items.'
    }
    return 'No results found.'
  }, [type])

  return (
    <VStack
      alignment="center"
      distribution="center"
      css={{
        color: '$grayTextContrast',
        textAlign: 'center',
        paddingTop: '88px',
        flex: '1',
      }}
    >
      <Book size={44} color={theme.colors.grayTextContrast.toString()} />
      <StyledText style="fixedHeadline" css={{ color: '$grayTextContrast' }}>
        {helpTitle}
      </StyledText>

      <StyledText style="footnote" css={{ color: '$grayTextContrast' }}>
        <HelpMessage type={type} />
      </StyledText>
    </VStack>
  )
}
