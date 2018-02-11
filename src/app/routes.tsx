import * as React from 'react'
import {action} from 'mobx'
import {Params, Route, State} from 'router5/create-router'
import {Store} from './store'
import {Feed} from './comps/feed'
import {StoryComp} from './comps/story'
import {About} from './comps/about'
import {FeedType} from './models/models'
import {minDuration} from './utils/utils'

const rs: Map<string, HNRoute> = new Map()

export type LinkData = {name: string, params?: object}

export interface HNRoute extends Route {
  globPath: string // For Firebase rewrite rules
  comp: (next?: any) => any
  onActivate?: (store: Store, current?: Params, prev?: State) => void
  onDeactivate?: (store: Store, current?: Params, next?: State) => void
}

export class FeedRoute implements HNRoute {
  static id = 'feed'
  get name() { return FeedRoute.id }
  get path() { return '/?:type' }
  globPath = '/'
  @action onActivate(store: Store, _, prev) {
    store.headerTitle = 'HN'
    if (prev.name === this.name && new Date().getTime() - store.currentGetFeed.timestamp > 1000 * 60 * 5) {
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
  comp() { return <Feed/> }
}
rs.set(FeedRoute.id, new FeedRoute())

export class StoryRoute implements HNRoute {
  static id = 'story'
  get name() { return StoryRoute.id }
  get path() { return '/story/:id' }
  globPath = '/story/*'
  onActivate(store: Store, {id}) {
    store.window.scrollTo(null, 0)
    store.refreshAction = () => store.getStory.refresh(id)
    store.getStory.refresh(id)
  }
  onDeactivate(store: Store, {id}) {
    store.refreshAction = null
    store.getStory.cancel(id)
  }
  static link = (id): LinkData => ({
    name: StoryRoute.id, params: {id: id}
  })
  comp({id}) { return <StoryComp id={id}/> }
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
  comp() { return <About/> }
}
rs.set(AboutRoute.id, new AboutRoute())

export const routesMap = rs
