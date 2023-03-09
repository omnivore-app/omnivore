import { DotsThreeVertical, X } from 'phosphor-react'
import { useState } from 'react'
import { Button } from './Button'
import { Box, SpanBox } from './LayoutPrimitives'

export function MenuTrigger(): JSX.Element {
  const [hover, setHover] = useState(false)

  return (
    <SpanBox
      css={{
        display: 'flex',
        height: '20px',
        width: '20px',
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
      <DotsThreeVertical
        size={25}
        weight="bold"
        color={hover ? '#EBEBEB' : '#898989'}
      />
      {/* color="#ADADAD" />
      <Button
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
          width={10}
          height={10}
          weight="bold"
          color={hover ? '#EBEBEB' : '#898989'}
          className="xMark"
        />
      </Button> */}
    </SpanBox>
  )
}
