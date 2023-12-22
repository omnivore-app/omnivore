import { In } from 'typeorm'
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity'
import { appDataSource } from '../data_source'
import { Label } from '../entity/label'
import { generateRandomColor } from '../utils/helpers'

export interface CreateLabelInput {
  name: string
  color?: string | null
  description?: string | null
}

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

const convertToLabel = (label: CreateLabelInput, userId: string) => {
  return {
    user: { id: userId },
    name: label.name,
    color:
      label.color ||
      getInternalLabelWithColor(label.name)?.color ||
      generateRandomColor(), // assign a random color if not provided
    description: label.description,
    internal: isLabelInternal(label.name),
  }
}

export const labelRepository = appDataSource.getRepository(Label).extend({
  findById(id: string) {
    return this.findOneBy({ id })
  },

  findByName(name: string) {
    return this.createQueryBuilder()
      .where('LOWER(name) = LOWER(:name)', { name }) // case insensitive
      .getOne()
  },

  findByNames(names: string[], userId: string) {
    return this.createQueryBuilder()
      .where('LOWER(name) IN (:...names)', {
        names: names.map((n) => n.toLowerCase()),
      })
      .andWhere('user_id = :userId', { userId })
      .getMany()
  },

  findLabelsById(labelIds: string[]) {
    return this.find({
      where: { id: In(labelIds) },
      select: ['id', 'name', 'color', 'description', 'createdAt'],
    })
  },

  createLabel(label: CreateLabelInput, userId: string) {
    return this.save(convertToLabel(label, userId))
  },

  createLabels(labels: CreateLabelInput[], userId: string) {
    return this.query(
      `
      INSERT INTO omnivore.labels (user_id, name, color, description, internal)
      SELECT $1, $2, $3, $4, $5
      WHERE NOT EXISTS (
        SELECT 1 FROM omnivore.labels WHERE LOWER(name) = LOWER($2) AND user_id = $1
      )
      RETURNING id, name, color, description, created_at
    `,
      labels.map((l) => Object.values(convertToLabel(l, userId)))
    ) as Promise<Label[]>
  },

  deleteById(id: string) {
    return this.delete({ id, internal: false })
  },

  updateLabel(id: string, label: QueryDeepPartialEntity<Label>) {
    // internal labels should not be updated
    return this.update({ id, internal: false }, label)
  },
})
