/// <reference lib="WebWorker" />
/// <reference types="vite/client" />
import { cleanupOutdatedCaches, createHandlerBoundToURL, precacheAndRoute } from 'workbox-precaching'
import { clientsClaim } from 'workbox-core'
import { NavigationRoute, registerRoute } from 'workbox-routing'
import { uGetSurahsUrls } from "../utils/surah_utils"
import { expose } from "comlink";
import { sleep } from './utils';
import { SWConfig } from './config';

declare let self: ServiceWorkerGlobalScope


let allowlist: undefined | RegExp[]
if (import.meta.env.DEV)
  allowlist = [/^\/$/]


async function cacheSurahs(cache: any, purge: boolean = false) {
  if (purge) caches.delete(SWConfig.SURAHS_NAME)
  await sleep(5)
  cache.addAll(uGetSurahsUrls());
  console.log(cache);
}

async function cacheAssets(cache: any, purge: boolean = false) {
  // if (purge) caches.delete(SWConfig.CACHE_NAME)
  // let assets = [
  //   '/fonts/Kitab-Regular.ttf',
  //   // '/surahs/1-al-fatiha.json',
  //   '/_nuxt/@vite/client',
  //   '/icons/icon-512.png',
  //   '/favicon.ico',
  // ]
  // await sleep(1)
  // cache.addAll(assets);
}

export async function initCache(event: ExtendableEvent) {
  registerRoute(new NavigationRoute(
    createHandlerBoundToURL('/'),
    { allowlist },
  ))
  event.waitUntil(
    caches.open(SWConfig.CACHE_NAME).then((cache) => {
      cacheAssets(cache)
      cacheSurahs(cache)
    })
  );

  event.waitUntil(
    caches.open(SWConfig.SURAHS_NAME).then((cache) => {
      cacheSurahs(cache)
    })
  );
}

