import { aliases } from 'vuetify/iconsets/mdi'
// const sw = process.env.SW === 'true'

const sw = true

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: import.meta.dev },
  future: {
    compatibilityVersion: 4
  },
  modules: [// '@vueuse/nuxt',
  // 'nuxt-auth-utils',
  '@pinia/nuxt', // 'nuxt-echarts',
  'vuetify-nuxt-module', // '@nuxt/eslint',
  'nuxt-icons', //'@nuxt/icon', // '@nuxt/test-utils/module',
  '@nuxtjs/i18n', 'nuxt-svgo', 'nuxt-snackbar', '@vite-pwa/nuxt', '@nuxt/icon'],
  // spaLoadingTemplate: false,
  // extends: ['~/lib/features/home'],
  css: ['~/assets/styles/index.css'],
  experimental: { typedPages: true },
  typescript: { shim: false, strict: true },
  vue: { propsDestructure: true },
  // vueuse: { ssrHandlers: true },
  vuetify: {
    moduleOptions: {
      ssrClientHints: {
        viewportSize: true,
        prefersColorScheme: true,
        prefersColorSchemeOptions: {},
        reloadOnFirstRequest: true,
      },
    },
  },
  pwa: {
    manifest: {
      display_override: ['window-controls-overlay'],
      id: "al_kitab_app",
      name: 'الكتاب',
      short_name: 'الكتاب',
      description: 'تطبيق مبسط لقرائة القران الكريم بدون انترنت',
      background_color: '#ffffff',
      theme_color: 'orange',
      screenshots: [{
        src: 'screenshots/alkitab-screenshot-phone.png',
        sizes: '523x684',
        type: 'image/png',
        form_factor: "narrow"
      }],
      icons: [
        {
          src: 'icons/icon-144.png',
          sizes: '144x144',
          type: 'image/png',
          purpose: 'any',
        },
        {
          src: 'icons/icon-192.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: 'icons/icon-512.png',
          sizes: '512x512',
          type: 'image/png',
        },
        {
          src: 'icons/icon-512-maskable.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable',
        },
      ],
    },
    mode: import.meta.env.dev ? "development" : "production",
    scope: "/",
    strategies: 'injectManifest', // : 'generateSW',
    srcDir: './service-worker',
    filename: 'sw.ts',
    injectRegister: "auto",
    injectManifest: {
      globPatterns: ['**/*.{js,json,css,html,txt,svg,png,ico,webp,woff,woff2,ttf,eot,otf}'],
    },
    includeManifestIcons: true,
    workbox: {
      globPatterns: ['**/*.{js,json,css,html,txt,svg,png,ico,webp,woff,woff2,ttf,eot,otf}'],
    },
    registerType: 'autoUpdate',
    client: {
      // installPrompt: true,
      periodicSyncForUpdates: 1,
    },
    devOptions: {
      enabled: import.meta.dev,
      suppressWarnings: import.meta.dev ? false : true,
      navigateFallback: '/',
      navigateFallbackAllowlist: [/^\/$/],
      type: 'module',
    },
  },
  i18n: {
    // if not using RTL, you can replace locales with codes only
    // locales: ['en', 'es'],
    locales: [{
      code: 'ar',
      name: 'العربية',
      dir: 'rtl',
    }],
    defaultLocale: 'ar',
    strategy: 'no_prefix', // or 'prefix_except_default'
    vueI18n: './i18n.config.ts',
  },
  snackbar: {
    bottom: true,
    right: true,
    duration: 5000
  },
  // watch: ['']
  app: {
    // head: {
    //   link: [{ rel: 'stylesheet', href: '/fonts/Hafs.woff2' }]
    // }
  },
  devServer: {
    port: 3030,
    // https: {
    //   key: './ssl/server.key',
    //   cert: './ssl/server.crt'
    // }
  },
  nitro: {
    prerender: {
      crawlLinks: true,
      failOnError: false,
      routes: ['/'],
      ignore: ['/surahs/', '/fonts/', '/icons/', '/screenshots/'],
    },
  },
  icon: {
    clientBundle: {
      icons: Object.values(aliases).map((v) =>
        (v as string).replace(/^mdi-/, 'mdi:'),
      ),
      scan: true,
      // scan all components in the project and include icons
      // scan: true,
    },
    customCollections: [
      {
        prefix: 'custom',
        dir: './assets/icons',
      },
    ],
  },
  // echarts: {
  //   charts: ['LineChart', 'BarChart', 'PieChart', 'RadarChart'],
  //   renderer: 'svg',
  //   components: [
  //     'DataZoomComponent',
  //     'LegendComponent',
  //     'TooltipComponent',
  //     'ToolboxComponent',
  //     'GridComponent',
  //     'TitleComponent',
  //     'DatasetComponent',
  //     'VisualMapComponent',
  //   ],
  // },
  vite: {
    build: { sourcemap: false },
  },
  runtimeConfig: {
    github: {
      clientId: '',
      clientSecret: '',
    },
    session: {
      name: 'nuxt-session',
      password: '',
    },
  },
  ssr: false,
  compatibilityDate: '2024-08-05',
})