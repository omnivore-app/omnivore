export const getStorageItem = async (singleKey: string) => {
  return new Promise((resolve) => {
    chrome.storage.local.get(singleKey, (result) => {
      const finalResult = (result && result[singleKey]) || null
      resolve(finalResult)
    })
  })
}

export const setStorage = (itemsToSet: Record<string, string>) => {
  return chrome.storage.local.set(itemsToSet)
}

// function removeStorage(itemsToRemove) {
//   return new Promise((resolve) => {
//     browserApi.storage.local.remove(itemsToRemove, resolve)
//   })
// }
