import React, { useCallback, useMemo, useState } from 'react'
import { Button } from './Button'
import { HStack, VStack } from './LayoutPrimitives'

type PaginationProps<T> = {
  items: T[]
  itemsPerPage: number
  loadMoreButtonText?: string
  render: (item: T) => React.ReactNode
}

const Pagination = <T,>({
  items,
  itemsPerPage,
  loadMoreButtonText,
  render,
}: PaginationProps<T>) => {
  const [currentPage, setCurrentPage] = useState(1)
  const maxPage = Math.ceil(items.length / itemsPerPage)

  const incrementCurrentPage = useCallback(() => {
    setCurrentPage(currentPage + 1)
  }, [currentPage, setCurrentPage])

  const itemsToShow = useMemo(() => {
    const count = currentPage * itemsPerPage
    return items.slice(0, count)
  }, [items, currentPage, itemsPerPage])

  return (
    <VStack css={{ width: '100%' }}>
      {itemsToShow.map(render)}
      <HStack
        alignment="center"
        distribution="center"
        css={{ p: '30px', width: '100%' }}
      >
        {currentPage < maxPage && (
          <Button
            onClick={(event) => {
              incrementCurrentPage()
              event.preventDefault()
            }}
            style="homeAction"
            css={{
              fontFamily: '$inter',
              fontSize: '15px',
              fontWeight: '500',
              color: '$readerFont',
              bg: '$thNavMenuFooter',
              py: '10px',
              px: '25px',
            }}
          >
            {loadMoreButtonText ?? 'Load More'}
          </Button>
        )}
      </HStack>
    </VStack>
  )
}

export default Pagination
