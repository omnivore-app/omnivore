import { DropdownMenu } from '@radix-ui/react-dropdown-menu'
import { SETTINGS_SECTION_1, SETTINGS_SECTION_2 } from './SettingsMenu'
import {
  Dropdown,
  DropdownOption,
  DropdownSeparator,
} from '../../elements/DropdownElements'
import { useRouter } from 'next/router'
import { List } from 'phosphor-react'

export const SettingsDropdown = (): JSX.Element => {
  const router = useRouter()

  return (
    <Dropdown triggerElement={<List size={30} />}>
      <DropdownOption onSelect={() => router.push('/home')} title="Home" />
      {SETTINGS_SECTION_1.map((item) => {
        return (
          <DropdownOption
            onSelect={() => router.push(item.destination)}
            title={item.name}
          />
        )
      })}

      <DropdownSeparator />

      {SETTINGS_SECTION_2.map((item) => {
        return (
          <DropdownOption
            onSelect={() => router.push(item.destination)}
            title={item.name}
          />
        )
      })}
    </Dropdown>
  )
}
