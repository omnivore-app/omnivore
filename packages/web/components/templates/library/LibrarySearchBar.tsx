import { HStack, SpanBox, VStack } from './../../elements/LayoutPrimitives'
import { useState } from 'react'
import { FormInput } from '../../elements/FormElements'
import { Button } from '../../elements/Button'
import { Sliders, SlidersHorizontal, X } from 'phosphor-react'
import { theme } from '../../tokens/stitches.config'
import { SearchCoordinator } from './LibraryContainer'

export type LibrarySearchBarProps = {
  coordinator: SearchCoordinator
}

export function LibrarySearchBar(props: LibrarySearchBarProps): JSX.Element {
  const [searchTerm, setSearchTerm] = useState('')  

  return (
    <>
      <VStack alignment="start" distribution="start" css={{ pl: '32px', width: '100%', height: '100%' }}>
        <HStack alignment="start" distribution="start" css={{ width: '100%', borderBottom: 'solid 1px $grayBorder' }}>
          <form
            style={{ width: '100%' }}
            onSubmit={(event) => {
              event.preventDefault()
              // props.applySearchQuery(searchTerm || '')
              // inputRef.current?.blur()
            }}
          >
            <FormInput
              css={{
                width: '100%',
                height: '80px',
                fontSize: '24px',
                fontFamily: 'Inter',
              }}
              type="text"
              tabIndex={0}
              value={searchTerm}
              placeholder="Search"
              onChange={(event) => {
                setSearchTerm(event.target.value)
              }}
            />
          </form>
        {!searchTerm && (
            <Button
            style="plainIcon"
            onClick={(event) => {
              // Display the advanced search sheet
            }}
            css={{
              display: 'flex',
              flexDirection: 'row',
              height: '100%',
              alignItems: 'center',
            }}
          >
            <Sliders size={24} color={theme.colors.utilityTextDefault.toString()} />
          </Button>
        )}
        {searchTerm && (
          <HStack alignment="center" distribution="start" css={{ height: '100%' }}>
            <Button
              style="plainIcon"
              onClick={(event) => {
                // event.preventDefault()
                // setSearchTerm('')
                // props.applySearchQuery('')
                // inputRef.current?.blur()
              }}
              css={{
                display: 'flex',
                flexDirection: 'row',
                mr: '16px',
                height: '100%',
                alignItems: 'center',
              }}
            >
              <X
                width={24}
                height={24}
                color={theme.colors.grayTextContrast.toString()}
              />
            </Button>

            <Button
            style="ctaDarkYellow"
            onClick={(event) => {
              // event.preventDefault()
              // setSearchTerm('')
              // props.applySearchQuery('')
              // inputRef.current?.blur()
            }}
            >
              Search
            </Button>
          </HStack>
        )}
      </HStack>
      </VStack>
    </>
  )
}