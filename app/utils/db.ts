import workerInjector from 'jsstore/dist/worker_injector'
import { type IDataBase, DATA_TYPE, type ITable, Connection } from 'jsstore';

const DB_NAME = "al_kitab_db"

export async function initDb() {
    var connection = new Connection();
    connection.addPlugin(workerInjector);

    var isDbCreated = await connection.initDb(getDbSchema());
    if (isDbCreated) {
        console.log('db created');
    }
    else {
        console.log('db opened');
    }
    return connection;
}



function getDbSchema() {
    let surahTable: ITable = {
        name: 'Surah',
        columns: {
            number: {
                primaryKey: true,
                // autoIncrement: true
            },
            name: {
                dataType: 'string'
            },
            englishName: {
                dataType: 'string',
            },
            englishNameTranslation: {
                dataType: 'string'
            },
            revelationType: {
                dataType: 'string',
            },
            numberOfAyahs: {
                dataType: "number"
            }
        }
    }

    var db: IDataBase = {
        name: DB_NAME,
        version: 5,
        tables: [surahTable]
    }
    return db;
}

// self.addEventListener('install', (event) => {
//     console.log('install work ??########');

//     event.waitUntil(initDb().then(function (connection) {
//         return connection.terminate();
//     }));
// });

