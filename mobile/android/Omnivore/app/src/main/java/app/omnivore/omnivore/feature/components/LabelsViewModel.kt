package app.omnivore.omnivore.feature.components

import androidx.lifecycle.*
import app.omnivore.omnivore.core.data.model.ServerSyncStatus
import app.omnivore.omnivore.core.database.entities.SavedItemLabel
import dagger.hilt.android.lifecycle.HiltViewModel
import java.time.LocalDate
import java.time.ZoneOffset
import java.time.format.DateTimeFormatter
import java.util.*
import javax.inject.Inject


@HiltViewModel
class LabelsViewModel @Inject constructor(): ViewModel() {
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
