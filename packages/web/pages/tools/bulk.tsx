import { useCallback, useEffect, useState } from 'react'
import { applyStoredTheme } from '../../lib/themeUpdater'

import { VStack } from '../../components/elements/LayoutPrimitives'

import { StyledText } from '../../components/elements/StyledText'
import { ProfileLayout } from '../../components/templates/ProfileLayout'
import {
  BulkAction,
  bulkActionMutation,
} from '../../lib/networking/mutations/bulkActionMutation'
import { Button } from '../../components/elements/Button'
import { theme } from '../../components/tokens/stitches.config'
import { ConfirmationModal } from '../../components/patterns/ConfirmationModal'
import { showErrorToast, showSuccessToast } from '../../lib/toastHelpers'
import { useRouter } from 'next/router'
import { useGetLibraryItemsQuery } from '../../lib/networking/queries/useGetLibraryItemsQuery'
import {
  BorderedFormInput,
  FormLabel,
} from '../../components/elements/FormElements'

type RunningState = 'none' | 'confirming' | 'running' | 'completed'

export default function BulkPerformer(): JSX.Element {
  const router = useRouter()

  applyStoredTheme()

  const [action, setAction] = useState<BulkAction | undefined>()
  const [query, setQuery] = useState<string>('in:all')
  const [expectedCount, setExpectedCount] = useState<number | undefined>()
  const [errorMessage, setErrorMessage] = useState<string | undefined>()
  const [runningState, setRunningState] = useState<RunningState>('none')

  const { itemsPages, isValidating } = useGetLibraryItemsQuery('', {
    searchQuery: query,
    limit: 1,
    sortDescending: false,
  })

  useEffect(() => {
    console.log('itemsPages: ', itemsPages)
    setExpectedCount(itemsPages?.find(() => true)?.search.pageInfo.totalCount)
  }, [itemsPages])

  const performAction = useCallback(() => {
    ;(async () => {
      console.log('performing action: ', action)
      if (isValidating) {
        showErrorToast('Query still being validated.')
        return
      }
      if (!action) {
        showErrorToast('Unable to run action, no action set.')
        return
      }
      if (!expectedCount) {
        showErrorToast('No items matching this query or query still running.')
        return
      }
      if (!action) {
        showErrorToast('No action selected')
        return
      }
      try {
        const success = await bulkActionMutation(action, query, expectedCount)
        if (!success) {
          throw 'Success not returned'
        }
        showSuccessToast('Bulk action is being performed.')
        setRunningState('completed')
      } catch (err) {
        showErrorToast('Error performing bulk action.')
      }
    })()
  }, [action, query, expectedCount])

  return (
    <ProfileLayout logoDestination="/home">
      <VStack
        alignment="start"
        css={{
          padding: '16px',
          background: 'white',
          minWidth: '340px',
          width: '70vw',
          maxWidth: '576px',
          borderRadius: '8px',
          border: '1px solid #3D3D3D',
          boxShadow: '#B1B1B1 9px 9px 9px -9px',
        }}
      >
        <StyledText
          style="modalHeadline"
          css={{
            color: theme.colors.omnivoreGray.toString(),
          }}
        >
          Perform a Bulk Action
        </StyledText>
        <StyledText
          style="caption"
          css={{ pt: '10px', color: theme.colors.omnivoreGray.toString() }}
        >
          Use this tool to perform a bulk operation on all the items in your
          library.<br></br>
        </StyledText>
        <StyledText
          style="caption"
          css={{ pt: '0px', color: theme.colors.omnivoreGray.toString() }}
        >
          <b>Note:</b> This operation can not be undone.
        </StyledText>
        <VStack css={{ pt: '36px', width: '100%' }}>
          {runningState == 'completed' ? (
            <StyledText
              style="caption"
              css={{
                pt: '10px',
                pb: '20px',
                color: theme.colors.omnivoreGray.toString(),
              }}
            >
              Your bulk action has started. Please note that it can take some
              time for these actions to complete. During this time, we recommend
              not modifying your library as new items could be updated by the
              action.
            </StyledText>
          ) : (
            <>
              <VStack css={{ width: '100%', gap: '15px' }}>
                <FormLabel className="required">Search Query</FormLabel>
                <BorderedFormInput
                  key="fullname"
                  type="text"
                  name="name"
                  defaultValue={query}
                  placeholder="Enter your query"
                  css={{ bg: 'white', color: 'black' }}
                  onChange={(e) => setQuery(e.target.value)}
                  required
                />
                <StyledText style="footnote" css={{ mt: '5px' }}>
                  Matches {expectedCount} items.
                </StyledText>

                <FormLabel className="required">Action</FormLabel>
                <select
                  disabled={runningState == 'running'}
                  onChange={(event) => {
                    const updatedAction: BulkAction =
                      BulkAction[
                        event.currentTarget.value as keyof typeof BulkAction
                      ]
                    setAction(updatedAction)
                  }}
                  style={{
                    margin: '0px',
                    padding: '8px',
                    height: '38px',
                    borderRadius: '6px',
                    minWidth: '196px',
                    color: theme.colors.omnivoreGray.toString(),
                  }}
                >
                  <option value="none">Choose bulk action</option>
                  <option value="ARCHIVE">Archive All</option>
                  <option value="DELETE">Delete All</option>
                </select>

                <Button
                  onClick={(e) => {
                    if (!expectedCount) {
                      alert(
                        'No items matching this query or query still running.'
                      )
                      return
                    }
                    if (!action) {
                      alert('No action selected')
                      return
                    }
                    setRunningState('confirming')
                  }}
                  style="ctaDarkYellow"
                >
                  Perform Action
                </Button>
              </VStack>
            </>
          )}

          {runningState == 'confirming' && (
            <ConfirmationModal
              message={`Are you sure you want to ${action} the ${expectedCount} items matching this query? This operation can not be undone.`}
              onAccept={performAction}
              onOpenChange={() => setRunningState('none')}
            />
          )}
          {runningState == 'completed' && (
            <VStack css={{ width: '100%' }} alignment="center">
              <Button
                onClick={(e) => {
                  window.location.href = '/l/home'
                  e.preventDefault()
                }}
                style="ctaDarkYellow"
              >
                Return to Library
              </Button>
            </VStack>
          )}

          {errorMessage && (
            <StyledText style="error">{errorMessage}</StyledText>
          )}
        </VStack>
      </VStack>
    </ProfileLayout>
  )
}
