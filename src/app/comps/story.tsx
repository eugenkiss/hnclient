import * as React from 'react'
import {Component} from 'react'
import {computed, observable, when} from 'mobx'
import {inject, observer} from 'mobx-react'
import {REJECTED} from 'mobx-utils'
import {css} from 'emotion'
import * as FontAwesome from '@fortawesome/react-fontawesome'
import {Store} from '../store'
import {Comment, Story} from '../models/story'
import {Box, Flex} from './basic'
import {faShareAlt} from '@fortawesome/fontawesome-free-solid'

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
  comments: '…'
}

@inject('store') @observer
class CommentComp extends Component<{
  store?: Store
  comment: Comment
}> {
  @observable collapsed = false

  render() {
    const { comment } = this.props
    return ([
      <Box
        key={comment.id}
        p={1}
        className={css`
        margin-left: ${comment.level}rem;
        background: white;
        border-bottom: 1px solid #eee;
      `}>
        <Flex
          f={1}
          className={css`
          color: #999;
        `}>
          <Box
            mr={1}
            onClick={() => this.collapsed = !this.collapsed}>
            {this.collapsed ? (
              <span>[+]</span>
            ) : (
              <span>[-]</span>
            )}
          </Box>
          <Box mr={1} fontWeight='bold'>
            <a href='#'>{comment.user}</a>
          </Box>
          <span className={css`
          `}>
            {comment.timeAgo}
          </span>
          <Box flex='1 1 auto'/>
          <Box onClick={() => alert('TODO')}>
            <FontAwesome icon={faShareAlt}/>
          </Box>
        </Flex>
        {!this.collapsed &&
          <Box
            mt={1} f={2}
            dangerouslySetInnerHTML={{__html: comment.content}}
            className={css`
            & a {
              text-decoration: underline;
              color: deepskyblue;
            }
            & a:visited {
              color: skyblue;
            }
            & p {
              margin-top: 0.5rem;
              word-break: break-word;
            }
            & pre {
              font-size: 0.85em;
              white-space: pre-wrap;
              margin-top: 0.5rem;
            }
          `}
          />
        }
      </Box>
      ,
      this.collapsed ? null : <CommentsComp comments={comment.comments}/>
    ])
  }
}

@inject('store') @observer
class CommentsComp extends Component<{
  store?: Store
  comments: Array<Comment>
}> {
  render() {
    const { comments } = this.props
    if (comments.length === 0) return null
    return (
      comments.map(c => <CommentComp comment={c}/>)
    )
  }
}

@inject('store') @observer
export class StoryComp extends Component<{
  store?: Store
  id: number
}> {

  disposers = []

  @computed get story(): Story {
    const { store, id } = this.props
    const req = store.getStory
    if (req.value(id) == null) {
      const stories = store.getStories.value
      if (stories != null) return stories.find(s => s.id === id)
    } else {
      return req.value(id)
    }
    return null
  }

  componentDidMount() {
    const { store } = this.props
    store.headerTitle = '…'
    this.disposers.push(when(() => this.story != null, () => {
      store.headerTitle = this.story.title
    }))
  }

  componentWillUnmount() {
    for (const disposer of this.disposers) disposer()
  }

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
      return (
        <Box>
          {false && this.renderHeader(this.story != null ? this.story.title : skeletonStory.title)}
          {req.state(id) === REJECTED ? (
            <div>Failed to load story!</div>
          ) : (
            <div>Loading story…</div>
          )}
        </Box>
      )
    } else {
      const story = req.value(id)
      return (
        <Box>
          {false && this.renderHeader(story.title)}
          <CommentsComp comments={story.comments}/>
        </Box>
      )
    }
  }

  render() {
    return (
      <Box className={css`
        overflow-y: auto;
        overflow-x: hidden;
        height: 100%;
        background: #eee;
      `}>
        {this.renderBody()}
      </Box>
    )
  }
}
