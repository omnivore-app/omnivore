package app.omnivore.omnivore.core.data.repository.impl

import android.content.Context
import android.util.Log
import app.omnivore.omnivore.core.data.DataService
import app.omnivore.omnivore.core.data.SavedItemSyncResult
import app.omnivore.omnivore.core.data.SearchResult
import app.omnivore.omnivore.core.data.model.LibraryQuery
import app.omnivore.omnivore.core.data.model.ServerSyncStatus
import app.omnivore.omnivore.core.data.repository.LibraryRepository
import app.omnivore.omnivore.core.database.dao.HighlightChangesDao
import app.omnivore.omnivore.core.database.dao.HighlightDao
import app.omnivore.omnivore.core.database.dao.SavedItemAndSavedItemLabelCrossRefDao
import app.omnivore.omnivore.core.database.dao.SavedItemDao
import app.omnivore.omnivore.core.database.dao.SavedItemLabelDao
import app.omnivore.omnivore.core.database.dao.SavedItemWithLabelsAndHighlightsDao
import app.omnivore.omnivore.core.database.entities.Highlight
import app.omnivore.omnivore.core.database.entities.HighlightChange
import app.omnivore.omnivore.core.database.entities.SavedItem
import app.omnivore.omnivore.core.database.entities.SavedItemAndSavedItemLabelCrossRef
import app.omnivore.omnivore.core.database.entities.SavedItemLabel
import app.omnivore.omnivore.core.database.entities.SavedItemWithLabelsAndHighlights
import app.omnivore.omnivore.core.database.entities.TypeaheadCardData
import app.omnivore.omnivore.core.database.entities.highlightChangeToHighlight
import app.omnivore.omnivore.core.network.Networker
import app.omnivore.omnivore.core.network.ReadingProgressParams
import app.omnivore.omnivore.core.network.archiveSavedItem
import app.omnivore.omnivore.core.network.createHighlight
import app.omnivore.omnivore.core.network.createNewLabel
import app.omnivore.omnivore.core.network.deleteHighlights
import app.omnivore.omnivore.core.network.deleteSavedItem
import app.omnivore.omnivore.core.network.loadLibraryItemContent
import app.omnivore.omnivore.core.network.mergeHighlights
import app.omnivore.omnivore.core.network.saveLibraryItemContentToFile
import app.omnivore.omnivore.core.network.savedItem
import app.omnivore.omnivore.core.network.savedItemLabels
import app.omnivore.omnivore.core.network.savedItemUpdates
import app.omnivore.omnivore.core.network.search
import app.omnivore.omnivore.core.network.unarchiveSavedItem
import app.omnivore.omnivore.core.network.updateHighlight
import app.omnivore.omnivore.core.network.updateLabelsForSavedItem
import app.omnivore.omnivore.core.network.updateReadingProgress
import app.omnivore.omnivore.graphql.generated.type.CreateHighlightInput
import app.omnivore.omnivore.graphql.generated.type.CreateLabelInput
import app.omnivore.omnivore.graphql.generated.type.HighlightType
import app.omnivore.omnivore.graphql.generated.type.MergeHighlightInput
import app.omnivore.omnivore.graphql.generated.type.SetLabelsInput
import app.omnivore.omnivore.graphql.generated.type.UpdateHighlightInput
import com.apollographql.apollo3.api.Optional
import com.google.gson.Gson
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.withContext
import javax.inject.Inject

