import {autorun, observable} from 'mobx'
import {IPromiseBasedObservable, PENDING} from 'mobx-utils'
import * as NProgress from 'nprogress'
import {DoneFn, NavigationOptions, Route, Router} from 'router5'
import {makeRouter, RouterStore} from './router'
import * as routes from './routes'
import {LinkData} from './routes'
import {canUseDOM, fulfilledReq} from './utils'
import {BaseStore} from './utils/base-store'
import {MapReq, Requester} from './utils/req'
import {ApiClient} from './api/client'
import {Story} from './models/story'

export class Store extends BaseStore {
  api = new ApiClient('https://api.hackerwebapp.com')
  routerStore = new RouterStore()
  routesMap = routes.routesMap
  router: Router = null

  constructor() {
    super()
    const rs: Array<Route> = []
    this.routesMap.forEach(v => rs.push(v))
    this.router = makeRouter(rs, this)

    if ('scrollRestoration' in this.history) { this.history.scrollRestoration = 'manual' }

    this.routerStore.restoreUiStates()
    this.window.addEventListener('unload', () => {
      this.routerStore.persistUiStates()
    })

    autorun(() => {
      if ( this.getStories.state === PENDING
        || this.getStory.lastState === PENDING
      ) {
        this.startProgress()
      } else {
        this.completeProgress()
      }
    })
  }

  @observable headerTitle = null

  getStories = new Requester<Array<Story>>(() => this.api.getStories())
  @observable getStoriesManualRefresh: IPromiseBasedObservable<Array<Story>> = fulfilledReq

  getStory = new MapReq<Number, Story>((id: number) => this.api.getStoryWithComments(id))

  refreshAction = null

  navigate = (linkData: LinkData, options?: NavigationOptions, done?: DoneFn) => {
    const {name, params} = linkData
    this.router.navigate(name, params, options, done)
  }

  startProgress = () => {
    if (!canUseDOM) return
    NProgress.start()
  }

  completeProgress = () => {
    if (!canUseDOM) return
    NProgress.done()
  }
}
