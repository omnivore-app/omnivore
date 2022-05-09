import React from 'react'
import Checkbox from '../../elements/Checkbox'
import { HStack } from '../../elements/LayoutPrimitives'
import { StyledText } from '../../elements/StyledText'

export const SelectOption: React.FC<{
  icon: string
  label: string
}> = ({ icon, label }) => {
  const [checked, setChecked] = React.useState(false)

  const toggleChecked = () => setChecked(!checked)

  return (
    <HStack onClick={toggleChecked} css={{
      border: checked ? '1px solid #F9D354' : '1px solid #0000000F',
      backgroundColor: checked ? '#FDFAEC' : '#FFFFFF',
      boxShadow: '0px 3px 11px 0px #201F1D0A',
      justifyContent: 'flex-start',
      alignItems: 'center',
      borderRadius: '6px',
      cursor: 'pointer',
      padding: '$2 $3',
      marginBottom: 7,
      width: '100%'
    }}>
      <Checkbox {...{checked, setChecked}} />
      <HStack css={{marginRight: '$2'}} />
      <img
          src={`/static/images/newsletter/${icon}.svg`}
          alt={`${icon}-logo`}
        />
      <StyledText
        css={{
          fontSize: 16,
          fontWeight: 700,
          marginLeft: '$2',
          color: '#0A0806CC',
        }}
      >
          {label}
      </StyledText>
    </HStack>
  )
}
