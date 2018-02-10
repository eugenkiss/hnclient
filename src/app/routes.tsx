import * as React from 'react'
import {action} from 'mobx'
import {Route} from 'router5/create-router'
import {Store} from './store'
import {Feed} from './comps/feed'
import {StoryComp} from './comps/story'
import {About} from './comps/about'
import {FeedType} from './models/models'

const rs: Map<string, HNRoute> = new Map()

export type LinkData = {name: string, params?: object}

export interface HNRoute extends Route {
  globPath: string // For Firebase rewrite rules
  comp: (next?: any) => any
  onActivate?: (store: Store, next?: any, prev?: any) => void
  onDeactivate?: (store: Store, next?: any, prev?: any) => void
}

export class FeedRoute implements HNRoute {
  static id = 'feed'
  get name() { return FeedRoute.id }
  get path() { return '/?:kind' }
  globPath = '/'
  prevKind: FeedType
  @action onActivate(store: Store, {kind}) {
    kind = kind == null ? FeedType.Top : kind
    store.headerTitle = 'HN'
    // TODO: use minduration wrapper here!
    store.refreshAction = () => store.getFeedItemsManualRefreshRequest = store.getFeedItems.refresh(300)
    if (store.getFeedItems.unstarted || kind !== this.prevKind) {
      this.prevKind = kind
      const unstarted = store.getFeedItems.unstarted
      const req = store.getFeedItems.refresh()
      if (!unstarted) store.getFeedItemsManualRefreshRequest = req
    }
  }
  onDeactivate(store) {
    store.refreshAction = null
    store.getFeedItems.cancel()
  }
  // noinspection JSUnusedGlobalSymbols
  static link = (kind?: FeedType): LinkData => ({
    name: FeedRoute.id, params: {kind: kind}
  })
  comp() { return <Feed/> }
}
rs.set(FeedRoute.id, new FeedRoute())

export class StoryRoute implements HNRoute {
  static id = 'story'
  get name() { return StoryRoute.id }
  get path() { return '/story/:id' }
  globPath = '/story/*'
  onActivate(store, {id}) {
    store.window.scrollTo(null, 0)
    store.refreshAction = () => store.getStory.refresh(id)
    store.getStory.refresh(id)
  }
  onDeactivate(store, {id}) {
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
  onActivate(store) {
    store.headerTitle = 'About'
  }
  // noinspection JSUnusedGlobalSymbols
  static link = (): LinkData => ({name: AboutRoute.id})
  comp() { return <About/> }
}
rs.set(AboutRoute.id, new AboutRoute())

export const routesMap = rs
