import { X } from '@phosphor-icons/react'
import { useState } from 'react'
import { Button } from './Button'
import { Box } from './LayoutPrimitives'

type CloseButtonProps = {
  close: () => void
}

export function CloseButton(props: CloseButtonProps): JSX.Element {
  const [hover, setHover] = useState(false)

  return (
    <Box
      css={{
        display: 'flex',
        height: '25px',
        width: '25px',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '1000px',
        background: '$thBackground2',
        '&:hover': {
          bg: '#898989',
        },
      }}
      onMouseOver={() => setHover(true)}
      onMouseOut={() => setHover(false)}
    >
      <Button
        tabIndex={-1}
        css={{
          cursor: 'pointer',
          marginLeft: 'auto',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        style="ghost"
        onClick={() => {
          props.close()
        }}
      >
        <X
          width={12}
          height={12}
          weight="bold"
          color={hover ? '#EBEBEB' : '#898989'}
          className="xMark"
        />
      </Button>
    </Box>
  )
}
