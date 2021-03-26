////////////////// DATABASE //////////////////
// the database receives from the server the following structure
import * as idb from './idb/index.js';

let db;

const MESSAGE_STORE_NAME= 'store_message';

/**
 * it inits the database
 */
async function initDatabase() {
    if (!db) {
        db = await idb.openDB('MessageDB', 2, {
            upgrade(upgradeDb, oldVersion, newVersion) {
                if (!upgradeDb.objectStoreNames.contains(MESSAGE_STORE_NAME)) {
                    let messageDB = upgradeDb.createObjectStore(MESSAGE_STORE_NAME, {
                        keyPath: 'id',
                        autoIncrement: true
                    });
                    messageDB.createIndex('username', 'username', {unique: false, multiEntry: true});
                }
            }
        });
        console.log('db created');
    }

    window.initDatabase = initDatabase;
}

async function storeCachedData(username, messageObject) {
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
            localStorage.setItem(username, JSON.stringify(messageObject));
        };
    }
    else localStorage.setItem(username, JSON.stringify(messageObject));
}
window.storeCachedData= storeCachedData;

async function getCachedData(username, date) {
    if (!db)
        await initDatabase();
    if (db) {
        try {
            console.log('fetching: ' + username);
            let tx = await db.transaction(MESSAGE_STORE_NAME, 'readonly');
            let store = await tx.objectStore(MESSAGE_STORE_NAME);
            let index = await store.index('username');
            let readingsList = await index.getAll(IDBKeyRange.only(username));
            await tx.complete;
            let finalResults=[];
            if (readingsList && readingsList.length > 0) {
                let max;
                for (let elem of readingsList)
                    if (!max || elem.date > max.date)
                        max = elem;
                if (max)
                    finalResults.push(max);
                return finalResults;
            } else {
                const value = localStorage.getItem(username);
                if (value == null)
                    return finalResults;
                else finalResults.push(value);
                return finalResults;
            }
        } catch (error) {
            console.log(error);
        }
    } else {
        const value = localStorage.getItem(username);
        let finalResults=[];
        if (value == null)
            return finalResults;
        else finalResults.push(value);
        return finalResults;
    }
}
window.getCachedData= getCachedData;

function getUsername(dataR) {
    if (dataR.username == null && dataR.username === undefined)
        return "unavailable";
    else return dataR.username;
}
window.getUsername= getUsername;

function getMessage(dataR) {
    if (dataR.message == null && dataR.message === undefined)
        return "unavailable";
    else return dataR.message;
}

window.getMessage= getMessage;