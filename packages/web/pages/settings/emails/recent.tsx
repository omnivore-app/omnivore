import { useMemo, useState } from 'react'
import { applyStoredTheme } from '../../../lib/themeUpdater'

import { FormInputProps } from '../../../components/elements/FormElements'
import {
  EmptySettingsRow,
  SettingsTable,
  SettingsTableRow,
} from '../../../components/templates/settings/SettingsTable'
import { StyledText } from '../../../components/elements/StyledText'
import {
  RecentEmail,
  useGetRecentEmailsQuery,
} from '../../../lib/networking/queries/useGetRecentEmails'
import {
  Box,
  HStack,
  SpanBox,
  VStack,
} from '../../../components/elements/LayoutPrimitives'
import { DropdownOption } from '../../../components/elements/DropdownElements'
import { theme } from '../../../components/tokens/stitches.config'
import {
  ModalContent,
  ModalOverlay,
  ModalRoot,
  ModalTitleBar,
} from '../../../components/elements/ModalPrimitives'
import TextArea from 'antd/lib/input/TextArea'
import { StyledTextArea } from '../../../components/elements/StyledTextArea'
import { markEmailAsItemMutation } from '../../../lib/networking/mutations/markEmailAsItemMutation'
import { showErrorToast, showSuccessToast } from '../../../lib/toastHelpers'

type TypeChipProps = {
  type: string
}

const TypeChip = (props: TypeChipProps): JSX.Element => {
  const backgroundColor = props.type == 'article' ? '$omnivoreCtaYellow' : 'red'
  return (
    <SpanBox
      css={{
        color: 'black',
        display: 'inline-table',
        marginTop: '5px',
        borderRadius: '4px',
        fontSize: '14px',
        fontWeight: 'bold',
        padding: '5px 10px 5px 10px',
        whiteSpace: 'nowrap',
        cursor: 'pointer',
        backgroundClip: 'padding-box',
        backgroundColor,
      }}
    >
      {props.type}
    </SpanBox>
  )
}

type MoreOptionItemProps = {
  text: string
  action: () => void
}

const MoreOptionItem = (props: MoreOptionItemProps): JSX.Element => {
  return (
    <DropdownOption
      onSelect={() => {
        props.action()
      }}
    >
      <HStack alignment={'center'} distribution={'start'}>
        <SpanBox
          css={{
            color: theme.colors.grayTextContrast.toString(),
            marginLeft: '8px',
            border: 'none',
            backgroundColor: 'transparent',
            '&:hover': {
              border: 'none',
              backgroundColor: 'transparent',
            },
          }}
        >
          {props.text}
        </SpanBox>
      </HStack>
    </DropdownOption>
  )
}

type ViewRecentEmailModalProps = {
  recentEmail: RecentEmail
  onOpenChange: (open: boolean) => void
}

const ViewRecentEmailModal = (
  props: ViewRecentEmailModalProps
): JSX.Element => {
  return (
    <ModalRoot defaultOpen onOpenChange={props.onOpenChange}>
      <ModalOverlay />
      <ModalContent
        css={{
          bg: '$grayBg',
          px: '24px',
          overflowY: 'auto',
          height: '100%',
          width: '100%',
        }}
        onInteractOutside={() => {
          // remove focus from modal
          ;(document.activeElement as HTMLElement).blur()
        }}
      >
        <VStack distribution="start">
          <ModalTitleBar title="View Email" onOpenChange={props.onOpenChange} />
          <Box
            css={{
              width: '100%',
              height: '100%',
              fontSize: '12px',
              overflowY: 'scroll',
            }}
          >
            {props.recentEmail.text}
          </Box>
        </VStack>
      </ModalContent>
    </ModalRoot>
  )
}

