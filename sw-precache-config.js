module.exports = {
  stripPrefix: 'dist/',
  staticFileGlobs: [
    'dist/fallback.html',
    'dist/manifest.json',
    'dist/favicon.ico',
    'dist/js/**/!(*map*)'
  ],
  dontCacheBustUrlsMatching: /\.\w{8}\./,
  swFilePath: 'dist/service-worker.js',
  navigateFallback: '/fallback.html',
  runtimeCaching: [
    {
      urlPattern: /^\/.+/,
      handler: 'networkFirst',
      options: {
        cache: {
          maxEntries: 100,
          name: 'page-cache'
        }
      }
    }
  ]
};
