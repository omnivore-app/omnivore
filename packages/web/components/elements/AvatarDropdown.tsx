import { Avatar } from './../elements/Avatar'
import { AngleDownIcon } from './../tokens/icons/AngleDownIcon'
import { HStack } from '../elements/LayoutPrimitives'

type AvatarDropdownProps = {
  profileImageURL?: string
  userInitials: string
}

export function AvatarDropdown(props: AvatarDropdownProps): JSX.Element {
  return (
    <HStack alignment="center" css={{ gap: '6px' }}>
      <Avatar
        imageURL={props.profileImageURL}
        height='32px'
        fallbackText={props.userInitials}
      />
    </HStack>
  )
}
