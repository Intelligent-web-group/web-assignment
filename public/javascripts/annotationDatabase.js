////////////////// DATABASE //////////////////
// the database receives from the server the following structure
import * as idb from './idb/index.js';

let db;
const Annotation_DB_NAME = 'db_annotation'
const Annotation_STORE_NAME = 'store_annotation';

/**
 * it inits the database
 */
async function initDatabase() {
    if (!db) {
        db = await idb.openDB(Annotation_DB_NAME, 2, {
            upgrade(upgradeDb, oldVersion, newVersion) {
                if (!upgradeDb.objectStoreNames.contains(Annotation_STORE_NAME)) {
                    let messageDB = upgradeDb.createObjectStore(Annotation_STORE_NAME, {
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

/**
 * The function to store the data in the indexedDB including username, roomNo and message
 * @param messageObject
 * @returns {Promise<void>}
 */

async function storeAnnotationData(annotationject) {
    console.log('inserting: ' + JSON.stringify(annotationject));
    if (!db)
        await initDatabase();
    if (db) {
        try {
            let tx = await db.transaction(Annotation_STORE_NAME, 'readwrite');
            let store = await tx.objectStore(Annotation_STORE_NAME);
            await store.put(annotationject);
            await tx.complete;
            console.log('added item to the store! ' + JSON.stringify(annotationject));
        } catch (error) {
            console.log('error: I could not store the element. Reason: ' + error);
        }

    } else localStorage.setItem(annotationject.roomNo, JSON.stringify(annotationject));
}

window.storeAnnotationData = storeAnnotationData;

/**
 * the function to get the data in the database
 * @param roomNo
 * @returns {Promise<[]>}
 * read the chat history and show on thee canvas
 */

async function getAnnotationData(roomNo) {
    if (!db)
        await initDatabase();
    if (db) {
        try {
            console.log('fetching: ' + roomNo);
            let tx = await db.transaction(Annotation_STORE_NAME, 'readonly');
            let store = await tx.objectStore(Annotation_STORE_NAME);
            let index = await store.index('roomNo');
            let readingsList = await index.getAll(IDBKeyRange.only(roomNo));
            await tx.complete;
            let finalResults = [];
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
        let finalResults = [];
        if (value == null)
            return finalResults;
        else finalResults.push(value);
        console.log(finalResults);
        return finalResults;
    }
}

window.getAnnotationData = getAnnotationData;
