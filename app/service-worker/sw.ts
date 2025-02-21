/// <reference lib="WebWorker" />
/// <reference types="vite/client" />
import { SWConfig } from './config';
import { cleanupOutdatedCaches, createHandlerBoundToURL, precacheAndRoute } from 'workbox-precaching'
import { clientsClaim } from 'workbox-core'
import { NavigationRoute, registerRoute } from 'workbox-routing'
import { expose } from "comlink";
import { initCache } from './caching';
import { sleep } from './utils';
import { onFetch } from './fetch';

declare let self: ServiceWorkerGlobalScope
precacheAndRoute(self.__WB_MANIFEST)
import { Connection } from 'jsstore';

let comlinkMainPort = null
let conn: Connection = null;


async function get_res() {
  return "HAHA!"
}

function getVersion() {
  return SWConfig.VERSION;
}

async function init() {
  console.log('#### SW INIT ####');
  
}

async function onMsg(event: ExtendableMessageEvent) {
  if (event.data.comlinkInit) {
    comlinkMainPort = event.data.port
    expose({getVersion, init, get_res}, comlinkMainPort)
    return;
  }
}




async function onInstall(event: ExtendableEvent) {
  console.log('Service worker install oninstall...');
  self.skipWaiting()
  initCache(event)
}

async function onActivate(event: ExtendableEvent) {
  clientsClaim()
}




self.addEventListener('install', onInstall);
self.addEventListener('activate', onActivate)
self.addEventListener('fetch', onFetch);
self.addEventListener("message", onMsg);
// setTimeout(() => init(), 1000)