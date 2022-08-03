import Link from 'next/link'
import React from 'react'
import { styled } from '../tokens/stitches.config'

import { ProSidebar, Menu, MenuItem } from 'react-pro-sidebar'
import 'react-pro-sidebar/dist/css/styles.css'


const calculateTodayMenuItem = () => {
  const timeZoneHourDiff = -new Date().getTimezoneOffset() / 60

  const hrefStr = `/home?q=in%3Ainbox+saved%3A${
    new Date(new Date().getTime() - 24 * 3600000).toISOString().split('T')[0]
  }Z${timeZoneHourDiff.toLocaleString('en-US', {
    signDisplay: 'always',
  })}Z%2B..*`

  console.log(hrefStr)
  return hrefStr
}
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
          <Link passHref href={calculateTodayMenuItem()}>
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
