import { VStack } from '../../components/elements/LayoutPrimitives'
import { applyStoredTheme } from '../../lib/themeUpdater'

type LoadingViewProps = {
  bgColor?: string
}

export function LoadingView(props: LoadingViewProps): JSX.Element {
  applyStoredTheme()

  return (
    <VStack
      alignment="center"
      distribution="center"
      css={{
        bg: props.bgColor ?? '$grayBase',
        height: '100vh',
        width: '100vw',
      }}
    />
  )
}
