import React from 'react'
import { HStack } from '../../../elements/LayoutPrimitives'
import { OmnivoreSmallLogo } from '../../../elements/images/OmnivoreNameLogo'
import { theme } from '../../../tokens/stitches.config'
import { FunnelSimple } from '@phosphor-icons/react'
import { DiscoverHeaderProps } from './DiscoverHeader'
import { SmallTopicBar } from './SmallTopicBar'
import { PrimaryDropdown } from '../../PrimaryDropdown'

export function SmallHeaderLayout(props: DiscoverHeaderProps): JSX.Element {
  return (
    <HStack
      alignment="center"
      distribution="start"
      css={{
        width: '100%',
        height: '100%',
        pt: '10px',
        pb: '10px',
        pr: '20px',
        bg: '$thBackground3',
        '@md': {
          display: 'none',
        },
      }}
    >
      <>
        <MenuHeaderButton {...props} />
        <SmallTopicBar {...props} />
      </>
    </HStack>
  )
}

type MenuHeaderButtonProps = {
  showFilterMenu: boolean
  setShowFilterMenu: (show: boolean) => void
}

export function MenuHeaderButton(props: MenuHeaderButtonProps): JSX.Element {
  return (
    <HStack
      css={{
        ml: '10px',
        width: '67px',
        height: '40px',
        bg: props.showFilterMenu ? '$thTextContrast2' : '$thBackground2',
        borderRadius: '5px',
        px: '5px',
        cursor: 'pointer',
      }}
      alignment="center"
      distribution="around"
      onClick={() => {
        props.setShowFilterMenu(!props.showFilterMenu)
      }}
    >
      <OmnivoreSmallLogo
        size={20}
        strokeColor={
          props.showFilterMenu
            ? theme.colors.thBackground.toString()
            : theme.colors.thTextContrast2.toString()
        }
      />
      <FunnelSimple
        size={20}
        color={
          props.showFilterMenu
            ? theme.colors.thBackground.toString()
            : theme.colors.thTextContrast2.toString()
        }
      />
    </HStack>
  )
}
