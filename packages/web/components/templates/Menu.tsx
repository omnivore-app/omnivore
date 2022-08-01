import React, { ReactNode } from 'react'
import { ProSidebar, Menu, MenuItem, SubMenu } from 'react-pro-sidebar'
import 'react-pro-sidebar/dist/css/styles.css'

//import { useRouter } from 'next/router'

export const Menubar = () => {
  return (
    <>
      <ProSidebar style={{display: 'inline-block'}}>
        <Menu iconShape="square" popperArrow={true}>
          <MenuItem>Home</MenuItem>
            <MenuItem>Today</MenuItem>
            <MenuItem>Read Later</MenuItem>
            <MenuItem>Highlights</MenuItem>
            <MenuItem>NewsLetters</MenuItem>
        </Menu>
      </ProSidebar>
    </>
  )
}
