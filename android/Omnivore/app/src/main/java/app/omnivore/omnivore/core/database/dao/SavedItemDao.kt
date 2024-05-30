package app.omnivore.omnivore.core.database.dao

import androidx.lifecycle.LiveData
import androidx.room.Dao
import androidx.room.Query
import androidx.room.Transaction
import androidx.room.Update
import app.omnivore.omnivore.core.database.entities.SavedItem
import app.omnivore.omnivore.core.database.entities.SavedItemQueryConstants
import app.omnivore.omnivore.core.database.entities.SavedItemWithLabelsAndHighlights
import app.omnivore.omnivore.core.database.entities.TypeaheadCardData
import kotlinx.coroutines.flow.Flow

@Dao
interface SavedItemDao {

    @Query("SELECT * FROM savedItem")
    fun getAll(): Flow<List<SavedItem>>

    @Query("SELECT * FROM savedItem WHERE savedItemId = :itemID")
    suspend fun findById(itemID: String): SavedItem?

    @Query("SELECT savedItemId, slug, title, isArchived FROM saveditem WHERE title LIKE '%' || :query || '%'")
    suspend fun getTypeaheadData(query: String): List<TypeaheadCardData>

    @Query("SELECT * FROM savedItem WHERE serverSyncStatus != 0")
    fun getUnSynced(): List<SavedItem>

    @Query("SELECT * FROM savedItem WHERE slug = :slug")
    suspend fun getSavedItemWithLabelsAndHighlights(slug: String): SavedItemWithLabelsAndHighlights?

    @Query("DELETE FROM savedItem WHERE savedItemId = :itemID")
    suspend fun deleteById(itemID: String)

    @Query("DELETE FROM savedItem WHERE savedItemId in (:itemIDs)")
    fun deleteByIds(itemIDs: List<String>)

    @Update
    suspend fun update(savedItem: SavedItem)

    @Transaction
    @Query(
        "SELECT ${SavedItemQueryConstants.libraryColumns} " +
                "FROM SavedItem " +
                "LEFT OUTER JOIN SavedItemAndSavedItemLabelCrossRef on SavedItem.savedItemId = SavedItemAndSavedItemLabelCrossRef.savedItemId " +
                "LEFT OUTER JOIN SavedItemAndHighlightCrossRef on SavedItem.savedItemId = SavedItemAndHighlightCrossRef.savedItemId " +

                "LEFT OUTER JOIN SavedItemLabel on SavedItemLabel.savedItemLabelId = SavedItemAndSavedItemLabelCrossRef.savedItemLabelId " +
                "LEFT OUTER  JOIN Highlight on highlight.highlightId = SavedItemAndHighlightCrossRef.highlightId " +

                "WHERE SavedItem.savedItemId = :savedItemId " +

                "GROUP BY SavedItem.savedItemId "
    )
    fun getLibraryItemById(savedItemId: String): LiveData<SavedItemWithLabelsAndHighlights>

    @Transaction
    @Query(
        "SELECT ${SavedItemQueryConstants.libraryColumns} " +
                "FROM SavedItem " +
                "LEFT OUTER JOIN SavedItemAndSavedItemLabelCrossRef on SavedItem.savedItemId = SavedItemAndSavedItemLabelCrossRef.savedItemId " +
                "LEFT OUTER JOIN SavedItemAndHighlightCrossRef on SavedItem.savedItemId = SavedItemAndHighlightCrossRef.savedItemId " +

                "LEFT OUTER JOIN SavedItemLabel on SavedItemLabel.savedItemLabelId = SavedItemAndSavedItemLabelCrossRef.savedItemLabelId " +
                "LEFT OUTER  JOIN Highlight on highlight.highlightId = SavedItemAndHighlightCrossRef.highlightId " +

                "WHERE SavedItem.savedItemId = :savedItemId " +

                "GROUP BY SavedItem.savedItemId "
    )
    suspend fun getById(savedItemId: String): SavedItemWithLabelsAndHighlights?

    @Transaction
    @Query(
        "SELECT ${SavedItemQueryConstants.libraryColumns} " +
                "FROM SavedItem " +
                "LEFT OUTER JOIN SavedItemAndSavedItemLabelCrossRef on SavedItem.savedItemId = SavedItemAndSavedItemLabelCrossRef.savedItemId " +
                "LEFT OUTER JOIN SavedItemAndHighlightCrossRef on SavedItem.savedItemId = SavedItemAndHighlightCrossRef.savedItemId " +

                "LEFT OUTER JOIN SavedItemLabel on SavedItemLabel.savedItemLabelId = SavedItemAndSavedItemLabelCrossRef.savedItemLabelId " +
                "LEFT OUTER  JOIN Highlight on highlight.highlightId = SavedItemAndHighlightCrossRef.highlightId " +

                "WHERE SavedItem.serverSyncStatus != 2 " +
                "AND SavedItem.folder IN (:folders) " +
                "AND SavedItem.isArchived IN (:allowedArchiveStates) " +
                "AND SavedItem.contentReader IN (:allowedContentReaders) " +
                "AND CASE WHEN :hasRequiredLabels THEN SavedItemLabel.name in (:requiredLabels) ELSE 1 END " +
                "AND CASE WHEN :hasExcludedLabels THEN NOT EXISTS ( " +
                "    SELECT 1 FROM SavedItemAndSavedItemLabelCrossRef " +
                "    INNER JOIN SavedItemLabel ON SavedItemAndSavedItemLabelCrossRef.savedItemLabelId = SavedItemLabel.savedItemLabelId " +
                "    WHERE SavedItemAndSavedItemLabelCrossRef.savedItemId = SavedItem.savedItemId " +
                "    AND SavedItemLabel.name IN (:excludedLabels) " +
                ") ELSE 1 END " +

                "GROUP BY SavedItem.savedItemId " +

                "ORDER BY \n" +
                "CASE WHEN :sortKey = 'newest' THEN SavedItem.savedAt END DESC,\n" +
                "CASE WHEN :sortKey = 'oldest' THEN SavedItem.savedAt END ASC,\n" +

                "CASE WHEN :sortKey = 'recentlyRead' THEN SavedItem.readAt END DESC,\n" +
                "CASE WHEN :sortKey = 'recentlyPublished' THEN SavedItem.publishDate END DESC"
    )
    fun filteredLibraryData(
        folders: List<String>,
        allowedArchiveStates: List<Int>,
        sortKey: String,
        hasRequiredLabels: Int,
        hasExcludedLabels: Int,
        requiredLabels: List<String>,
        excludedLabels: List<String>,
        allowedContentReaders: List<String>
    ): Flow<List<SavedItemWithLabelsAndHighlights>>
}
