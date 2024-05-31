import React, { useState } from 'react'
import { Button } from './Button'
import { HStack, VStack } from './LayoutPrimitives'

type PaginationProps<T> = {
  items: T[]
  itemsPerPage: number
  render: (item: T) => React.ReactNode
}

const Pagination = <T,>({
  items,
  itemsPerPage,
  render,
}: PaginationProps<T>) => {
  const [currentPage, setCurrentPage] = useState(1)
  const maxPage = Math.ceil(items.length / itemsPerPage)

  function createChangePageHandler(page: number) {
    return function handlePageChange() {
      setCurrentPage(page)
    }
  }

  const itemsToShow = items.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  return (
    <VStack>
      {itemsToShow.map(render)}
      <HStack>
        {Array.from({ length: maxPage }, (_, i) => i + 1).map((pageNum) => (
          <Button
            key={pageNum}
            onClick={createChangePageHandler(pageNum)}
            disabled={pageNum === currentPage}
          >
            {pageNum}
          </Button>
        ))}
      </HStack>
    </VStack>
  )
}

export default Pagination
