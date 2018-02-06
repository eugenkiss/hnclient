import {autorun, computed, observable, runInAction} from 'mobx'
import {IPromiseBasedObservable, PENDING} from 'mobx-utils'
import * as NProgress from 'nprogress'
import {DoneFn, NavigationOptions, Route, Router} from 'router5'
import {makeRouter, RouterStore} from './router'
import * as routes from './routes'
import {LinkData} from './routes'
import {canUseDOM, fulfilledReq} from './utils/utils'
import {BaseStore} from './utils/base-store'
import {MapRequester, Requester} from './utils/req'
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

    autorun(() => {
      if ( this.getFeedItems.state === PENDING
        || this.getStory.lastState === PENDING
      ) {
        this.startProgress()
      } else {
        this.completeProgress()
      }
    })
  }

  @observable headerTitle = null

  refreshAction = null

  @computed get selectedFeedItemType() {
    if (this.routerStore.startNext == null) return null
    return this.routerStore.startNext.params.kind
  }


  @observable storyIds: Array<number> = []
  feedItemDb = observable.map<FeedItem>()
  @computed get feedItems(): Array<FeedItem> {
    const result = []
    for (const id of this.storyIds) {
      result.push(this.feedItemDb.get(id.toString()))
    }
    return result
  }

  getFeedItems = new Requester<Array<FeedItem>>(async () => {
    const stories = await this.api.getFeedItems(this.selectedFeedItemType || FeedType.Top)
    runInAction(() => {
      this.storyIds = stories.map(s => s.id)
      for (const story of stories) {
        this.feedItemDb.set(story.id.toString(), story)
      }
    })
    return stories
  })
  @observable getFeedItemsManualRefreshRequest: IPromiseBasedObservable<any> = fulfilledReq

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
