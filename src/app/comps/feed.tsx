import * as React from 'react'
import {Component} from 'react'
import {autorun, observable, when} from 'mobx'
import {inject, observer} from 'mobx-react'
import {now, PENDING, REJECTED} from 'mobx-utils'
import {css} from 'emotion'
import FontAwesome from '@fortawesome/react-fontawesome'
import {IconDefinition} from '@fortawesome/fontawesome-common-types'
import {faBriefcase, faCaretDown, faCaretUp, faComments, faSpinner, faTimes} from '@fortawesome/fontawesome-free-solid'
import {FeedRoute, StoryRoute} from '../routes'
import {A, Box, BoxClickable, Fill, Flex, FlexClickable, Space, Span} from './basic'
import {Link} from './link'
import {FeedItem, FeedType} from '../models/models'
import {Store} from '../store'
import {fulfilledReq, getNow, minDuration, smoothScrollToId, timeAgo} from '../utils/utils'

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
      <FlexClickable
        onClick={onClick}
        flex='1'
        justify='center'
        className={css`
        position: relative;
        height: 100%;
      `}>
        <Flex
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
      </FlexClickable>
    )
  }
}

@inject('store') @observer
export class Tabbar extends Component<{
  store?: Store
}> {
  static ID = 'tabbar'

  disposers = []

  componentDidMount() {
    const {store} = this.props
    this.disposers.push(autorun(() => {
      this.selected = store.selectedFeedType
    }))
  }

  componentWillUnmount() {
    for (const disposer of this.disposers) disposer()
  }

  @observable selected

  timeout = null
  handleFeedType = (type?: FeedType) => () => {
    this.selected = type

    clearTimeout(this.timeout)
    this.timeout = setTimeout(() => {
      this.props.store.navigate(FeedRoute.link(type), {replace: true})
    }, 20)
  }

  render() {
    const selected = this.selected
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
          active={selected == null || selected === FeedType.Top}
          onClick={this.handleFeedType()}
        />
        <TabEntry
          title='New'
          active={selected === FeedType.New}
          onClick={this.handleFeedType(FeedType.New)}
        />
        <TabEntry
          title='Show'
          active={selected === FeedType.Show}
          onClick={this.handleFeedType(FeedType.Show)}
        />
        <TabEntry
          title='Ask'
          active={selected === FeedType.Ask}
          onClick={this.handleFeedType(FeedType.Ask)}
        />
        <TabEntry
          title='Jobs'
          active={selected === FeedType.Job}
          onClick={this.handleFeedType(FeedType.Job)}
        />
      </Flex>
    )
  }
}

@inject('store') @observer
export class FeedItemComp extends Component<{
  store?: Store
  item: FeedItem
  readOnly?: boolean
}> {
  static makeDomFeedItemId = (id: number) => `feed-item-${id}`

  handleContainerClick = (e) => {
    if (!this.props.readOnly) return
    e.stopPropagation()
    e.nativeEvent.stopImmediatePropagation()
    e.preventDefault()
  }

  handleLinkClick = () => {
    const {store, item} = this.props
    store.lastClickedFeedItemIdFleeting = item.id
    setTimeout(() => store.lastClickedFeedItemIdFleeting = null, 10)
  }

  render() {
    const { item } = this.props
    return (
      <Flex
        id={FeedItemComp.makeDomFeedItemId(item.id)}
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
            {item.points != null && `${item.points} points`}
            {item.points != null && item.domain != null && <Span><Space/>|<Space/></Span>}
            {item.domain != null && item.domain}
          </Flex>
        </Box>
        <Fill pr={1}/>
        <Link
          f={1} p={1} m={-1} py={1} my={-1}
          color='#999'
          link={StoryRoute.link(item.id)}
          onClick={this.handleLinkClick}
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
          {item.type !== FeedType.Job ? ([
            <FontAwesome key={1} icon={faComments} size='lg'/>
              ,
            <Span key={2} mt={'0.2rem'}>{item.commentsCount != null ? item.commentsCount : '…'}</Span>
          ]) : (
            <FontAwesome key={1} icon={faBriefcase} size='lg'/>
          )}

        </Link>
      </Flex>
    )
  }
}

