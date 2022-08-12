import { VStack } from '../../elements/LayoutPrimitives'
import { useGetUserPreferences } from '../../../lib/networking/queries/useGetUserPreferences'
import { Menubar } from '../Menu'


export function LibraryMenu(): JSX.Element {
  useGetUserPreferences()

  return (
    <VStack alignment="start" distribution="start" css={{ width: '286px', pl: '16px', height: '100%' }}>
      <Menubar />
    </VStack>
  )
}