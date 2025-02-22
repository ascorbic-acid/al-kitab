/// <reference lib="WebWorker" />
/// <reference types="vite/client" />
import { cleanupOutdatedCaches, createHandlerBoundToURL, precacheAndRoute } from 'workbox-precaching'
import { clientsClaim } from 'workbox-core'
import { NavigationRoute, registerRoute } from 'workbox-routing'
import { uGetSurahsUrls } from "../utils/surah_utils"
import { expose } from "comlink";
import { SWConfig } from './config';

declare let self: ServiceWorkerGlobalScope

export async function onFetch(event: FetchEvent) {
  const isOnline = self.navigator.onLine;
  const url = new URL(event.request.url);
  const isImage =
    url.hostname.includes('picsum.photos') ||
    url.pathname.includes('.png') ||
    url.pathname.endsWith('.jpg');

  const isJSON = url.hostname.endsWith('.json');
  const isSurhahAsset = url.hostname.startsWith('/surahs/')

  const isCSS =
    url.pathname.endsWith('.css') || url.hostname.includes('googleapis.com');
  const isHTML = event.request.mode === 'navigate';
  const isFont =
    url.hostname.includes('gstatic') || url.pathname.endsWith('woff2');

  const selfUrl = new URL(self.location);
  const isExternal =
  event.request.mode == 'cors' || selfUrl.hostname !== url.hostname;

  
  if(isSurhahAsset) {
    // event.respondWith(cacheOnly(event));
    return
  }

  if (isOnline) {
    event.respondWith(networkRevalidateAndCache(event));
  } else {
    event.respondWith(cacheOnly(event));
  }
}


function cacheOnly(event: FetchEvent) {
  //only return what is in the cache
  return caches.match(event.request);
}
function cacheFirst(event: FetchEvent) {
  //return from cache or fetch if not in cache
  return caches.match(event.request).then((cacheResponse) => {
    //return cacheResponse if not null
    return cacheResponse || fetch(event.request);
  });
}
function networkOnly(event: FetchEvent) {
  //only return fetch response
  return fetch(event.request);
}
function networkFirst(event: FetchEvent) {
  //try fetch and fallback on cache
  return fetch(event.request).then((fetchResponse) => {
    if (fetchResponse.ok) return fetchResponse;
    return caches.match(event.request);
  });
}
async function staleWhileRevalidate(event: FetchEvent) {
  //check cache and fallback on fetch for response
  //always attempt to fetch a new copy and update the cache
  return caches.match(event.request).then((cacheResponse) => {
    let fetchResponse = fetch(event.request).then((response) => {
      return caches.open(SWConfig.CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    });
    return cacheResponse || fetchResponse;
  });
}
async function networkRevalidateAndCache(event: FetchEvent) {
  //try fetch first and fallback on cache
  //update cache if fetch was successful
  return fetch(event.request, { mode: 'cors', credentials: 'omit' }).then(
    (fetchResponse) => {
      if (fetchResponse.ok) {
        //put in cache
        return caches.open(SWConfig.CACHE_NAME).then((cache) => {
          cache.put(event.request, fetchResponse.clone());
          return fetchResponse;
        });
      } else {
        return caches.match(event.request);
      }
    }
  );
}
