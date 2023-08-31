import { In } from 'typeorm'
import { entityManager } from '.'
import { Label } from '../entity/label'
import { generateRandomColor } from '../utils/helpers'

const INTERNAL_LABELS_WITH_COLOR = new Map<
  string,
  { name: string; color: string }
>([
  ['favorites', { name: 'Favorites', color: '#FFD700' }],
  ['library', { name: 'Library', color: '#584C42' }],
  ['rss', { name: 'RSS', color: '#F26522' }],
  ['newsletter', { name: 'Newsletter', color: '#07D2D1' }],
])

export const getInternalLabelWithColor = (name: string) => {
  return INTERNAL_LABELS_WITH_COLOR.get(name.toLowerCase())
}

const isLabelInternal = (name: string): boolean => {
  return INTERNAL_LABELS_WITH_COLOR.has(name.toLowerCase())
}

const toPartialLabel = (
  label: {
    name: string
    color?: string | null
    description?: string | null
  },
  userId: string
) => {
  return {
    user: { id: userId },
    name: label.name,
    color: label.color || generateRandomColor(), // assign a random color if not provided
    description: label.description,
    internal: isLabelInternal(label.name),
  }
}

export const labelRepository = entityManager.getRepository(Label).extend({
  findById(id: string) {
    return this.findOneBy({ id })
  },

  findByName(name: string) {
    return this.createQueryBuilder()
      .where('LOWER(name) = LOWER(:name)', { name }) // case insensitive
      .getOne()
  },

  findByNames(names: string[]) {
    return this.createQueryBuilder()
      .where('LOWER(name) IN (:...names)', {
        names: names.map((n) => n.toLowerCase()),
      })
      .getMany()
  },

  findByIds(labelIds: string[]) {
    return this.find({
      where: { id: In(labelIds) },
      select: ['id', 'name', 'color', 'description', 'createdAt'],
    })
  },

  createLabel(
    label: {
      name: string
      color?: string | null
      description?: string | null
    },
    userId: string
  ) {
    return this.save(toPartialLabel(label, userId))
  },

  createLabels(
    labels: {
      name: string
      color?: string | null
      description?: string | null
    }[],
    userId: string
  ) {
    return this.save(labels.map((l) => toPartialLabel(l, userId)))
  },
})
