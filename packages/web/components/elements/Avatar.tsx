import { styled } from './../tokens/stitches.config'
import { Root, Image, Fallback } from '@radix-ui/react-avatar'

type AvatarProps = {
  imageURL?: string
  height: string
  fallbackText: string
}

export function Avatar(props: AvatarProps): JSX.Element {
  return (
    <StyledAvatar
      css={{
        width: props.height,
        height: props.height,
        borderRadius: '50%',
      }}
    >
      <StyledImage src={props.imageURL} />
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
  border: '1px solid $grayBorder',
})

const StyledImage = styled(Image, {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  opacity: '48%',

  '&:hover': {
    opacity: '100%',
  },
})

const StyledFallback = styled(Fallback, {
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '$2',
  fontWeight: 700,
  backgroundColor: '$avatarBg',
  color: '$toolColor',
})
