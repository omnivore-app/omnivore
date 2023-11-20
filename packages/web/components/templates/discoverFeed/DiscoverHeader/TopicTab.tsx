import { Button } from '../../../elements/Button'
import { isDarkTheme } from '../../../../lib/themeUpdater'
import { useEffect, useState } from 'react'

export type TopicTabProps = {
  title: string
  selected: boolean
  onClick: () => void
}

const selectedStyle = {
  cursor: 'pointer',
  borderRadius: '15px',
  px: '12px',
  py: '5px',
  font: '$inter',
  fontSize: '12px',
  fontWeight: '500',
  whiteSpace: 'nowrap',
  border: '1px solid $thBackground4',
  backgroundColor: '$thBackground4',
  color: '$thLibraryMenuPrimary',
}

const unselectedStyle = {
  cursor: 'pointer',
  borderRadius: '15px',
  px: '12px',
  py: '5px',
  font: '$inter',
  fontSize: '12px',
  fontWeight: '500',
  whiteSpace: 'nowrap',
  border: '1px solid $thLeftMenuBackground',
  backgroundColor: '$thLeftMenuBackground',
  '&:hover': {
    bg: '$thBackground5',
    border: '1px solid $thBackground5',
  },
}

export function TopicTab(props: TopicTabProps): JSX.Element {
  const [style, setStyle] = useState(
    isDarkTheme()
      ? props.selected
        ? unselectedStyle
        : selectedStyle
      : props.selected
      ? selectedStyle
      : unselectedStyle
  )

  useEffect(() => {
    const mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          setStyle(
            isDarkTheme()
              ? props.selected
                ? unselectedStyle
                : selectedStyle
              : props.selected
              ? selectedStyle
              : unselectedStyle
          )
        }
      })
    })

    mutationObserver.observe(document.getElementsByTagName('html')[0], {
      attributes: true,
    })

    return () => {
      mutationObserver.disconnect()
    }
  }, [])

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
