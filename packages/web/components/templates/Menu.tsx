import Link from 'next/link'
import React, { useEffect, useState } from 'react'

import { useGetLabelsQuery } from '../../lib/networking/queries/useGetLabelsQuery'
import { useGetSubscriptionsQuery } from '../../lib/networking/queries/useGetSubscriptionsQuery'

import { ProSidebar, Menu, MenuItem, SubMenu } from 'react-pro-sidebar'
import { Tag } from 'phosphor-react'

// styles
const proSideBarStyles = {
  display: 'inline-block',
}

// Types
type MenuItems = {
  label: string
  query: string
  active?: boolean
  icon: string | JSX.Element | null
  href: string
}

type DynamicMenuItems = {
  labels?: MenuItems[]
  subscriptions?: MenuItems[]
}

// Functions
const calculateTodayMenuItem = () => {
  const timeZoneHourDiff = -new Date().getTimezoneOffset() / 60
  const hrefStr = `?q=in%3Ainbox+saved%3A${
    new Date(new Date().getTime() - 24 * 3600000).toISOString().split('T')[0]
  }Z%${timeZoneHourDiff}B2..*`
  return hrefStr
}

const createDynamicMenuItems = (
  labels: Array<any>,
  subscriptions: Array<any>
) => {
  const labelsList: Array<MenuItems> = []
  const subscriptionsList: Array<MenuItems> = []
  // Create labels list
  if (labels.length) {
    labels.map((l) =>
      labelsList.push({
        label: l.name,
        query: `label:"${l.name}"`,
        icon: <Tag size={18} weight="light" />,
        href: `?q=label:"${l.name}"`,
      })
    )
  }
  // create subscriptions list
  if (subscriptions.length) {
    subscriptions.map((s) =>
      subscriptionsList.push({
        label: s.name,
        query: `subscription:"${s.subscription}"`,
        icon: 'subscription',
        href: `?q=subscription:"${s.subscription}"`,
      })
    )
  }
  return { labels: [...labelsList], subscriptions: [...subscriptionsList] }
}

// Component
export const Menubar = () => {
  const { labels } = useGetLabelsQuery()
  const { subscriptions } = useGetSubscriptionsQuery()

  const [menuList, setMenuList] = useState<Array<MenuItems>>([])
  const [dynamicMenuItems, setDynamicMenuItems] = useState<DynamicMenuItems>({})

  useEffect(() => {
    if (labels || subscriptions) {
      setDynamicMenuItems(createDynamicMenuItems(labels, subscriptions))
    }
    setMenuList([
      {
        label: 'Home',
        query: 'in:inbox',
        icon: null,
        href: '/home',
        active: true,
      },
      {
        label: 'Today',
        query: 'in:inbox-label:Newsletter',
        icon: null,
        href: calculateTodayMenuItem(),
      },
      {
        label: 'Read Later',
        query: 'in:inbox-label:Newsletter',
        icon: null,
        href: `?q=in:inbox+-label:Newsletter`,
      },
      {
        label: 'HighLights',
        query: 'type:highlights',
        icon: null,
        href: `?q=type:highlights`,
      },
      {
        label: 'Newsletters',
        query: 'in:inbox label:Newsletter',
        icon: null,
        href: `?q=in:inbox+label:Newsletter`,
      },
    ])
  },[labels, subscriptions])

  return (
    <ProSidebar style={proSideBarStyles} breakPoint={'sm'}>
      <Menu>
        {menuList.length > 0 &&
          menuList.map((item) => {
            return (
              <MenuItem
                key={item.label}
                icon={item.icon}
                active={item.active ?? false}
              >
                <Link passHref href={item.href}>
                  {item.label}
                </Link>
              </MenuItem>
            )
          })}
          {dynamicMenuItems.labels &&
            <SubMenu
              key="labels-list"
              title="Labels"
            >
              {dynamicMenuItems.labels.map((item: MenuItems) => {
                return (<MenuItem
                  key={item.label}
                  icon={item.icon}
                  active={item.active ?? false}
                >
                  <Link passHref href={item.href}>
                    {item.label}
                  </Link>
                </MenuItem>)
              })}
            </SubMenu>
          }
          {dynamicMenuItems.subscriptions &&
            <SubMenu
              key="subscriptions-list"
              title="Subscriptions"
            >
              {dynamicMenuItems.subscriptions.map((item: MenuItems) => {
                return (
                  <MenuItem
                    key={item.label}
                    icon={item.icon}
                    active={item.active ?? false}
                  >
                    <Link passHref href={item.href}>
                      {item.label}
                    </Link>
                  </MenuItem>
                )
              })}
            </SubMenu>
          }
      </Menu>
    </ProSidebar>
  )
}
