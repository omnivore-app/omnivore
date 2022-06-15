import { HStack, Box } from '../../elements/LayoutPrimitives'
import { StyledText } from '../../elements/StyledText'
import { theme } from '../../tokens/stitches.config'
import { CaretLeft, CheckCircle } from 'phosphor-react'

const DEFAULT_FONT_FAMILY = 'Inter'
const GOOGLE_FONT_FAMILIES = ['Lyon', 'Tisa', 'Merriweather']

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
  return (
    <HStack distribution='between' alignment='start' css={{width: '100%', pt: '14px'}}>
      <StyledText
        css={{ m: '0px', fontSize: 16, fontWeight: '600', fontFamily: props.family, textTransform: 'capitalize', cursor: 'pointer' }}
        onClick={() => props.onSelect(props.family)}
      >
        {props.family}
      </StyledText>
      {props.selected === props.family && (
        <CheckCircle color={theme.colors.grayTextContrast.toString()} />
      )}
    </HStack>
  )
}

export function FontFamiliesOptions(props: FontFamiliesListProps): JSX.Element {
  return (
    <>
      <Box css={{borderBottom: `1px solid ${theme.colors.grayLine.toString()}`, width: '100%'}}>
        <HStack alignment='center' distribution='between' css={{width: '70%', py: 10, px: 15}}>
          <HStack
            alignment='center'
            distribution='start'
            css={{cursor: 'pointer'}}
            onClick={() => props.setShowFontFamilies(false)}
          >
            <Box css={{position: 'relative', top: 2, right: 5}}>
              <CaretLeft color={theme.colors.textSubtle.toString()} size={15} />
            </Box>
            <StyledText css={{m: 0, pt: 4, fontSize: 12, fontWeight: '600', color: theme.colors.textSubtle.toString()}}>
              Back
            </StyledText>
          </HStack>
          <StyledText css={{m: 0, fontSize: 16, fontWeight: '600'}}>Select Font</StyledText>
        </HStack>
      </Box>
      <Box css={{px: 15, width: '100%', pb: 15}}>
        <StyledText css={{m: 0, fontSize: 10, fontWeight: '600', pt: 14, color: theme.colors.textSubtle.toString()}}>DEFAULT</StyledText>
        <FontOption selected={props.selected} family={DEFAULT_FONT_FAMILY} onSelect={props.onSelect} key={`font-${DEFAULT_FONT_FAMILY}`} />
        <StyledText css={{m: 0, fontSize: 10, fontWeight: '600', pt: 14, color: theme.colors.textSubtle.toString()}}>GOOGLE FONTS</StyledText>
        {GOOGLE_FONT_FAMILIES.map((family) => (
          <FontOption selected={props.selected} family={family} onSelect={props.onSelect} key={`font-${family}`} />
        ))}
      </Box>
    </>
  )
}
