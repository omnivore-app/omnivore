import { useEffect, useCallback } from 'react'
import { Button } from '../components/elements/Button'
import { HStack } from '../components/elements/LayoutPrimitives'
import { EmptyLayout } from '../components/templates/EmptyLayout'
import { setupAnalytics } from '../lib/analytics'

export default function Support(): JSX.Element {
  const initAnalytics = useCallback(() => {
    setupAnalytics()
    window.Intercom('show')
  }, [])

  useEffect(() => {
    window.addEventListener('load', initAnalytics)
    return () => {
      window.removeEventListener('load', initAnalytics)
    }
  }, [initAnalytics])

  return (
    <EmptyLayout title="Support">
      <HStack
        alignment="center"
        distribution="end"
        css={{
          pr: '$3',
          height: '80px',
          'input:focus': {
            outline: '5px auto -webkit-focus-ring-color',
          },
          'button:focus': {
            outline: '5px auto -webkit-focus-ring-color',
          },
        }}
      >
        <Button
          style={'ctaOutlineYellow'}
          type="button"
          onClick={(event) => {
            event.preventDefault()
            if (window.Intercom) {
              window.Intercom('show')
            }
          }}
        >
          {'Open Chat Window'}
        </Button>
      </HStack>
    </EmptyLayout>
  )
}
