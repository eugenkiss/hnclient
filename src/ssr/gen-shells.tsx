import {execSync} from 'child_process'
import * as http from 'http'
import * as fs from 'fs'
import * as express from 'express'
import * as React from 'react'

import {renderToString} from 'react-dom/server'
import {renderStylesToString} from 'emotion-server'
import App from '../app'
import {routesMap} from '../app/routes'

require('universal-url').shim()
global['navigator'] = { userAgent: 'node.js' }

// https://github.com/developit/preact/issues/720#issuecomment-312500876
require('module-alias').addAliases({
  'react'  : 'inferno-compat',
  'react-dom': 'inferno-compat',
  'react-dom/server': 'inferno-server',
})

const PORT = process.env['PORT'] || 5002
const ENV = process.env['ENV']

const jsDirCont = fs.readdirSync(__dirname + '/../../dist/js');
const jsName = jsDirCont[0]

const DATE = new Date().getTime()
const GIT_HASH = execSync('git rev-parse --short HEAD').toString().trim()
const GIT_STATUS = execSync('test -z "$(git status --porcelain)" || echo "dirty"').toString().trim()

const template = fs.readFileSync(__dirname + '/../public/template.html', 'utf8')
  .replace('<!-- ::JS:: -->', `<script src='/js/${jsName}'></script>`)
  .replace('<!-- ::GIT_HASH:: -->', GIT_HASH)
  .replace('<!-- ::GIT_STATUS:: -->', GIT_STATUS)
  .replace('<!-- ::BUILD_TIME:: -->', DATE.toString())

const htmlForPath = (path: string): string => {
  const html = renderStylesToString(renderToString(<App initialPath={path}/>))
  return template
    .replace('<!-- ::APP:: -->', html)
}

const htmlMap = new Map<string, string>()
const firebaseRewrites = new Array<{source: string, destination: string}>()
for (const [key, route] of routesMap) {
  const html = htmlForPath(route.path)
  htmlMap.set(key, html)
  firebaseRewrites.push({source: route.globPath, destination: `/${key}.html`})
  fs.writeFileSync(__dirname + `/../../dist/${key}.html`, html)
}

// Fallback for PWA
fs.writeFileSync(__dirname + `/../../dist/fallback.html`, template)

console.log()
console.log('Firebase rewrites:')
console.log(JSON.stringify(firebaseRewrites, null, 2))
console.log()


if (ENV === 'loc') {
  const app = express()

  for (const [key, route] of routesMap) {
    app.get(route.path, (req, res) => {
      res.send(htmlMap.get(key))
    })
  }

  app.use(express.static('dist'))

  http.createServer(app).listen(PORT, (err) => {
    if (err) throw err
    console.log(`> Ready on http://localhost:${PORT}`)
  })
}
