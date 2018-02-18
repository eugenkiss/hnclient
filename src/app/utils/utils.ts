import * as querystring from 'querystring'
import {fromPromise, IPromiseBasedObservable} from 'mobx-utils'

export const infPromise = new Promise<any>(() => null)
// noinspection JSUnusedGlobalSymbols
export const infReq: IPromiseBasedObservable<any> = fromPromise(infPromise)
export const fulfilledReq: IPromiseBasedObservable<any> = fromPromise.resolve(null)
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
  const parsedQuery = new URLSearchParams(querystring.stringify(params || {}))
  for (const key of Object.keys(params || {})) {
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

// TODO: Doesn't handle rejected promise
export const minDuration = <T>(minDuration: number): (p: Promise<T>) => Promise<T> => async (promise) => {
  const now = getNow()
  const result = await promise
  const duration = getNow() - now
  await sleep(minDuration - duration)
  return result
}

export function smoothScrollToId(id: string) {
  const pageEl = document.getElementById(id)
  if (pageEl != null) pageEl.scrollIntoView({block: 'start', behavior: 'smooth'})
}

export function getNow() {
  return new Date().getTime()
}

function numberize(n: number, single: string) {
  const result = n + ' ' + single
  return n === 1 ? result : result + 's'
}

// https://stackoverflow.com/a/6109105/283607
export function timeAgo(now, then) {
    const msPerMinute = 60 * 1000
    const msPerHour = msPerMinute * 60
    const msPerDay = msPerHour * 24
    const msPerMonth = msPerDay * 30
    const msPerYear = msPerDay * 365

    const elapsed = now - then

    if (elapsed < msPerHour) {
         return numberize(Math.round(elapsed/msPerMinute), 'minute')
    }

    else if (elapsed < msPerDay ) {
         return numberize(Math.round(elapsed/msPerHour ), 'hour')
    }

    else if (elapsed < msPerMonth) {
        return numberize(Math.round(elapsed/msPerDay), 'day')
    }

    else if (elapsed < msPerYear) {
        return numberize(Math.round(elapsed/msPerMonth), 'month')
    }

    else {
        return numberize(Math.round(elapsed/msPerYear ), 'year')
    }
}
