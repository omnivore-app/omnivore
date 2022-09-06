import { useState } from 'react'
import { Sliders, X } from 'phosphor-react'
import Downshift from 'downshift'

import { HStack, VStack } from './../../elements/LayoutPrimitives'
import { FormInput } from '../../elements/FormElements'
import { Button } from '../../elements/Button'
import { styled, theme } from '../../tokens/stitches.config'
import { SearchCoordinator } from './LibraryContainer'

// Styles

const List = styled('ul', {
  width: '93%',
  top: '65px',
  left: '0',
  color: 'var(--colors-utilityTextDefault)',
  backgroundColor: 'var(--colors-grayBase)',
  position: 'absolute',
  zIndex: '2',
  '@smDown': {
    fontSize: 16,
  },
})

const Item = styled('li', {
  listStyleType: 'none',
  p: '5px 5px 5px 35px',
})

export type LibrarySearchBarProps = {
  coordinator: SearchCoordinator
  options?: OptionType[]
  onChange?: (selectedItem: string) => void // this is for later
}

type OptionType = {
  value?: string
}

// export type searchHistoryProps = {
//   searchQuery: string,
//   index: number
// }

export function LibrarySearchBar(props: LibrarySearchBarProps): JSX.Element {
  const [searchTerm, setSearchTerm] = useState('')
  const [recentSearches, setRecentSearches] = useState([
    'apple',
    'pear',
    'orange',
    'grape',
    'banana',
  ])

  return (
    <>
      <Downshift>
        {({
          getInputProps,
          getRootProps,
          getMenuProps,
          getItemProps,
          getToggleButtonProps,
          isOpen,
          highlightedIndex,
        }) => (
          <VStack
            alignment="start"
            distribution="start"
            css={{ pl: '32px', width: '100%', height: '100%' }}
          >
            <HStack
              alignment="start"
              distribution="start"
              css={{ width: '100%', borderBottom: 'solid 1px $grayBorder' }}
              {...getRootProps({ refKey: 'ref' }, { suppressRefError: true })}
            >
              <form
                style={{ width: '100%' }}
                onSubmit={(event) => {
                  event.preventDefault()
                  // props.applySearchQuery(searchTerm || '')
                  // inputRef.current?.blur()
                }}
                {...getRootProps()}
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
                  {...getInputProps()}
                />
              </form>

              <List {...getMenuProps()}>
                {isOpen &&
                  recentSearches?.map((item, index) => (
                    <Item
                      key={item}
                      {...getItemProps({
                        item,
                        index,
                        style: {
                          backgroundColor:
                            index === highlightedIndex
                              ? 'lightgray'
                              : undefined,
                        },
                      })}
                    >
                      {item}
                    </Item>
                  ))}
              </List>

              {searchTerm && (
                <HStack
                  alignment="center"
                  distribution="start"
                  css={{ height: '100%' }}
                >
                  <Button
                    style="plainIcon"
                    onClick={(event) => {
                      event.preventDefault()
                      setSearchTerm('')
                      //props.applySearchQuery('')
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
                      event.preventDefault()
                      //recentSearches.push({searchQuery: searchTerm, index: recentSearches.length })
                      localStorage.setItem(searchTerm, searchTerm)
                      //setRecentSearches(recentSearches)

                      // props.applySearchQuery('')
                      // inputRef.current?.blur()
                    }}
                  >
                    Search
                  </Button>
                </HStack>
              )}
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
                  <Sliders
                    size={24}
                    color={theme.colors.utilityTextDefault.toString()}
                  />
                </Button>
              )}
            </HStack>
          </VStack>
        )}
      </Downshift>
    </>
  )
}
