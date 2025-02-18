/// <reference lib="WebWorker" />
/// <reference types="vite/client" />
import { cleanupOutdatedCaches, createHandlerBoundToURL, precacheAndRoute } from 'workbox-precaching'
import { clientsClaim } from 'workbox-core'
import { NavigationRoute, registerRoute } from 'workbox-routing'
import { uGetSurahsUrls } from "../utils/surah_utils"
import { expose } from "comlink";
import { SWConfig } from './config';

import { Connection } from 'jsstore';
import workerInjector from 'jsstore/dist/worker_injector'

const DB_NAME = "play_db1"

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
    var table = {
        name: 'Student',
        columns: {
            id: {
                primaryKey: true,
                autoIncrement: true
            },
            name: {
                notNull: true,
                dataType: 'string'
            },
            gender: {
                dataType: 'string',
                default: 'male'
            },
            country: {
                notNull: true,
                dataType: 'string'
            },
            city: {
                dataType: 'string',
                notNull: true
            }
        }
    }

    var db = {
        name: DB_NAME,
        tables: [table]
    }
    return db;
}

// self.addEventListener('install', (event) => {
//     console.log('install work ??########');

//     event.waitUntil(initDb().then(function (connection) {
//         return connection.terminate();
//     }));
// });