export default function RecentEmails(): JSX.Element {
  const { recentEmails, isValidating } = useGetRecentEmailsQuery()
  const [viewingEmail, setViewingEmail] = useState<RecentEmail | undefined>(
    undefined
  )

  applyStoredTheme(false)

  const sortedRecentEmails = useMemo(() => {
    const stub = {
      createdAt: '2023-01-25T09:00:02.000Z',
      from: 'Jackson Harper from 😜 Jackson’s Newsletter <jacksonharper@substack.com>',
      id: 'a7210b62-9c8e-11ed-bac2-7321761ada92',
      subject: 'This is a test post i just created',
      text: 'View this post on the web at https://jacksonharper.substack.com/p/this-is-a-test-post-i-just-created\n\nThis is a test post created on substack. You can read it in your recent emails.\n\nUnsubscribe https://substack.com/redirect/2/eyJlIjoiaHR0cHM6Ly9qYWNrc29uaGFycGVyLnN1YnN0YWNrLmNvbS9hY3Rpb24vZGlzYWJsZV9lbWFpbD90b2tlbj1leUoxYzJWeVgybGtJam8zTWpVMU16RXlNQ3dpY0c5emRGOXBaQ0k2T1RnNE5EYzFNRE1zSW1saGRDSTZNVFkzTkRZek56RTVOU3dpWlhod0lqb3hOamMzTWpJNU1UazFMQ0pwYzNNaU9pSndkV0l0Tmpnek1Ea3hJaXdpYzNWaUlqb2laR2x6WVdKc1pWOWxiV0ZwYkNKOS5SenJLc1RUcXQ5VTlXbFliY250ZmR1anFjeW80Mk5mUDFSNjRLMXBoRVJZIiwicCI6OTg4NDc1MDMsInMiOjY4MzA5MSwiZiI6dHJ1ZSwidSI6NzI1NTMxMjAsImlhdCI6MTY3NDYzNzE5NSwiZXhwIjoxNjc3MjI5MTk1LCJpc3MiOiJwdWItMCIsInN1YiI6ImxpbmstcmVkaXJlY3QifQ.bQzDxlIPeV1K2lMXAFkBrFkSiAxEJWOC-9VLw372kME?',
      to: 'jacksonh-eEMfQepve@inbox-demo.omnivore.app',
      type: 'article',
    }
    return [stub]
    if (!recentEmails) {
      return []
    }
    return recentEmails.sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  }, [recentEmails])

  return (
    <SettingsTable
      pageId="api-keys"
      pageInfoLink="https://docs.omnivore.app/using/inbox.html"
      headerTitle="Recently Received Emails"
    >
      {sortedRecentEmails.length > 0 ? (
        sortedRecentEmails.map((recentEmail: RecentEmail, i) => {
          return (
            <SettingsTableRow
              key={recentEmail.id}
              title={recentEmail.from}
              isLast={i === sortedRecentEmails.length - 1}
              sublineElement={
                <VStack>
                  <StyledText
                    css={{
                      my: '5px',
                      fontSize: '14px',
                    }}
                  >
                    {recentEmail.subject}
                  </StyledText>
                  <StyledText
                    css={{
                      my: '0px',
                      fontSize: '11px',
                      a: {
                        color: '$omnivoreCtaYellow',
                      },
                    }}
                  >
                    <TypeChip type={recentEmail.type} />
                  </StyledText>
                </VStack>
              }
              dropdownItems={
                <>
                  <MoreOptionItem
                    text="View Text"
                    action={() => {
                      console.log('viewing text: ', recentEmail)
                      setViewingEmail(recentEmail)
                    }}
                  />
                  <MoreOptionItem
                    text="Mark as article"
                    action={async () => {
                      console.log('marking as email', recentEmail)
                      showSuccessToast('Marking email as article')
                      try {
                        await markEmailAsItemMutation(recentEmail.id)
                      } catch (err) {
                        console.log('error marking as article: ', err)
                        showErrorToast('Error marking item as article')
                        return
                      }
                      showSuccessToast('Email added to library')
                    }}
                  />
                </>
              }
            />
          )
        })
      ) : (
        <EmptySettingsRow
          text={isValidating ? '-' : 'No recent emails Found'}
        />
      )}

      {viewingEmail && (
        <ViewRecentEmailModal
          recentEmail={viewingEmail}
          onOpenChange={() => setViewingEmail(undefined)}
        />
      )}
    </SettingsTable>
  )
}
