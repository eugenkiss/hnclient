import * as React from 'react'
import {Component} from 'react'
import {autorun, computed, observable} from 'mobx'
import {inject, observer} from 'mobx-react'
import {REJECTED} from 'mobx-utils'
import {css} from 'emotion'
import * as FontAwesome from '@fortawesome/react-fontawesome'
import {
  faArrowAltCircleUp,
  faComments,
  faCompress,
  faExpand,
  faExternalLinkSquareAlt,
  faSpinner
} from '@fortawesome/fontawesome-free-solid'
import {Store} from '../store'
import {Comment, FeedItem, Item, Story, StringStory} from '../models/models'
import {A, Box, Flex, Space, Span} from './basic'

@observer
class ContentComp extends Component<{
  deleted: boolean
  content: string
  [key: string]: any
}> {
  render() {
    const { deleted, content, ...rest } = this.props
    return (
      <Box {...rest}>
        <base target='_blank'/>
        {deleted ? (
          <Span color='#999'>[deleted]</Span>
        ) : (
          <Box
            dangerouslySetInnerHTML={{__html: content}}
            className={css`
            &>* {
              margin-top: 0.5rem;
            }
            & a {
              text-decoration: underline;
              color: deepskyblue;
              word-break: break-all;
            }
            & a:visited {
              color: skyblue;
            }
            & p {
              word-break: break-word;
            }
            & pre {
              font-size: 0.85em;
              white-space: pre-wrap;
            }
          `}/>
        )}
      </Box>
    )
  }
}

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
  //asStringStory: '',
} as any

@observer // Mainly for performance reasons due to timeAgo
class CommentHeaderComp extends Component<{
  comment: Comment
  minimized: boolean
  onMinimize: (...args: any[]) => void
}> {
  render() {
    const { comment, minimized, onMinimize } = this.props
    return (
      <Flex
        f={1}
        className={css`
        color: #999;
      `}>
        <A
          mr={1}
          fontWeight='bold'
          href={comment.externalUserLink}
          title={`HN User: ${comment.user}`}
          >
          {comment.deleted ? '[deleted]' : comment.user}
        </A>
        <A
          mr={1}
          href={comment.externalLink}
          title={`HN 💬 ${comment.user}: ${comment.excerpt}`}
          className={css`
        `}>
          {comment.timeAgo}
        </A>
        {minimized && <Span>……</Span>}
        <Box
          p={1} m={-1}
          flex='1 1 auto'
          onClick={onMinimize}
          className={css`
          text-align: right;
          color: #ddd;
        `}>
          <FontAwesome
            size={!minimized ? 'xs' : undefined}
            icon={minimized ? faExpand : faCompress}
          />
        </Box>
      </Flex>
    )
  }
}

