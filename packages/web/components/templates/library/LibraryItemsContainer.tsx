import { Allotment } from 'allotment'
import 'allotment/dist/style.css'
import { useGetViewerQuery } from '../../../lib/networking/queries/useGetViewerQuery'
import { useRouter } from 'next/router'
import { useKBar } from 'kbar'
import { useState } from 'react'
import { LibraryContainer } from './LibraryContainer'
import { LibrarySideBar } from './LibrarySideBar'
import { HighlightsList } from '../../../pages/highlights'

export function LibraryItemsContainer(): JSX.Element {
  const router = useRouter()

  return (
    <Allotment>
      <Allotment.Pane minSize={200}>
        <LibraryContainer />
      </Allotment.Pane>
      {/* <Allotment.Pane snap maxSize={400}>
        <HighlightsList />
      </Allotment.Pane> */}
    </Allotment>
  )
}
