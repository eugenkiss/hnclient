import * as React from 'react'
import {Home} from './comps/home'
import {StoryComp} from './comps/story'
import {Route} from 'router5/create-router'
import {Store} from './store'

const rs: Map<string, HNRoute> = new Map()

export type LinkData = {name: string, params?: object}

export interface HNRoute extends Route {
  globPath: string // For Firebase rewrite rules
  comp: (next?: any) => any
  onActivate?: (store: Store, next?: any, prev?: any) => void
  onDeactivate?: (store: Store, next?: any, prev?: any) => void
}

export class HomeRoute implements HNRoute {
  static id = 'home'
  get name() { return HomeRoute.id }
  get path() { return '/' }
  globPath = '/'
  onActivate(store) {
    if (store.getStories.unstarted) store.getStories.refresh()
  }
  onDeactivate(store) {
    store.getStories.cancel()
  }
  // noinspection JSUnusedGlobalSymbols
  static link = (): LinkData => ({name: HomeRoute.id})
  comp() { return <Home/> }
}
rs.set(HomeRoute.id, new HomeRoute())

export class StoryRoute implements HNRoute {
  static id = 'story'
  get name() { return StoryRoute.id }
  get path() { return '/story/:id' }
  globPath = '/story/*'
  onActivate(store, {id}) {
    store.window.scrollTo(null, 0)
    store.getStory.refresh(id)
  }
  onDeactivate(store, {id}) {
    store.getStory.cancel(id)
  }
  static link = (id): LinkData => ({
    name: StoryRoute.id, params: {id: id}
  })
  comp({id}) { return <StoryComp id={id}/> }
}
rs.set(StoryRoute.id, new StoryRoute())

export const routesMap = rs
