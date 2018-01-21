import * as React from 'react'
import {Home} from './comps/home'
import {Story} from './comps/story'
import {Route} from 'router5/create-router'
import {Store} from './store'

const rs: Map<string, HNRoute> = new Map()

export type LinkData = {name: string, params?: object}

export interface HNRoute extends Route {
  globPath: string // For Firebase rewrite rules
  comp: (next?: any) => any
  onActivate?: (store: Store, next?: any, prev?: any) => void
}

export class HomeRoute implements HNRoute {
  static id = 'home'
  get name() { return HomeRoute.id }
  get path() { return '/' }
  globPath = '/'
  onActivate(store) { store.getStories.refresh() }
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
  onActivate(store, {id}) { store.getStory.refresh(id) }
  static link = (id): LinkData => ({
    name: StoryRoute.id, params: {id: id}
  })
  comp({id}) { return <Story id={id}/> }
}
rs.set(StoryRoute.id, new StoryRoute())

export const routesMap = rs