class LibraryRepositoryImpl @Inject constructor(
    private val savedItemDao: SavedItemDao,
    private val savedItemLabelDao: SavedItemLabelDao,
    private val savedItemWithLabelsAndHighlightsDao: SavedItemWithLabelsAndHighlightsDao,
    private val savedItemAndSavedItemLabelCrossRefDao: SavedItemAndSavedItemLabelCrossRefDao,
    private val highlightDao: HighlightDao,
    private val highlightChangesDao: HighlightChangesDao,
    private val networker: Networker,
    private val dataService: DataService
): LibraryRepository {

    override fun getSavedItems(query: LibraryQuery): Flow<List<SavedItemWithLabelsAndHighlights>> =
        savedItemDao.filteredLibraryData(
            folders = query.folders,
            query.allowedArchiveStates,
            query.sortKey,
            hasRequiredLabels = query.requiredLabels.size,
            hasExcludedLabels = query.excludedLabels.size,
            query.requiredLabels,
            query.excludedLabels,
            query.allowedContentReaders
        )

    override fun getSavedItemsLabels(): Flow<List<SavedItemLabel>> = savedItemLabelDao.getSavedItemLabels()

    override suspend fun getLabels(): List<SavedItemLabel> = networker.savedItemLabels()

    override suspend fun insertAllLabels(labels: List<SavedItemLabel>) {
        savedItemLabelDao.insertAll(labels)
    }

    override suspend fun fetchSavedItemContent(context: Context, slug: String) {
        val syncResult = networker.savedItem(context, slug)

        val savedItem = syncResult.item
        savedItem?.let {
            val item = SavedItemWithLabelsAndHighlights(
                savedItem = savedItem, labels = syncResult.labels, highlights = syncResult.highlights
            )
            savedItemWithLabelsAndHighlightsDao.insertAll(listOf(item))
        }
    }

    override suspend fun getTypeaheadData(query: String): List<TypeaheadCardData> {
        return withContext(Dispatchers.IO) {
            savedItemDao.getTypeaheadData(query)
        }
    }

    override suspend fun updateReadingProgress(
        itemId: String,
        readingProgressPercentage: Double,
        readingProgressAnchorIndex: Int
    ) {

        val jsonString = Gson().toJson(
            mapOf(
                "id" to itemId,
                "readingProgressPercent" to readingProgressPercentage,
                "readingProgressAnchorIndex" to readingProgressAnchorIndex,
                "force" to true
            )
        )

        val readingProgressParams = Gson().fromJson(jsonString, ReadingProgressParams::class.java)
        val savedItemId = readingProgressParams.id ?: return


        val savedItem = savedItemDao.findById(savedItemId)
        val updatedItem = savedItem?.copy(
            readingProgress = readingProgressParams.readingProgressPercent ?: 0.0,
            readingProgressAnchor = readingProgressParams.readingProgressAnchorIndex ?: 0,
            serverSyncStatus = ServerSyncStatus.NEEDS_UPDATE.rawValue
        )

        updatedItem?.let { savedItemDao.update(updatedItem) }

        val isUpdatedOnServer = networker.updateReadingProgress(readingProgressParams)

        if (isUpdatedOnServer) {
            updatedItem?.serverSyncStatus = ServerSyncStatus.IS_SYNCED.rawValue
            updatedItem?.let { savedItemDao.update(updatedItem) }
        }
    }

    override suspend fun setSavedItemLabels(
        itemId: String,
        labels: List<SavedItemLabel>
    ): Boolean {
        val input = SetLabelsInput(
            pageId = itemId,
            labels = Optional.presentIfNotNull(labels.map { CreateLabelInput(color = Optional.presentIfNotNull(it.color), name = it.name) }),
        )

        val updatedLabels = networker.updateLabelsForSavedItem(input)

        // Figure out which of the labels are new
        updatedLabels?.let { updatedLabels ->
            val existingNamedLabels = savedItemLabelDao.namedLabels(updatedLabels.map { it.labelFields.name })
            val existingNames = existingNamedLabels.map { it.name }
            val newNamedLabels = updatedLabels.filter { !existingNames.contains(it.labelFields.name) }

            savedItemLabelDao.insertAll(newNamedLabels.map {
                SavedItemLabel(
                    savedItemLabelId = it.labelFields.id,
                    name = it.labelFields.name,
                    color = it.labelFields.color,
                    createdAt = null,
                    labelDescription = null
                )
            })

            val allNamedLabels = savedItemLabelDao.namedLabels(updatedLabels.map { it.labelFields.name })
            val crossRefs = allNamedLabels.map {
                SavedItemAndSavedItemLabelCrossRef(
                    savedItemLabelId = it.savedItemLabelId,
                    savedItemId = itemId
                )
            }
            savedItemAndSavedItemLabelCrossRefDao.deleteRefsBySavedItemId(itemId)
            savedItemAndSavedItemLabelCrossRefDao.insertAll(crossRefs)

            return true
        } ?: run {
            return false
        }
    }

    override suspend fun createNewSavedItemLabel(labelName: String, hexColorValue: String) {
        val newLabel = networker.createNewLabel(
            CreateLabelInput(
                color = Optional.presentIfNotNull(hexColorValue), name = labelName
            )
        )

        newLabel?.let {
            val savedItemLabel = SavedItemLabel(
                savedItemLabelId = it.id,
                name = it.name,
                color = it.color,
                createdAt = it.createdAt as String?,
                labelDescription = it.description
            )

            savedItemLabelDao.insertAll(listOf(savedItemLabel))
        }
    }

    override suspend fun librarySearch(context: Context, cursor: String?, query: String): SearchResult {
        val searchResult = networker.search(context = context, cursor = cursor, limit = 10, query = query)
        val savedItems = searchResult.items.map {
            SavedItemWithLabelsAndHighlights(
                savedItem = it.item,
                labels = it.labels,
                highlights = it.highlights,
            )
        }

        savedItemWithLabelsAndHighlightsDao.insertAll(savedItems)

        Log.d(
            "sync",
            "found ${searchResult.items.size} items with search api. Query: $query cursor: $cursor"
        )

        return SearchResult(
            hasError = false,
            hasMoreItems = false,
            cursor = searchResult.cursor,
            count = searchResult.items.size,
            savedItems = savedItems
        )
    }

    override suspend fun isSavedItemContentStoredInDB(context: Context, slug: String): Boolean {
        val existingItem = savedItemDao.getSavedItemWithLabelsAndHighlights(slug)
        existingItem?.savedItem?.savedItemId?.let { savedItemId ->
            val htmlContent = loadLibraryItemContent(context, savedItemId)
            return (htmlContent ?: "").length > 10
        }
        return false
    }

    override suspend fun deleteSavedItem(itemID: String) {
        val savedItem = savedItemDao.findById(itemID = itemID) ?: return
        savedItem.serverSyncStatus = ServerSyncStatus.NEEDS_DELETION.rawValue
        savedItemDao.update(savedItem)

        val isUpdatedOnServer = networker.deleteSavedItem(itemID)

        if (isUpdatedOnServer) {
            savedItemDao.deleteById(itemID)
        }
    }

    override suspend fun archiveSavedItem(itemID: String) {
        val savedItem = savedItemDao.findById(itemID = itemID) ?: return

        savedItem.serverSyncStatus = ServerSyncStatus.NEEDS_UPDATE.rawValue
        savedItem.isArchived = true
        savedItemDao.update(savedItem)

        val isUpdatedOnServer = networker.archiveSavedItem(itemID)

        if (isUpdatedOnServer) {
            savedItem.serverSyncStatus = ServerSyncStatus.IS_SYNCED.rawValue
            savedItemDao.update(savedItem)
        }
    }

    override suspend fun unarchiveSavedItem(itemID: String) {
        val savedItem = savedItemDao.findById(itemID = itemID) ?: return

        savedItem.serverSyncStatus = ServerSyncStatus.NEEDS_UPDATE.rawValue
        savedItem.isArchived = false
        savedItemDao.update(savedItem)

        val isUpdatedOnServer = networker.unarchiveSavedItem(itemID)

        if (isUpdatedOnServer) {
            savedItem.serverSyncStatus = ServerSyncStatus.IS_SYNCED.rawValue
            savedItemDao.update(savedItem)
        }
    }

    override suspend fun syncOfflineItemsWithServerIfNeeded() {
        val unSyncedSavedItems = savedItemDao.getUnSynced()
        val unSyncedHighlights = highlightChangesDao.getUnSynced()

        for (savedItem in unSyncedSavedItems) {
            delay(250)
            dataService.savedItemSyncChannel.send(savedItem)
        }

        for (change in unSyncedHighlights) {
            performHighlightChange(change)
        }
    }

    override suspend fun syncHighlightChange(highlightChange: HighlightChange): Boolean {
        val highlight = highlightChangeToHighlight(highlightChange)

        fun updateSyncStatus(status: ServerSyncStatus) {
            highlight.serverSyncStatus = status.rawValue
            highlightDao.update(highlight)
        }

        when (highlight.serverSyncStatus) {
            ServerSyncStatus.NEEDS_DELETION.rawValue -> {
                updateSyncStatus(ServerSyncStatus.IS_SYNCING)
                val isDeletedOnServer = networker.deleteHighlights(listOf(highlight.highlightId))

                if (isDeletedOnServer) {
                    highlightDao.deleteById(highlight.highlightId)
                } else {
                    updateSyncStatus(ServerSyncStatus.NEEDS_DELETION)
                }
                return isDeletedOnServer != null
            }

            ServerSyncStatus.NEEDS_UPDATE.rawValue -> {
                updateSyncStatus(ServerSyncStatus.IS_SYNCING)

                val isUpdatedOnServer = networker.updateHighlight(
                    UpdateHighlightInput(
                        annotation = Optional.presentIfNotNull(highlight.annotation),
                        highlightId = highlight.highlightId,
                        sharedAt = Optional.absent()
                    )
                )

                if (isUpdatedOnServer) {
                    updateSyncStatus(ServerSyncStatus.IS_SYNCED)
                } else {
                    updateSyncStatus(ServerSyncStatus.NEEDS_UPDATE)
                }
                return isUpdatedOnServer != null
            }

            ServerSyncStatus.NEEDS_CREATION.rawValue -> {
                updateSyncStatus(ServerSyncStatus.IS_SYNCING)

                val input = CreateHighlightInput(
                    id = highlight.highlightId,
                    shortId = highlight.shortId,
                    articleId = highlightChange.savedItemId,
                    type = Optional.presentIfNotNull(HighlightType.safeValueOf(highlight.type)),
                    annotation = Optional.presentIfNotNull(highlight.annotation),
                    patch = Optional.presentIfNotNull(highlight.patch),
                    quote = Optional.presentIfNotNull(highlight.quote),
                )
                Log.d("sync", "Creating highlight from input: ${input}")
                val createResult = networker.createHighlight(
                    input
                )
                if (createResult.newHighlight != null || createResult.alreadyExists) {
                    updateSyncStatus(ServerSyncStatus.IS_SYNCED)
                    return true
                } else {
                    updateSyncStatus(ServerSyncStatus.NEEDS_UPDATE)
                    return false
                }
            }

            ServerSyncStatus.NEEDS_MERGE.rawValue -> {
                Log.d("sync", "NEEDS MERGE: ${highlightChange}")

                val mergeHighlightInput = MergeHighlightInput(
                    id = highlight.highlightId,
                    shortId = highlight.shortId,
                    articleId = highlightChange.savedItemId,
                    annotation = Optional.presentIfNotNull(highlight.annotation),
                    color = Optional.presentIfNotNull(highlight.color),
                    highlightPositionAnchorIndex = Optional.presentIfNotNull(highlight.highlightPositionAnchorIndex),
                    highlightPositionPercent = Optional.presentIfNotNull(highlight.highlightPositionPercent),
                    html = Optional.presentIfNotNull(highlightChange.html),
                    overlapHighlightIdList = highlightChange.overlappingIDs ?: emptyList(),
                    patch = highlight.patch ?: "",
                    prefix = Optional.presentIfNotNull(highlight.prefix),
                    quote = highlight.quote ?: "",
                    suffix = Optional.presentIfNotNull(highlight.suffix)
                )

                val isUpdatedOnServer = networker.mergeHighlights(mergeHighlightInput)
                if (!isUpdatedOnServer) {
                    Log.d("sync", "FAILED TO MERGE HIGHLIGHT")
                    highlight.serverSyncStatus = ServerSyncStatus.NEEDS_MERGE.rawValue
                    return false
                }

                for (highlightID in mergeHighlightInput.overlapHighlightIdList) {
                    Log.d("sync", "DELETING MERGED HIGHLIGHT: ${highlightID}")
                    val deleteChange = HighlightChange(
                        highlightId = highlightID,
                        savedItemId = highlightChange.savedItemId,
                        type = "",
                        shortId = "",
                        annotation = null,
                        createdAt = null,
                        patch = null,
                        prefix = null,
                        quote = null,
                        serverSyncStatus = ServerSyncStatus.NEEDS_DELETION.rawValue,
                        html = null,
                        suffix = null,
                        updatedAt = null,
                        color = null,
                        highlightPositionPercent = null,
                        highlightPositionAnchorIndex = null,
                        overlappingIDs = null
                    )
                    performHighlightChange(deleteChange)
                }
                return true
            }

            else -> return false
        }
    }

    private suspend fun performHighlightChange(highlightChange: HighlightChange) {
        val highlight = highlightChangeToHighlight(highlightChange)
        if (syncHighlightChange(highlightChange)) {
            highlightChangesDao.deleteById(highlight.highlightId)
        }
    }

    override suspend fun sync(context: Context, since: String, cursor: String?, limit: Int): SavedItemSyncResult {
        val syncResult = networker.savedItemUpdates(cursor = cursor, limit = limit, since = since)
            ?: return SavedItemSyncResult.errorResult

        if (syncResult.deletedItemIDs.isNotEmpty()) {
            savedItemDao.deleteByIds(syncResult.deletedItemIDs)
        }

        val savedItems = syncResult.items.map {
            saveLibraryItemContentToFile(context, it.id, it.content)
            val savedItem = SavedItem(
                savedItemId = it.id,
                title = it.title,
                folder = it.folder,
                createdAt = it.createdAt as String,
                savedAt = it.savedAt as String,
                readAt = it.readAt as String?,
                updatedAt = it.updatedAt as String?,
                readingProgress = it.readingProgressPercent,
                readingProgressAnchor = it.readingProgressAnchorIndex,
                imageURLString = it.image,
                pageURLString = it.url,
                descriptionText = it.description,
                publisherURLString = it.originalArticleUrl,
                siteName = it.siteName,
                author = it.author,
                publishDate = it.publishedAt as String?,
                slug = it.slug,
                isArchived = it.isArchived,
                contentReader = it.contentReader.rawValue,
                wordsCount = it.wordsCount
            )
            val labels = it.labels?.map { label ->
                SavedItemLabel(
                    savedItemLabelId = label.labelFields.id,
                    name = label.labelFields.name,
                    color = label.labelFields.color,
                    createdAt = null,
                    labelDescription = null
                )
            } ?: listOf()
            val highlights = it.highlights?.map { highlight ->
                Highlight(
                    type = highlight.highlightFields.type.toString(),
                    highlightId = highlight.highlightFields.id,
                    annotation = highlight.highlightFields.annotation,
                    createdByMe = highlight.highlightFields.createdByMe,
                    markedForDeletion = false,
                    patch = highlight.highlightFields.patch,
                    prefix = highlight.highlightFields.prefix,
                    quote = highlight.highlightFields.quote,
                    serverSyncStatus = ServerSyncStatus.IS_SYNCED.rawValue,
                    shortId = highlight.highlightFields.shortId,
                    suffix = highlight.highlightFields.suffix,
                    createdAt = null,
                    updatedAt = highlight.highlightFields.updatedAt as String?,
                    color = highlight.highlightFields.color,
                    highlightPositionPercent = highlight.highlightFields.highlightPositionPercent,
                    highlightPositionAnchorIndex = highlight.highlightFields.highlightPositionAnchorIndex,
                )
            } ?: listOf()
            SavedItemWithLabelsAndHighlights(
                savedItem = savedItem, labels = labels, highlights = highlights
            )
        }

        savedItemWithLabelsAndHighlightsDao.insertAll(savedItems)

        Log.d("sync", "found ${syncResult.items.size} items with sync api. Since: $since")

        return SavedItemSyncResult(
            hasError = false,
            errorString = null,
            hasMoreItems = syncResult.hasMoreItems,
            cursor = syncResult.cursor,
            count = syncResult.items.size,
            savedItemSlugs = syncResult.items.map { it.slug }
        )
    }
}
