/// <reference lib="WebWorker" />
/// <reference types="vite/client" />
import { cleanupOutdatedCaches, createHandlerBoundToURL, precacheAndRoute } from 'workbox-precaching'
import { clientsClaim } from 'workbox-core'
import { NavigationRoute, registerRoute } from 'workbox-routing'
import { uGetSurahsUrls } from "../app/utils/surah_utils"

declare let self: ServiceWorkerGlobalScope
const VERSION = 24
console.log(`SW v${VERSION}`);

const CACHE_NAME = "app-cache"
// self.__WB_MANIFEST is default injection point
precacheAndRoute(self.__WB_MANIFEST)

// clean old assets
cleanupOutdatedCaches()

let allowlist: undefined | RegExp[]
if (import.meta.env.DEV)
  allowlist = [/^\/$/]

// to allow work offline
registerRoute(new NavigationRoute(
  createHandlerBoundToURL('/'),
  { allowlist },
))

self.skipWaiting()


async function sleep(seconds: number) {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}

async function cacheSurahs(cache: any, purge: boolean = false) {
  if (purge) caches.delete(CACHE_NAME)
  await sleep(5)
  cache.addAll(uGetSurahsUrls());
}

async function cacheAssets(cache: any, purge: boolean = false) {
  if (purge) caches.delete(CACHE_NAME)
  let assets = [
    '/fonts/Kitab-Regular.ttf',
    // '/surahs/1-al-fatiha.json',
    '/_nuxt/@vite/client',
    '/icons/icon-512.png',
    '/favicon.ico',
  ]
  await sleep(1)
  cache.addAll(assets);
}

self.addEventListener('install', async (event) => {
  console.log('Service worker install...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      cacheAssets(cache)
      cacheSurahs(cache)
      
    })
  );
  
  
});



self.addEventListener('activate', (event) => {
  console.log('Service worker activated!, Good Place To Clear Old Cache etc');
});

self.addEventListener("notificationclick", function (event) {
  console.log("notificación abierta");
});

self.addEventListener("notificationclick", function (event) {
  const channel = new BroadcastChannel("sw-mensajes");
  if (event.action == "aceptar") {
    channel.postMessage({ title: "aceptar" });
  }

  if (event.action == "rechazar") {
    channel.postMessage({ title: "rechazar" });
  }
});
clientsClaim()

self.addEventListener('message', (event) => {
  console.log("SW: a msg event: ", event);
  
  if (event.data && event.data.type === 'cacheJsonFiles') {
    const urls = event.data.urls;
    // event.waitUntil(cacheJsonFiles(urls));
  }
});

self.addEventListener('fetch', (ev) => {
  //handle fetch requests
  //online? external? font? css? img? html? specific folder?
  // console.log(`fetch: ${ev.request.url}`);

  const isOnline = self.navigator.onLine;
  const url = new URL(ev.request.url);
  const isImage =
    url.hostname.includes('picsum.photos') ||
    url.pathname.includes('.png') ||
    url.pathname.endsWith('.jpg');

  const isJSON = url.hostname.endsWith('.json');
  const isSurhahAsset = url.hostname.startsWith('/surahs/')

  const isCSS =
    url.pathname.endsWith('.css') || url.hostname.includes('googleapis.com');
  const isHTML = ev.request.mode === 'navigate';
  const isFont =
    url.hostname.includes('gstatic') || url.pathname.endsWith('woff2');

  const selfUrl = new URL(self.location);
  const isExternal =
    ev.request.mode == 'cors' || selfUrl.hostname !== url.hostname;

  
  if(isSurhahAsset) {
    ev.respondWith(cacheOnly(ev));
  }

  
  if (isOnline) {
    ev.respondWith(networkRevalidateAndCache(ev));
  } else {
    ev.respondWith(cacheOnly(ev));
  }
});

function cacheOnly(ev: FetchEvent) {
  //only return what is in the cache
  return caches.match(ev.request);
}
function cacheFirst(ev: FetchEvent) {
  //return from cache or fetch if not in cache
  return caches.match(ev.request).then((cacheResponse) => {
    //return cacheResponse if not null
    return cacheResponse || fetch(ev.request);
  });
}
function networkOnly(ev: FetchEvent) {
  //only return fetch response
  return fetch(ev.request);
}
function networkFirst(ev: FetchEvent) {
  //try fetch and fallback on cache
  return fetch(ev.request).then((fetchResponse) => {
    if (fetchResponse.ok) return fetchResponse;
    return caches.match(ev.request);
  });
}
async function staleWhileRevalidate(ev: FetchEvent) {
  //check cache and fallback on fetch for response
  //always attempt to fetch a new copy and update the cache
  return caches.match(ev.request).then((cacheResponse) => {
    let fetchResponse = fetch(ev.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(ev.request, response.clone());
        return response;
      });
    });
    return cacheResponse || fetchResponse;
  });
}
async function networkRevalidateAndCache(ev: FetchEvent) {
  //try fetch first and fallback on cache
  //update cache if fetch was successful
  return fetch(ev.request, { mode: 'cors', credentials: 'omit' }).then(
    (fetchResponse) => {
      if (fetchResponse.ok) {
        //put in cache
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(ev.request, fetchResponse.clone());
          return fetchResponse;
        });
      } else {
        return caches.match(ev.request);
      }
    }
  );
}