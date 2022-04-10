import {
  ModalContent,
  ModalOverlay,
  ModalRoot,
} from '../../elements/ModalPrimitives'
import { Box, HStack, SpanBox, VStack } from '../../elements/LayoutPrimitives'
import { Button } from '../../elements/Button'
import { StyledText } from '../../elements/StyledText'
import { CrossIcon } from '../../elements/images/CrossIcon'
import { styled, theme } from '../../tokens/stitches.config'
import { Label, useGetLabelsQuery } from '../../../lib/networking/queries/useGetLabelsQuery'
import { ChangeEvent, useCallback, useRef, useState, useMemo } from 'react'
import { setLabelsMutation } from '../../../lib/networking/mutations/setLabelsMutation'
import { ArticleAttributes } from '../../../lib/networking/queries/useGetArticleQuery'
import { LabelChip } from '../../elements/LabelChip'
import { Check, Circle, Pen, PencilSimple, PencilSimpleLine, Plus, TagSimple } from 'phosphor-react'
import Link from 'next/link'
import { isTouchScreenDevice } from '../../../lib/deviceType'

type EditLabelsModalProps = {
  // labels: Label[]
  // article: ArticleAttributes
  // onOpenChange: (open: boolean) => void
  // setLabels: (labels: Label[]) => void
}

type HeaderProps = {
  filterText: string
  setFilterText: (text: string) => void
}

const FormInput = styled('input', {
  width: '100%',
  fontSize: '16px',
  fontFamily: 'inter',
  fontWeight: 'normal',
  lineHeight: '1.8',
  color: '$grayTextContrast',
  '&:focus': {
    outline: 'none',
  },
})

const StyledLabel = styled('label', {
  display: 'flex',
  justifyContent: 'flex-start',
  '&:focus-visible': {
    backgroundColor: 'red',
  },
})

function Header(props: HeaderProps): JSX.Element {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <VStack css={{ width: '100%', my: '0px',        borderBottom: '1px solid $grayBorder',
  }}>
      {/* <HStack
        distribution="between"
        alignment="center"
        css={{
          width: '100%',
          flex: '0 0 20px',
          mx: '0px',
          p: '0px',
          borderBottom: `1px solid ${theme.colors.grayLine.toString()}`,
        }}
      > */}
        {/* <StyledText style="modalHeadline" css={{ p: '16px', fontSize: '12px',  }}>
          Apply labels to this page
        </StyledText> */}
        {/* <Button
          css={{ pt: '16px', pr: '16px' }}
          style="ghost"
          onClick={() => {
          
          }}
        >
          <CrossIcon
            size={20}
            strokeColor={theme.colors.grayText.toString()}
          />
        </Button> */}
      {/* </HStack> */}
      <Box css={{ 
        width: '100%',
        my: '14px',
        px: '14px',
      }}>
        <form
          onSubmit={(event) => {
            // event.preventDefault()
            // props.applySearchQuery(searchTerm || '')
            inputRef.current?.blur()
          }}
        >
        <FormInput
          ref={inputRef}
          type="text"
          tabIndex={0}
          autoFocus={!isTouchScreenDevice()}
          value={props.filterText}
          placeholder="Filter for label"
          onFocus={(event) => {
            event.target.select()
            //setFocused(true)
          }}
          onBlur={() => {
            //setFocused(false)
            console.log('blurred')
          }}
          onKeyDown={(event) => {
            console.log('keydown', event.key)
          }}
          onChange={(event) => {
            console.log('event', event)
            props.setFilterText(event.target.value)
          }}
          css={{
            border: '1px solid $grayBorder',
            borderRadius: '8px',
            width: '100%',
            bg: 'transparent',
            fontSize: '16px',
            fontFamily: 'inter',
            fontWeight: 'normal',
            marginBottom: '2px',
            textIndent: '8px',
            paddingLeft: '8px',
            color: '$grayTextContrast',
            '&:focus': {
              outline: 'none',
              boxShadow: '0px 0px 2px 2px rgba(255, 234, 159, 0.56)',
            },
          }}
        />
      </form>
    </Box>
  </VStack>)
}

type LabelsListProps = {
  // pageId: string
  // selectedLabels: Label[]
  availableLabels: Label[]
//  setSelectedLabels: (labels: Label[]) => void
}

