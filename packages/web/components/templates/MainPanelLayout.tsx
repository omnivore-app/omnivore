import { MouseEventHandler } from 'react'
import { Button } from '../elements/Button'
import { HStack, VStack } from '../elements/LayoutPrimitives'
import { LeftPanelToggleIcon } from '../elements/icons/LeftPanelToggleIcon'

type MainPanelLayoutProps = {
  showLeftToggle: boolean
  showRightToggle: boolean

  leftToggleClicked: (event: React.MouseEvent<HTMLElement>) => void
  rightToggleClicked: (event: React.MouseEvent<HTMLElement>) => void

  children: React.ReactNode
}

export const MainPanelLayout = (props: MainPanelLayoutProps): JSX.Element => {
  return (
    <VStack>
      <HStack
        css={{
          top: 0,
          position: 'relative',
          width: '100%',
          px: '10px',
          pb: '10px',
          pt: '10px',
          lineHeight: '1',
        }}
        distribution="between"
      >
        <Button style="plainIcon" onClick={props.leftToggleClicked}>
          <LeftPanelToggleIcon size={26} color="white" />
        </Button>

        <Button style="plainIcon" onClick={props.rightToggleClicked}>
          <LeftPanelToggleIcon size={26} color="white" />
        </Button>
      </HStack>
      {props.children}
    </VStack>
  )
}
