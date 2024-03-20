import { HStack, VStack } from '../../../elements/LayoutPrimitives'
import React, { useEffect, useRef, useState } from 'react'

type HeaderTextProps = {
  title: string
  subTitle: string
}

export function HeaderText(props: HeaderTextProps): JSX.Element {
  return (
    <>
      <VStack alignment={'start'}>
        <HStack
          css={{
            font: '$inter',
            fontSize: 'min(4.25vw, 75px)',
            fontWeight: '750',
            whiteSpace: 'nowrap',
            lineHeight: '75px',
            color: '$thLibraryMenuPrimary',
          }}
        >
          {props.title}
        </HStack>
      </VStack>
      <VStack
        alignment={'end'}
        distribution={'end'}
        css={{ width: '100%', fontSize: '30px' }}
      >
        <HStack
          distribution={'end'}
          css={{
            font: '$inter',
            fontWeight: '100',
            whiteSpace: 'nowrap',
            fontSize: '2vw',
            color: '$thLibraryMenuPrimary',
          }}
        >
          {props.subTitle}
        </HStack>
      </VStack>

      <VStack alignment={'end'} distribution={'end'} css={{ width: '100%' }}>
        <HStack
          css={{
            width: '100%',
            height: '1px',
            backgroundColor: '$thBorderColor',
          }}
        ></HStack>
      </VStack>
    </>
  )
}
