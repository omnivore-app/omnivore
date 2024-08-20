import { isAndroid } from '../../lib/deviceType'
import { styled, theme } from '../tokens/stitches.config'
import { Button } from '../elements/Button'
import { HStack, Box } from '../elements/LayoutPrimitives'
import { Circle, CheckCircle } from '@phosphor-icons/react'
import { LabelIcon } from '../elements/icons/LabelIcon'
import { NotebookIcon } from '../elements/icons/NotebookIcon'
import { highlightColor, highlightColors } from '../../lib/themeUpdater'
import { useState } from 'react'
import { CopyIcon } from '../elements/icons/CopyIcon'

type PageCoordinates = {
  pageX: number
  pageY: number
}

type LinkHoverBarProps = {
  anchorCoordinates: PageCoordinates
  handleButtonClick: () => void
}

export function LinkHoverBar(props: LinkHoverBarProps): JSX.Element {
  console.log('settingh link hover, ', props)
  return (
    <Box
      css={{
        // width: '295px',
        // height: '50px',
        position: 'absolute',
        background: '$thBackground2',
        borderRadius: '5px',
        border: '1px solid $thHighlightBar',
        boxShadow: `0px 4px 4px 0px rgba(0, 0, 0, 0.15)`,
        padding: '10px',

        // ...(props.displayAtBottom && {
        //   bottom: 'calc(38px + env(safe-area-inset-bottom, 40px))',
        // }),
        // ...(props.displayAtBottom && {
        //   '@smDown': {
        //     maxWidth: '90vw',
        //     bottom: `calc(28px + ${
        //       isAndroid() ? 30 : 0
        //     }px + env(safe-area-inset-bottom, 40px))`,
        //   },
        // }),
        left: props.anchorCoordinates.pageX,
        top: props.anchorCoordinates.pageY,
      }}
    >
      <Box>Save to Omnivore</Box>
    </Box>
  )
}
