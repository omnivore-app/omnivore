import { useEffect, useMemo, useState} from 'react'
import { useRouter } from 'next/router'
import { styled } from '@stitches/react'
import { Toaster } from 'react-hot-toast'
import { DownloadSimple, Eye, Link } from 'phosphor-react'
import Image from 'next/image'

import {
  Box,
  HStack,
  SpanBox,
  VStack,
} from '../../components/elements/LayoutPrimitives'
import { PrimaryLayout } from '../../components/templates/PrimaryLayout'
import { applyStoredTheme } from '../../lib/themeUpdater'
import { Button } from '../../components/elements/Button'
import { useGetIntegrationsQuery } from '../../lib/networking/queries/useGetIntegrationsQuery'
import { useGetWebhooksQuery } from '../../lib/networking/queries/useGetWebhooksQuery'

// Styles
const Header = styled(Box, {
  color: '$utilityTextDefault',
  fontSize: 'x-large',
  margin: '10px',
})

const Subheader = styled(Box, {
  padding: '20px',
  color: '$utilityTextDefault',
  borderBottom: '1px solid $grayLine',
  margin: '0 auto',
  width: '80%',
})

//interface
interface Integrations {
  id: string
}

type integrationsCard = {
  icon: string
  title: string
  subText?: string
  button: {
    text: string
    icon?: JSX.Element
    style: string
    action: () => void
  }
}
export default function Integrations(): JSX.Element {
  applyStoredTheme(false)
  const { integrations } = useGetIntegrationsQuery()
  const { webhooks } = useGetWebhooksQuery()

  const [integrationsArray, setIntegrationsArray] = useState(
    Array<integrationsCard>()
  )
  const router = useRouter()

  const readwiseConnected = useMemo(() => {
    return integrations.some((i) => i.type == 'READWISE')
  }, [integrations])

  useEffect(() => {
    setIntegrationsArray([
      {
        icon: '/static/icons/logseq.svg',
        title: 'Logseq',
        subText: 'Logseq is an open-source knowledge base. Use the Omnivore Logseq plugin to sync articles, highlights, and notes to Logseq.',
        button: {
          text: `Install Logseq Plugin`,
          icon: <DownloadSimple size={16} weight={'bold'} />,
          style: 'ctaDarkYellow',
          action: () => {
            router.push(`https://github.com/omnivore-app/logseq-omnivore`)
          }
        },
      },
      {
        icon: '/static/icons/readwise.svg',
        title: 'Readwise',
        subText: 'Readwise makes it easy to revisit and learn from your ebook & article highlights. Use our Readwise integration to sync your highlights from Omnivore to Readwise.',
        button: {
          text: readwiseConnected ? 'Remove' : 'Connect to Readwise',
          icon: <Link size={16} weight={'bold'} />,
          style: readwiseConnected ? 'ctaWhite' : 'ctaDarkYellow',
          action: () => router.push("/settings/integrations/readwise")
        },
      },
      {
        icon: '/static/icons/webhooks.svg',
        title: 'Webhooks',
        subText: `${webhooks.length} Webhooks`,
        button: {
          text: 'View Webhooks',
          icon: <Eye size={16} weight={'bold'} />,
          style: 'ctaWhite',
          action: () =>router.push("/settings/integrations/webhooks"),
        },
      },
    ])
  }, [readwiseConnected, integrations, webhooks])

  return (
    <PrimaryLayout pageTestId={'integrations'}>
      <Toaster
        containerStyle={{
          top: '5rem',
        }}
      />
      <Header css={{ textAlign: 'center' }}>Integrations</Header>
      <Subheader>
        Connect with other applications can help enhance and streamline your
        experience with Omnivore, below are some useful apps to connect your
        Omnivore account to.
      </Subheader>
      <VStack
        distribution={'start'}
        css={{
          width: '80%',
          margin: '0 auto',
          height: '500px',
        }}
      >
        <Header>Applications</Header>

        {integrationsArray.map((item) => {
          return (
            <HStack
              key={item.title}
              css={{
                width: '100%',
                borderRadius: '5px',
                backgroundColor: '$grayBg',
                margin: '10px 0',
                padding: '20px',
                display: 'flex',
                alignItems: 'center',
                '@smDown': {
                  flexWrap: 'wrap',
                },
              }}
            >
              <Image
                src={item.icon}
                alt="integration Image"
                width={75}
                height={75}
              />
              <Box
                css={{
                  width: '60%',
                  padding: '10px',
                  color: '$utilityTextDefault',
                  m: '10px',
                  'h3, p': {
                    margin: '0',
                  },
                }}
              >
                <h3>{item.title}</h3>
                <p>{item.subText}</p>
              </Box>
              <HStack>
                <Button
                  style={
                    item.button.style === 'ctaDarkYellow'
                      ? 'ctaDarkYellow'
                      : 'ctaWhite'
                  }
                  css={{
                    py: '10px',
                    px: '14px',
                    minWidth: '230px',
                  }}
                  onClick={item.button.action}
                >
                  {item.button.icon}
                  <SpanBox
                    css={{ pl: '10px', fontWeight: '600', fontSize: '16px' }}
                  >
                    {item.button.text}
                  </SpanBox>
                </Button>
              </HStack>
            </HStack>
          )
        })}
      </VStack>
    </PrimaryLayout>
  )
}
