import { HStack, Box } from '../../elements/LayoutPrimitives'
import { StyledText } from '../../elements/StyledText'
import { theme } from '../../tokens/stitches.config'
import { CaretLeft, Check, CheckCircle } from 'phosphor-react'

const FONT_FAMILIES = [
  'Inter',
  'System Default',
  'Merriweather',
  'Lora',
  'Open Sans',
  'Roboto',
  'Crimson Text',
  'OpenDyslexic',
  'Source Serif Pro'
]

type FontFamiliesListProps = {
  selected: string
  setShowFontFamilies: (value: boolean) => void
  onSelect: (value: string) => void
}

type FontOptionProps = {
  family: string
  selected: string
  onSelect: (value: string) => void
}

function FontOption(props: FontOptionProps):JSX.Element {
  const isSelected = props.selected === props.family
  return (
    <HStack distribution='between' alignment='start' css={{ width: '100%', pt: '14px' }}>
      <StyledText
        css={{ m: '0px', fontSize: 16, fontFamily: props.family, textTransform: 'capitalize', cursor: 'pointer' }}
        onClick={() => props.onSelect(props.family)}
      >
        {props.family}
      </StyledText>
      {isSelected && (
        <Check color={theme.colors.grayTextContrast.toString()} weight='bold' />
      )}
    </HStack>
  )
}

export function FontFamiliesOptions(props: FontFamiliesListProps): JSX.Element {
  return (
    <>
      <Box css={{borderBottom: `1px solid ${theme.colors.grayLine.toString()}`, width: '100%'}}>
        <HStack alignment='center' distribution='between' css={{width: '100%', py: 10, px: 15}}>
          <HStack
            alignment='center'
            distribution='start'
            css={{ cursor: 'pointer', py: '4px', width: '100%' }}
            onClick={() => props.setShowFontFamilies(false)}
          >
            <CaretLeft color={theme.colors.utilityTextSubtle.toString()} size={15} />
            <StyledText css={{ textAlign: 'center', m: 0, fontSize: 14, fontWeight: 'bold', width: '100%', wordWrap: 'revert' }}>Choose Font</StyledText>
          </HStack>
        </HStack>
      </Box>
      <Box css={{ px: 15, pb: 15, width: '100%' }}>
        {FONT_FAMILIES.map((family) => (
          <FontOption selected={props.selected} family={family} onSelect={props.onSelect} key={`font-${family}`} />
        ))}
      </Box>
    </>
  )
}
