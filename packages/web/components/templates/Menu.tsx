import React, { ReactNode } from 'react'

//import { useRouter } from 'next/router'

type MenuItem = {
  name: string
  action?: () => void
  url?: string
}
type MenuProps = {
  items: Array<MenuItem>
}

export const Menu = ({ items }: MenuProps) => {
  //const router = useRouter()
  console.log(items)
  return (
    <>
      {/* <nav id="menu">
        <header>
          <h2>Menu</h2>
        </header>
      </nav>

      <main id="panel">
        <header>
          <h2>Panel</h2>
        </header>
      </main> */}
    </>
  )
}
