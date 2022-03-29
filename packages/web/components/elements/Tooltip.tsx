import React, { FC } from 'react'
import { styled, keyframes } from '@stitches/react'
import * as TooltipPrimitive from '@radix-ui/react-tooltip'

const slideUpAndFade = keyframes({
  '0%': { opacity: 0, transform: 'translateY(2px)' },
  '100%': { opacity: 1, transform: 'translateY(0)' },
})

const slideRightAndFade = keyframes({
  '0%': { opacity: 0, transform: 'translateX(-2px)' },
  '100%': { opacity: 1, transform: 'translateX(0)' },
})

const slideDownAndFade = keyframes({
  '0%': { opacity: 0, transform: 'translateY(-2px)' },
  '100%': { opacity: 1, transform: 'translateY(0)' },
})

const slideLeftAndFade = keyframes({
  '0%': { opacity: 0, transform: 'translateX(2px)' },
  '100%': { opacity: 1, transform: 'translateX(0)' },
})

const StyledContent = styled(TooltipPrimitive.Content, {
  borderRadius: 8,
  padding: '9px 17px',
  fontSize: 13,
  color: '#FFFFFF',
  backgroundColor: '#1C1C1E',
  textAlign: 'center',
  '@media (prefers-reduced-motion: no-preference)': {
    animationDuration: '400ms',
    animationTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
    animationFillMode: 'forwards',
    willChange: 'transform, opacity',
    '&[data-state="delayed-open"]': {
      '&[data-side="top"]': { animationName: slideDownAndFade },
      '&[data-side="right"]': { animationName: slideLeftAndFade },
      '&[data-side="bottom"]': { animationName: slideUpAndFade },
      '&[data-side="left"]': { animationName: slideRightAndFade },
    },
  },
})

const StyledArrow = styled(TooltipPrimitive.Arrow, {
  fill: '#1C1C1E',
  width: 14,
  height: 7,
});

export const TooltipProvider = TooltipPrimitive.Provider;
export const Tooltip = TooltipPrimitive.Root;
export const TooltipTrigger = TooltipPrimitive.Trigger;
export const TooltipContent = StyledContent;
export const TooltipArrow = StyledArrow;

type TooltipWrappedProps = {
  tooltipContent: string;
  active?: boolean;
  tooltipSide?: TooltipPrimitive.TooltipContentProps['side']
  align?: TooltipPrimitive.TooltipContentProps['align']
  alignOffset?: TooltipPrimitive.TooltipContentProps['alignOffset']
  arrowStyles?: TooltipPrimitive.TooltipArrowProps['style']
  style?: TooltipPrimitive.TooltipContentProps['style']
}

export const TooltipWrapped: FC<TooltipWrappedProps> = ({
  children,
  active,
  tooltipContent,
  tooltipSide,
  ...props
}) => {
  return (
    <Tooltip open={active}>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent sideOffset={5} side={tooltipSide} {...props}>
        {tooltipContent}
        <TooltipArrow style={props.arrowStyles} />
      </TooltipContent>
    </Tooltip>
  )
}
