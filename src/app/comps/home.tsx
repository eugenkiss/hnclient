import * as React from 'react'
import {Component} from 'react'
import {inject, observer} from 'mobx-react'
import {PENDING, REJECTED, whenAsync} from 'mobx-utils'
import {Link} from './link'
import {StoryRoute} from '../routes'
import {Story} from '../models/story'
import {Box, Flex} from './basic'
import {space} from 'styled-system'
import styled from 'react-emotion'
import {Store} from '../store'
import {css} from 'emotion'

const Container = styled(Flex)`
  border-bottom: 1px solid rgba(0,0,0,0.05);
`

const LinkAreaStory = styled('a')`
  ${space};
  &:visited {
    color: #777777;
  }
` as any

const Source = styled(Box)`
  ${space};
  display: flex;
  color: #666;
` as any

@observer
export class StoryEntry extends Component<{
  story: Story
  skeleton?: boolean
}> {
  handleContainerClick = (e) => {
    if (!this.props.skeleton) return
    e.stopPropagation()
    e.nativeEvent.stopImmediatePropagation()
    e.preventDefault()
  }

  render() {
    const { story } = this.props
    return (
      <Container flex='1 1 auto' p={1} onClickCapture={this.handleContainerClick}>
        <LinkAreaStory pr={1} href={story.url} target='_blank'>
          <Box f={2} fontWeight='600'>{story.title}</Box>
          <Flex mt={1} align='center'>
            <Box mr={1} f={0} className={css`
              padding: 3px;
              min-width: 32px;
              height: 24px;
              background: rgba(0,0,0,0.05);
              display: flex;
              flex: 0 0 auto;
              justify-content: center;
              align-items: center;
              border-radius: 4px;
              color: #666;
            `}>
              {story.points}
            </Box>
            <Source f={0}>{story.domain}</Source>
          </Flex>
        </LinkAreaStory>
        <Box flex='1 1 auto'/>
        <Link link={StoryRoute.link(story.id)} className={css`
          font-size: 14px;
          width: 60px;
          display: flex;
          flex: 0 0 auto;
          justify-content: center;
          align-items: center;
          &:visited {
            color: #777777;
          }
        `}>
          <Box f={2} mr={-1} fontWeight={300} className={css`
            padding: 2px;
            width: 45px;
            height: 35px;
            border: 1px solid #ccc;
            box-shadow: 1px 1px 0 #eee;
            border-radius: 3px;
            display: flex;
            justify-content: center;
            align-items: center;

            /* http://www.cssarrowplease.com/ */
            position: relative;
            &:after, &:before {
              right: 100%;
              top: 50%;
              border: solid transparent;
              content: " ";
              height: 0;
              width: 0;
              position: absolute;
              pointer-events: none;
            }
            &:after {
              border-color: rgba(255, 255, 255, 0);
              border-right-color: #fff;
              border-width: 4px;
              margin-top: -4px;
            }
            &:before {
              border-color: rgba(181, 181, 181, 0);
              border-right-color: #b5b5b5;
              border-width: 5px;
              margin-top: -5px;
            }
          `}>
            {story.commentsCount}
          </Box>
        </Link>
        <Box my={-1}/>
      </Container>
    )
  }
}

const skeletonStories = []
for (let i = 0; i < 30; i++) {
  const story = new Story()
  story.id = i
  story.title = '…'
  story.domain = '…'
  skeletonStories.push(story)
}

@inject('store') @observer
export class Home extends Component<{store?: Store}> {
  static ID = 'Home'

  saveUiCb
  restoreUiCb

  componentDidMount() {
    const {store} = this.props
    const {routerStore} = store
    this.saveUiCb = routerStore.addSaveUiCb(() => {
      return { id: Home.ID, data: store.window.pageYOffset }
    })
    this.restoreUiCb = routerStore.addRestoreUiCb(Home.ID, async (data: number) => {
      await whenAsync(() => store.getStories.value != null)
      store.window.scrollTo(0, data)
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
          <StoryEntry key={story.id} story={story} skeleton={true}/>
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
      <Box className={css`
        transition: opacity 0.15s ease-in-out;
        ${store.getStoriesManualRefresh.state === PENDING && 'opacity: 0.25;'}
      `}>
        {this.renderBody()}
      </Box>
    )
  }
}
