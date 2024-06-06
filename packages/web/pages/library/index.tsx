import { NavigationLayout } from '../../components/templates/NavigationLayout'
import { PrimaryLayout } from '../../components/templates/PrimaryLayout'
import { HomeFeedContainer } from '../../components/templates/homeFeed/HomeFeedContainer'
import { Box, VStack } from '../../components/elements/LayoutPrimitives'
import { LibraryContainer } from '../../components/templates/library/LibraryContainer'
import { LibraryItemsContainer } from '../../components/templates/library/LibraryItemsContainer'
import { LibrarySideBar } from '../../components/templates/library/LibrarySideBar'
import { Allotment, LayoutPriority } from 'allotment'
import 'allotment/dist/style.css'

export default function Library(): JSX.Element {
  return (
    <NavigationLayout
      section="library"
      pageMetaDataProps={{
        title: 'Library',
        path: '/library',
      }}
    >
      {/* <Allotment>
        <Allotment.Pane priority={LayoutPriority.High}> */}
      <Box css={{ width: '100%', height: '100%', overflowY: 'auto' }}>
        <LibraryContainer />
      </Box>
      {/* </Allotment.Pane>
        <Allotment.Pane maxSize={480}>
          <LibrarySideBar text="SIDEBAR" />
        </Allotment.Pane>
      </Allotment> */}
    </NavigationLayout>
  )
}
