import {
  InputHTMLAttributes,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import { StyledText } from '../../elements/StyledText'
import { Box, HStack, SpanBox, VStack } from '../../elements/LayoutPrimitives'
import { SearchIcon } from '../../elements/images/SearchIcon'
import { theme, ThemeId } from '../../tokens/stitches.config'
import { Dropdown, DropdownOption } from '../../elements/DropdownElements'
import { FormInput } from '../../elements/FormElements'
import { searchBarCommands } from '../../../lib/keyboardShortcuts/navigationShortcuts'
import { useKeyboardShortcuts } from '../../../lib/keyboardShortcuts/useKeyboardShortcuts'
import { Button, IconButton } from '../../elements/Button'
import {
  DotsThree,
  DotsThreeOutline,
  MagnifyingGlass,
  TextAa,
  Textbox,
  X,
} from 'phosphor-react'
import { OmnivoreNameLogo } from '../../elements/images/OmnivoreNameLogo'
import { OmnivoreFullLogo } from '../../elements/images/OmnivoreFullLogo'
import { AvatarDropdown } from '../../elements/AvatarDropdown'
import { ListSelectorIcon } from '../../elements/images/ListSelectorIcon'
import { GridSelectorIcon } from '../../elements/images/GridSelectorIcon'
import { DropdownMenu, HeaderDropdownAction } from '../../patterns/DropdownMenu'
import { updateTheme } from '../../../lib/themeUpdater'
import { useRouter } from 'next/router'
import { PrimaryDropdown } from '../PrimaryDropdown'
import { TooltipWrapped } from '../../elements/Tooltip'

const HEADER_HEIGHT = '105px'
const MOBILE_HEIGHT = '48px'

export function ReaderHeader(): JSX.Element {
  return (
    <>
      <VStack
        alignment="center"
        distribution="start"
        css={{
          top: '0',
          left: '0',
          zIndex: 5,
          position: 'fixed',
          width: '100%',
          height: HEADER_HEIGHT,
          bg: 'transparent',
          pt: '35px',
          '@mdDown': {
            height: MOBILE_HEIGHT,
            pt: '0px',
          },
        }}
      >
        <HStack
          alignment="center"
          distribution="start"
          css={{
            width: '100%',
            height: '100%',
          }}
        >
          <LogoBox />
          <ControlButtonBox />
        </HStack>
      </VStack>
    </>
  )
}

// Displays the full logo on larger screens, small logo on mobile
function LogoBox(): JSX.Element {
  return (
    <>
      <SpanBox
        css={{
          ml: '25px',
          height: '24px',
          width: '232px',
          minWidth: '232px',
          '@mdDown': {
            display: 'none',
          },
        }}
      >
        <OmnivoreFullLogo showTitle={true} />
      </SpanBox>
      <SpanBox
        css={{
          ml: '20px',
          mr: '20px',
          '@md': {
            display: 'none',
          },
        }}
      >
        <OmnivoreNameLogo />
      </SpanBox>
    </>
  )
}

function ControlButtonBox(): JSX.Element {
  return (
    <>
      <HStack
        alignment="center"
        distribution="end"
        css={{
          marginLeft: 'auto',
          marginRight: '45px',
          width: '100px',
          height: '100%',
          gap: '20px',
          minWidth: '121px',
          '@mdDown': {
            display: 'none',
          },
        }}
      >
        <Button
          style="articleActionIcon"
          onClick={() =>
            console.log('readerSettings.setShowEditDisplaySettingsModal(true)')
          }
        >
          <TooltipWrapped tooltipContent="Adjust Display Settings">
            <TextAa size={25} color="#6A6968" />
          </TooltipWrapped>
        </Button>
        <DotsThreeOutline size={25} color="#6A6968" />
      </HStack>

      <HStack
        alignment="center"
        distribution="end"
        css={{
          marginLeft: 'auto',
          marginRight: '20px',
          width: '100px',
          height: '100%',
          gap: '20px',
          '@md': {
            display: 'none',
          },
        }}
      >
        <PrimaryDropdown />
      </HStack>
    </>
  )
}
