/**
 * FlairBadge - System label indicator (icon-only)
 *
 * Flair badges are system-managed labels that appear in the metadata row
 * of library cards. They use icons to indicate the item's source or type
 * (e.g., Newsletter 📧, RSS 📰, Subscription 🔔).
 *
 * Per ARC-009B Design System:
 * - Icon-only display (no text)
 * - Small, subtle design
 * - Displayed in metadata row alongside site name/reading time
 * - Distinguished from user tags (which show text + color)
 */

import '../styles/FlairBadge.css'

import React from 'react'

import type { Label } from '../types/api'

interface FlairBadgeProps {
  label: Label
}

// Map common system label names to emoji icons
const FLAIR_ICONS: Record<string, string> = {
  'Newsletter': '📧',
  'RSS': '📰',
  'Subscription': '🔔',
  'Feed': '📡',
  'Email': '✉️',
  'Import': '📥',
  'Saved': '⭐',
  'Archived': '📦',
  'Shared': '🔗',
}

const FlairBadge: React.FC<FlairBadgeProps> = ({ label }) => {
  // Get icon from mapping or use first character of label name
  const icon = FLAIR_ICONS[label.name] || label.name.charAt(0).toUpperCase()

  return (
    <span
      className="flair-badge"
      title={label.description || label.name}
      aria-label={`System label: ${label.name}`}
    >
      {icon}
    </span>
  )
}

export default FlairBadge
