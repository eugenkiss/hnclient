import * as React from 'react'
import {action, when} from 'mobx'
import {Params, Route, State} from 'router5/create-router'
import {Store} from './store'
import {FeedScreen} from './comps/feed'
import {skeletonStory, StoryScreen} from './comps/story'
import {AboutScreen} from './comps/about'
import {FeedType} from './models/models'
import {getNow, minDuration} from './utils/utils'

const rs: Map<string, HNRoute> = new Map()

export type LinkData = {name: string, params?: object}

export interface HNRoute extends Route {
  globPath: string // For Firebase rewrite rules
  comp: (key: number, active: boolean, next?: Params) => any
  onActivate?: (store: Store, fromStack: boolean, current?: Params, prev?: State) => void
  onDeactivate?: (store: Store, current?: Params, next?: State) => void
}

export class FeedRoute implements HNRoute {
  static id = 'feed'
  get name() { return FeedRoute.id }
  get path() { return '/?:type' }
  globPath = '/'
  @action onActivate(store: Store, _, __, prev) {
    store.headerTitle = 'HN'
    if (prev.name === this.name && getNow() - store.currentGetFeed.timestamp > 1000 * 60 * 5) {
      // If user switches tabs after a while he wants to see new stuff
      store.currentGetFeed.clearCache()
    }
    if (store.currentGetFeed.listOfPages.length === 0) {
      store.currentGetFeed.refresh(1, minDuration(1000))
    }
    store.refreshAction = async () => {
      store.getFeedManualRefreshRequest = store.currentGetFeed.hardRefresh(1, minDuration(500))
      await store.getFeedManualRefreshRequest
      store.scrollFeedToTop = true
    }
  }
  onDeactivate(store: Store) {
    store.refreshAction = null
  }
  // noinspection JSUnusedGlobalSymbols
  static link = (type?: FeedType): LinkData => ({
    name: FeedRoute.id, params: {type: type}
  })
  comp(key, active) {
    return <FeedScreen key={key} active={active}/>
  }
}
rs.set(FeedRoute.id, new FeedRoute())

export class StoryRoute implements HNRoute {
  static id = 'story'
  get name() { return StoryRoute.id }
  get path() { return '/story/:id' }
  globPath = '/story/*'
  disposers = new Map<number, Array<() => void>>()
  @action onActivate(store: Store, fromStack, {id}) {
    store.window.scrollTo(null, 0)
    store.refreshAction = () => store.getStory.refresh(id)
    if (!fromStack) store.getStory.refresh(id)

    if (this.disposers.get(id) == null) this.disposers.set(id, [])
    store.headerTitle = skeletonStory.title
    const feedItem = store.feedItemDb.get(id.toString())
    if (feedItem != null) store.headerTitle = feedItem.title
    this.disposers.get(id).push(when(() => store.getStory.value(id) != null, () => {
      store.headerTitle = store.getStory.value(id).title
    }))
  }
  onDeactivate(store: Store, {id}) {
    store.refreshAction = null
    store.getStory.cancel(id)
    for (const disposer of this.disposers.get(id)) disposer()
  }
  static link = (id): LinkData => ({
    name: StoryRoute.id, params: {id: id}
  })
  comp(key, active, params) {
    return <StoryScreen key={key} active={active} id={params.id}/>
  }
}
rs.set(StoryRoute.id, new StoryRoute())

export class AboutRoute implements HNRoute {
  static id = 'about'
  get name() { return AboutRoute.id }
  get path() { return '/about' }
  globPath = '/about'
  onActivate(store: Store) {
    store.headerTitle = 'About'
  }
  // noinspection JSUnusedGlobalSymbols
  static link = (): LinkData => ({name: AboutRoute.id})
  comp(key, active) { return <AboutScreen key={key}/> }
}
rs.set(AboutRoute.id, new AboutRoute())

export const routesMap = rs
