import Link from 'next/link'
import React, { ReactNode } from 'react'

import { ProSidebar, Menu, MenuItem, SubMenu } from 'react-pro-sidebar'
import 'react-pro-sidebar/dist/css/styles.css'
import { styled } from '../tokens/stitches.config'
//import { useRouter } from 'next/router'
//const timeZoneHourDiff = -new Date().getTimezoneOffset() / 60

export const Menubar = () => {
  return (
    <ProSidebar
      style={{
        display: 'inline-block',
        background: '$grayBgActive !important',
      }}
    >
      <Menu iconShape="square" popperArrow={true}>
        <MenuItem>
          <Link passHref href={'/home'}>
            Home
          </Link>
        </MenuItem>
        <MenuItem>
          <Link
            passHref
            href={'/today'}
          >
            Today
          </Link>
        </MenuItem>
        <MenuItem>
          <Link passHref href={'home?q=in%3Ainbox+-label%3ANewsletter'}>
            Read Later
          </Link>
        </MenuItem>
        <MenuItem>
          <Link passHref href={'/home?q=type%3Ahighlights'}>
            Highlights
          </Link>
        </MenuItem>
        <MenuItem>
          <Link passHref href={'/home?q=in%3Ainbox+label%3ANewsletter'}>
            Newsletters
          </Link>
        </MenuItem>
      </Menu>
    </ProSidebar>
  )
}
