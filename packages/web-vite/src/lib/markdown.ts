// Lightweight markdown renderer
// Supports basic markdown without external dependencies

/**
 * Groups contiguous <li> elements into separate <ul> blocks
 * Handles whitespace and newlines between items correctly
 * Uses stateful parsing to avoid greedy regex
 */
function groupListItems(html: string): string {
  if (!html.includes('<li>')) {
    return html
  }

  const result: string[] = []
  let currentListItems: string[] = []
  let i = 0

  while (i < html.length) {
    // Find the next <li> tag
    const liStart = html.indexOf('<li>', i)

    if (liStart === -1) {
      // No more list items, add remaining content and close any open list
      if (currentListItems.length > 0) {
        result.push(`<ul>${currentListItems.join('\n')}</ul>`)
        currentListItems = []
      }
      // Add remaining content
      if (i < html.length) {
        const remaining = html.substring(i)
        if (remaining.trim()) {
          result.push(remaining)
        }
      }
      break
    }

    // Add content before this <li> tag
    const beforeLi = html.substring(i, liStart)
    if (beforeLi.trim()) {
      // If we have accumulated list items, close that list first
      if (currentListItems.length > 0) {
        result.push(`<ul>${currentListItems.join('\n')}</ul>`)
        currentListItems = []
      }
      result.push(beforeLi)
    } else if (beforeLi && currentListItems.length === 0) {
      // Pure whitespace before first item - preserve it if no list is open
      result.push(beforeLi)
    }

    // Find the matching </li> tag
    const liEnd = html.indexOf('</li>', liStart)
    if (liEnd === -1) {
      // Malformed HTML - no closing tag, skip this <li>
      i = liStart + 4
      continue
    }

    // Extract the list item (including tags)
    const listItem = html.substring(liStart, liEnd + 5)
    currentListItems.push(listItem.trim())

    i = liEnd + 5 // Move past </li>
  }

  // Close any remaining list items
  if (currentListItems.length > 0) {
    result.push(`<ul>${currentListItems.join('\n')}</ul>`)
  }

  return result.join('')
}

export function renderMarkdown(markdown: string): string {
  if (!markdown) return ''

  let html = markdown

  // Escape HTML to prevent XSS
  html = html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

  // Headers (must come before other rules)
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>')
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>')
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>')

  // Bold
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/__(.+?)__/g, '<strong>$1</strong>')

  // Italic
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>')
  html = html.replace(/_(.+?)_/g, '<em>$1</em>')

  // Strikethrough
  html = html.replace(/~~(.+?)~~/g, '<del>$1</del>')

  // Code blocks (must come before inline code)
  html = html.replace(
    /```(\w*)\n([\s\S]*?)```/g,
    '<pre><code class="language-$1">$2</code></pre>',
  )

  // Inline code
  html = html.replace(/`(.+?)`/g, '<code>$1</code>')

  // Links
  html = html.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>',
  )

  // Images
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />')

  // Blockquotes
  html = html.replace(/^&gt; (.*$)/gim, '<blockquote>$1</blockquote>')

  // Horizontal rules
  html = html.replace(/^---$/gim, '<hr />')
  html = html.replace(/^\*\*\*$/gim, '<hr />')

  // Unordered lists
  html = html.replace(/^\* (.*$)/gim, '<li>$1</li>')
  html = html.replace(/^- (.*$)/gim, '<li>$1</li>')

  // Ordered lists
  html = html.replace(/^\d+\. (.*$)/gim, '<li>$1</li>')

  // Group contiguous <li> elements into separate <ul> blocks
  html = groupListItems(html)

  // Wrap entire content in <p> if it doesn't already start with a tag
  // This ensures paragraphs are properly enclosed before splitting
  if (!html.trim().startsWith('<')) {
    html = `<p>${html}</p>`
  }

  // Replace double newlines with closing and opening paragraph tags
  // This splits content into separate paragraphs while maintaining proper nesting
  html = html.replace(/\n\n/g, '</p><p>')

  // Replace single newlines with line breaks
  html = html.replace(/\n/g, '<br />')

  return html
}
