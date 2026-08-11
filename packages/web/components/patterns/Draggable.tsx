import { useRef, useState } from 'react'
import React from 'react';

type DraggableProps = {
  children: React.ReactNode,
}

export const Draggable = (props: DraggableProps) => {
  const ourRef = useRef(null) as any
  const [isMouseDown, setIsMouseDown] = useState(false)
  const mouseCoords = useRef({
    startX: 0,
    startY: 0,
    scrollLeft: 0,
    scrollTop: 0,
  })

  const handleDragStart = (e: any) => {
    if (!ourRef.current) {
      return
    }

    const slider = ourRef.current.children[0]
    const startX = e.pageX - slider.offsetLeft
    const startY = e.pageY - slider.offsetTop
    const scrollLeft = slider.scrollLeft
    const scrollTop = slider.scrollTop
    mouseCoords.current = { startX, startY, scrollLeft, scrollTop }
    setIsMouseDown(true)
  }

  const handleDragEnd = () => {
    setIsMouseDown(false)
    if (!ourRef.current) return
  }

  const handleDrag = (e: any) => {
    if (!isMouseDown || !ourRef.current) return
    e.preventDefault()
    const slider = ourRef.current.children[0]
    const x = e.pageX - slider.offsetLeft
    const y = e.pageY - slider.offsetTop
    const walkX = (x - mouseCoords.current.startX) * 1.5
    const walkY = (y - mouseCoords.current.startY) * 1.5
    slider.scrollLeft = mouseCoords.current.scrollLeft - walkX
    slider.scrollTop = mouseCoords.current.scrollTop - walkY
  }

  return (
    <div
      ref={ourRef}
      onMouseDown={handleDragStart}
      onMouseUp={handleDragEnd}
      onMouseMove={handleDrag}
      style={{
        width: '100%'
      }}
    >
      {props.children}
    </div>
  )
}
