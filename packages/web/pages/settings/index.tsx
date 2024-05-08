import React, { useEffect } from 'react'
import Router from 'next/router'
import { Box } from '../../components/elements/LayoutPrimitives'

export default function Extensions(): JSX.Element {
  useEffect(() => {
    if (window.innerWidth <= 1024) {
      Router.push('/settings/account')
    } else {
      Router.push('/settings/account')
    }
  }, [])

  return <Box css={{ bg: '$grayBase', height: '100vh', width: '100vw' }} />
}
