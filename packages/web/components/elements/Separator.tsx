import { HStack } from './LayoutPrimitives'
import type { ReactNode } from 'react'

type SeparatorProps = {
  children?: ReactNode
  width?: string
  color?: string
}

export function Separator(props: SeparatorProps): JSX.Element {
  const color = props.color ?? '$orange9'
  const width = props.width ?? '100%'

  return (
    <HStack
      alignment="center"
      css={{
        fontSize: '$1',
        width,
        color,
        '&:before': {
          mr: '$2',
          content: "''",
          flex: 1,
          borderBottom: `1px solid ${color}`
        },
        '&:after': {
          ml: '$2',
          content: "''",
          flex: 1,
          borderBottom: `1px solid ${color}`
        }
      }}
    >
      {props.children}
    </HStack>
  )
}
