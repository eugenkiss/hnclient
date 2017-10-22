module.exports = {
  stripPrefix: 'dist/',
  staticFileGlobs: [
    'dist/*.html',
    'dist/manifest.json',
    'dist/favicon.png',
    'dist/js/**/!(*map*)'
  ],
  dontCacheBustUrlsMatching: /\.\w{8}\./,
  swFilePath: 'dist/service-worker.js',
  navigateFallback: '/index.html',
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
