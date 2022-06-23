import { Root, Content, Anchor, Arrow } from '@radix-ui/react-popover'
import type { ReactNode } from 'react'
import { styled } from '../tokens/stitches.config'

type AnchoredPopoverProps = {
  children: ReactNode
  xAnchorCoordinate: number
  yAnchorCoordinate: number
  preventAutoFocus: boolean
}

export function AnchoredPopover(props: AnchoredPopoverProps): JSX.Element {
  const StyledAnchor = styled(Anchor, {
    position: 'absolute',
    left: props.xAnchorCoordinate,
    top: props.yAnchorCoordinate,
  })

  const StyledArrow = styled(Arrow, {
    fill: '$grayBase',
  })

  return (
    <Root defaultOpen modal>
      <StyledAnchor />
      <Content
        side="top"
        sideOffset={18}
        onOpenAutoFocus={(event) => {
          if (props.preventAutoFocus) {
            event.preventDefault()
          }
        }}
      >
        {props.children}
        <StyledArrow />
      </Content>
    </Root>
  )
}
