import { styled } from './../tokens/stitches.config'
import { Root, Fallback } from '@radix-ui/react-avatar'

type AvatarProps = {
  imageURL?: string
  height: string
  fallbackText: string
  tooltip?: string
}

export function Avatar(props: AvatarProps): JSX.Element {
  return (
    <StyledAvatar
      title={props.tooltip}
      css={{
        width: props.height,
        height: props.height,
        borderRadius: '50%',
      }}
    >
      <StyledFallback>{props.fallbackText}</StyledFallback>
    </StyledAvatar>
  )
}

const StyledAvatar = styled(Root, {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  verticalAlign: 'middle',
  overflow: 'hidden',
  userSelect: 'none',
})

const StyledFallback = styled(Fallback, {
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '15px',
  fontWeight: 600,
  fontFamily: '$inter',
  color: '$avatarFont',
  backgroundColor: '$avatarBg',
})
