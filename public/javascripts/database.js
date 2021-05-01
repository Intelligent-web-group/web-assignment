////////////////// DATABASE //////////////////
// the database receives from the server the following structure
import * as idb from './idb/index.js';

let db;
const MESSAGE_DB_NAME = 'db_message'
const MESSAGE_STORE_NAME= 'store_message';

/**
 * it inits the database
 */
async function initDatabase() {
    if (!db) {
        db = await idb.openDB(MESSAGE_DB_NAME, 2, {
            upgrade(upgradeDb, oldVersion, newVersion) {
                if (!upgradeDb.objectStoreNames.contains(MESSAGE_STORE_NAME)) {
                    let messageDB = upgradeDb.createObjectStore(MESSAGE_STORE_NAME, {
                        keyPath: 'id',
                        autoIncrement: true
                    });
                    messageDB.createIndex('roomNo', 'roomNo', {unique: false, multiEntry: true});
                }
            }
        });
        console.log('db created');
    }

    window.initDatabase = initDatabase;
}

async function storeCachedData(messageObject) {
    console.log('inserting: '+JSON.stringify(messageObject));
    if (!db)
        await initDatabase();
    if (db) {
        try{
            let tx = await db.transaction(MESSAGE_STORE_NAME, 'readwrite');
            let store = await tx.objectStore(MESSAGE_STORE_NAME);
            await store.put(messageObject);
            await  tx.complete;
            console.log('added item to the store! '+ JSON.stringify(messageObject));
        } catch(error) {
            console.log('error: I could not store the element. Reason: '+error);
        };
    }
    else localStorage.setItem(messageObject.roomNo, JSON.stringify(messageObject));
}
window.storeCachedData= storeCachedData;

async function getCachedData(roomNo) {
    if (!db)
        await initDatabase();
    if (db) {
        try {
            console.log('fetching: ' + roomNo);
            let tx = await db.transaction(MESSAGE_STORE_NAME, 'readonly');
            let store = await tx.objectStore(MESSAGE_STORE_NAME);
            let index = await store.index('roomNo');
            let readingsList = await index.getAll(IDBKeyRange.only(roomNo));
            await tx.complete;
            let finalResults=[];
            if (readingsList && readingsList.length > 0) {
                for (let elem of readingsList)
                    finalResults.push(elem);
                console.log(finalResults);
                return finalResults;
            } else {
                const value = localStorage.getItem(roomNo);
                if (value == null)
                    return finalResults;
                else finalResults.push(value);
                console.log(finalResults);
                return finalResults;
            }
        } catch (error) {
            console.log(error);
        }
    } else {
        const value = localStorage.getItem(roomNo);
        let finalResults=[];
        if (value == null)
            return finalResults;
        else finalResults.push(value);
        console.log(finalResults);
        return finalResults;
    }
}
window.getCachedData= getCachedData;