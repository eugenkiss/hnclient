import {action, autorun, computed, observable, runInAction} from 'mobx'
import {PENDING} from 'mobx-utils'
import * as NProgress from 'nprogress'
import {DoneFn, NavigationOptions, Route, Router} from 'router5'
import {makeRouter, RouterStore} from './router'
import * as routes from './routes'
import {LinkData} from './routes'
import {canUseDOM, fulfilledReq} from './utils/utils'
import {BaseStore} from './utils/base-store'
import {MapRequester, PageRequester} from './utils/req'
import {ApiClient} from './api/client'
import {FeedItem, FeedType, Story} from './models/models'

export class Store extends BaseStore {
  api = new ApiClient('https://hnpwa.com/api/v0')
  routerStore = new RouterStore()
  routesMap = routes.routesMap
  router: Router = null

  constructor() {
    super()
    const rs: Array<Route> = []
    this.routesMap.forEach(v => rs.push(v))
    this.router = makeRouter(rs, this)

    if ('scrollRestoration' in this.history) { this.history.scrollRestoration = 'manual' }

    this.window.addEventListener('resize', this.handleResize)
    this.handleResize()

    autorun(() => {
      if ( this.currentGetFeed.lastState === PENDING
        || this.getStory.lastState === PENDING
      ) {
        this.startProgress()
      } else {
        this.completeProgress()
      }
    })
  }

  @observable windowWidth = 1
  @observable windowHeight = 1
  @action handleResize = () => {
    this.windowHeight = this.window.innerHeight
    this.windowWidth = this.window.innerWidth
  }

  headerHeight = 48

  @observable headerTitle = null

  @observable refreshAction = null

  @observable scrollFeedToTop = false

  @computed get selectedFeedType() {
    if (this.routerStore.current == null) return null
    return this.routerStore.current.params.type
  }


  feedItemDb = observable.map<FeedItem>()
  @computed get currentListOfPages(): Array<[number, Array<FeedItem>]> {
    const pages = []
    for (const [page, items] of this.currentGetFeed.listOfPages) {
      const freshItems = []
      for (const item of items) {
        freshItems.push(this.feedItemDb.get(item.id.toString()))
      }
      pages.push([page, freshItems])
    }
    return pages
  }

  @observable getFeedManualRefreshRequest = fulfilledReq

  makeFeedRequester = (type: FeedType) => new PageRequester<FeedItem>(async (page: number) => {
    const items = await this.api.getFeedItems(type, page)
    runInAction(() => {
      for (const item of items) {
        const dbItem = this.feedItemDb.get(item.id.toString())
        if (dbItem != null && dbItem._createdAt > item._createdAt) continue
        this.feedItemDb.set(item.id.toString(), item)
      }
    })
    return items
  })

  getHotFeed = this.makeFeedRequester(FeedType.Top)
  getNewFeed = this.makeFeedRequester(FeedType.New)
  getShowFeed = this.makeFeedRequester(FeedType.Show)
  getAskFeed = this.makeFeedRequester(FeedType.Ask)
  getJobsFeed = this.makeFeedRequester(FeedType.Job)

  @computed get currentGetFeed() {
    switch (this.selectedFeedType) {
      case FeedType.New: return this.getNewFeed
      case FeedType.Show: return this.getShowFeed
      case FeedType.Ask: return this.getAskFeed
      case FeedType.Job: return this.getJobsFeed
      case FeedType.Top: return this.getHotFeed
      default: return this.getHotFeed
    }
  }

  getStory = new MapRequester<Number, Story>(async (id: number) => {
    const story = await this.api.getItem(id)
    const feedItem = this.feedItemDb.get(id.toString())
    if (feedItem != null && story._createdAt > feedItem._createdAt) {
      feedItem.updateFromStory(story)
    }
    return story
  })

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
