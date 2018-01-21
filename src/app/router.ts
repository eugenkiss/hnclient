import {observable} from 'mobx'
import createRouter, {PluginFactory, Route, Router, State} from 'router5'
import browserPlugin from 'router5/plugins/browser'
import {routesMap} from './routes'
import {Store} from './store'

export type SaveUiCb = () => { id: string, data: any }
export type RestoreUiCb = (data: any) => void

export class RouterStore {
  @observable current: State
  @observable history = observable.array<State>()

  uiStates: {[id:number]: {[id:string]: any}} = {}
  saveUiCbs = new Array<SaveUiCb>()
  restoreUiCbs = new Array<RestoreUiCb>()
  restoreUiCbIds = new Array<string>()

  persistUiStates() {
    this.callSaveUiCbs(this.current)
    sessionStorage.setItem('uiStates', JSON.stringify(this.uiStates))
  }

  restoreUiStates() {
    // Disable restoration, there is something wrong for edge cases (refresh)
    // meta.id is not consistent after refresh
    if (1==1) return
    const uiStatesJson = sessionStorage.getItem('uiStates')
    if (uiStatesJson == null) return
    this.uiStates = JSON.parse(uiStatesJson)
  }

  addSaveUiCb = (cb: SaveUiCb): SaveUiCb => {
    this.saveUiCbs.push(cb)
    return cb
  }

  addRestoreUiCb = (id: string, cb: RestoreUiCb): RestoreUiCb => {
    this.restoreUiCbs.push(cb)
    this.restoreUiCbIds.push(id)
    return cb
  }

  delSaveUiCb = (cb: SaveUiCb) => {
    this.saveUiCbs.splice(this.saveUiCbs.indexOf(cb), 1)
  }

  delRestoreUiCb = (cb: RestoreUiCb) => {
    const i = this.restoreUiCbs.indexOf(cb)
    this.restoreUiCbs.splice(i, 1)
    this.restoreUiCbIds.splice(i, 1)
  }

  callSaveUiCbs = (state: State) => {
    if (state == null) return
    const id = state.meta['id']
    for (const cb of this.saveUiCbs) {
      const res = cb()
      const saved = this.uiStates[id] || {}
      if (res != null) saved[res.id] = res.data
      this.uiStates[id] = saved
    }
  }

  callRestoreUiCbs = (state: State) => {
    const id = state.meta['id']
    for (let i = 0; i < this.restoreUiCbs.length; i++) {
      const cbId = this.restoreUiCbIds[i]
      const cb = this.restoreUiCbs[i]
      const uiState = this.uiStates[id]
      if (uiState != null) cb(uiState[cbId])
    }
  }
}

function makeMobxRouterPlugin(routerStore: RouterStore): PluginFactory {
  function mobxRouterPlugin() {
    // noinspection JSUnusedGlobalSymbols
    return {
      onTransitionSuccess: (toState: State) => {
        routerStore.current = toState
      },
    }
  }
  (mobxRouterPlugin as any as PluginFactory).pluginName = "MOBX_PLUGIN"
  return mobxRouterPlugin as any as PluginFactory
}

function makeViewRestorePlugin(routerStore: RouterStore): PluginFactory {
  function viewRestorePlugin() {
    // noinspection JSUnusedGlobalSymbols
    return {
      onTransitionStart: (toState: State, fromState: State) => {
        routerStore.callSaveUiCbs(fromState)
      },
      onTransitionSuccess: (toState: State) => {
        routerStore.callRestoreUiCbs(toState)
      },
    }
  }
  (viewRestorePlugin as any as PluginFactory).pluginName = "VIEW_RESTORE_PLUGIN"
  return viewRestorePlugin as any as PluginFactory
}

// noinspection JSUnusedLocalSymbols
const asyncMiddleware = (store: Store) =>
  (router: Router) =>
    (toState: any, fromState: State, done: any) => {
      const route = routesMap.get(toState.name)
      if (route.onActivate != null) {
        route.onActivate(store, toState.params, (fromState || {} as any).params || {})
      }
      done()
    }

export function makeRouter(routes: Array<Route>, store: Store): Router {
  const router = createRouter(routes, {
    trailingSlash: true
  })
  router.usePlugin(
    browserPlugin({}),
    makeMobxRouterPlugin(store.routerStore),
    makeViewRestorePlugin(store.routerStore)
  )
  router.useMiddleware(asyncMiddleware(store))
  return router
}
