import {autorun, observable} from 'mobx'
import {IPromiseBasedObservable, PENDING} from 'mobx-utils'
import * as NProgress from 'nprogress'
import {ApiClient} from './api/client'
import {makeRouter, RouterStore} from './router'
import {Story} from './models/story'
import {canUseDOM, fulfilledReq} from './utils'
import {MapReq, Requester} from './utils/req'
import {Route} from "router5"
import * as routes from './routes'
import {Router} from 'router5/create-router'

export class Store {

  api = new ApiClient('https://api.hackerwebapp.com')
  routerStore = new RouterStore()
  routesMap = routes.routesMap
  router: Router = null

  constructor() {
    const rs: Array<Route> = []
    this.routesMap.forEach(v => rs.push(v))
    this.router = makeRouter(rs, this)

    if (!canUseDOM) return

    if ('scrollRestoration' in history) { history.scrollRestoration = 'manual' }

    this.routerStore.restoreUiStates()
    window.addEventListener('unload', () => {
      this.routerStore.persistUiStates()
    })

    autorun(() => {
      if ( this.getStories.state === PENDING
        || this.getStory.lastState === PENDING
      ) {
        NProgress.start()
      } else {
        NProgress.done()
      }
    })
  }

  getStories = new Requester<Array<Story>>(() => this.api.getStories())
  @observable getStoriesManualRefresh: IPromiseBasedObservable<Array<Story>> = fulfilledReq

  getStory = new MapReq<Number, Story>((id: number) => this.api.getStory(id))
}
