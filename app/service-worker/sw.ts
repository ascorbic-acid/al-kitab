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


function getVersion() {
  return SWConfig.VERSION;
}

function transfer_test(data) {

}


self.addEventListener("message", (event) => {
  if (event.data.comlinkInit) {
    expose({getVersion, transfer_test}, event.data.port)
    return;
  }
});



async function onActivate(event: ExtendableEvent) {
  clientsClaim()
}

async function onInstall(event: ExtendableEvent) {
  console.log('Service worker install oninstall...');
  self.skipWaiting()
  initCache(event)

}



self.addEventListener('install', onInstall);
self.addEventListener('activate', onActivate)
self.addEventListener('fetch', onFetch);
