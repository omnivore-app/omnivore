import { NavigationLayout } from '../../components/templates/NavigationLayout'
import { Box } from '../../components/elements/LayoutPrimitives'
import { LibraryContainer } from '../../components/templates/library/LibraryContainer'

export default function Library(): JSX.Element {
  return (
    <NavigationLayout
      section="library"
      pageMetaDataProps={{
        title: 'Library',
        path: '/library',
      }}
    >
      <Box css={{ width: '100%', height: '100%', overflowY: 'auto' }}>
        <LibraryContainer />
      </Box>
    </NavigationLayout>
  )
}
