import * as React from 'react'
import {Component} from 'react'
import {observable} from 'mobx'
import {inject, observer} from 'mobx-react'
import {PENDING, REJECTED, whenAsync} from 'mobx-utils'
import {css} from 'emotion'
import * as FontAwesome from '@fortawesome/react-fontawesome'
import {faComments} from '@fortawesome/fontawesome-free-solid'
import {FeedRoute, StoryRoute} from '../routes'
import {A, Box, Flex, Span} from './basic'
import {Link} from './link'
import {FeedItem, FeedType} from '../models/models'
import {Store} from '../store'

@inject('store')
class TabEntry extends React.Component<{
  store?: Store
  active: boolean
  title: string
  onClick: () => void
}> {
  render() {
    const { active, title, onClick } = this.props
    return (
      <Flex
        onClick={onClick}
        flex='1'
        justify='center'
        className={css`
        position: relative;
        height: 100%;
        user-select: none;
        cursor: pointer;
      `}>
        <Flex
          onClick={onClick}
          mx={1} f={2}
          justify='center'
          align='center'
          className={css`
        `}>
          {title}
        </Flex>
        <Box
          className={css`
          opacity: ${active ? '1' : '0'};
          position: absolute;
          bottom: 0;
          width: 100%;
          height: 4px;
          background: rgba(255, 255, 255, 0.6);
        `}/>
      </Flex>
    )
  }
}

@inject('store') @observer
export class Tabbar extends Component<{
  store?: Store
}> {
  handleFeedType = (kind?: FeedType) => () => {
    this.props.store.navigate(FeedRoute.link(kind), {replace: true})
  }

  render() {
    const {store} = this.props
    const {selectedFeedType} = store
    return (
      <Flex align='center' className={css`
        top: 0;
        background: rgb(210,100,0);
        font-size: 20px;
        align-items: center;
        color: white;
        height: 42px;
      `}>
        <TabEntry
          title='Hot'
          active={selectedFeedType == null || selectedFeedType === FeedType.Top}
          onClick={this.handleFeedType()}
        />
        <TabEntry
          title='New'
          active={selectedFeedType === FeedType.New}
          onClick={this.handleFeedType(FeedType.New)}
        />
        <TabEntry
          title='Show'
          active={selectedFeedType === FeedType.Show}
          onClick={this.handleFeedType(FeedType.Show)}
        />
        <TabEntry
          title='Ask'
          active={selectedFeedType === FeedType.Ask}
          onClick={this.handleFeedType(FeedType.Ask)}
        />
        <TabEntry
          title='Jobs'
          active={selectedFeedType === FeedType.Job}
          onClick={this.handleFeedType(FeedType.Job)}
        />
      </Flex>
    )
  }
}

@observer
export class FeedItemComp extends Component<{
  story: FeedItem
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
        p={1} pb={2}
        onClickCapture={this.handleContainerClick}
        className={css`
      `}>
        <Box pr={1}>
          <A
            href={story.url}
            title={story.title}
            className={css`
            font-weight: 600;
          `}>
            <Box f={2}>
              {story.title}
            </Box>
          </A>
          <Flex mt={1} f={0} align='center' color='#999'>
            {story.points != null ? story.points : '…'} points
            {story.domain &&
              <Span>
                {'\u00A0'}
                |
                {'\u00A0'}
                {story.domain === 'cool.com' ? '……….…' : story.domain}
              </Span>
            }
          </Flex>
        </Box>
        <Box flex='1 1 auto' pr={1}/>
        <Link
          f={1} p={1} m={-1} pb={2} mb={-2}
          color='#999'
          link={StoryRoute.link(story.id)}
          title={`HN: ${story.title}`}
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
          <FontAwesome icon={faComments} size='lg'/>
          <Span mt={'0.2rem'}>{story.commentsCount != null ? story.commentsCount : '…'}</Span>
        </Link>
      </Flex>
    )
  }
}

const skeletonFeedItems = []
for (let i = 0; i < 30; i++) {
  const item = new FeedItem()
  item.id = i
  item.title = '…… … … ……… … ……… … … ……… …… ………… ………'
  item.domain = '………'
  skeletonFeedItems.push(item)
}

type ViewRestoreData = { scrollTop: number, dataTimeStamp: number }

@inject('store') @observer
export class Feed extends Component<{store?: Store}> {
  static ID = 'Feed'

  saveUiCb
  restoreUiCb

  @observable containerNode = null

  componentDidMount() {
    const {store} = this.props
    const {routerStore} = store
    this.saveUiCb = routerStore.addSaveUiCb(() => {
      return { id: Feed.ID, data: {
        scrollTop: this.containerNode.scrollTop,
        dataTimeStamp: store.getFeedItems.timestamp,
      } as ViewRestoreData}
    })
    this.restoreUiCb = routerStore.addRestoreUiCb(Feed.ID, async (data?: ViewRestoreData) => {
      await whenAsync(() => store.getFeedItems.state !== PENDING && this.containerNode != null)
      if (data == null || data.dataTimeStamp !== store.getFeedItems.timestamp) {
        if (this.containerNode != null) { // How can this happen?
          this.containerNode.scrollTop = 0
        }
        return
      }
      if (store.getFeedItems.value != null) {
        this.containerNode.scrollTop = data.scrollTop
      }
    })
  }

  componentWillUnmount() {
    const {routerStore} = this.props.store
    routerStore.delSaveUiCb(this.saveUiCb)
    routerStore.delRestoreUiCb(this.restoreUiCb)
  }

  renderBody() {
    const {store} = this.props
    const req = store.getFeedItems
    if (req.value == null) {
      switch (req.state) {
        case REJECTED: return <div>Failed to load stories!</div>
        default: return skeletonFeedItems.map(story =>
          <FeedItemComp key={story.id} story={story} readOnly={true}/>
        )
      }
    } else {
      return store.feedItems.map(story =>
        <FeedItemComp key={story.id} story={story}/>
      )
    }
  }

  render() {
    const {store} = this.props
    return (
        <Box
          innerRef={r => this.containerNode = r}
          className={css`
          position: relative;
          overflow: auto;
          height: 100%;
        `}>
          <Tabbar/>
          <Box
            className={css`
            transition: opacity 0.15s ease-in-out;
            ${store.getFeedItemsManualRefreshRequest.state === PENDING && 'opacity: 0.25'};
          `}>
            {this.renderBody()}
          </Box>
        </Box>
    )
  }
}
