package app.omnivore.omnivore.ui.components

import android.util.Log
import androidx.lifecycle.*
import app.omnivore.omnivore.DatastoreRepository
import app.omnivore.omnivore.dataService.*
import app.omnivore.omnivore.graphql.generated.type.CreateLabelInput
import app.omnivore.omnivore.models.ServerSyncStatus
import app.omnivore.omnivore.networking.*
import app.omnivore.omnivore.persistence.entities.SavedItemLabel
import com.apollographql.apollo3.api.Optional.Companion.presentIfNotNull
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.*
import java.time.LocalDate
import java.time.ZoneOffset
import java.time.format.DateTimeFormatter
import java.util.*
import javax.inject.Inject


@HiltViewModel
class LabelsViewModel @Inject constructor(
    private val datastoreRepo: DatastoreRepository,
    private val dataService: DataService,
    private val networker: Networker
): ViewModel() {
    val labelNameMaxLength = 64

    enum class Error {
        LabelNameTooLong
    }

    /**
     * Checks whether or not the provided label name is valid.
     * @param labelName The name of the label.
     * @return null if valid, [Error] otherwise.
     */
    fun validateLabelName(labelName: String): Error? {
        if (labelName.count() > labelNameMaxLength) {
            return Error.LabelNameTooLong
        }

        return null
    }

    fun createNewSavedItemLabelWithTemp(labelName: String, hexColorValue: String): SavedItemLabel {
        val tempId = UUID.randomUUID().toString()
        val res = SavedItemLabel(
            savedItemLabelId = tempId,
            name = labelName,
            labelDescription = "",
            color = hexColorValue,
            createdAt = LocalDate.now().atStartOfDay().atOffset(ZoneOffset.UTC).format(
                DateTimeFormatter.ISO_DATE_TIME
            ),
            serverSyncStatus = ServerSyncStatus.NEEDS_CREATION.rawValue
        )

        return res
    }
}
