import { VStack } from '../../elements/LayoutPrimitives'
import { useGetUserPreferences } from '../../../lib/networking/queries/useGetUserPreferences'
import { Menubar } from '../Menu'

export function LibraryMenu(): JSX.Element {
  useGetUserPreferences()

  return (
    <VStack
      alignment="start"
      distribution="start"
      css={{
        width: '286px',
        minWidth: '286px',
        pl:'15px',
        height: 'calc(100% - 100px)',
        overflowY: 'auto',
        fontWeight: '600',
      }}
    >
      <Menubar />
    </VStack>
  )
}
