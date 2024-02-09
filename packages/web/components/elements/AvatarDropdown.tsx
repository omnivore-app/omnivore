import { Avatar } from './../elements/Avatar'
import { HStack } from '../elements/LayoutPrimitives'

type AvatarDropdownProps = {
  userInitials: string
}

export function AvatarDropdown(props: AvatarDropdownProps): JSX.Element {
  return (
    <HStack alignment="center" css={{ gap: '6px' }}>
      <Avatar height="25px" fallbackText={props.userInitials} />
    </HStack>
  )
}
