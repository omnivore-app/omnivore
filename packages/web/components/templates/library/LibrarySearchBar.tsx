import { useState, useEffect } from 'react'
import { Sliders, X } from 'phosphor-react'
import Downshift from 'downshift'

import { HStack, VStack } from './../../elements/LayoutPrimitives'
import { FormInput } from '../../elements/FormElements'
import { Button } from '../../elements/Button'
import { styled, theme } from '../../tokens/stitches.config'
import { SearchCoordinator } from './LibraryContainer'

// Styles

const List = styled('ul', {
  width: '95%',
  top: '65px',
  left: '-32px',
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
  p: '8px 8px 8px 35px',
  borderRadius: '5px',
  textOverflow: 'ellipsis',
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
  const [recentSearches, setRecentSearches] = useState(Array<[]>())

  // const [searchState, setSearchState] = useState({
  //   searchQuery: '',
  //   hits: [],
  //   highlightedIndex: 0,
  // })
  const [optionsList, setOptionsList] = useState(Array<[]>())

  useEffect(() => {
    setRecentSearches(Object.values(localStorage))
    setOptionsList(Object.values(localStorage))
    //localStorage.clear()
  }, [])

  return (
    <>
      <Downshift
        onChange={(selection) =>
          console.log(
            selection ? `You selected ${selection.value}` : 'Selection Cleared'
          )
        }
        itemToString={(item) => (item ? item.value : '')}
      >
        {({
          getInputProps,
          getRootProps,
          getMenuProps,
          getItemProps,
          isOpen,
          highlightedIndex,
          inputValue,
          clearSelection,
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
                  optionsList
                    .filter((item) => !inputValue || item.includes(inputValue))
                    .map((item, index) => (
                      <Item
                        {...getItemProps({
                          style: {
                            backgroundColor:
                              index === highlightedIndex
                                ? 'var(--colors-grayBg)'
                                : 'transparent',
                          },
                          item,
                          index,
                        })}
                        key={item}
                      >
                        {item}
                      </Item>
                    ))}
              </List>

              {/* {searchTerm && ( */}
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
                    setSearchTerm(searchTerm)

                    // props.applySearchQuery('')
                    // inputRef.current?.blur()
                  }}
                >
                  Search
                </Button>
              </HStack>
              {/* )} */}
              {/* {!searchTerm && ( */}
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
              {/* )} */}
            </HStack>
          </VStack>
        )}
      </Downshift>
    </>
  )
}
