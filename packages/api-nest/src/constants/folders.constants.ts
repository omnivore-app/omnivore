/**
 * Folder constants for library items
 * Use these constants instead of magic strings to ensure type safety and consistency
 */

export const FOLDERS = {
  INBOX: 'inbox',
  ARCHIVE: 'archive',
  TRASH: 'trash',
  ALL: 'all', // Virtual folder for viewing all items
} as const

// Type-safe folder name from const assertion
export type FolderName = (typeof FOLDERS)[keyof typeof FOLDERS]

// Array of valid folder names (excluding 'all' which is a virtual folder)
export const VALID_FOLDERS = [
  FOLDERS.INBOX,
  FOLDERS.ARCHIVE,
  FOLDERS.TRASH,
] as const

// Array of all folder names including virtual folders
export const ALL_FOLDERS = [
  FOLDERS.INBOX,
  FOLDERS.ARCHIVE,
  FOLDERS.TRASH,
  FOLDERS.ALL,
] as const

// Helper function to check if a string is a valid folder
export function isValidFolder(folder: string): folder is FolderName {
  return ALL_FOLDERS.includes(folder as FolderName)
}

// Helper function to check if a string is a valid physical folder (not virtual)
export function isPhysicalFolder(
  folder: string,
): folder is (typeof VALID_FOLDERS)[number] {
  return VALID_FOLDERS.includes(folder as (typeof VALID_FOLDERS)[number])
}
