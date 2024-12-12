import { VStack } from '../../../elements/LayoutPrimitives'
import React, { useEffect, useState } from 'react'
import 'react-sliding-pane/dist/react-sliding-pane.css'
import 'pdfjs-dist/web/pdf_viewer.css'
import { PDFDocumentProxy } from 'pdfjs-dist'

export type PdfSidebarProps = {
  sidebarActive: boolean

  pdfDocument: PDFDocumentProxy | undefined

  totalPages: number
  activePage: number
  setPage: (page: number) => void
}

export default function PdfSideBar(props: PdfSidebarProps) {
  const [images, setImages] = useState<string[]>([])

  useEffect(() => {
    ;(async () => {
      if (props.pdfDocument) {
        const propsArray = [...Array(props.pdfDocument.numPages ?? 0)];

        const dataUrls = await Promise.all(propsArray.map(async (_it, i) => {
          const page = await props.pdfDocument!.getPage(i + 1)
          const viewport = page.getViewport({ scale: 0.3 })
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')

          canvas.width = viewport.width
          canvas.height = viewport.height
          if (ctx) {
            const task = page.render({ canvasContext: ctx, viewport: viewport })
            return task.promise.then(() => canvas.toDataURL())
          }

          return "";
        }))

        console.log("Setting Data Urls");
        setImages(dataUrls)
      }
    })()
  }, [props.pdfDocument])

  if (!props.sidebarActive) {
    return null
  }

  return (
    <VStack
      distribution="start"
      css={{
        alignItems: 'flex-start',
        position: 'fixed',
        left: '0px',
        top: '100px',
        padding: '7px',
        paddingTop: '10px',
        width: '250px',
        height: 'calc(100% - 100px)',
        borderTop: '1px solid black',
        boxShadow: 'rgba(61, 66, 78, 0.5) 0px 1px 2px 0px',
        background: '$thBackground2',
        overflow: 'scroll',
      }}
    >
      {[...Array(props.totalPages)].map((_it, idx) => (
        <VStack
          key={`pdf-page-${idx}`}
          css={{ width: '80%', margin: 'auto', height: '100%' }}
          onClick={() => props.setPage(idx + 1)}
        >
          <div
            style={
              idx == props.activePage - 1
                ? { outline: '5px solid var(--colors-thBackgroundActive)', width: '100%' }
                : { width: '100%', height: '100%' }
            }
          >
            <img
              width={'100%'}
              alt={`page-${idx + 1}`}
              src={images[idx]}
              style={{ display: 'block', objectFit: 'contain' }}
            />
          </div>
          <div
            style={{ margin: 'auto', marginTop: '3px', marginBottom: '3px' }}
          >
            <span
              style={{
                backgroundColor: 'var(--colors-thLeftMenuBackground)',
                paddingLeft: '10px',
                paddingRight: '10px',
                borderRadius: '10px',
              }}
            >
              {idx + 1}
            </span>
          </div>
        </VStack>
      ))}
    </VStack>
  )
}
