import { useMemo, useState } from 'react'
import { applyStoredTheme } from '../../../lib/themeUpdater'

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
  display: 'html' | 'text'
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
          maxWidth: '650px',
        }}
        onInteractOutside={(event) => {
          event.preventDefault()
        }}
      >
        <VStack distribution="start" css={{ height: '100%' }}>
          <ModalTitleBar title="View Email" onOpenChange={props.onOpenChange} />
          {props.display == 'text' ? (
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
          ) : (
            <Box
              css={{
                width: '100%',
                height: '100%',
                fontSize: '12px',
                overflowY: 'scroll',
                iframe: {
                  width: '100%',
                  height: '100%',
                  display: 'block',
                  border: 'none',
                },
              }}
            >
              <iframe srcDoc={props.recentEmail.html}></iframe>
            </Box>
          )}
        </VStack>
      </ModalContent>
    </ModalRoot>
  )
}

export default function RecentEmails(): JSX.Element {
  const { recentEmails, revalidate, isValidating } = useGetRecentEmailsQuery()
  const [viewingEmailText, setViewingEmailText] =
    useState<RecentEmail | undefined>(undefined)

  const [viewingEmailHtml, setViewingEmailHtml] =
    useState<RecentEmail | undefined>(undefined)

  applyStoredTheme()

  const sortedRecentEmails = useMemo(() => {
    return recentEmails.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }, [recentEmails])

  return (
    <SettingsTable
      pageId="recent-emails"
      pageInfoLink="https://docs.omnivore.app/using/inbox.html"
      headerTitle="Recently Received Emails"
    >
      {sortedRecentEmails.length > 0 ? (
        sortedRecentEmails.map((recentEmail: RecentEmail, i) => {
          return (
            <SettingsTableRow
              key={recentEmail.id}
              title={recentEmail.from}
              onClick={() => {
                setViewingEmailHtml(recentEmail)
              }}
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
                      setViewingEmailText(recentEmail)
                    }}
                  />
                  {recentEmail.type != 'article' && (
                    <MoreOptionItem
                      text="Mark as article"
                      action={async () => {
                        console.log('marking as email', recentEmail)
                        showSuccessToast('Marking email as article')
                        try {
                          await markEmailAsItemMutation(recentEmail.id)
                          revalidate()
                        } catch (err) {
                          console.log('error marking as article: ', err)
                          showErrorToast('Error marking item as article')
                          return
                        }
                        showSuccessToast('Email added to library')
                      }}
                    />
                  )}
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

      {viewingEmailText && (
        <ViewRecentEmailModal
          display="text"
          recentEmail={viewingEmailText}
          onOpenChange={() => setViewingEmailText(undefined)}
        />
      )}
      {viewingEmailHtml && (
        <ViewRecentEmailModal
          display="html"
          recentEmail={viewingEmailHtml}
          onOpenChange={() => setViewingEmailHtml(undefined)}
        />
      )}
    </SettingsTable>
  )
}
