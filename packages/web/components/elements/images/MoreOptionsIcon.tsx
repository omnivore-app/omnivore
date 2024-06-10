import { DotsThree, DotsThreeVertical } from '@phosphor-icons/react'

type Orientation = 'horizontal' | 'vertical'

type MoreOptionsIconProps = {
  size: number
  strokeColor: string
  orientation: Orientation
}

export function MoreOptionsIcon(props: MoreOptionsIconProps): JSX.Element {
  return props.orientation == 'horizontal' ? (
    <DotsThree size={props.size} color={props.strokeColor} />
  ) : (
    <DotsThreeVertical size={props.size} color={props.strokeColor} />
  )
}
