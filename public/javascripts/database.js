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
                    messageDB.createIndex("name", "name");
                    messageDB.createIndex("message", "message");
                }
            }
        });
        console.log('db created');
    }

    window.initDatabase = initDatabase;
}

async function storeCachedData(roomNo, messageObject) {
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
            localStorage.setItem(roomNo, JSON.stringify(messageObject));
        };
    }
    else localStorage.setItem(roomNo, JSON.stringify(messageObject));
}
window.storeCachedData= storeCachedData;

async function getCachedData(roomNo, date) {
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
                let max;
                for (let elem of readingsList)
                    if (!max || elem.date > max.date)
                        max = elem;
                if (max)
                    finalResults.push(max);
                return finalResults;
            } else {
                const value = localStorage.getItem(roomNo);
                if (value == null)
                    return finalResults;
                else finalResults.push(value);
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
        return finalResults;
    }
}
window.getCachedData= getCachedData;

function getRoomNumber(dataR){
    if (dataR.roomNo == null && dataR.roomNo === undefined)
        return "unavailable";
    else return dataR.roomNo;
}
window.getRoomNumber= getRoomNumber

function getName(dataR) {
    if (dataR.name == null && dataR.name === undefined)
        return "unavailable";
    else return dataR.name;
}
window.getNname= getName;

function getMessage(dataR) {
    if (dataR.message == null && dataR.message === undefined)
        return "unavailable";
    else return dataR.message;
}

window.getMessage= getMessage;