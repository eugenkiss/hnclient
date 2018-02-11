import * as React from 'react'
import {Component} from 'react'
import {autorun, observable, when} from 'mobx'
import {inject, observer} from 'mobx-react'
import {PENDING, REJECTED} from 'mobx-utils'
import {css} from 'emotion'
import * as FontAwesome from '@fortawesome/react-fontawesome'
import {faComments, faSpinner} from '@fortawesome/fontawesome-free-solid'
import {FeedRoute, StoryRoute} from '../routes'
import {A, Box, Flex, Space, Span} from './basic'
import {Link} from './link'
import {FeedItem, FeedType} from '../models/models'
import {Store} from '../store'
import {fulfilledReq, minDuration, smoothScrollToId} from '../utils/utils'

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
  static ID = 'tabbar'

  handleFeedType = (kind?: FeedType) => () => {
    this.props.store.navigate(FeedRoute.link(kind), {replace: true})
  }

  render() {
    const {store} = this.props
    const {selectedFeedType} = store
    return (
      <Flex id={Tabbar.ID} align='center' className={css`
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
  item: FeedItem
  readOnly?: boolean
}> {
  handleContainerClick = (e) => {
    if (!this.props.readOnly) return
    e.stopPropagation()
    e.nativeEvent.stopImmediatePropagation()
    e.preventDefault()
  }

  render() {
    const { item } = this.props
    return (
      <Flex
        flex='1 1 auto'
        p={1} py={1}
        onClickCapture={this.handleContainerClick}
        className={css`
      `}>
        <Box pr={1}>
          <A
            href={item.url}
            title={item.title}
            className={css`
            font-weight: 600;
          `}>
            <Box f={2}>
              {item.title}
            </Box>
          </A>
          <Flex mt={1} f={0} align='center' color='#999'>
            {item.points != null ? item.points : '…'} points
            {item.domain &&
              <Span>
                <Space/>|<Space/>
                {item.domain}
              </Span>
            }
          </Flex>
        </Box>
        <Box flex='1 1 auto' pr={1}/>
        <Link
          f={1} p={1} m={-1} py={1} my={-1}
          color='#999'
          link={StoryRoute.link(item.id)}
          title={`HN: ${item.title}`}
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
          <Span mt={'0.2rem'}>{item.commentsCount != null ? item.commentsCount : '…'}</Span>
        </Link>
      </Flex>
    )
  }
}

const skeletonFeedItems = []
const skeletonAskFeedItems = []
const skeletonJobFeedItems = []
for (let i = 0; i < 30; i++) {
  const item = new FeedItem()
  item.id = i
  item.title = '…… … … ……… … ……… … … ……… …… ………… ………'
  item.domain = '………'
  skeletonFeedItems.push(item)
  const askItem = new FeedItem()
  askItem.id = i
  askItem.title = '…… … … ……… … ……… … … ……… …… ………… ………'
  askItem.type = 'ask'
  skeletonAskFeedItems.push(askItem)
  const jobItem = new FeedItem()
  jobItem.id = i
  jobItem.title = '…… … … ……… … ……… … … ……… …… ………… ………'
  jobItem.domain = '………'
  jobItem.type = 'job'
  skeletonJobFeedItems.push(jobItem)
}

type ViewRestoreData = { scrollTop: number }

@inject('store') @observer
export class Feed extends Component<{store?: Store}> {
  static ID = 'Feed'

  disposers = []
  saveUiCb
  restoreUiCb

  @observable containerNode = null

  componentDidMount() {
    const {store} = this.props
    const {routerStore} = store
    autorun(() => {
      if (store.scrollFeedToTop === false) return
      smoothScrollToId(Tabbar.ID)
      store.scrollFeedToTop = false
    })
    this.saveUiCb = routerStore.addSaveUiCb(() => {
      return { id: Feed.ID, data: {
        scrollTop: this.containerNode.scrollTop,
      }}
    })
    this.restoreUiCb = routerStore.addRestoreUiCb(Feed.ID, (data?: ViewRestoreData) => {
      when(() => this.containerNode != null, () => {
        if (data == null) {
          this.containerNode.scrollTop = 0
          return
        }
        this.containerNode.scrollTop = data.scrollTop
      })
    })
  }

  componentWillUnmount() {
    for (const disposer of this.disposers) disposer()
    const {routerStore} = this.props.store
    routerStore.delSaveUiCb(this.saveUiCb)
    routerStore.delRestoreUiCb(this.restoreUiCb)
  }

  moreHeight = 33
  @observable moreReq = fulfilledReq

  handleNextPage = async (pageCount: number, atEnd: boolean) => {
    if (atEnd) return
    this.moreReq = this.props.store.currentGetFeed.refresh(pageCount + 1, minDuration(500))
    await this.moreReq
    smoothScrollToId(`page-${pageCount + 1}`)
  }

  renderBody() {
    const {store} = this.props
    const req = store.currentGetFeed
    if (req.listOfPages == null || req.listOfPages.length === 0) {
      switch (req.lastState) {
        case REJECTED: return <div>Failed to load stories!</div>
        default:
          const items = store.selectedFeedType === FeedType.Ask
            ? skeletonAskFeedItems
            : store.selectedFeedType === FeedType.Job
              ? skeletonJobFeedItems
              : skeletonFeedItems
          return items.map(story =>
          <FeedItemComp key={story.id} item={story} readOnly={true}/>
        )
      }
    } else {
      const pages = store.currentListOfPages
      const pageCount = pages.length
      const atEnd = pages[pageCount - 1][1].length === 0
      return (
        <Box>
          {pages.map(([page, items]) =>
            <Box key={page}>
              {page > 1 && items.length > 0 &&
                <Flex
                  id={`page-${page}`}
                  f={1} p={1}
                  justify='center'
                  className={css`
                  color: #666;
                  background: #f7f7f7;
                  top: -1px;
                  position: sticky;
                  height: ${this.moreHeight}px;
                `}>
                  Page {page}
                </Flex>
              }
              {items.map(item =>
                <FeedItemComp key={item.id} item={item}/>
              )}
            </Box>
          )}
          <Flex
            f={1} p={1}
            justify='center'
            onClick={() => this.handleNextPage(pageCount, atEnd)}
            className={css`
            color: #666;
            background: #f7f7f7;
            height: ${this.moreHeight}px;
          `}>
            {this.moreReq.state === PENDING ? (
              <Box>
                <FontAwesome icon={faSpinner} pulse/>
              </Box>
            ) : (
              atEnd ? (
                <Span>End</Span>
              ): (
                <Span>More…</Span>
              )
            )}
          </Flex>
        </Box>
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
          ${(store.getFeedManualRefreshRequest.state === PENDING || store.currentListOfPages.length === 0)
            && 'overflow: hidden'};
        `}>
          <Tabbar/>
          <Box
            className={css`
            transition: opacity 0.15s ease-in-out;
            ${store.getFeedManualRefreshRequest.state === PENDING || store.currentListOfPages.length === 0 ? (
              'transition: opacity 0.05s; opacity: 0.25'
            ) : (
              'transition: opacity 0.2s ease-in-out; opacity: 1'
            )};
          `}>
            {this.renderBody()}
            <Box className={css`
              height: ${store.windowHeight - store.headerHeight - this.moreHeight - 1}px;
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
        </Box>
    )
  }
}
