import { Box, HStack, SpanBox, VStack } from './../../elements/LayoutPrimitives'
import { useGetViewerQuery } from '../../../lib/networking/queries/useGetViewerQuery'
import { useRouter } from 'next/router'
import { useGetUserPreferences } from '../../../lib/networking/queries/useGetUserPreferences'
import { useState } from 'react'
import { FormInput } from '../../elements/FormElements'
import { Button } from '../../elements/Button'
import { X } from 'phosphor-react'
import { theme } from '../../tokens/stitches.config'


export function LibrarySearchBar(): JSX.Element {
  useGetUserPreferences()


  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const { viewerData } = useGetViewerQuery()

  return (
    <>
      <VStack alignment="start" distribution="start" css={{ pl: '32px', pt: '20px', width: '100%', height: '110px' }}>
        <HStack alignment="start" distribution="start" css={{ width: '100%' }}>
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
                fontFamily: 'Inter',
                fontSize: '24px',
              }}
              type="text"
              value={searchTerm}
              placeholder="Search"
              // onFocus={(event) => {
              //   event.target.select()
              //   setFocused(true)
              // }}
              // onBlur={() => {
              //   setFocused(false)
              // }}
              // onChange={(event) => {
              //   setSearchTerm(event.target.value)
              // }}
            />
          </form>
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
      <SpanBox css={{ width: '100%', height: '1px', bg: '$grayBorder' }} />
      </VStack>
    </>
  )
}