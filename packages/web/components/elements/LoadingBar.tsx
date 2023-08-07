import { Box } from './../elements/LayoutPrimitives'
import { Dispatch, SetStateAction, useEffect, useState } from "react"

type LoadingBarProps = {
  fillColor: string
  backgroundColor: string
  borderRadius: string
  percentFill?: number
}

type AnimationStatus = {
  position: number,
  transition: string
}

export function LoadingBar(props: LoadingBarProps): JSX.Element {
  const [leftOne, setLeftOne] = useState({ position: 0, transition: 'left 0.5s linear' })
  const [leftTwo, setLeftTwo] = useState({ position: -100, transition: 'left 0.5s linear' })

  const calculateNewValue = (currVal: AnimationStatus, setNextVal: Dispatch<SetStateAction<AnimationStatus>>) => {
    const position = currVal.position >= 100 ? -100 : currVal.position + 25;
    const transition = currVal.position >= 100 ? 'left 0s linear' : 'left 0.5s linear';
    setNextVal({ position, transition })
  }

  useEffect(() => {
    const interval = setTimeout(() => {
      calculateNewValue(leftOne, setLeftOne)
    }, 500);

    return () => {
      clearTimeout(interval)
    }
  }, [leftOne])

  useEffect(() => {
    const interval = setTimeout(() => {
      calculateNewValue(leftTwo, setLeftTwo)
    }, 500);

    return () => {
      clearTimeout(interval)
    }
  }, [leftTwo])

  return (
    <Box
      css={{
        height: '5px',
        width: '100%',
        overflow: 'hidden',
        backgroundColor: props.backgroundColor,
      }}
    >
      <Box
        css={{
          height: '100%',
          position: 'absolute',
          width: `${props.percentFill ?? 10}%`,
          left: `${leftOne.position}%`,
          transition: leftOne.transition,
          backgroundColor: props.fillColor,
        }}
      />
      <Box
        css={{
          height: '100%',
          position: 'absolute',
          width: `${props.percentFill ?? 10}%`,
          left: `${leftTwo.position}%`,
          transition: leftTwo.transition,
          backgroundColor: props.fillColor,
        }}
      />
    </Box>
  )
}
