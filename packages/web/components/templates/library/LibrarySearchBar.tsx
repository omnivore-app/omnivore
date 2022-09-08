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
}

export function LibrarySearchBar(props: LibrarySearchBarProps): JSX.Element {
  //const [searchTerm, setSearchTerm] = useState('')
  const [recentSearches, setRecentSearches] = useState(Array<[]>())

  useEffect(() => {
    setRecentSearches(Object.values(localStorage))
    //localStorage.clear()
  }, [])

  return (
    <>
      <Downshift
        onChange={(selection) =>
          console.log(
            selection ? `You selected ${selection}` : 'Selection Cleared'
          )
        }
        itemToString={(item) => (item ? item : '')}
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
                  //localStorage.setItem(inputValue, inputValue)
                  // props.applySearchQuery(searchTerm || '')
                  // inputRef.current?.blur()
                }}
                {...getRootProps()}
              >
                <FormInput
                  css={{
                    width: '80%',
                    height: '80px',
                    fontSize: '24px',
                    fontFamily: 'Inter',
                  }}
                  type="text"
                  tabIndex={0}
                  value={inputValue}
                  placeholder="Search"
                  onChange={(event) => {
                    event.preventDefault()
                    //setSearchTerm(inputValue)
                    
                  }}
                  {...getInputProps()}
                />

                {/* {searchTerm && ( */}
                <HStack
                  alignment="center"
                  distribution="start"
                  css={{
                    height: '100%',
                    display: 'flex',
                    justifyContent: 'right',
                    alignItems: 'center',
                    margin: '-57px 0 10px',
                  }}
                >
                  <Button
                    style="plainIcon"
                    onClick={(event) => {
                      event.preventDefault()
                      //setSearchTerm('')
                      clearSelection
                      //props.applySearchQuery('')
                      // inputRef.current?.blur()
                    }}
                    css={{
                      mr: '15px',
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
                    type="submit"
                    css={{
                      mr: '15px',
                    }}
                    onClick={(event) => {
                      event.preventDefault()
                      if(inputValue !== null) {
                        localStorage.setItem(inputValue, inputValue)
                      }
                      //setSearchTerm(searchTerm)

                      // props.applySearchQuery('')
                      // inputRef.current?.blur()
                    }}
                  >
                    Search
                  </Button>
                  {/* )} */}
                  {/* {!searchTerm && ( */}
                  <Button
                    style="plainIcon"
                    onClick={(event) => {
                      // Display the advanced search sheet
                    }}
                  >
                    <Sliders
                      size={24}
                      color={theme.colors.utilityTextDefault.toString()}
                    />
                  </Button>
                  {/* )} */}
                </HStack>

                <List {...getMenuProps()}>
                  {isOpen &&
                    recentSearches
                      .filter(
                        (item) => !inputValue || item.includes(inputValue)
                      )
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
              </form>
            </HStack>
          </VStack>
        )}
      </Downshift>
    </>
  )
}
