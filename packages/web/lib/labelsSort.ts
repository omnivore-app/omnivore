import { Label } from './networking/fragments/labelFragment'

export const sortedLabels = (labels: Label[] | undefined): Label[] => {
  if (!labels) {
    return []
  }

  const colors = new Map<string, Label[]>()
  for (const label of labels) {
    const list = colors.get(label.color) ?? []
    list.push(label)
    colors.set(
      label.color,
      list.sort((a, b) => a.name.localeCompare(b.name))
    )
  }

  const sortedColors = Array.from(colors.keys()).sort((a, b) => {
    // Sort by the first element's name
    const aname = colors.get(a)?.find(() => true)?.name ?? a
    const bname = colors.get(b)?.find(() => true)?.name ?? b
    return aname.localeCompare(bname)
  })

  const result: Label[] = []
  for (const key of sortedColors) {
    const items = colors.get(key)
    if (!items) {
      continue
    }
    const sorted = items.sort((a, b) => a.name.localeCompare(b.name))
    result.push(...sorted)
  }

  return result
}
