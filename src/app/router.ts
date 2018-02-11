import {observable} from 'mobx'
import createRouter, {PluginFactory, Route, Router, State} from 'router5'
import browserPlugin from 'router5/plugins/browser'
import {routesMap} from './routes'
import {Store} from './store'

function extractId(state: State) {
  return state.path
}

export type SaveUiCb = (current: State) => { id: string, data: any }
export type RestoreUiCb = (data: any) => void

// TODO: Has to be rethought. The callbacks list should be a map from path to a list of callbacks.
// Each callback for the given path will be called with either null or the saved state.
export class RouterStore {
  @observable current: State
  @observable history = observable.array<State>()

  uiStates: {[id:number]: {[id:string]: any}} = {}
  saveUiCbs = new Array<SaveUiCb>()
  restoreUiCbs = new Array<RestoreUiCb>()
  restoreUiCbIds = new Array<string>()

  // persistUiStates() {
  //   this.callSaveUiCbs(extractId(this.current))
  //   sessionStorage.setItem('uiStates', JSON.stringify(this.uiStates))
  // }

  // Disable (de)serialization for now, need to think deeper about it
  // restoreUiStates() {
  //   if (1==1) return
  //   const uiStatesJson = sessionStorage.getItem('uiStates')
  //   if (uiStatesJson == null) return
  //   this.uiStates = JSON.parse(uiStatesJson)
  // }

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
      const res = cb(this.current)
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

function makeMobxRouterPlugin(store: Store): PluginFactory {
  function mobxRouterPlugin() {
    return {
      'onTransitionSuccess': (nextState: State, prevState: State) => {
        const prevParams = (prevState || {} as any).params || {}
        const nextParams = nextState.params || {}
        const prevRoute = routesMap.get((prevState || {} as any).name) || {} as any
        const nextRoute = routesMap.get(nextState.name)

        if (prevState != null) store.routerStore.callSaveUiCbs(extractId(prevState))

        if (prevRoute.onDeactivate != null) {
          prevRoute.onDeactivate(store, prevParams, nextState)
        }

        store.routerStore.current = nextState

        if (nextRoute.onActivate != null) {
          nextRoute.onActivate(store, nextParams, (prevState || {} as any))
        }

        if (prevState != null && nextState.meta.id < prevState.meta.id) {
          store.routerStore.callRestoreUiCbs(extractId(nextState))
        }
      },
    }
  }
  (mobxRouterPlugin as any as PluginFactory).pluginName = "MOBX_PLUGIN"
  return mobxRouterPlugin as any as PluginFactory
}

export function makeRouter(routes: Array<Route>, store: Store): Router {
  const router = createRouter(routes, {
    trailingSlash: true
  })
  router.usePlugin(
    browserPlugin({}),
    makeMobxRouterPlugin(store),
  )
  return router
}
