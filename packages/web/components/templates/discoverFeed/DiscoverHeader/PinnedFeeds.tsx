import { HStack, SpanBox } from '../../../elements/LayoutPrimitives'
import { theme } from '../../../tokens/stitches.config'
import { Button } from '../../../elements/Button'

import { Dropdown, DropdownOption } from '../../../elements/DropdownElements'
import { MoreOptionsIcon } from '../../../elements/images/MoreOptionsIcon'
import { useRouter } from 'next/router'
import { DiscoverFeed } from "../../../../lib/networking/queries/useGetDiscoverFeeds"

type PinnedFeedsProps = {
  items: DiscoverFeed[]
  selected: string
  applyFeedFilter: (feedFilter: string) => void
}

export const PinnedFeeds = (props: PinnedFeedsProps): JSX.Element => {
  const router = useRouter()

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
        // overflowX: 'scroll',
      }}
    >
      {[{ title: "All Feeds", id:"All Feeds" }, { title: "Community", id: "Community" },  ...props.items.map(({visibleName, id}) => ({ title: visibleName, id }))].map((it) => {
        const style =
          it.id == props.selected ? 'ctaPill' : 'ctaPillUnselected'
        return (
          <Button
            key={it.id}
            style={style}
            onClick={(event) => {
              props.applyFeedFilter(it.id)
              event.preventDefault()
            }}
          >
            {it.title}
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
      >
        <DropdownOption
          onSelect={() => {
            router.push('/settings/discover-feeds')
          }}
          title="Edit"
        />

      </Dropdown>
    </HStack>
  )
}
