import * as React from 'react'
import {Component} from 'react'
import {observable} from 'mobx'
import {inject, observer} from 'mobx-react'
import {PENDING, REJECTED, whenAsync} from 'mobx-utils'
import {css} from 'emotion'
import * as FontAwesome from '@fortawesome/react-fontawesome'
import {StoryRoute} from '../routes'
import {A, Box, Flex, Span} from './basic'
import {Link} from './link'
import {Story} from '../models/story'
import {Store} from '../store'
import {faComments} from '@fortawesome/fontawesome-free-solid'

@observer
export class StoryEntry extends Component<{
  story: Story
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
        p={1}
        onClickCapture={this.handleContainerClick}
        className={css`
        border-bottom: 1px solid rgba(0,0,0,0.05);
      `}>
        <Box pr={1}>
          <A
            href={story.url}
            target='_self'
            className={css`
            &:visited {
              color: #777777;
            }
          `}>
            <Box f={2} fontWeight='600'>
              {story.title}
              {'\u00A0'}
              <Span f={1} color='#999' fontWeight='normal'>({story.domain})</Span>
            </Box>
          </A>
          <Flex mt={1} f={1} align='center' color='#999'>
            {story.points != null ? story.points : '…'}
          </Flex>
        </Box>
        <Box flex='1 1 auto'/>
        <Link
          f={2} p={1} m={-1}
          link={StoryRoute.link(story.id)}
          className={css`
          width: 70px;
          display: flex;
          flex: 0 0 auto;
          justify-content: flex-end;
          align-items: center;
          &:visited {
            color: #777777;
          }
        `}>
          {story.commentsCount}
          {'\u00A0'}
          <FontAwesome icon={faComments}/>
        </Link>
      </Flex>
    )
  }
}

const skeletonStories = []
for (let i = 0; i < 30; i++) {
  const story = new Story()
  story.id = i
  story.title = '…… … … ……… … ……… … … ……… …… ………… ………'
  story.domain = '…………'
  skeletonStories.push(story)
}

@inject('store') @observer
export class Home extends Component<{store?: Store}> {
  static ID = 'Home'

  saveUiCb
  restoreUiCb

  @observable containerNode = null

  componentDidMount() {
    const {store} = this.props
    const {routerStore} = store
    this.saveUiCb = routerStore.addSaveUiCb(() => {
      return { id: Home.ID, data: this.containerNode.scrollTop }
    })
    this.restoreUiCb = routerStore.addRestoreUiCb(Home.ID, async (data: number) => {
      await whenAsync(() => store.getStories.value != null && this.containerNode != null)
      this.containerNode.scrollTop = data
    })
  }

  componentWillUnmount() {
    const {routerStore} = this.props.store
    routerStore.delSaveUiCb(this.saveUiCb)
    routerStore.delRestoreUiCb(this.restoreUiCb)
  }

  renderBody() {
    const {store} = this.props
    const req = store.getStories
    if (req.value == null) {
      switch (req.state) {
        case REJECTED: return <div>Failed to load stories!</div>
        default: return skeletonStories.map(story =>
          <StoryEntry key={story.id} story={story} readOnly={true}/>
        )
      }
    } else {
      const stories = req.value
      return stories.map(story =>
        <StoryEntry key={story.id} story={story}/>
      )
    }
  }

  render() {
    const {store} = this.props
    return (
      <Box innerRef={r => this.containerNode = r} className={css`
        transition: opacity 0.15s ease-in-out;
        ${store.getStoriesManualRefresh.state === PENDING && 'opacity: 0.25'};
        overflow: auto;
        height: 100%;
      `}>
        {this.renderBody()}
      </Box>
    )
  }
}
