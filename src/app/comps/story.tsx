import * as React from 'react'
import {Component} from 'react'
import {inject, observer} from 'mobx-react'
import {REJECTED} from 'mobx-utils'
import {Store} from '../store'
import {Story} from '../models/story'

type StringStory = {[P in keyof Story]: string}

const skeletonStory: StringStory = {
  id: '…',
  title: '………',
  points: '…',
  user: '…',
  time: '…',
  timeAgo: '…',
  commentsCount: '…',
  type: '…',
  url: 'http://…',
  domain: '…',
}

// TODO: story to stringstory / presentstory

@inject('store') @observer
export class StoryComp extends Component<{
  store?: Store
  id: number
}> {

  renderHeader(title: string) {
    return (
      <div>
        {title}
      </div>
    )
  }

  renderBody() {
    const { store, id } = this.props
    const req = store.getStory
    if (req.value(id) == null) {
      const stories = store.getStories.value
      const story = stories != null && stories.find(s => s.id === id)
      return (
        <div>
          {this.renderHeader(story != null ? story.title : skeletonStory.title)}
          {req.state(id) === REJECTED ? (
            <div>Failed to load story!</div>
          ) : (
            <div>Loading story…</div>
          )}
        </div>
      )
    } else {
      const story = req.value(id)
      return this.renderHeader(story.title)
    }
  }

  render() {
    return (
      <div>
        {this.renderBody()}
      </div>
    )
  }
}
