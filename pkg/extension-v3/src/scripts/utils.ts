export const getStorageItem = async (singleKey: string) => {
  return new Promise((resolve) => {
    chrome.storage.local.get(singleKey, (result) => {
      const finalResult = (result && result[singleKey]) || null
      resolve(finalResult)
    })
  })
}

// const setStorage(itemsToSet) {
//   return new Promise((resolve) => {
//     browserApi.storage.local.set(itemsToSet, resolve)
//   })
// }

// function removeStorage(itemsToRemove) {
//   return new Promise((resolve) => {
//     browserApi.storage.local.remove(itemsToRemove, resolve)
//   })
// }
