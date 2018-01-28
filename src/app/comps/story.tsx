import * as React from 'react'
import {Component} from 'react'
import {computed, observable, when} from 'mobx'
import {inject, observer} from 'mobx-react'
import {REJECTED} from 'mobx-utils'
import {css} from 'emotion'
import * as FontAwesome from '@fortawesome/react-fontawesome'
import {
  faArrowAltCircleUp,
  faComments,
  faCompress,
  faExpand,
  faShare,
  faSpinner
} from '@fortawesome/fontawesome-free-solid'
import {Store} from '../store'
import {Comment, Story, StringStory} from '../models/story'
import {A, Box, Flex, Span} from './basic'

const skeletonStory: StringStory = {
  id: '…',
  title: '…… … … ……… … ……… … … ……… …… ………… ………',
  points: '…',
  user: '……',
  time: '…',
  timeAgo: '… …… …',
  commentsCount: '…',
  type: '…',
  url: 'http://…',
  domain: '………',
  comments: '',
  externalUserLink: '',
  externalLink: '',
  asStringStory: '',
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
              <A href={comment.externalUserLink} mr={1} fontWeight='bold'>
                {comment.user}
              </A>
              <A href={comment.externalLink} mr={1} className={css`
              `}>
                {comment.timeAgo}
              </A>
              <Box
                p={1} m={-1}
                flex='1 1 auto'
                onClick={this.handleMinimzeClick}
                className={css`
                text-align: right;
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
                mt={1} mx={-1} px={1} mb={-1} pb={1}
                f={1}
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

@observer
class Header extends Component<{
  story: Story | StringStory
  readOnly?: boolean
}> {
  handleContainerClick = (e) => {
    if (!this.props.readOnly) return
    e.stopPropagation()
    e.nativeEvent.stopImmediatePropagation()
    e.preventDefault()
  }

  render() {
    const { story } = this.props
    return (
      <Flex
        flex='1 1 auto'
        p={1} pb={1} pt={1}
        onClickCapture={this.handleContainerClick}
        className={css`
        border-bottom: 1px solid rgba(0,0,0,0.05);
      `}>
        <Box pr={1}>
          <A
            href={story.url}
            className={css`
            font-weight: 600;
            &:visited {
              color: #777777;
            }
          `}>
            <Box f={2}>
              {story.title}
              {'\u00A0'}
              <Span f={1} color='#999' fontWeight='normal'>({story.domain})</Span>
            </Box>
          </A>
          <Flex mt={1} f={1} align='center' color='#999'>
            {story.points}
            {'\u00A0'}
            <FontAwesome icon={faArrowAltCircleUp}/>
            {'\u00A0'}
            |
            {'\u00A0'}
            by
            {'\u00A0'}
            <A fontWeight='bold' href={story.externalUserLink} target='_blank'>
              {story.user}
            </A>
            {'\u00A0'}
            {story.timeAgo}
            {'\u00A0'}
            |
            {'\u00A0'}
            {story.commentsCount}
            {'\u00A0'}
            <FontAwesome icon={faComments}/>
          </Flex>
        </Box>
        <Box flex='1 1 auto' pr={1}/>
        <A
          f={1} p={1} m={-1}
          color='#999'
          href={story.externalLink}
          target='_blank'
          className={css`
          width: 48px;
          border-left: 1px solid #eee;
          background: rgba(0,0,0,.01);
          display: flex;
          flex: 0 0 auto;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        `}>
          <FontAwesome icon={faShare} size='lg'/>
        </A>
      </Flex>
    )
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
    store.headerTitle = skeletonStory.title
    this.disposers.push(when(() => this.story != null, () => {
      store.headerTitle = this.story.title
    }))
  }

  componentWillUnmount() {
    this.mounted = false
    for (const disposer of this.disposers) disposer()
  }

  renderBody() {
    const { store, id } = this.props
    const req = store.getStory
    if (req.value(id) == null) {
      return (
        <Flex
          flexDirection='column'
          className={css`
            height: 100%;
          `}>
          <Box flex='0'>
            <Header
              story={this.story != null ? this.story : skeletonStory}
              readOnly={this.story == null}
            />
          </Box>
          <Flex
            flex='1'
            justify='center'
            align='center'
            f={4}
            className={css`
              color: #666;
          `}>
            {req.state(id) === REJECTED ? (
              <div>Failed to load story!</div>
            ) : (
              <FontAwesome icon={faSpinner} pulse/>
            )}
          </Flex>
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
          <Header story={story}/>
          <CommentsComp
            comments={story.comments}
            renderedCommentCount={this.renderedCommentCounter.get()}
            renderedCommentCounter={this.renderedCommentCounter}
          />
          <Box className={css`
            height: 100vh;
            width: 100%;
          `}/>
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
