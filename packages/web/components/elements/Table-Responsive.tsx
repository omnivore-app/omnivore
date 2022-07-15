import React from 'react'
import { Table, Thead, Tbody, Tr, Th, Td } from 'react-super-responsive-table'
import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css'
import { styled } from '../tokens/stitches.config'
import { Button } from './Button'
import { Trash } from 'phosphor-react'
import { isDarkTheme } from '../../lib/themeUpdater'

interface TableProps {
  heading: string
  infoLink?: string
  onAdd?: () => void
  headers: string[]
  rows: Map<string, Record<string, any>>
  onDelete?: (id: string) => void
  onEdit?: (obj: any) => void
}

const IconButton = styled(Button, {
  variants: {
    style: {
      ctaWhite: {
        color: 'red',
        padding: '10px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        border: '1px solid $grayBorder',
        boxSizing: 'border-box',
        borderRadius: 6,
        width: 40,
        height: 40,
      },
    },
  },
})

export default function TableR(props: TableProps): JSX.Element {
  const { headers } = props
  const iconColor = isDarkTheme() ? '#D8D7D5' : '#5F5E58'
  console.log(props.rows)
  return (
    <Table>
      <Thead>
        <Tr>
          {headers.map((header: string, index: number) => (
            <Th key={index}>
              {header}
            </Th>
          ))}
        </Tr>
      </Thead>
      <Tbody>
        {Array.from(props.rows.keys()).map((key, index) => (
          <Tr key={index}>
            {Object.values(props.rows.get(key) || {}).map((cell, index) => (
              <Td key={index}>{cell}</Td>
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
          </Tr>
        ))}
      </Tbody>
    </Table>
  )
}
