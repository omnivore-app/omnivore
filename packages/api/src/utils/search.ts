import { LiqeQuery, parse } from 'liqe'

export const parseSearchQuery = (query: string): LiqeQuery => {
  const searchQuery = query
    .replace(/\W\s":/g, '')
    .replace('in:subscription', 'has:subscriptions') // compatibility with old search
    .replace('in:library', 'no:subscription') // compatibility with old search
    // wrap the value behind colon in quotes if it's not already
    .replace(/(\w+):("([^"]+)"|([^")\s]+))/g, '$1:"$3$4"')
    // remove any quotes that are in the array value for example: label:"test","test2" -> label:"test,test2"
    .replace(/","/g, ',')

  return parse(searchQuery)
}
