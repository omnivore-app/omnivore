/**
 * CardSkeleton - Loading placeholder for LibraryItemCard
 *
 * Shows a shimmer/skeleton state when content is being processed.
 * Per ARC-009B Design System, this indicates the item is in "PROCESSING" state
 * and content extraction is in progress.
 *
 * Features:
 * - Shimmer animation for visual feedback
 * - Matches LibraryCard dimensions
 * - Respects density modes
 */

import React from 'react'
import type { CardDensity } from './LibraryItemCard'
import '../styles/CardSkeleton.css'

interface CardSkeletonProps {
  density?: CardDensity
}

const CardSkeleton: React.FC<CardSkeletonProps> = ({ density = 'comfortable' }) => {
  const showThumbnail = density !== 'compact'

  return (
    <div className={`card-skeleton density-${density}`} aria-label="Loading content">
      {/* Thumbnail skeleton */}
      {showThumbnail && (
        <div className="skeleton-thumbnail">
          <div className="skeleton-shimmer"></div>
        </div>
      )}

      {/* Metadata bar skeleton */}
      <div className="skeleton-metadata">
        <div className="skeleton-icon"></div>
        <div className="skeleton-text skeleton-text-sm" style={{ width: '120px' }}></div>
        <div className="skeleton-spacer"></div>
        <div className="skeleton-text skeleton-text-sm" style={{ width: '60px' }}></div>
      </div>

      {/* Title skeleton */}
      <div className="skeleton-title">
        <div className="skeleton-text skeleton-text-lg" style={{ width: '90%' }}></div>
        {density !== 'compact' && (
          <div className="skeleton-text skeleton-text-lg" style={{ width: '70%' }}></div>
        )}
        {density === 'spacious' && (
          <div className="skeleton-text skeleton-text-lg" style={{ width: '50%' }}></div>
        )}
      </div>

      {/* Tags skeleton */}
      <div className="skeleton-tags">
        <div className="skeleton-tag" style={{ width: '80px' }}></div>
        <div className="skeleton-tag" style={{ width: '100px' }}></div>
        <div className="skeleton-tag" style={{ width: '60px' }}></div>
      </div>

      {/* Footer skeleton */}
      <div className="skeleton-footer">
        <div className="skeleton-text skeleton-text-sm" style={{ width: '100px' }}></div>
      </div>
    </div>
  )
}

export default CardSkeleton
