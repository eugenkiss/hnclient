import * as React from 'react'
import {Home} from './comps/home'
import {uiStore} from './deps'
import {Story} from './comps/story'

const rs: Map<string, any> = new Map()

export type LinkData = {name: string, params?: object}

export class HomeRoute {
  static id = 'home'
  name = HomeRoute.id
  // noinspection JSUnusedGlobalSymbols
  path = '/'
  onActivate = () => !uiStore.lastGetStoriesValue && uiStore.getStories()
  static link = (): LinkData => ({name: HomeRoute.id})
  comp = () => <Home/>
}
rs.set(HomeRoute.id, new HomeRoute())

export class StoryRoute {
  static id = 'story'
  name = StoryRoute.id
  // noinspection JSUnusedGlobalSymbols
  path = '/story/:id'
  onActivate = ({id}) => uiStore.getStory(id)
  static link = (id): LinkData => ({
    name: StoryRoute.id, params: {id: id}
  })
  comp = ({id}) =>
    <Story id={id}/>
}
rs.set(StoryRoute.id, new StoryRoute())

export const routesMap = rs
