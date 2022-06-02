import React from 'react'
import Checkbox from '../../elements/Checkbox'
import { Box, VStack, HStack, SpanBox } from '../../elements/LayoutPrimitives'
import { CoverImage } from '../../elements/CoverImage'
import { StyledText } from '../../elements/StyledText'
import { authoredByText } from '../../patterns/ArticleSubtitle'
import { LabelChip } from '../../elements/LabelChip'
import { Label } from '../../../lib/networking/fragments/labelFragment'
import Image from 'next/image'

export const SelectOption: React.FC<{
  icon: string
  label: string
  description: string
  onCheck: (idx: number) => void
  indexNum: number
  isChecked: boolean
}> = ({ icon, label, description, onCheck, indexNum, isChecked}) => {

  const toggleChecked = () => {
    onCheck(indexNum)
  }

  return (
    <HStack onClick={toggleChecked} css={{
      border: isChecked ? '1px solid #F9D354' : '1px solid #0000000F',
      backgroundColor: isChecked ? '#FDFAEC' : '#FFFFFF',
      boxShadow: '0px 3px 11px 0px #201F1D0A',
      justifyContent: 'flex-start',
      alignItems: 'center',
      borderRadius: '6px',
      cursor: 'pointer',
      padding: '$2 $3',
      marginBottom: 7,
      width: '100%'
    }}>
      <Checkbox checked={isChecked} setChecked={() => undefined} />
      <SpanBox css={{ marginLeft: '$2', width: '32px', height: '32px' }}>
        <Image width={32} height={32} layout="fixed"
          src={`/static/images/newsletter/${icon}`}
          alt={`${icon.slice(0, -4)} logo`}
        />
      </SpanBox>
      <VStack css={{ border: '1', marginLeft: '$2', color: '#0A0806CC', }}>
        <StyledText
          css={{
            margin: 0,
            fontSize: 16,
            fontWeight: 700,
            
          }}
        >
          {label}
        </StyledText>
        <StyledText
          css={{
            margin: 0,
            fontSize: 16,
            fontWeight: 400,
            color: '#0A0806CC',
          }}
        >
          {description}
        </StyledText>
      </VStack>
    </HStack>
  )
}

export const SelectionOptionCard: React.FC <{
  title: string,
  author: string,
  originText: string,
  description: string,
  image: string,
  labels: Label[]
}> = ({title, author, originText, description, image, labels}) => {
  const [checked, setChecked] = React.useState(false)
  const toggleChecked = () => setChecked(!checked)
  
  return (
    <VStack
      css={{
        p: '$2',
        pr: '8px',
        height: '100%',
        width: '100%',
        maxWidth: '100%',
        borderRadius: '6px',
        cursor: 'pointer',
        wordBreak: 'break-word',
        overflow: 'clip',
        boxShadow: '0px 3px 11px rgba(32, 31, 29, 0.04)',
        position: 'relative',
        marginRight: '$3',
        border: checked ? '1px solid #F9D354' : '1px solid $grayBorder',
        backgroundColor: checked ? '#FDFAEC' : '#FFFFFF',
      }}
      alignment="start"
      distribution="start"
      onClick={toggleChecked}
    >
      <Box
        css={{
          position: 'absolute',
          top: '1px',
          left: '1px',
          width: 'calc(100% - 2px)',
          '& > div': {
            borderRadius: '100vmax 100vmax 0 0',
          },
        }}
      >
      </Box>
      <VStack
        distribution="start"
        alignment="start"
        css={{
          px: '0px',
          width: '100%',
          pl: '$1',
        }}
      >
        <HStack
          alignment="start"
          distribution="between"
          css={{
            width: '100%',
            p: '0px',
            mr: '-12px',
            mt: '15px',
            display: 'grid',
            gridTemplateColumns: '1fr 24px',
            gridTemplateRows: '1fr',
          }}
        >
          <HStack css={{
            alignItems: 'center'
          }}>
            <Checkbox {...{checked, setChecked}} />
            <HStack css={{marginRight: '$2'}} />
            <CardTitle title= {title} />
          </HStack>
          <Box
            css={{ alignSelf: 'end', alignItems: 'start', height: '100%' }}
            onClick={(e) => {
              // This is here to prevent menu click events from bubbling
              // up and causing us to "click" on the link item.
              e.stopPropagation()
            }}
          >
          </Box>
        </HStack>
        <HStack alignment="start" distribution="between">
          <StyledText style="caption" css={{ my: '0' }}>
            {author && (
              <SpanBox css={{ mr: '8px' }}>
                {authoredByText(author)}
              </SpanBox>
            )}
            <SpanBox css={{ textDecorationLine: 'underline' }}>
              {originText}
            </SpanBox>
          </StyledText>
        </HStack>
      </VStack>
      <HStack
        alignment="start"
        distribution="between"
        css={{
          width: '100%',
          pt: '$2',
          px: '$1',
          pr: '12px',
          mt: '7px',
          flexGrow: '1',
        }}
      >
        <StyledText
          css={{
            m: 0,
            py: '0px',
            mr: '$2',
            fontStyle: 'normal',
            fontWeight: '400',
            fontSize: '14px',
            lineHeight: '125%',
            color: '$grayTextContrast',
            flexGrow: '4',
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 5,
            WebkitBoxOrient: 'vertical',
          }}
          data-testid="listDesc"
        >
          {description}
        </StyledText>
        {image && (
          <CoverImage
            src={image}
            alt="Link Preview Image"
            width={135}
            height={90}
            css={{ ml: '10px', mb: '8px', borderRadius: '3px' }}
            onError={(e) => {
              ;(e.target as HTMLElement).style.display = 'none'
            }}
          />
        )}
      </HStack>
      <Box css={{ display: 'block', mt: '8px' }}>
        {labels?.map(({ name, color }, index) => (
          <LabelChip key={index} text={name || ''} color={color} />
        ))}
      </Box>
    </VStack>
  )
}

type CardTitleProps = {
  title: string
}

function CardTitle(props: CardTitleProps): JSX.Element {
  return (
    <StyledText
      style="listTitle"
      data-testid="listTitle"
      css={{
        mt: '0',
        mb: '0',
        fontWeight: '700',
        textAlign: 'left',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        width: '100%',
        overflow: 'hidden',
      }}
    >
      {props.title}
    </StyledText>
  )
}