@observer
class CommentComp extends Component<{
  store?: Store
  firstChild: boolean
  level: number
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
    const { firstChild, level, comment, renderedCommentCounter } = this.props
    const comments = comment.comments == null ? [] : comment.comments
    if (renderedCommentCounter.get() <= 0) return null
    renderedCommentCounter.dec()
    // TODO: Once Inferno supports Fragment, use it
    return (<div>
      <Flex flex='1' className={css`
      `}>
        <Box
          flex={`0 0 ${level === 0 ? '0' : '10'}px`}
          className={css`
          border-right: ${level === 0 ? 'none' : '1px solid #eee'};
        `}/>
        <Box flex='1' className={css`
          overflow: hidden; // Important!
        `}>
          <Box
            key={comment.id}
            p={1} pt={firstChild && level > 0 ? 0 : 1}
            className={css`
            background: white;
          `}>
            <CommentHeaderComp
              comment={comment}
              minimized={this.minimized}
              onMinimize={this.handleMinimzeClick}
            />
            {!this.minimized &&
              <ContentComp
                mt={1} f={2}
                deleted={comment.deleted}
                content={comment.content}
              />
            }
            {comments.length > 0 && !this.minimized &&
              <Box
                mt={1} ml={!this.collapsedChildren ? '-11px' : -1} px={1} mb={-1} pb={1}
                f={1}
                onClick={this.handleCollapseClick}
                className={css`
                color: #ddd;
              `}>
                <FontAwesome
                  size={!this.collapsedChildren ? 'xs' : undefined}
                  icon={this.collapsedChildren ? faExpand : faCompress}
                />
                {this.collapsedChildren && <Span ml={1}>……</Span>}
              </Box>
            }
          </Box>
          {this.collapsedChildren || this.minimized ? null :
            <CommentsComp
              level={level + 1}
              comments={comments}
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

@observer
class CommentsComp extends Component<{
  store?: Store
  level: number
  renderedCommentCount: number
  renderedCommentCounter: Counter
  comments: Array<Comment>
}> {
  render() {
    const { level, comments, renderedCommentCounter } = this.props
    if (comments == null) return null
    // TODO: Once Inferno supports Fragment, use it
    return (<div>
      {comments.map((c, i) =>
        <CommentComp
          key={c.id}
          firstChild={i === 0}
          level={level}
          comment={c}
          renderedCommentCount={renderedCommentCounter.get()}
          renderedCommentCounter={renderedCommentCounter}
        />)}
    </div>)
  }
}

@observer
class Header extends Component<{
  story: Story | StringStory | FeedItem
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
    return (<div>
      <Box key={1}
        p={1} pb={2} pt={1}
        onClickCapture={this.handleContainerClick}
        className={css`
        border-bottom: 1px solid rgba(0,0,0,0.05);
      `}>
        <Flex
          flex='1 1 auto'
          >
          <Box pr={1}>
            <A
              href={story.url}
              title={story.title}
              className={css`
              font-weight: 600;
            `}>
              <Box f={2}>
                {story.title}
                <Space/>
                {story.domain != null &&
                  <Span f={1} color='#999' fontWeight='normal'>({story.domain})</Span>
                }
              </Box>
            </A>
            <Flex mt={1} f={0} align='center' color='#999'>
              {story.points != null &&
                <Span>
                  {story.points}
                  <Space/>
                  <FontAwesome icon={faArrowAltCircleUp}/>
                </Span>
              }
              {story.points != null && story.user != null &&
                <Span>
                  <Space/>|<Space/>
                </Span>
              }
              {story.user != null &&
                <Span>
                  by<Space/>
                  <A
                    fontWeight='bold'
                    target='_blank'
                    title={`HN User: ${story.user}`}
                    href={story.externalUserLink}
                    >
                    {story.user}
                  </A>
                  <Space/>
                </Span>
              }
              {story.timeAgo}
              {story.commentsCount > 0 &&
                <Span>
                  <Space/>|<Space/>
                  {story.commentsCount}
                  <Space/>
                  <FontAwesome icon={faComments}/>
                </Span>
              }
            </Flex>
          </Box>
          <Box flex='1 1 auto' pr={1}/>
          <A
            f={2} p={1} m={-1} pb={2} mb={-2}
            color='#999'
            href={story.externalLink}
            title={story.title}
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
            <FontAwesome icon={faExternalLinkSquareAlt} size='lg'/>
          </A>
        </Flex>
      </Box>
      {story instanceof Item && story.content != null && story.content.length > 0 &&
        <ContentComp
          key={2}
          p={1} pb={2} pt={1}
          f={2}
          deleted={story.deleted === true}
          content={story.content}
          className={css`
          border-bottom: 1px solid rgba(0,0,0,0.05);
        `}/>
      }
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
    return store.getStory.valueOrRefresh(id)
  }

  @computed get feedItem(): FeedItem {
    const { store, id } = this.props
    return store.feedItemDb.get(id.toString())
  }

  componentDidMount() {
    this.mounted = true
    this.toRenderCommentsLength = 4
    this.renderedCommentCounter.frozen = false
    this.renderedCommentCounter.set(this.toRenderCommentsLength)

    const { store } = this.props
    store.headerTitle = skeletonStory.title
    this.disposers.push(autorun(() => {
      if (this.story != null) {
        store.headerTitle = this.story.title
      } else if (this.feedItem != null) {
        store.headerTitle = this.feedItem.title
      }
    }))
  }

  componentWillUnmount() {
    this.mounted = false
    for (const disposer of this.disposers) disposer()
  }

  renderBody() {
    const { store, id } = this.props
    if (this.story == null) {
      return (
        <Flex
          flexDirection='column'
          className={css`
            height: 100%;
          `}>
          <Box flex='0'>
            <Header
              story={this.feedItem != null ? this.feedItem : skeletonStory}
              readOnly={this.feedItem == null}
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
            {store.getStory.state(id) === REJECTED ? (
              <div>Failed to load story!</div>
            ) : (
              <FontAwesome icon={faSpinner} pulse/>
            )}
          </Flex>
        </Flex>
      )
    } else {
      if (this.toRenderCommentsLength < this.story.commentsCount) {
        setTimeout(this.handleIncreaseRenderCommentsLength)
      } else {
        this.renderedCommentCounter.frozen = true
      }

      return (
        <Flex
          flexDirection='column'
          className={css`
          height: 100%;
        `}>
          <Header story={this.story}/>
            <Box>
              {this.story.commentsCount > 0 ? (
                <CommentsComp
                  level={0}
                  comments={this.story.comments}
                  renderedCommentCount={this.renderedCommentCounter.get()}
                  renderedCommentCounter={this.renderedCommentCounter}
                />
              ) : (
                <Box p={1} f={1}>
                  No comments
                </Box>
              )}
              <Box mt={1} className={css`
                height: ${store.windowHeight - store.headerHeight}px;
                width: 100%;
                background: repeating-linear-gradient(
                  -45deg,
                  #fafafa,
                  #fafafa 5px,
                  #fff 5px,
                  #fff 10px
                );
              `}/>
            </Box>
        </Flex>
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
