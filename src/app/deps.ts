import {ApiClient} from './api/client'
import * as routes from './routes'
import {makeRouter, RouterStore} from './router'
import {UiStore} from './store'
import {Route} from 'router5'

export const api = new ApiClient('https://api.hackerwebapp.com')

export const routerStore = new RouterStore()

export const routesMap = routes.routesMap
const rs: Array<Route> = []
routesMap.forEach(v => rs.push(v))
export const router = makeRouter(rs, routerStore)

export const uiStore = new UiStore(api, routerStore)
