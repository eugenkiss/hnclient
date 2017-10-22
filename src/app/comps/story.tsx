import * as React from 'react'
import {Component} from 'react'
import {observer} from 'mobx-react'
import {uiStore} from '../deps'
import {FULFILLED, PENDING, REJECTED} from 'mobx-utils'

@observer
export class Story extends Component<{
  id: string
}> {

  renderBody() {
    const req = uiStore.getStoryReq
    switch (req.state) {
      case PENDING: return <div>Loading stories…</div>
      case REJECTED: return <div>Failed to load stories!</div>
      case FULFILLED:
        const story = req.value
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
