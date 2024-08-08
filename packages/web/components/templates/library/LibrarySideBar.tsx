import { VStack } from '../../elements/LayoutPrimitives'

type LibrarySideBarProps = {
  text: string
}

export function LibrarySideBar(props: LibrarySideBarProps): JSX.Element {
  return <VStack css={{ width: '100%', height: '100%' }}>{props.text}</VStack>
}
