import { Label } from '../../../lib/networking/fragments/labelFragment'

export type LabelOptionProps = {
  color: string
  isDropdownOption?: boolean
  isCreateMode: boolean | undefined
  labelId: string
}

export type ColorDetailsProps = {
  colorName: string
  color: string
  icon: JSX.Element
}

export type LabelColorObject = {
  colorName: string
  text: string
  border: string
  background: string
}

export type LabelColorObjects = {
  [key: string]: LabelColorObject
}

export type GenericTableCardProps = {
  label: Label | null
  editingLabelId: string | null
  labelColorHex: string
  isCreateMode: boolean
  nameInputText: string
  descriptionInputText: string
  isMobileView?: boolean
  handleGenerateRandomColor: (rowId?: string) => void
  setEditingLabelId: (id: string | null) => void
  setLabelColorHex: (color: string) => void
  deleteLabel: (id: string) => void
  setNameInputText: (text: string) => void
  setDescriptionInputText: (text: string) => void
  resetState: () => void
  createLabel: () => void
  updateLabel: (id: string) => void
  setIsCreateMode: (isCreateMode: boolean) => void
  onEditPress: (label: Label | null) => void
}

export type LabelColorDropdownProps = {
  isCreateMode: boolean
  canEdit: boolean
  labelId: string
  labelColor: string
  setLabelColor: (color: string) => void
}
