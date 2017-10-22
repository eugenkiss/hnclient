import * as querystring from 'querystring'

export function buildUrl(baseUrl: string, endpoint: string = '', params: object = {}) {
  const url = new URL(baseUrl)
  const parsedQuery = new URLSearchParams(querystring.stringify(params))
  for (const key of Object.keys(params)) {
    url.searchParams.set(key, parsedQuery.get(key))
  }
  url.pathname = joinPathnames(url.pathname, endpoint)
  return url.toString()
}

function joinPathnames(p1: string, p2: string) {
  if (p2 == null || p2 === '') return p1
  const joined = `${p1}/${p2}`
  return joined.replace(/\/\/+/g, '/')
}
