import { convertWiredArticles } from './wired'
import { convertAtlanticArticles } from './atlantic'
import { convertArsTechnicasArticles } from './arstechnica'

export = {
  wired: convertWiredArticles,
  atlantic: convertAtlanticArticles,
  arstechnica: convertArsTechnicasArticles,
}
