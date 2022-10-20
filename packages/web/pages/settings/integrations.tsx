import { useEffect, useState } from 'react'
import { styled } from '@stitches/react'
import { Toaster } from 'react-hot-toast'
import { DownloadSimple, Eye, Link, Plus } from 'phosphor-react'
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

// Styles
const Header = styled(Box, {
  //width: '100%',
  color: '$utilityTextDefault',
  fontSize: 'x-large',
  margin: '10px',
})

const Para = styled(Box, {
  //width: '100%',
  padding: '20px',
  color: '$utilityTextDefault',
  borderBottom: '1px solid $grayLine',
})

const IntegrationCard = styled(Box, {
  width: '100%',
  borderRadius: '5px',
  backgroundColor: '$grayBg',
  margin: '10px 0',
  padding: '20px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
})

const IntegrationContent = styled(Box, {
  width: '60%',
  minWidth: '200px',
  padding: '10px',
  color: '$utilityTextDefault',
  m: '10px',
  'h3, p': {
    margin: '0',
  },
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
  }
}
export default function Integrations(): JSX.Element {
  applyStoredTheme(false)

  const [integrationsArray, setIntegrationsArray] = useState(
    Array<integrationsCard>()
  )

  useEffect(() => {
    setIntegrationsArray([
      {
        icon: '/static/icons/logseq.svg',
        title: 'Logseq',
        subText: 'Organize your personal knowledge base',
        button: {
          text: `Install Logseq Plugin`,
          icon: <DownloadSimple size={16} weight={'bold'} />,
          style: 'ctaDarkYellow',
        },
      },
      {
        icon: '/static/icons/readwise.svg',
        title: 'ReadWise',
        subText: 'Synchronize ebooks & articles from Readwise account',
        button: {
          text: 'Connect to Readwise',
          icon: <Link size={16} weight={'bold'} />,
          style: 'ctaDarkYellow',
        },
      },
      {
        icon: '/static/icons/webhooks.svg',
        title: 'Webhooks',
        subText: '## Webhooks',
        button: {
          text: 'View Webhooks',
          icon: <Eye size={16} weight={'bold'} />,
          style: 'ctaWhite',
        },
      },
    ])
  }, [])

  return (
    <PrimaryLayout pageTestId={'integrations'}>
      <Toaster
        containerStyle={{
          top: '5rem',
        }}
      />
      <HStack css={{ width: '80%', margin: '0 auto' }}>
        <Header css={{ textAlign: 'center' }}>Integrations</Header>
      </HStack>

      <HStack css={{ width: '80%', margin: '0 auto' }}>
        <Para>
          Connect with other applications can help enhance and streamline your
          experience with Omnivore, below are some useful apps to connect your
          Omnivore account to.
        </Para>
      </HStack>
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
            <IntegrationCard key={item.title}>
              <Image
                src={item.icon}
                alt="integration Image"
                width={90}
                height={90}
              />
              <IntegrationContent>
                <h3>{item.title}</h3>
                <p>{item.subText}</p>
              </IntegrationContent>
              <Button
                style={
                  item.button.style === 'ctaDarkYellow'
                    ? 'ctaDarkYellow'
                    : 'ctaWhite'
                }
                css={{
                  py: '10px',
                  px: '14px',
                  mr: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  minWidth: '255px',
                }}
              >
                {item.button.icon}
                <SpanBox
                  css={{ pl: '10px', fontWeight: '600', fontSize: '16px' }}
                >
                  {item.button.text}
                </SpanBox>
              </Button>
            </IntegrationCard>
          )
        })}
      </VStack>
    </PrimaryLayout>
  )
}
