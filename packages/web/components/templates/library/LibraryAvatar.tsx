import { SpanBox, VStack } from '../../elements/LayoutPrimitives'
import { UserBasicData } from '../../../lib/networking/queries/useGetViewerQuery'

import { styled } from '../../tokens/stitches.config'
import { Root, Image, Fallback } from '@radix-ui/react-avatar'

type AvatarProps = {
  viewer?: UserBasicData
}

export function LibraryAvatar(props: AvatarProps): JSX.Element {
  return (
    <VStack alignment="center" distribution="start" css={{ pl: '8px', pt: '20px', width: '100%', height: '100%' }}>
      <VStack css={{ height: '100%' }}>
        <StyledAvatar
          css={{
            width: '40px',
            height: '40px',
            borderRadius: '6px',
          }}
        >
          {props.viewer?.profile.pictureUrl 
            ? <StyledImage src={props.viewer.profile.pictureUrl} />
            : <StyledFallback>{props.viewer?.name.charAt(0) ?? ''}</StyledFallback>
          }
        </StyledAvatar>
      </VStack>
      {/* This spacer is to help align with items in the search box */}
      <SpanBox css={{ marginTop: 'auto', height: '10px', width: '100%' }} />
    </VStack> 
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

const StyledImage = styled(Image, {
  width: '100%',
  height: '100%',
  objectFit: 'cover',

  '&:hover': {
    opacity: '48%',
  },
})

const StyledFallback = styled(Fallback, {
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '20px',
  backgroundColor: '$omnivoreCtaYellow',
  color: '#595959',
})
