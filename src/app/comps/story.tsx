import * as React from 'react'
import {Component} from 'react'
import {computed, observable, when} from 'mobx'
import {inject, observer} from 'mobx-react'
import {REJECTED} from 'mobx-utils'
import {css} from 'emotion'
import * as FontAwesome from '@fortawesome/react-fontawesome'
import {faCompress, faExpand, faSpinner} from '@fortawesome/fontawesome-free-solid'
import {Store} from '../store'
import {Comment, Story} from '../models/story'
import {A, Box, Flex} from './basic'

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

@observer
class CommentComp extends Component<{
  store?: Store
  renderedCommentCount: number
  renderedCommentCounter: Counter
  comment: Comment
}> {
  @observable minimized = false
  @observable collapsedChildren = false

  handleMinimzeClick = (e) => {
    this.minimized = !this.minimized
    e.stopPropagation()
  }

  handleCollapseClick = (e) => {
    this.collapsedChildren = !this.collapsedChildren
    e.stopPropagation()
  }

  render() {
    const { comment, renderedCommentCounter } = this.props
    if (renderedCommentCounter.get() <= 0) return null
    renderedCommentCounter.dec()
    // TODO: Once Inferno supports Fragment, use it
    return (<div>
      <Flex flex='1' className={css`
      `}>
        <Box
          flex={`0 0 ${comment.level === 0 ? '0' : '1'}rem`}
          className={css`
          background: #eee;
        `}/>
        <Box flex='1'>
          <Box
            key={comment.id}
            p={1}
            className={css`
            background: white;
            border-bottom: 1px solid #eee;
          `}>
            <Flex
              f={1}
              className={css`
              color: #999;
            `}>
              <A href={comment.externalUserLink} target='_blank' mr={1} fontWeight='bold'>
                {comment.user}
              </A>
              <A href={comment.externalLink} target='_blank' className={css`
              `}>
                {comment.timeAgo}
              </A>
              <Box flex='1 1 auto'/>
              <Box
                mr={1}
                onClick={this.handleMinimzeClick}
                className={css`
                color: #ddd;
              `}>
                {this.minimized ? (
                  <FontAwesome icon={faExpand}/>
                ) : (
                  <FontAwesome icon={faCompress}/>
                )}
              </Box>
            </Flex>
            {!this.minimized &&
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
            {comment.comments.length > 0 && !this.minimized &&
              <Box
                mt={1} f={1}
                onClick={this.handleCollapseClick}
                className={css`
                color: #ddd;
              `}>
                {this.collapsedChildren ? (
                  <FontAwesome icon={faExpand}/>
                ) : (
                  <FontAwesome icon={faCompress}/>
                )}
              </Box>
            }
          </Box>
          {this.collapsedChildren || this.minimized ? null :
            <CommentsComp
              comments={comment.comments}
              renderedCommentCount={renderedCommentCounter.get()}
              renderedCommentCounter={renderedCommentCounter}
            />
          }
        </Box>
      </Flex>
    </div>)
  }
}

class Counter {
  private x = 0
  frozen = false
  constructor(x: number) {
    this.x = x
  }
  get() { return this.x }
  set(x: number) { if (this.frozen) return; this.x = x}
  dec() { if (this.frozen) return; this.x-- }
}

class CommentsComp extends Component<{
  store?: Store
  renderedCommentCount: number
  renderedCommentCounter: Counter
  comments: Array<Comment>
}> {
  render() {
    const { comments, renderedCommentCounter } = this.props
    // TODO: Once Inferno supports Fragment, use it
    return (<div>
      {comments.map(c =>
        <CommentComp
          key={c.id}
          comment={c}
          renderedCommentCount={renderedCommentCounter.get()}
          renderedCommentCounter={renderedCommentCounter}
        />)}
    </div>)
  }
}

@inject('store') @observer
export class StoryComp extends Component<{
  store?: Store
  id: number
}> {
  // Poor man's React Fibers to decrease transition time to this component (latency, faster initial render)
  mounted = true
  toRenderCommentsLength = 4
  renderedCommentCounter = new Counter(this.toRenderCommentsLength)
  handleIncreaseRenderCommentsLength = () => {
    if (!this.mounted) return
    // https://stackoverflow.com/a/34999925/283607
    requestAnimationFrame(() => {
      if (!this.mounted) return
      this.toRenderCommentsLength += this.toRenderCommentsLength
      this.renderedCommentCounter.set(this.toRenderCommentsLength)
      this.forceUpdate()
    })
  }

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
    this.mounted = true
    this.toRenderCommentsLength = 4
    this.renderedCommentCounter.frozen = false
    this.renderedCommentCounter.set(this.toRenderCommentsLength)

    const { store } = this.props
    store.headerTitle = '…'
    this.disposers.push(when(() => this.story != null, () => {
      store.headerTitle = this.story.title
    }))
  }

  componentWillUnmount() {
    this.mounted = false
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
        <Flex
          justify='center'
          align='center'
          f={4}
          className={css`
            height: 100%;
            color: #666;
        `}>
          {false && this.renderHeader(this.story != null ? this.story.title : skeletonStory.title)}
          {req.state(id) === REJECTED ? (
            <div>Failed to load story!</div>
          ) : (
            <FontAwesome icon={faSpinner} pulse/>
          )}
        </Flex>
      )
    } else {
      const story = req.value(id)

      if (this.toRenderCommentsLength < story.commentsCount) {
        setTimeout(this.handleIncreaseRenderCommentsLength)
      } else {
        this.renderedCommentCounter.frozen = true
      }

      return (
        <Box>
          {false && this.renderHeader(story.title)}
          <CommentsComp
            comments={story.comments}
            renderedCommentCount={this.renderedCommentCounter.get()}
            renderedCommentCounter={this.renderedCommentCounter}
          />
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
        width: 100%;
        background: white;
      `}>
        {this.renderBody()}
      </Box>
    )
  }
}
