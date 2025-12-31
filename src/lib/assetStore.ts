const DB_NAME = 'board_assets'
const STORE_NAME = 'assets'
const DB_VERSION = 1

export const saveAsset = async (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION)

        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME)
            }
        }

        request.onsuccess = (event) => {
            const db = (event.target as IDBOpenDBRequest).result
            const transaction = db.transaction(STORE_NAME, 'readwrite')
            const store = transaction.objectStore(STORE_NAME)
            const id = `asset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
            const putRequest = store.put(blob, id)

            putRequest.onsuccess = () => resolve(`assetId:${id}`)
            putRequest.onerror = () => reject(putRequest.error)
        }

        request.onerror = () => reject(request.error)
    })
}

export const getAsset = async (id: string): Promise<Blob | null> => {
    if (!id.startsWith('assetId:')) return null
    const assetId = id.replace('assetId:', '')

    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION)

        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME)
            }
        }

        request.onsuccess = (event) => {
            const db = (event.target as IDBOpenDBRequest).result
            const transaction = db.transaction(STORE_NAME, 'readonly')
            const store = transaction.objectStore(STORE_NAME)
            const getRequest = store.get(assetId)

            getRequest.onsuccess = () => resolve(getRequest.result || null)
            getRequest.onerror = () => reject(getRequest.error)
        }

        request.onerror = () => reject(request.error)
    })
}