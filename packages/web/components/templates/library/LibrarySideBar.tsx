import { Action, createAction, useKBar, useRegisterActions } from 'kbar'
import debounce from 'lodash/debounce'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Toaster } from 'react-hot-toast'
import TopBarProgress from 'react-topbar-progress-indicator'
import { useFetchMore } from '../../../lib/hooks/useFetchMoreScroll'
import { usePersistedState } from '../../../lib/hooks/usePersistedState'
import { libraryListCommands } from '../../../lib/keyboardShortcuts/navigationShortcuts'
import { useKeyboardShortcuts } from '../../../lib/keyboardShortcuts/useKeyboardShortcuts'
import {
  PageType,
  State,
} from '../../../lib/networking/fragments/articleFragment'
import {
  SearchItem,
  TypeaheadSearchItemsData,
  typeaheadSearchQuery,
} from '../../../lib/networking/queries/typeaheadSearch'
import type {
  LibraryItem,
  LibraryItemsQueryInput,
} from '../../../lib/networking/queries/useGetLibraryItemsQuery'
import { useGetLibraryItemsQuery } from '../../../lib/networking/queries/useGetLibraryItemsQuery'
import {
  useGetViewerQuery,
  UserBasicData,
} from '../../../lib/networking/queries/useGetViewerQuery'
import { Button } from '../../elements/Button'
import { StyledText } from '../../elements/StyledText'
import { ConfirmationModal } from '../../patterns/ConfirmationModal'
import { LinkedItemCardAction } from '../../patterns/LibraryCards/CardTypes'
import { LinkedItemCard } from '../../patterns/LibraryCards/LinkedItemCard'
import { Box, HStack, SpanBox, VStack } from '../../elements/LayoutPrimitives'
import { AddLinkModal } from '../AddLinkModal'
import { EditLibraryItemModal } from '../homeFeed/EditItemModals'
import { EmptyLibrary } from '../homeFeed/EmptyLibrary'
import { LegacyLibraryHeader, MultiSelectMode } from '../homeFeed/LibraryHeader'
import { UploadModal } from '../UploadModal'
import { BulkAction } from '../../../lib/networking/mutations/bulkActionMutation'
import { bulkActionMutation } from '../../../lib/networking/mutations/bulkActionMutation'
import {
  showErrorToast,
  showSuccessToast,
  showSuccessToastWithAction,
} from '../../../lib/toastHelpers'
import { SetPageLabelsModalPresenter } from '../article/SetLabelsModalPresenter'
import { NotebookPresenter } from '../article/NotebookPresenter'
import { saveUrlMutation } from '../../../lib/networking/mutations/saveUrlMutation'
import { articleQuery } from '../../../lib/networking/queries/useGetArticleQuery'
import { PinnedButtons } from '../homeFeed/PinnedButtons'
import { PinnedSearch } from '../../../pages/settings/pinned-searches'
import { FetchItemsError } from '../homeFeed/FetchItemsError'
import { LibraryHeader } from './LibraryHeader'

type LibrarySideBarProps = {
  text: string
}

export function LibrarySideBar(props: LibrarySideBarProps): JSX.Element {
  return <VStack css={{ width: '100%', height: '100%' }}>{props.text}</VStack>
}