@inject('store') @observer
class RefreshWarning extends Component<{store?: Store}> {
  render() {
    const {store} = this.props
    const interval = 1000 * 60 // 1m
    if (now(interval) - store.lastDismissedRefreshWarning < store.feedFreshnessCutoff) {
      return null
    }
    if (now(interval) - store.getFeed.timestamp < store.feedFreshnessCutoff) {
      return null
    }
    return (
      <Flex
        p={1} f={1} flex='1 1 auto'
        justify='center' align='center'
        className={css`
        position: fixed;
        width: 100%;
        left: 0px;
        bottom: 0px;
        background: #f7f7f7;
      `}>
        <Fill/>
        Data is older than {timeAgo(now(interval), store.getFeed.timestamp)}.
        <Space/>
        <BoxClickable
          onClick={() => store.refreshAction()}
          p={1} m={-1}
          className={css`
          color: skyblue;
          text-decoration: underline;
        `}>
          Refresh
        </BoxClickable>
        <Fill/>
        <Box
          onClick={() => store.lastDismissedRefreshWarning = getNow()}
          p={1} m={-1}
          className={css`
          color: #999;
          user-select: none;
          cursor: pointer;
        `}>
          <FontAwesome icon={faTimes}/>
        </Box>
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

type ViewRestoreData = { scrollTop: number, itemId: number }

@inject('store') @observer
export class FeedScreen extends Component<{
  store?: Store,
  active: boolean
}> {
  static ID = 'FeedScreen'

  disposers = []
  when = (cond, cb) => this.disposers.push(when(cond, cb))

  @observable containerNode = null

  componentDidMount() {
    const {store} = this.props
    const {routerStore} = store

    this.disposers.push(autorun(() => {
      if (store.scrollFeedToTop === false) return
      smoothScrollToId(Tabbar.ID)
      store.scrollFeedToTop = false
    }))

    this.disposers.push(routerStore.addSaveListener(() => {
      return { id: FeedScreen.ID, data: {
        scrollTop: this.containerNode.scrollTop,
        itemId: store.lastClickedFeedItemIdFleeting,
      }}
    }))
    this.disposers.push(routerStore.addRestoreListener(FeedScreen.ID, (data?: ViewRestoreData) => {
      this.when(() => this.containerNode != null, () => {
        if (data == null) {
          this.containerNode.scrollTop = 0
          return
        }
        this.containerNode.scrollTop = data.scrollTop
        if (data.itemId != null) {
          const feedItemComp = document.getElementById(FeedItemComp.makeDomFeedItemId(data.itemId))
          if (feedItemComp != null) {
            feedItemComp.style.cssText = 'animation: ease-out glowing 500ms'
            setTimeout(() => { // Fix for mobile Chrome browser
              if (feedItemComp == null) return
              feedItemComp.style.cssText = ''
            }, 500)
          }
        }
      })
    }))
  }

  componentWillUnmount() {
    for (const disposer of this.disposers) disposer()
  }

  static makeDomPageId = (id: number) => `page-${id}`

  renderPageUpDownButton = (icon: IconDefinition, handler: (...args: any[]) => any) => {
    return (
      <BoxClickable
        p={1} m={-1}
        onClick={handler}
        className={css`
        color: #999;
      `}>
        <FontAwesome icon={icon} />
      </BoxClickable>
    )
  }

  renderPageUpButton = (page) => this.renderPageUpDownButton(faCaretUp, () => this.handlePageUp(page))

  renderPageDownButton = (page) => this.renderPageUpDownButton(faCaretDown, () => this.handlePageDown(page))

  moreHeight = 33
  @observable moreReq = fulfilledReq

  handleNextPage = async (pageCount: number, atEnd: boolean) => {
    if (atEnd) return
    this.moreReq = this.props.store.getFeed.refresh(pageCount + 1, minDuration(500))
    await this.moreReq
    smoothScrollToId(FeedScreen.makeDomPageId(pageCount + 1))
  }

  handlePageUp = (page: number) => {
    if (page == 2) {
      const origEl = document.getElementById(FeedScreen.makeDomPageId(page) + '-original')
      const el = document.getElementById(FeedScreen.makeDomPageId(page))
      const origElY = origEl.getBoundingClientRect().top
      const elY = el.getBoundingClientRect().top
      if (elY - origElY < 20) {
        smoothScrollToId(Tabbar.ID)
      } else {
        smoothScrollToId(origEl.id)
      }
      return
    }
    smoothScrollToId(FeedScreen.makeDomPageId(page - 1))
  }

  handlePageDown = (page: number) => {
    smoothScrollToId(FeedScreen.makeDomPageId(page + 1))
  }

  renderBody() {
    const {store} = this.props
    const req = store.getFeed
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
            <Box key={page} id={FeedScreen.makeDomPageId(page) + '-original'}>
              {page > 1 && items.length > 0 &&
                <Flex
                  id={FeedScreen.makeDomPageId(page)}
                  f={1} p={1}
                  justify='center' align='center'
                  className={css`
                  color: #666;
                  background: #f7f7f7;
                  user-select: none;
                  position: sticky;
                  top: -1px;
                  height: ${this.moreHeight}px;
                `}>
                  {this.renderPageDownButton(page)}
                  <Fill/>
                  Page {page}
                  <Fill/>
                  {this.renderPageUpButton(page)}
                </Flex>
              }
              {items.map(item =>
                <FeedItemComp key={item.id} item={item}/>
              )}
            </Box>
          )}
          <Span id={FeedScreen.makeDomPageId(pageCount + 1) + '-original'}/>
          <Flex
            id={FeedScreen.makeDomPageId(pageCount + 1)}
            f={1} p={1}
            justify='center'
            className={css`
            color: #666;
            background: #f7f7f7;
            height: ${this.moreHeight}px;
          `}>
            <Fill/>
            {this.moreReq.state === PENDING ? (
              <Box><FontAwesome icon={faSpinner} pulse/></Box>
            ) : (
              atEnd ? (
                <Span>End</Span>
              ): (
                <BoxClickable p={1} m={-1} onClick={() => this.handleNextPage(pageCount, atEnd)}>
                  More…
                </BoxClickable>
              )
            )}
            <Fill/>
            {pageCount <= 1 && this.renderPageUpButton(pageCount + 1)}
          </Flex>
        </Box>
      )
    }
  }

  render() {
    const {active, store} = this.props
    return (
        <Box
          innerRef={r => this.containerNode = r}
          className={css`
          ${active ? '' : 'display: none'};
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
            <RefreshWarning/>
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
