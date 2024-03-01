import { styled } from '@stitches/react'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { DownloadSimple, Eye, Link, Spinner } from 'phosphor-react'
import { useEffect, useMemo, useState } from 'react'
import { Toaster } from 'react-hot-toast'
import { Button } from '../../components/elements/Button'
import {
  Dropdown,
  DropdownOption,
} from '../../components/elements/DropdownElements'
import {
  Box,
  HStack,
  SpanBox,
  VStack,
} from '../../components/elements/LayoutPrimitives'
import { SettingsLayout } from '../../components/templates/SettingsLayout'
import { fetchEndpoint } from '../../lib/appConfig'
import { deleteIntegrationMutation } from '../../lib/networking/mutations/deleteIntegrationMutation'
import { importFromIntegrationMutation } from '../../lib/networking/mutations/importFromIntegrationMutation'
import {
  ImportItemState,
  setIntegrationMutation,
} from '../../lib/networking/mutations/setIntegrationMutation'
import {
  Integration,
  useGetIntegrationsQuery,
} from '../../lib/networking/queries/useGetIntegrationsQuery'
import { useGetWebhooksQuery } from '../../lib/networking/queries/useGetWebhooksQuery'
import { applyStoredTheme } from '../../lib/themeUpdater'
import { showErrorToast, showSuccessToast } from '../../lib/toastHelpers'
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
  // Our defined media queries don't work in styled components
  '@media (max-width: 575px)': {
    width: '100%',
  },
})

//interface
interface Integrations {
  id: string
}

