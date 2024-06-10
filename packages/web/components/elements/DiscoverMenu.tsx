import { HStack, SpanBox, VStack } from './LayoutPrimitives'
import { StyledText } from './StyledText'
import { NewspaperClipping } from '@phosphor-icons/react'
import { theme } from '../tokens/stitches.config'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

export function Discover(): JSX.Element {
  const [isUsed, setIsUsed] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setIsUsed(window.location.pathname.includes('/discover'))
  }, [])

  return (
    <VStack
      css={{
        m: '0px',
        width: '100%',
        borderBottom: '1px solid $thBorderColor',
        px: '15px',
        background: isUsed ? '$thLibrarySelectionColor' : 'none',
        '&:hover': {
          background: '$thLibrarySelectionColor',
          cursor: 'pointer',
        },
      }}
      onClick={() => {
        router.push('/discover')
      }}
      alignment="start"
      distribution="start"
    >
      <HStack css={{ width: '100%' }} distribution="start" alignment="center">
        <StyledText
          css={{
            fontFamily: '$inter',
            fontWeight: '600',
            fontSize: '16px',
            lineHeight: '125%',
            color: '$thLibraryMenuPrimary',
            pl: '10px',
            pb: '10px',
            mt: '20px',
            mb: '10px',
          }}
        >
          Discover
        </StyledText>
        <SpanBox
          css={{
            display: 'flex',
            height: '100%',
            mt: '0px',
            marginLeft: 'auto',
            position: 'relative',
            left: '-5px',
            verticalAlign: 'middle',
          }}
        >
          <NewspaperClipping
            size={15}
            color={theme.colors.thLibraryMenuPrimary.toString()}
          />
        </SpanBox>
      </HStack>
    </VStack>
  )
}
