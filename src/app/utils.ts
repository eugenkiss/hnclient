import * as querystring from 'querystring'
import {fromPromise, IPromiseBasedObservable} from 'mobx-utils'

export const infPromise = new Promise<any>(() => null)
// noinspection JSUnusedGlobalSymbols
export const infReq = fromPromise(infPromise)
export const fulfilledReq = fromPromise.resolve(null)
// Other ways lead to exceptions being thrown by mobx-utils
// noinspection JSUnusedGlobalSymbols, ReservedWordAsName
export const failedReq: IPromiseBasedObservable<any> = {
  state: 'rejected',
  value: null,
  isPromiseBasedObservable: true,
  case: () => null,
  then: () => null,
}

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

export const canUseDOM = !!(
  typeof window !== 'undefined' &&
  window.document &&
  window.document.createElement
)

export function sleep(time) {
  return new Promise(resolve => {
    setTimeout(resolve, time)
  })
}

export function makeExternalItemLink(itemId: string) {
  return `https://news.ycombinator.com/item?id=${itemId}`
}

export function makeExternalUserLink(userId: string) {
  return `https://news.ycombinator.com/user?id=${userId}`
}
