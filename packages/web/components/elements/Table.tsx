import { isDarkTheme } from '../../lib/themeUpdater'
import {
  Table as ResponsiveTable,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
} from 'react-super-responsive-table'
import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css'
import { PencilSimple, Plus, Trash } from '@phosphor-icons/react'
import { Box, SpanBox, VStack } from './LayoutPrimitives'
import { styled } from '../tokens/stitches.config'
import { StyledText } from './StyledText'
import { InfoLink } from './InfoLink'
import { Button } from './Button'
import { IconButton } from './Button'

interface TableProps {
  heading: string
  infoLink?: string
  onAdd?: () => void
  headers: string[]
  rows: Map<string, Record<string, any>>
  onDelete?: (id: string) => void
  onEdit?: (obj: any) => void
}

const HeaderWrapper = styled(Box, {
  width: '100%',
  '@md': {
    display: 'block',
  },
})

const StyledTable = styled(ResponsiveTable, {
  margin: ' 0 auto',
  border: '0.5px solid $grayBgActive',
  backgroundColor: '$graySolid',
  borderCollapse: 'collapse',
  borderRadius: '5px',
  width: '100%',
  mt: '$3',
  '&:hover': {
    border: '0.5px solid #FFD234',
  },
})
const TableBody = styled(Tbody, {
  backgroundColor: '$grayBg',
})

const TableRow = styled(Tr, {
  border: '0 !important',
  borderTop: '0.5px solid $grayBgActive !important',
})

export function Table(props: TableProps): JSX.Element {
  const iconColor = isDarkTheme() ? '#D8D7D5' : '#5F5E58'

  return (
    <VStack
      distribution="center"
      css={{
        mx: '10px',
        color: '$grayText',
        paddingBottom: '5rem',
        paddingTop: '2rem',
        '@md': {
          m: '16px',
          alignSelf: 'center',
          mx: '42px',
          paddingTop: '0',
        },
      }}
    >
      <HeaderWrapper>
        <Box style={{ display: 'flex', alignItems: 'center' }}>
          <Box>
            <StyledText style="fixedHeadline">{props.heading}</StyledText>
          </Box>
          {props.infoLink && <InfoLink href={props.infoLink} />}
          {props.onAdd && (
            <Button
              onClick={props.onAdd}
              style="ctaDarkYellow"
              css={{
                display: 'flex',
                alignItems: 'center',
                marginLeft: 'auto',
              }}
            >
              <SpanBox
                css={{
                  display: 'none',
                  '@md': {
                    display: 'flex',
                  },
                }}
              >
                <SpanBox>Create</SpanBox>
              </SpanBox>
              <SpanBox
                css={{
                  p: '0',
                  display: 'flex',
                  '@md': {
                    display: 'none',
                  },
                }}
              >
                <Plus size={24} />
              </SpanBox>
            </Button>
          )}
        </Box>
      </HeaderWrapper>
      <StyledTable>
        <Thead>
          <Tr>
            {props.headers.map((header: string, index: number) => (
              <Th key={index}>
                <SpanBox
                  css={{
                    textTransform: 'uppercase',
                    display: 'flex',
                    fontWeight: 600,
                    padding: '20px 10px 20px 40px',
                    color: '$grayTextContrast',
                    fontSize: '$2',
                  }}
                >
                  {header}
                </SpanBox>
              </Th>
            ))}
          </Tr>
        </Thead>

        <TableBody>
          {Array.from(props.rows.keys()).map((key, index) => (
            <TableRow key={index}>
              {Object.values(props.rows.get(key) || {}).map((cell, index) => (
                <Td key={index}>
                  <SpanBox
                    key={index}
                    css={{
                      display: 'flex',
                      justifyContent: 'left',
                      padding: '20px 10px 20px 40px',
                      color: '$grayTextContrast',
                      fontSize: '$1',
                    }}
                  >
                    {cell}
                  </SpanBox>
                </Td>
              ))}

              {props.onDelete && (
                <Td>
                  <IconButton
                    style="ctaWhite"
                    css={{
                      mr: '$1',
                      background: '$labelButtonsBg',
                      margin: '20px 10px 20px 40px',
                    }}
                    onClick={() => {
                      props.onDelete && props.onDelete(key)
                    }}
                  >
                    <Trash size={16} color={iconColor} />
                  </IconButton>
                </Td>
              )}
              {props.onEdit && (
                <Td>
                  <IconButton
                    style="ctaWhite"
                    css={{
                      mr: '$1',
                      background: '$labelButtonsBg',
                      margin: '20px 10px 20px 40px',
                    }}
                    onClick={() => {
                      props.onEdit &&
                        props.onEdit({ ...props.rows.get(key), id: key })
                    }}
                  >
                    <PencilSimple size={24} color={iconColor} />
                  </IconButton>
                </Td>
              )}
            </TableRow>
          ))}
        </TableBody>
      </StyledTable>
    </VStack>
  )
}