interface DropdownOption {
  text: string
  action: () => void
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
    disabled?: boolean
    isDropdown?: boolean
    dropdownOptions?: DropdownOption[]
  }
}
export default function Integrations(): JSX.Element {
  applyStoredTheme()
  const { integrations, revalidate } = useGetIntegrationsQuery()
  const { webhooks } = useGetWebhooksQuery()

  const [integrationsArray, setIntegrationsArray] = useState(
    Array<integrationsCard>()
  )
  const router = useRouter()

  const readwiseConnected = useMemo(() => {
    return integrations.find((i) => i.name == 'READWISE' && i.type == 'EXPORT')
  }, [integrations])
  const pocketConnected = useMemo(() => {
    return integrations.find((i) => i.name == 'POCKET' && i.type == 'IMPORT')
  }, [integrations])

  const deleteIntegration = async (id: string) => {
    try {
      await deleteIntegrationMutation(id)
      revalidate()
      showSuccessToast('Integration Removed')
    } catch (err) {
      showErrorToast('Error: ' + err)
    }
  }

  const importFromIntegration = async (id: string) => {
    try {
      await importFromIntegrationMutation(id)
      revalidate()
      showSuccessToast('Import started')
    } catch (err) {
      showErrorToast('Error: ' + err)
    }
  }

  const redirectToPocket = (importItemState: ImportItemState) => {
    // create a form and submit it to the backend
    const form = document.createElement('form')
    form.method = 'POST'
    form.action = `${fetchEndpoint}/integration/pocket/auth`
    const input = document.createElement('input')
    input.type = 'hidden'
    input.name = 'state'
    input.value = importItemState
    form.appendChild(input)
    document.body.appendChild(form)
    form.submit()
  }

  const isImporting = (integration: Integration | undefined) => {
    return !!integration && !!integration.taskName
  }

  useEffect(() => {
    const connectToPocket = async () => {
      try {
        // get the token from query string
        const token = router.query.pocketToken as string
        const importItemState = router.query.state as ImportItemState
        const result = await setIntegrationMutation({
          token,
          name: 'POCKET',
          type: 'IMPORT',
          enabled: true,
          importItemState,
        })
        if (result) {
          revalidate()
          showSuccessToast('Connected with Pocket.')
          // start the import
          await importFromIntegration(result.id)
        } else {
          showErrorToast('There was an error connecting to Pocket.')
        }
      } catch (err) {
        showErrorToast(
          'There was an error connecting to Pocket. Please try again.',
          { duration: 5000 }
        )
      } finally {
        router.replace('/settings/integrations')
      }
    }
    if (!router.isReady) return
    if (router.query.pocketToken && router.query.state && !pocketConnected) {
      connectToPocket()
    }
  }, [router])

  useEffect(() => {
    setIntegrationsArray([
      {
        icon: '/static/icons/logseq.svg',
        title: 'Logseq',
        subText:
          'Logseq is an open-source knowledge base. Use the Omnivore Logseq plugin to sync articles, highlights, and notes to Logseq.',
        button: {
          text: `Install Logseq Plugin`,
          icon: <DownloadSimple size={16} weight={'bold'} />,
          style: 'ctaDarkYellow',
          action: () => {
            router.push(`https://github.com/omnivore-app/logseq-omnivore`)
          },
        },
      },
      {
        icon: '/static/icons/obsidian.png',
        title: 'Obsidian',
        subText:
          'Obsidian is a powerful and extensible knowledge base that works on top of your local folder of plain text files. Use the Omnivore Obsidian plugin to sync articles, highlights, and notes to Obsidian.',
        button: {
          text: `Install Obsidian Plugin`,
          icon: <DownloadSimple size={16} weight={'bold'} />,
          style: 'ctaDarkYellow',
          action: () => {
            router.push(`https://github.com/omnivore-app/obsidian-omnivore`)
          },
        },
      },
      {
        icon: '/static/icons/pocket.svg',
        title: 'Pocket',
        subText:
          'Pocket is a place to save articles, videos, and more. Our Pocket integration allows importing your Pocket library to Omnivore. Once connected we will asyncronously import all your Pocket articles into Omnivore, as this process is resource intensive it can take some time. You will receive an email when the process is completed. Limit 20k articles per import.',
        button: {
          text: pocketConnected ? 'Disconnect' : 'Import',
          icon: isImporting(pocketConnected) ? (
            <Spinner size={16} />
          ) : (
            <Link size={16} weight={'bold'} />
          ),
          style: pocketConnected ? 'ctaWhite' : 'ctaDarkYellow',
          action: () => {
            pocketConnected
              ? deleteIntegration(pocketConnected.id)
              : redirectToPocket(ImportItemState.Unarchived)
          },
          disabled: isImporting(pocketConnected),
          isDropdown: !pocketConnected,
          dropdownOptions: [
            {
              text: 'Import All',
              action: () => {
                redirectToPocket(ImportItemState.All)
              },
            },
            {
              text: 'Import Unarchived',
              action: () => {
                redirectToPocket(ImportItemState.Unarchived)
              },
            },
          ],
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
          action: () => router.push('/settings/webhooks'),
        },
      },
      {
        icon: '/static/icons/readwise.svg',
        title: 'Readwise',
        subText:
          'Readwise makes it easy to revisit and learn from your ebook & article highlights. Use our Readwise integration to sync your highlights from Omnivore to Readwise.',
        button: {
          text: readwiseConnected ? 'Remove' : 'Connect to Readwise',
          icon: <Link size={16} weight={'bold'} />,
          style: readwiseConnected ? 'ctaWhite' : 'ctaDarkYellow',
          action: () => {
            readwiseConnected
              ? deleteIntegration(readwiseConnected.id)
              : router.push('/settings/integrations/readwise')
          },
        },
      },
    ])
  }, [pocketConnected, readwiseConnected, webhooks])

  return (
    <SettingsLayout>
      <Toaster
        containerStyle={{
          top: '5rem',
        }}
      />

      <VStack css={{ width: '100%', height: '100%' }}>
        <Header css={{ textAlign: 'center', width: '100%' }}>
          Integrations
        </Header>
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
            height: '100%',
            '@smDown': {
              width: '100%',
            },
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
                    borderRadius: 'unset',
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
                    '@sm': {
                      width: '60%',
                    },
                    padding: '8px',
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
                <HStack css={{ '@smDown': { width: '100%' } }}>
                  {item.button.isDropdown ? (
                    <Dropdown
                      triggerElement={
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
                            width: '100%',
                          }}
                        >
                          {item.button.icon}
                          <SpanBox
                            css={{
                              pl: '10px',
                              fontWeight: '600',
                              fontSize: '16px',
                            }}
                          >
                            {item.button.text}
                          </SpanBox>
                        </Button>
                      }
                    >
                      {item.button.dropdownOptions?.map((option) => (
                        <DropdownOption
                          key={option.text}
                          onSelect={option.action}
                          title={option.text}
                        ></DropdownOption>
                      ))}
                    </Dropdown>
                  ) : (
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
                        width: '100%',
                      }}
                      onClick={item.button.action}
                      disabled={item.button.disabled}
                    >
                      {item.button.icon}
                      <SpanBox
                        css={{
                          pl: '10px',
                          fontWeight: '600',
                          fontSize: '16px',
                        }}
                      >
                        {item.button.text}
                      </SpanBox>
                    </Button>
                  )}
                </HStack>
              </HStack>
            )
          })}
        </VStack>
      </VStack>
    </SettingsLayout>
  )
}
