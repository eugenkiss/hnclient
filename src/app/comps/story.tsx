import * as React from 'react'
import {Component} from 'react'
import {inject, observer} from 'mobx-react'
import {REJECTED} from 'mobx-utils'
import {Store} from '../store'

@inject('store') @observer
export class Story extends Component<{
  store?: Store
  id: number
}> {

  renderBody() {
    const { store, id } = this.props
    const req = store.getStory
    if (req.value(id) == null) {
      // TODO: Use session store provided initial data
      if (req.state(id) === REJECTED) {
        return <div>Failed to load story!</div>
      } else {
        return <div>Loading story…</div>
      }
    } else {
      const story = req.value(id)
        return (
          <div>
            {story.title}
          </div>
        )
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
