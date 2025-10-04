import { useEffect, useState } from 'react'
import {
  useLabels,
  useCreateLabel,
  useUpdateLabel,
  useDeleteLabel,
  type Label,
  type CreateLabelInput,
  type UpdateLabelInput,
} from '../lib/graphql-client'
import '../styles/LabelsPage.css'

export function LabelsPage() {
  const { data: labels, loading, error, fetchLabels } = useLabels()
  const { createLabel, loading: creating } = useCreateLabel()
  const { updateLabel, loading: updating } = useUpdateLabel()
  const { deleteLabel, loading: deleting } = useDeleteLabel()

  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingLabel, setEditingLabel] = useState<Label | null>(null)
  const [formData, setFormData] = useState<CreateLabelInput>({
    name: '',
    color: '#6366f1',
    description: '',
  })
  const [notification, setNotification] = useState<{
    message: string
    type: 'success' | 'error'
  } | null>(null)

  useEffect(() => {
    fetchLabels()
  }, [fetchLabels])

  const showToast = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 3000)
  }

  const handleCreateLabel = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createLabel(formData)
      showToast('Label created successfully', 'success')
      setShowCreateForm(false)
      setFormData({ name: '', color: '#6366f1', description: '' })
      fetchLabels()
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Failed to create label',
        'error'
      )
    }
  }

  const handleUpdateLabel = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingLabel) return

    try {
      const input: UpdateLabelInput = {
        name: formData.name,
        color: formData.color,
        description: formData.description,
      }
      await updateLabel(editingLabel.id, input)
      showToast('Label updated successfully', 'success')
      setEditingLabel(null)
      setFormData({ name: '', color: '#6366f1', description: '' })
      fetchLabels()
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Failed to update label',
        'error'
      )
    }
  }

  const handleDeleteLabel = async (label: Label) => {
    if (label.internal) {
      showToast('Cannot delete system labels', 'error')
      return
    }

    if (!confirm(`Are you sure you want to delete "${label.name}"?`)) {
      return
    }

    try {
      await deleteLabel(label.id)
      showToast('Label deleted successfully', 'success')
      fetchLabels()
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Failed to delete label',
        'error'
      )
    }
  }

  const startEdit = (label: Label) => {
    if (label.internal) {
      showToast('Cannot edit system labels', 'error')
      return
    }
    setEditingLabel(label)
    setFormData({
      name: label.name,
      color: label.color,
      description: label.description || '',
    })
  }

  const cancelEdit = () => {
    setEditingLabel(null)
    setShowCreateForm(false)
    setFormData({ name: '', color: '#6366f1', description: '' })
  }

  if (loading && !labels) {
    return (
      <div className="labels-page">
        <div className="labels-loading">Loading labels...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="labels-page">
        <div className="labels-error">Error loading labels: {error.message}</div>
      </div>
    )
  }

  return (
    <div className="labels-page">
      <div className="labels-header">
        <h1>Labels</h1>
        <button
          className="btn-primary"
          onClick={() => setShowCreateForm(true)}
          disabled={showCreateForm || !!editingLabel}
        >
          + Create Label
        </button>
      </div>

      {notification && (
        <div className={`notification notification-${notification.type}`}>
          {notification.message}
        </div>
      )}

      {(showCreateForm || editingLabel) && (
        <div className="label-form-card">
          <h2>{editingLabel ? 'Edit Label' : 'Create New Label'}</h2>
          <form
            onSubmit={editingLabel ? handleUpdateLabel : handleCreateLabel}
          >
            <div className="form-group">
              <label htmlFor="name">Name *</label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                maxLength={100}
                disabled={creating || updating}
              />
            </div>

            <div className="form-group">
              <label htmlFor="color">Color *</label>
              <div className="color-input-group">
                <input
                  type="color"
                  id="color"
                  value={formData.color}
                  onChange={(e) =>
                    setFormData({ ...formData, color: e.target.value })
                  }
                  disabled={creating || updating}
                />
                <input
                  type="text"
                  value={formData.color}
                  onChange={(e) =>
                    setFormData({ ...formData, color: e.target.value })
                  }
                  pattern="^#[0-9A-Fa-f]{6}$"
                  placeholder="#6366f1"
                  disabled={creating || updating}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                maxLength={500}
                rows={3}
                disabled={creating || updating}
              />
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={cancelEdit}
                disabled={creating || updating}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={creating || updating}
              >
                {creating || updating ? 'Saving...' : editingLabel ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="labels-list">
        {labels && labels.length === 0 ? (
          <div className="labels-empty">
            <p>No labels yet. Create your first label to get started!</p>
          </div>
        ) : (
          <div className="labels-grid">
            {labels?.map((label) => (
              <div key={label.id} className="label-card">
                <div className="label-card-header">
                  <div className="label-name-group">
                    <span
                      className="label-color-dot"
                      style={{ backgroundColor: label.color }}
                    />
                    <span className="label-name">{label.name}</span>
                    {label.internal && (
                      <span className="label-badge">System</span>
                    )}
                  </div>
                  {!label.internal && (
                    <div className="label-actions">
                      <button
                        className="btn-icon"
                        onClick={() => startEdit(label)}
                        title="Edit label"
                        disabled={deleting}
                      >
                        ✏️
                      </button>
                      <button
                        className="btn-icon btn-danger"
                        onClick={() => handleDeleteLabel(label)}
                        title="Delete label"
                        disabled={deleting}
                      >
                        🗑️
                      </button>
                    </div>
                  )}
                </div>
                {label.description && (
                  <p className="label-description">{label.description}</p>
                )}
                <div className="label-meta">
                  <span className="label-color-code">{label.color}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default LabelsPage
