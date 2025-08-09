import { Button } from '../../../elements/Button'
import { useEffect, useState } from 'react'
import { isDarkTheme } from "../../../../lib/themeUpdater"

export type TopicTabProps = {
  title: string
  selected: boolean
  onClick: () => void
}

export function TopicTab(props: TopicTabProps): JSX.Element {
  const DEFAULT_STYLING: any = {
    cursor: 'pointer',
    borderRadius: '15px',
    px: '12px',
    py: '5px',
    font: '$inter',
    fontSize: '12px',
    fontWeight: '500',
    whiteSpace: 'nowrap',
    border: '1px solid transparent',
    backgroundColor: 'transparent',
  }


  const [style, setStyle] = useState(DEFAULT_STYLING)
  useEffect(() => {
    const selectedColor = isDarkTheme() ? '$thBackground3' : '$thBackground4'
    const highlightColor = isDarkTheme() ? '$thBackground' : '$thBackground5'
    if (props.selected) {
      setStyle({ ...DEFAULT_STYLING, border: `1px solid ${selectedColor}`, backgroundColor: selectedColor, color: '$thLibraryMenuPrimary',})
      return
    }

    setStyle({ ...DEFAULT_STYLING, '&:hover': { bg: highlightColor, border: `1px solid ${highlightColor}` }})
  }, [props.selected])

  return (
    <Button
      key={props.title}
      css={style}
      onClick={(event) => {
        event.preventDefault()
        props.onClick()
      }}
    >
      {props.title}
    </Button>
  )
}
