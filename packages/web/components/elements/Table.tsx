import { Box, SpanBox, VStack } from './LayoutPrimitives'
import { styled } from '../tokens/stitches.config'
import { StyledText } from './StyledText'
import { InfoLink } from './InfoLink'
import { Button } from './Button'
import { PencilSimple, Plus, Trash } from 'phosphor-react'
import { isDarkTheme } from '../../lib/themeUpdater'
import { Table, Thead, Tbody, Tr, Th, Td } from 'react-super-responsive-table'
import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css'
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

// const TableCard = styled(Box, {
//   backgroundColor: '$grayBg',
//   display: 'flex',
//   alignItems: 'center',
//   padding: '10px 12px',
//   border: '0.5px solid $grayBgActive',
//   width: '100%',

//   '&:hover': {
//     border: '0.5px solid #FFD234',
//   },
//   '@md': {
//     paddingLeft: '0',
//   },
// })

// const TableHeading = styled(Box, {
//   backgroundColor: '$grayBgActive',
//   border: '1px solid rgba(0, 0, 0, 0.06)',
//   display: 'none',
//   alignItems: 'center',
//   padding: '14px 0 14px 40px',
//   borderRadius: '5px 5px 0px 0px',
//   width: '100%',
//   '@md': {
//     display: 'flex',
//   },
// })

// const Input = styled('input', {
//   backgroundColor: 'transparent',
//   color: '$grayTextContrast',
//   marginTop: '5px',
//   '&[disabled]': {
//     border: 'none',
//   },
// })

// const IconButton = styled(Button, {
//   variants: {
//     style: {
//       ctaWhite: {
//         color: 'red',
//         padding: '10px',
//         display: 'flex',
//         justifyContent: 'center',
//         alignItems: 'center',
//         border: '1px solid $grayBorder',
//         boxSizing: 'border-box',
//         borderRadius: 6,
//         width: 40,
//         height: 40,
//       },
//     },
//   },
// })

export function TableR(props: TableProps): JSX.Element {
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
      {/* <TableHeading>
        {props.headers.map((header, index) => (
          <Box
            key={index}
            css={{
              flex: 'auto',
            }}
          >
            <StyledText
              key={index}
              style="menuTitle"
              css={{
                color: '$grayTextContrast',
                '@md': {
                  fontWeight: '600',
                  color: '$grayTextContrast',
                  textTransform: 'uppercase',
                },
                width: '240px',
              }}
            >
              {header}
            </StyledText>
          </Box>
        ))}
        <Box
          css={{
            width: '120px',
          }}
        ></Box>
      </TableHeading> */}
      {/* {Array.from(props.rows.keys()).map((key, index) => (
        <TableCard
          key={index}
          css={{
            '&:hover': {
              background: 'rgba(255, 234, 159, 0.12)',
            },
            '@mdDown': {
              borderTopLeftRadius: index === 0 ? '5px' : '',
              borderTopRightRadius: index === 0 ? '5px' : '',
            },
            borderBottomLeftRadius: index == props.rows.size - 1 ? '5px' : '',
            borderBottomRightRadius: index == props.rows.size - 1 ? '5px' : '',
            padding: '10px 20px 10px 40px',
          }}
        >
          <Box
            css={{
              display: 'flex',
              width: '100%',
              flexDirection: 'column',
              '@md': {
                flexDirection: 'row',
              },
            }}
          >
            {Object.values(props.rows.get(key) || {}).map((cell, index) => (
              <HStack
                key={index}
                css={{
                  flex: 'auto',
                  display: 'flex',
                  padding: '4px 4px 4px 0px',
                }}
              >
                <Input
                  type="text"
                  value={cell}
                  disabled
                  css={{
                    width: '100%',
                  }}
                ></Input>
              </HStack>
            ))}
            {props.onEdit && (
              <IconButton
                style="ctaWhite"
                css={{ mr: '$1', background: '$labelButtonsBg' }}
                onClick={() => {
                  props.onEdit &&
                    props.onEdit({ ...props.rows.get(key), id: key })
                }}
              >
                <PencilSimple size={24} color={iconColor} />
              </IconButton>
            )}
            {props.onDelete && (
              <IconButton
                style="ctaWhite"
                css={{ mr: '$1', background: '$labelButtonsBg' }}
                onClick={() => {
                  props.onDelete && props.onDelete(key)
                }}
              >
                <Trash size={16} color={iconColor} />
              </IconButton>
            )}
          </Box>
        </TableCard>
      ))} */}
      {/* <Box css={{ ml: '25px' }}>
        <StyledText style="fixedHeadline">{props.heading}</StyledText>
      </Box> */}
      <Box
        css={{
          backgroundColor: '$grayBg',
          margin: ' 0 auto',
          border: '0.5px solid $grayBgActive',
          width: '100%',
          mt: '$3',
          '&:hover': {
            border: '0.5px solid #FFD234',
          },
        }}
      >
        <Table>
          <Thead>
            <Tr>
              {props.headers.map((header: string, index: number) => (
                <Th key={index}>
                  <SpanBox
                    css={{
                      textTransform: 'uppercase',
                      display: 'flex',
                      fontWeight: 600,
                      padding: '20px 10px',
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
          <Tbody>
            {Array.from(props.rows.keys()).map((key, index) => (
              <Tr key={index}>
                {Object.values(props.rows.get(key) || {}).map((cell, index) => (
                  <Td key={index}>
                    <SpanBox
                      key={index}
                      css={{
                        display: 'flex',
                        justifyContent: 'left',
                        padding: '20px 10px',
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
                      css={{ mr: '$1', background: '$labelButtonsBg' }}
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
                      css={{ mr: '$1', background: '$labelButtonsBg' }}
                      onClick={() => {
                        props.onEdit &&
                          props.onEdit({ ...props.rows.get(key), id: key })
                      }}
                    >
                      <PencilSimple size={24} color={iconColor} />
                    </IconButton>
                  </Td>
                )}
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    </VStack>
  )
}
