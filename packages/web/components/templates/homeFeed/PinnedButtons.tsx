import { useCallback, useEffect, useRef, useState } from 'react'
import { HStack, SpanBox } from '../../elements/LayoutPrimitives'
import { theme } from '../../tokens/stitches.config'
import { Button } from '../../elements/Button'

import { Dropdown, DropdownOption } from '../../elements/DropdownElements'
import { MoreOptionsIcon } from '../../elements/images/MoreOptionsIcon'
import { PinnedSearch } from '../../../pages/settings/pinned-searches'
import { useRouter } from 'next/router'
import { usePersistedState } from '../../../lib/hooks/usePersistedState'

type PinnedButtonsProps = {
  items: PinnedSearch[]
  searchTerm: string | undefined
  applySearchQuery: (searchQuery: string) => void
}

export const PinnedButtons = (props: PinnedButtonsProps): JSX.Element => {
  const router = useRouter()
  const [hidePinnedSearches, setHidePinnedSearches] = usePersistedState({
    key: '--library-hide-pinned-searches',
    initialValue: false,
    isSessionStorage: false,
  })

  if (hidePinnedSearches || !props.items.length) {
    return <></>
  }

  return (
    <HStack
      alignment="center"
      distribution="start"
      css={{
        width: '100%',
        maxWidth: '100%',
        pt: '10px',
        pb: '0px',
        gap: '10px',
        bg: 'transparent',
        overflowX: 'scroll',
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
      <Dropdown
        triggerElement={
          <SpanBox
            css={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              width: '24px',
              height: '24px',
              border: '1px solid $thBackground4',
              backgroundColor: '$thBackground4',
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
        children={
          <>
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
          </>
        }
      ></Dropdown>
    </HStack>
  )
}
