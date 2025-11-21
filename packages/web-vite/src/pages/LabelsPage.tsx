import '../styles/LabelsPage.css'

import { useEffect, useRef, useState } from 'react'

import {
  type CreateLabelInput,
  type Label,
  type UpdateLabelInput,
  useCreateLabel,
  useDeleteLabel,
  useLabels,
  useUpdateLabel,
} from '../lib/graphql-client'

export function LabelsPage() {
  const { data: labels, loading, error, fetchLabels } = useLabels()
  const { createLabel, loading: creating } = useCreateLabel()
  const { updateLabel, loading: updating } = useUpdateLabel()
  const { deleteLabel, loading: deleting } = useDeleteLabel()

  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingLabel, setEditingLabel] = useState<Label | null>(null)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [menuDirection, setMenuDirection] = useState<'up' | 'down'>('down')
  const [formData, setFormData] = useState<CreateLabelInput>({
    name: '',
    color: '#6366f1',
    description: '',
  })
  const [notification, setNotification] = useState<{
    message: string
    type: 'success' | 'error'
  } | null>(null)

  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchLabels()
  }, [fetchLabels])

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null)
      }
    }
    if (openMenuId) {
      document.addEventListener('mousedown', handleClickOutside)
      
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [openMenuId])

  const showToast = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 3000)
  }

  // Filter labels by search query
  const filteredLabels = labels?.filter(label =>
    label.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    label.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleCreateLabel = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createLabel(formData)
      showToast('Label created successfully', 'success')
      setShowCreateModal(false)
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
    setShowCreateModal(false)
    setFormData({ name: '', color: '#6366f1', description: '' })
  }

  const toggleMenu = (labelId: string, event: React.MouseEvent) => {
    // Determine if menu should open upward (if near bottom of viewport)
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
    const spaceBelow = window.innerHeight - rect.bottom
    const menuHeight = 200 // Approximate menu height with padding

    // If there's not enough space below, open upward
    const direction = spaceBelow < menuHeight ? 'up' : 'down'
    setMenuDirection(direction)
    setOpenMenuId(openMenuId === labelId ? null : labelId)
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
      {/* Toast notification */}
      {notification && (
        <div className={`toast toast-${notification.type}`}>
          {notification.message}
        </div>
      )}

      {/* Header with search and create button */}
      <div className="labels-header">
        <h1 className="labels-title">Labels</h1>
        <div className="labels-header-actions">
          <div className="search-box">
            <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
            <input
              type="text"
              placeholder="Search labels..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
          <button
            className="btn-primary"
            onClick={() => setShowCreateModal(true)}
          >
            + New Label
          </button>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || editingLabel) && (
        <div className="modal-overlay" onClick={cancelEdit}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingLabel ? 'Edit Label' : 'Create New Label'}</h2>
              <button className="modal-close" onClick={cancelEdit}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <form onSubmit={editingLabel ? handleUpdateLabel : handleCreateLabel}>
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  maxLength={100}
                  disabled={creating || updating}
                  placeholder="e.g., Reading, Tech, Design"
                />
              </div>

              <div className="form-group">
                <label htmlFor="color">Color</label>
                <input
                  type="color"
                  id="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  disabled={creating || updating}
                  className="color-picker"
                  title={formData.color}
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description (optional)</label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  maxLength={500}
                  rows={3}
                  disabled={creating || updating}
                  placeholder="Add a description for this label..."
                />
              </div>

              <div className="modal-actions">
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
                  {creating || updating ? 'Saving...' : editingLabel ? 'Update Label' : 'Create Label'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Labels Table */}
      {!labels || labels.length === 0 ? (
        <div className="labels-empty">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
            <line x1="7" y1="7" x2="7.01" y2="7"></line>
          </svg>
          <h3>No labels yet</h3>
          <p>Create your first label to organize your articles</p>
          <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
            + Create Label
          </button>
        </div>
      ) : (
        <div className="labels-table-wrapper">
          <table className="labels-table">
            <thead>
              <tr>
                <th className="th-name">Name</th>
                <th className="th-description">Description</th>
                <th className="th-created">Created</th>
                <th className="th-actions"></th>
              </tr>
            </thead>
            <tbody>
              {filteredLabels?.map((label) => (
                <tr key={label.id} className="label-row">
                  <td className="td-name">
                    <div className="label-name-cell">
                      <span
                        className="label-color-dot"
                        style={{ backgroundColor: label.color }}
                      />
                      <span className="label-name">{label.name}</span>
                      {label.internal && (
                        <span className="label-system-badge">System</span>
                      )}
                    </div>
                  </td>
                  <td className="td-description">
                    <span className="label-description-text">
                      {label.description || 'No description'}
                    </span>
                  </td>
                  <td className="td-created">
                    <span className="label-created-text">
                      {new Date(label.createdAt || Date.now()).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </td>
                  <td className="td-actions">
                    {!label.internal && (
                      <div className="label-actions-cell">
                        <button
                          className="label-menu-button"
                          onClick={(e) => toggleMenu(label.id, e)}
                          aria-label="Label actions"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="1"></circle>
                            <circle cx="12" cy="5" r="1"></circle>
                            <circle cx="12" cy="19" r="1"></circle>
                          </svg>
                        </button>

                        {/* Dropdown menu */}
                        {openMenuId === label.id && (
                          <div
                            ref={menuRef}
                            className={`label-menu-dropdown ${menuDirection === 'up' ? 'label-menu-dropdown-up' : ''}`}
                          >
                            <button
                              className="label-menu-item"
                              onClick={() => {
                                startEdit(label)
                                setOpenMenuId(null)
                              }}
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                              </svg>
                              Edit
                            </button>
                            <div className="label-menu-divider"></div>
                            <button
                              className="label-menu-item label-menu-item-danger"
                              onClick={() => {
                                handleDeleteLabel(label)
                                setOpenMenuId(null)
                              }}
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                              </svg>
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default LabelsPage
