import '../styles/LabelPickerModal.css'

import { useEffect, useState } from 'react'

import { type Label, useCreateLabel, useLabels, useSetLibraryItemLabels } from '../lib/graphql-client'

interface LabelPickerModalProps {
  itemId: string
  currentLabels: string[]
  onUpdate: (labels: string[]) => void
  onClose: () => void
}

// Preset colors matching legacy implementation
const PRESET_COLORS = [
  { name: 'Red', value: '#FF5D99' },
  { name: 'Orange', value: '#EF8C43' },
  { name: 'Yellow', value: '#FFD234' },
  { name: 'Green', value: '#7CFF7B' },
  { name: 'Blue', value: '#7BE4FF' },
  { name: 'Purple', value: '#CE88EF' },
]

/**
 * LabelPickerModal
 * @param props.itemId - Target library item ID.
 * @param props.currentLabels - Current label names applied.
 * @param props.onUpdate - Called with the updated label name list.
 * @param props.onClose - Close handler.
 */
export function LabelPickerModal({ itemId, currentLabels, onUpdate, onClose }: LabelPickerModalProps) {
  const { data: allLabels, loading: loadingLabels, fetchLabels } = useLabels()
  const { setLibraryItemLabels, loading: updating } = useSetLibraryItemLabels()
  const { createLabel, loading: creating } = useCreateLabel()
  const [selectedLabels, setSelectedLabels] = useState<Set<string>>(new Set(currentLabels))
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[2].value) // Default to yellow

  useEffect(() => {
    fetchLabels()
  }, [fetchLabels])

  useEffect(() => {
    setSelectedLabels(new Set(currentLabels))
  }, [currentLabels])

  const toggleLabel = (labelName: string) => {
    setSelectedLabels((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(labelName)) {
        newSet.delete(labelName)
      } else {
        newSet.add(labelName)
      }
      
      return newSet
    })
  }

  const handleSave = async () => {
    try {
      const labelNames = Array.from(selectedLabels)

      const freshLabels = await fetchLabels()

      // Convert label names to label IDs using fresh data
      const labelIds = freshLabels
        ?.filter((label) => labelNames.includes(label.name))
        .map((label) => label.id) || []

      // If some labels weren't found (shouldn't happen, but be defensive)
      if (labelIds.length !== labelNames.length) {
        console.error('[LabelPicker] ERROR: Some labels could not be found!', {
          requested: labelNames,
          found: labelIds.length,
          available: freshLabels?.map(l => l.name),
          freshLabels: freshLabels,
        })
      }

      await setLibraryItemLabels(itemId, labelIds)
      onUpdate(labelNames)
    } catch (err) {
      console.error('[LabelPicker] handleSave - Failed to update labels:', err)
      // Revert to original labels on error
      setSelectedLabels(new Set(currentLabels))
    }
  }

  const handleCancel = () => {
    setSelectedLabels(new Set(currentLabels))
    onClose()
  }

  const handleCreateLabel = async () => {
    const trimmedName = searchQuery.trim()
    if (!trimmedName) return

    try {
      await createLabel({ name: trimmedName, color: selectedColor })

      // Add to selected labels immediately
      setSelectedLabels((prev) => {
        const updated = new Set([...prev, trimmedName])
        
        return updated
      })

      // Clear search and refetch labels to ensure the new label is in allLabels
      setSearchQuery('')
      await fetchLabels()
    } catch (err) {
      console.error('Failed to create label:', err)
    }
  }

  // Filter labels based on search query
  const filteredLabels = allLabels?.filter((label) =>
    label.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Check if search query exactly matches an existing label (case-insensitive)
  const exactMatch = allLabels?.some(
    (label) => label.name.toLowerCase() === searchQuery.toLowerCase().trim()
  )

  // Show create option if there's a search query and no exact match
  const showCreateOption = searchQuery.trim() && !exactMatch

  return (
    <div className="label-picker-modal-overlay" onClick={onClose}>
      <div className="label-picker-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="label-picker-modal-header">
          <h2 className="label-picker-modal-title">Labels</h2>
          <button className="label-picker-modal-close" onClick={onClose} aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="label-picker-modal-body">
          {/* Search input */}
          <div className="label-picker-modal-search">
            <svg className="label-picker-modal-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
            <input
              type="text"
              className="label-picker-modal-search-input"
              placeholder="Search or create label..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={updating || creating}
            />
          </div>

          {loadingLabels ? (
            <div className="label-picker-modal-loading">
              Loading labels...
            </div>
          ) : (
            <>
              {/* Create new label option */}
              {showCreateOption && (
                <div className="label-picker-modal-create">
                  <div className="label-picker-modal-create-header">
                    <span className="label-picker-modal-create-text">
                      Create "{searchQuery.trim()}"
                    </span>
                  </div>
                  <div className="label-picker-modal-color-picker">
                    {PRESET_COLORS.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        className={`label-picker-modal-color-btn ${selectedColor === color.value ? 'selected' : ''}`}
                        style={{ backgroundColor: color.value }}
                        onClick={() => setSelectedColor(color.value)}
                        title={color.name}
                        disabled={creating}
                      />
                    ))}
                  </div>
                  <button
                    type="button"
                    className="label-picker-modal-create-btn"
                    onClick={handleCreateLabel}
                    disabled={creating}
                  >
                    {creating ? 'Creating...' : 'Create Label'}
                  </button>
                </div>
              )}

              {/* Label list */}
              {filteredLabels && filteredLabels.length === 0 && !showCreateOption ? (
                <div className="label-picker-modal-empty">
                  {searchQuery ? `No labels match "${searchQuery}"` : 'No labels available.'}
                </div>
              ) : (
                <div className="label-picker-modal-list">
                  {filteredLabels?.map((label: Label) => (
                    <label
                      key={label.id}
                      className="label-picker-modal-item"
                    >
                      <input
                        type="checkbox"
                        className="label-picker-modal-checkbox"
                        checked={selectedLabels.has(label.name)}
                        onChange={() => toggleLabel(label.name)}
                        disabled={updating || creating}
                      />
                      <span
                        className="label-picker-modal-color"
                        style={{ backgroundColor: label.color }}
                      />
                      <span className="label-picker-modal-name">
                        {label.name}
                      </span>
                      {label.internal && (
                        <span className="label-picker-modal-system-badge">System</span>
                      )}
                    </label>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        <div className="label-picker-modal-footer">
          <button
            type="button"
            className="label-picker-modal-btn label-picker-modal-btn-cancel"
            onClick={handleCancel}
            disabled={updating}
          >
            Cancel
          </button>
          <button
            type="button"
            className="label-picker-modal-btn label-picker-modal-btn-save"
            onClick={handleSave}
            disabled={updating || loadingLabels}
          >
            {updating ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default LabelPickerModal
