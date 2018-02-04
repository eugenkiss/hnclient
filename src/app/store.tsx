import {autorun, computed, observable} from 'mobx'
import {IPromiseBasedObservable, PENDING} from 'mobx-utils'
import * as NProgress from 'nprogress'
import {DoneFn, NavigationOptions, Route, Router} from 'router5'
import {makeRouter, RouterStore} from './router'
import * as routes from './routes'
import {LinkData} from './routes'
import {canUseDOM, fulfilledReq} from './utils/utils'
import {BaseStore} from './utils/base-store'
import {MapReq, Requester} from './utils/req'
import {ApiClient} from './api/client'
import {StoriesKind, Story} from './models/models'

export class Store extends BaseStore {
  api = new ApiClient('https://hacker-news.firebaseio.com/v0')
  routerStore = new RouterStore()
  routesMap = routes.routesMap
  router: Router = null

  constructor() {
    super()
    const rs: Array<Route> = []
    this.routesMap.forEach(v => rs.push(v))
    this.router = makeRouter(rs, this)

    if ('scrollRestoration' in this.history) { this.history.scrollRestoration = 'manual' }

    //this.routerStore.restoreUiStates()
    // this.window.addEventListener('unload', () => {
    //   this.routerStore.persistUiStates()
    // })

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

  getStories = new Requester<Array<Story>>(() => this.api.getStories(this.selectedStoriesKind))
  @computed get selectedStoriesKind() {
    const defaultKind = StoriesKind.Top
    if (this.routerStore.startNext == null) return defaultKind
    return this.routerStore.startNext.params.kind || defaultKind
  }
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
