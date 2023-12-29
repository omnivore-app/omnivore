import { convertWiredArticles } from './wired'
import { convertVoxArticle } from './vox'
import { convertArsTechnicasArticles } from './arstechnica'
import { convertSlateArticles } from './slate'

export = {
  wired: convertWiredArticles,
  vox: convertVoxArticle,
  arstechnica: convertArsTechnicasArticles,
  slate: convertSlateArticles,
}
