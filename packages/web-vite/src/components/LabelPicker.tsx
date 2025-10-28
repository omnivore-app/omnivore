import { useState, useEffect, useRef } from 'react'
import { useLabels, useSetLibraryItemLabels, type Label } from '../lib/graphql-client'
import '../styles/LabelPicker.css'

interface LabelPickerProps {
  itemId: string
  currentLabels: string[]
  onUpdate?: (labels: string[]) => void
}

export function LabelPicker({ itemId, currentLabels, onUpdate }: LabelPickerProps) {
  const { data: allLabels, loading: loadingLabels, fetchLabels } = useLabels()
  const { setLibraryItemLabels, loading: updating } = useSetLibraryItemLabels()
  const [isOpen, setIsOpen] = useState(false)
  const [selectedLabels, setSelectedLabels] = useState<Set<string>>(new Set(currentLabels))
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen && !allLabels) {
      fetchLabels()
    }
  }, [isOpen, allLabels, fetchLabels])

  useEffect(() => {
    setSelectedLabels(new Set(currentLabels))
  }, [currentLabels])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

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

      // Convert label names to label IDs
      const labelIds = allLabels
        ?.filter((label) => labelNames.includes(label.name))
        .map((label) => label.id) || []

      await setLibraryItemLabels(itemId, labelIds)

      if (onUpdate) {
        onUpdate(labelNames)
      }

      setIsOpen(false)
    } catch (err) {
      console.error('Failed to update labels:', err)
      // Revert to original labels on error
      setSelectedLabels(new Set(currentLabels))
    }
  }

  const handleCancel = () => {
    setSelectedLabels(new Set(currentLabels))
    setIsOpen(false)
  }

  return (
    <div className="label-picker" ref={dropdownRef}>
      <button
        className="label-picker-trigger"
        onClick={() => setIsOpen(!isOpen)}
        disabled={updating}
      >
        🏷️
      </button>

      {isOpen && (
        <div className="label-picker-dropdown">
          <div className="label-picker-header">
            <h4>Select Labels</h4>
          </div>

          {loadingLabels ? (
            <div className="label-picker-loading">Loading labels...</div>
          ) : allLabels && allLabels.length === 0 ? (
            <div className="label-picker-empty">
              No labels available. Create labels from the Labels page.
            </div>
          ) : (
            <div className="label-picker-list">
              {allLabels?.map((label: Label) => (
                <label key={label.id} className="label-picker-item">
                  <input
                    type="checkbox"
                    checked={selectedLabels.has(label.name)}
                    onChange={() => toggleLabel(label.name)}
                    disabled={updating}
                  />
                  <span
                    className="label-color-indicator"
                    style={{ backgroundColor: label.color }}
                  />
                  <span className="label-name">{label.name}</span>
                  {label.internal && (
                    <span className="label-system-badge">System</span>
                  )}
                </label>
              ))}
            </div>
          )}

          <div className="label-picker-footer">
            <button
              className="label-picker-btn label-picker-btn-cancel"
              onClick={handleCancel}
              disabled={updating}
            >
              Cancel
            </button>
            <button
              className="label-picker-btn label-picker-btn-save"
              onClick={handleSave}
              disabled={updating || loadingLabels}
            >
              {updating ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default LabelPicker
