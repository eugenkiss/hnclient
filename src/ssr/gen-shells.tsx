import {exec} from 'child_process'
import * as http from 'http'
import * as fs from 'fs'
import * as express from 'express'
import * as React from 'react'

import {renderToString} from 'react-dom/server'
import {ServerStyleSheet} from 'styled-components'
import {css} from '../css'
import App from '../app'
import {routesMap} from '../app/routes'

const DATE = new Date().getTime()
process.env.DATE = JSON.stringify(DATE)
const GIT_HASH = exec('git rev-parse --short HEAD').toString().trim()
process.env.GIT_HASH = JSON.stringify(GIT_HASH)
const GIT_STATUS = exec('test -z "$(git status --porcelain)" || echo "dirty"').toString().trim()
process.env.GIT_STATUS = JSON.stringify(GIT_STATUS)

require('universal-url').shim()
global['navigator'] = { userAgent: 'node.js' }

// https://github.com/developit/preact/issues/720#issuecomment-312500876
require('module-alias').addAliases({
  'react'  : 'inferno-compat',
  'react-dom': 'inferno-compat',
  'react-dom/server': 'inferno-server',
})

// I have no idea why styled component doesn't do this itself
// There must be a better way than duplication...
// https://github.com/styled-components/styled-components/issues/749
const globalCss = `<style>${css}</style>`

const PORT = process.env['PORT'] || 5002
const ENV = process.env['ENV']

const template = fs.readFileSync(__dirname + '/../public/template.html', 'utf8')
const jsDirCont = fs.readdirSync(__dirname + '/../../dist/js');
const jsName = jsDirCont[0]

const htmlForPath = (path: string): string => {
  const sheet = new ServerStyleSheet()
  const html = renderToString(sheet.collectStyles(<App initialPath={path}/>))
  const css = sheet.getStyleTags()
  return template
    .replace('<!-- ::APP:: -->', html)
    .replace('<!-- ::CSS:: -->', `${globalCss}${css}`)
    .replace('<!-- ::JS:: -->', `<script src='/js/${jsName}'></script>`)
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
fs.writeFileSync(__dirname + `/../../dist/fallback.html`, template
  .replace('<!-- ::JS:: -->', `<script src='/js/${jsName}'></script>`))

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
