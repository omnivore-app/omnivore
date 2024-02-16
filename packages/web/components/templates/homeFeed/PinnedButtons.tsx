import { useEffect, useState } from 'react'
import { HStack, SpanBox } from '../../elements/LayoutPrimitives'
import { theme } from '../../tokens/stitches.config'
import { Button } from '../../elements/Button'

import { Dropdown, DropdownOption } from '../../elements/DropdownElements'
import { MoreOptionsIcon } from '../../elements/images/MoreOptionsIcon'
import { PinnedSearch } from '../../../pages/settings/pinned-searches'
import { useRouter } from 'next/router'
import { usePersistedState } from '../../../lib/hooks/usePersistedState'
import { LayoutType } from './HomeFeedContainer'
import { MultiSelectMode } from './LibraryHeader'

type PinnedButtonsProps = {
  items: PinnedSearch[]
  searchTerm: string | undefined
  applySearchQuery: (searchQuery: string) => void

  multiSelectMode: MultiSelectMode
  layout: LayoutType
}

export const PinnedButtons = (props: PinnedButtonsProps): JSX.Element => {
  const router = useRouter()
  const [hidePinnedSearches, setHidePinnedSearches] = usePersistedState({
    key: '--library-hide-pinned-searches',
    initialValue: false,
    isSessionStorage: false,
  })
  const [opacity, setOpacity] = useState(1.0)

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      const opacityValue = 1 - scrollTop / 15
      setOpacity(opacityValue >= 0 ? opacityValue : 0)
    }

    window.addEventListener('scroll', handleScroll)

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  if (hidePinnedSearches || !props.items.length) {
    return <></>
  }

  return (
    <HStack alignment="center" distribution="start" css={{ maxWidth: '100%' }}>
      <HStack
        alignment="center"
        distribution="start"
        css={{
          gap: '10px',
          bg: 'transparent',
          overflowX: 'scroll',
          opacity: opacity,

          '@lgDown': {
            display: 'none',
          },
          '@media (min-width: 930px)': {
            px: '0px',
            maxWidth: '580px',
          },
          '@media (min-width: 1280px)': {
            maxWidth: '890px',
          },
          '@media (min-width: 1600px)': {
            maxWidth: '1200px',
          },
        }}
      >
        {props.items.map((item) => {
          const style =
            item.search == props.searchTerm ? 'ctaPill' : 'ctaPillUnselected'
          return (
            <Button
              key={item.search}
              style={style}
              onClick={(event) => {
                props.applySearchQuery(item.search)
                event.preventDefault()
              }}
            >
              {item.name}
            </Button>
          )
        })}
      </HStack>

      <Dropdown
        triggerElement={
          <SpanBox
            css={{
              ml: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              width: '30px',
              height: '30px',
              border: '1px solid $thBackground4',
              '&:hover': {
                bg: '$grayBgHover',
                border: '1px solid $grayBgHover',
              },
            }}
          >
            <MoreOptionsIcon
              size={16}
              strokeColor={theme.colors.grayText.toString()}
              orientation={'horizontal'}
            />
          </SpanBox>
        }
        css={{}}
      >
        <DropdownOption
          onSelect={() => {
            router.push('/settings/pinned-searches')
          }}
          title="Edit"
        />
        <DropdownOption
          onSelect={() => {
            setHidePinnedSearches(true)
          }}
          title="Hide"
        />
      </Dropdown>
    </HStack>
  )
}
