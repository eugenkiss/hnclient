import {action, observable} from 'mobx'
import createRouter, {PluginFactory, Route, Router, State} from 'router5'
import browserPlugin from 'router5/plugins/browser'
import {routesMap} from './routes'
import {Store} from './store'

function extractId(state: State) {
  return state.path
}

export type SaveUiCb = () => { id: string, data: any }
export type RestoreUiCb = (data: any) => void

export class RouterStore {
  @observable startNext: State
  @observable startPrev: State
  @observable current: State
  @observable history = observable.array<State>()

  uiStates: {[id:number]: {[id:string]: any}} = {}
  saveUiCbs = new Array<SaveUiCb>()
  restoreUiCbs = new Array<RestoreUiCb>()
  restoreUiCbIds = new Array<string>()

  persistUiStates() {
    this.callSaveUiCbs(extractId(this.current))
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

  callSaveUiCbs = (id: string) => {
    for (const cb of this.saveUiCbs) {
      const res = cb()
      const saved = this.uiStates[id] || {}
      if (res != null) saved[res.id] = res.data
      this.uiStates[id] = saved
    }
  }

  callRestoreUiCbs = (id: string) => {
    for (let i = 0; i < this.restoreUiCbs.length; i++) {
      const cbId = this.restoreUiCbIds[i]
      const cb = this.restoreUiCbs[i]
      const uiState = this.uiStates[id]
      cb(uiState == null ? null : uiState[cbId])
    }
  }
}

function makeMobxRouterPlugin(routerStore: RouterStore): PluginFactory {
  function mobxRouterPlugin() {
    // noinspection JSUnusedGlobalSymbols
    return {
      onTransitionStart: action((toState: State, fromState: State) => {
        routerStore.startPrev = fromState
        routerStore.startNext = toState
      }),
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
        if (fromState != null) routerStore.callSaveUiCbs(extractId(fromState))
      },
      onTransitionSuccess: (toState: State) => {
        routerStore.callRestoreUiCbs(extractId(toState))
      },
    }
  }
  (viewRestorePlugin as any as PluginFactory).pluginName = "VIEW_RESTORE_PLUGIN"
  return viewRestorePlugin as any as PluginFactory
}

// noinspection JSUnusedLocalSymbols
const asyncMiddleware = (store: Store) =>
  (router: Router) =>
    (nextState: State, prevState: State, done: any) => {
      prevState = prevState || {} as any
      const prevParams = prevState.params || {}
      const nextParams = nextState.params || {}
      const prevRoute = routesMap.get(prevState.name) || {} as any
      const nextRoute = routesMap.get(nextState.name)
      if (prevRoute.onDeactivate != null) {
        prevRoute.onDeactivate(store, prevParams, nextParams)
      }
      if (nextRoute.onActivate != null) {
        nextRoute.onActivate(store, nextParams, prevParams)
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