function LabelsList(props: LabelsListProps): JSX.Element {
  const isSelected = useCallback((label: Label) => {
    // return props.selectedLabels.some((other) => {
    //   return other.id === label.id
    // })
    return false
  }, [])

  return (
    <VStack css={{ flexGrow: '1', overflow: 'scroll', width: '100%', height: '100%', maxHeight: '400px',  }}>
      {props.availableLabels &&
        props.availableLabels.map((label, idx) => (
          <StyledLabel
            key={label.id}
            tabIndex={idx + 1}
            css={{
              width: '100%',
              height: '42px',
              borderBottom: '1px solid $grayBorder',
            }}
            onClick={async () => {
              // console.log('selected label', label)
              // if (props.selectedLabels.includes(label)) {
              //   props.setSelectedLabels(
              //     props.selectedLabels.filter((id) => id !== label)
              //   )
              // } else {
              //   props.setSelectedLabels([...props.selectedLabels, label])
              // }
              // const result = await setLabelsMutation(props.pageId, props.selectedLabels.map((l) => l.id))
              // console.log('result', result)
            }}
          >
            <Box css={{ pl: '5px', width: '25px', height: '45px', display: 'flex', alignItems: 'center' }}>
              {isSelected(label) && <Check color={theme.colors.grayText.toString()} weight='bold' />}
            </Box>
            <Box css={{ width: '30px', height: '100%', display: 'flex', alignItems: 'center' }}>
              <Circle width={22} height={22} color={label.color} weight='fill' />
            </Box>
            <Box css={{ overflow: 'clip', height: '100%', display: 'flex', alignItems: 'center' }}>
              <StyledText style="caption">{label.name}</StyledText>
            </Box>
            <Box css={{ pl: '10px', width: '40px', marginLeft: 'auto', height: '100%', display: 'flex', alignItems: 'center'  }}>
              {isSelected(label) && <CrossIcon
                size={14}
                strokeColor={theme.colors.grayText.toString()}
              />}
            </Box>
            {/* 
            
            <CrossIcon
              size={14}
             strokeColor={theme.colors.grayText.toString()}
            /> */}
            {/* <input
              type="checkbox"
              value={label.id}
              onChange={handleChange}
              checked={selectedLabels.includes(label)}
            /> */}
          </StyledLabel>
        ))}
    </VStack>)
}

export function EditLabelsModal(props: EditLabelsModalProps): JSX.Element {
  const [filterText, setFilterText] = useState('')
  const [selectedLabels, setSelectedLabels] = useState([])
  const { labels } = useGetLabelsQuery()

  const saveAndExit = useCallback(async () => {
    // const result = await setLabelsMutation(props.article.id, selectedLabels.map((l) => l.id))
    // console.log('result of setting labels', result)
    // // props.onOpenChange(false)
    // // props.setLabels(selectedLabels)
  }, [props, selectedLabels])

  const filteredLabels = useMemo(() => {
    if (!labels) {
      return []
    }
    return labels.filter((label) => {
      return label.name.toLowerCase().includes(filterText.toLowerCase())
    })
  }, [labels, filterText])

  return (
    // <ModalRoot defaultOpen onOpenChange={saveAndExit}>
    //   <ModalOverlay />
    //   <ModalContent
    //     onPointerDownOutside={(event) => {
    //       event.preventDefault()
    //     }}
    //     css={{ p: '0', width: '100%', maxWidth: '400px' }}
    //   >
        <VStack distribution="start" css={{ 
          p: '0', maxHeight: '400px',
          maxWidth: '265px',
          '@mdDown': {
            maxWidth: '100%',
            maxHeight: '280px',
          },
        }}>
          <Header setFilterText={setFilterText} filterText={filterText} />
          <LabelsList
            availableLabels={filteredLabels}
            // selectedLabels={selectedLabels || []}
          />
          {filterText && (
            <Button style='modalOption' css={{
              pl: '26px', color: theme.colors.grayText.toString(), height: '42px', borderBottom: '1px solid $grayBorder'
            }} 
              onClick={() => {
                // props.createLabel(filterText)
                // setFilterText('')
              }}
            >
              <HStack alignment='center' distribution='start' css={{ gap: '8px' }}>
                <Plus size={18} color={theme.colors.grayText.toString()} />
               <SpanBox css={{ fontSize: '12px' }}>{`Create new label "${filterText}"`}</SpanBox>
               </HStack>
            </Button>)}
            {/* Footer */}
          <HStack  distribution="start"  alignment="center" css={{
              ml: '20px', gap: '8px', width: '100%', fontSize: '12px', p: '8px', height: '42px',
              'a:link': {
                textDecoration: 'none',
              },
              'a:visited': {
                color: theme.colors.grayText.toString(),
              },
            }}
          >
            <PencilSimple size={18} color={theme.colors.grayText.toString()} /> 
            <Link href="/settings/labels">Edit labels</Link>
          </HStack>
        </VStack>
    //   </ModalContent>
    // </ModalRoot>
  )
}