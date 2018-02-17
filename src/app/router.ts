import {observable} from 'mobx'
import createRouter, {Plugin, PluginFactory, Route, Router, State} from 'router5'
import browserPlugin from 'router5/plugins/browser'
import {routesMap} from './routes'
import {Store} from './store'

function extractId(state: State) {
  return state.path
}

export type SaveListener = (current: State) => { id: string, data: any }
export type RestoreListener = (data: any) => void

// TODO: Has to be rethought. The callbacks list should be a map from path to a list of callbacks.
// Each callback for the given path will be called with either null or the saved state.
export class RouterStore {
  @observable current: State
  @observable history = observable.array<State>()

  uiStates: {[id:number]: {[id:string]: any}} = {}
  saveUiCbs = new Array<SaveListener>()
  restoreUiCbs = new Array<RestoreListener>()
  restoreUiCbIds = new Array<string>()

  addSaveListener = (cb: SaveListener): () => void => {
    this.saveUiCbs.push(cb)
    return () => this.removeSaveListener(cb)
  }

  addRestoreListener = (id: string, cb: RestoreListener): () => void => {
    this.restoreUiCbs.push(cb)
    this.restoreUiCbIds.push(id)
    return () => this.removeRestoreListener(cb)
  }

  private removeSaveListener = (cb: SaveListener) => {
    this.saveUiCbs.splice(this.saveUiCbs.indexOf(cb), 1)
  }

  private removeRestoreListener = (cb: RestoreListener) => {
    const i = this.restoreUiCbs.indexOf(cb)
    this.restoreUiCbs.splice(i, 1)
    this.restoreUiCbIds.splice(i, 1)
  }

  callSaveListeners = (id: string) => {
    for (const cb of this.saveUiCbs) {
      const res = cb(this.current)
      const saved = this.uiStates[id] || {}
      if (res != null) saved[res.id] = res.data
      this.uiStates[id] = saved
    }
  }

  callRestoreListeners = (id: string) => {
    for (let i = 0; i < this.restoreUiCbs.length; i++) {
      const cbId = this.restoreUiCbIds[i]
      const cb = this.restoreUiCbs[i]
      const uiState = this.uiStates[id]
      cb(uiState == null ? null : uiState[cbId])
    }
  }
}

function makeMobxRouterPlugin(store: Store): PluginFactory {
  function mobxRouterPlugin(): Plugin {
    return {
      onTransitionSuccess(nextState?: State, prevState?: State) {
        const prevParams = (prevState || {} as any).params || {}
        const nextParams = nextState.params || {}
        const prevRoute = routesMap.get((prevState || {} as any).name) || {} as any
        const nextRoute = routesMap.get(nextState.name)

        if (prevState != null) {
          store.routerStore.callSaveListeners(extractId(prevState))
        }

        if (prevRoute.onDeactivate != null) {
          prevRoute.onDeactivate(store, prevParams, nextState)
        }

        store.routerStore.current = nextState

        if (nextRoute.onActivate != null) {
          nextRoute.onActivate(store, nextParams, (prevState || {} as any))
        }

        if (prevState != null && nextState.meta.id < prevState.meta.id) {
          store.routerStore.callRestoreListeners(extractId(nextState))
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
