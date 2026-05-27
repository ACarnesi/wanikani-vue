import { openDB } from 'idb';

const CURRENT_DB_VERSION = 3;
const DB_STORES = {
    'subjects': {
        keyOptions: { keyPath: 'id' },
        indexes: [{ name: 'level', keyPath: 'data.level' }]
    },
    'assignments': {
        keyOptions: { keyPath: 'id' },
        indexes: [
            { name: 'available-at', keyPath: 'data.availableAt' },
            { name: 'subject-id', keyPath: 'data.subjectId' }
        ]
    },
    'user': {
        keyOptions: {},
        indexes: []
    }
}

export async function initializeDB(dbName: string)
{
    let database = await openDB<WaniKani.WaniKaniDBSchema>(dbName, CURRENT_DB_VERSION, {
        upgrade(db, oldVersion, newVersion, transaction, event)
        {
            for (const [storeName, storeDetails] of Object.entries(DB_STORES))
            {
                //Create missing stores
                if (!db.objectStoreNames.contains(storeName))
                {
                    db.createObjectStore(storeName, storeDetails.keyOptions);
                }

                //Create missing indexes
                if (storeDetails.indexes.length > 0)
                {
                    let objectStore = transaction.objectStore(storeName);

                    for (const index of storeDetails.indexes)
                    {
                        if (!objectStore.indexNames.contains(index.name))
                        {
                            objectStore.createIndex(index.name, index.keyPath);
                        }
                    }
                }
            };
        },
        blocked(currentVersion, blockedVersion, event)
        {
            alert("An older version of the application is opened in another tab which must be closed before continuing. Please close any other tabs and refresh the page.");
        },
        blocking(currentVersion, blockedVersion, event)
        {
            alert("Database is outdated, please reload the page.");
        }
    });

    return database;
}

export async function deleteIndexedDb(dbName: string)
{
    await indexedDB.deleteDatabase(dbName);
}