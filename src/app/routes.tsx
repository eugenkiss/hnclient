import * as React from 'react'
import {Route} from 'router5/create-router'
import {Store} from './store'
import {Home} from './comps/home'
import {StoryComp} from './comps/story'
import {About} from './comps/about'
import {StoriesKind} from './models/models'
import {Span} from './comps/basic'
import {css} from 'emotion'

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
  get path() { return '/?:kind' }
  globPath = '/'
  onActivate(store, {kind}) {
    kind = kind == null ? StoriesKind.Top : kind
    const subTitle = kind === StoriesKind.Top ? null : kind
    store.headerTitle =
      <Span
        key='HN'
        className={css`
        position: relative;
      `}>
        HN
        <Span
          key='Subtitle'
          f={0}
          className={css`
          text-transform: lowercase;
          margin-left: 0.1rem;
          position: absolute;
          bottom: 0.095rem;
        `}>
          {subTitle}
        </Span>
      </Span>
    store.refreshAction = () => store.getStoriesManualRefresh = store.getStories.refresh(300)
    if (store.getStories.unstarted || kind !== store.selectedStoriesKind) {
      store.selectedStoriesKind = kind
      const req = store.getStories.refresh()
      if (!store.getStories.unstarted) store.getStoriesManualRefresh = req
    }
  }
  onDeactivate(store) {
    store.refreshAction = null
    store.getStories.cancel()
  }
  // noinspection JSUnusedGlobalSymbols
  static link = (kind?: StoriesKind): LinkData => ({
    name: HomeRoute.id, params: {kind: kind}
  })
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
