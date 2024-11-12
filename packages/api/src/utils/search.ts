import { LiqeQuery, parse } from '@omnivore/liqe'

export const parseSearchQuery = (query: string): LiqeQuery => {
  let searchQuery = query
    .replace(/\W\s":/g, '')
    .replace('in:subscription', 'has:subscriptions') // compatibility with old search
    .replace('in:library', 'no:subscription') // compatibility with old search
    // wrap the value behind colon in quotes if it's not already
    .replace(/(\w+):("([^"]+)"|([^")\s]+))/g, '$1:"$3$4"')
    // remove any quotes that are in the array value for example: label:"test","test2" -> label:"test,test2"
    .replace(/","/g, ',')

  // if the query contains includes:, we want to search in all folders
  if (searchQuery.includes('includes:')) {
    searchQuery = `(${searchQuery}) in:all`
  }

  // by default we want to search in the inbox if no in: is specified
  if (!searchQuery.includes('in:')) {
    searchQuery = `in:inbox (${searchQuery})`
  }

  return parse(searchQuery)
}
