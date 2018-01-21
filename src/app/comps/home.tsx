import * as React from 'react'
import {Component} from 'react'
import {inject, observer} from 'mobx-react'
import {REJECTED, whenAsync} from 'mobx-utils'
import {Link} from './link'
import {StoryRoute} from '../routes'
import {Story} from '../models/story'
import {Box, Flex} from './basic'
import {space} from 'styled-system'
import styled from 'styled-components'
import {Store} from '../store'

const Container = styled(Flex)`
  border-bottom: 1px solid rgba(0,0,0,0.05);
`

const LinkAreaStory = styled('a')`
  ${space};
  &:visited {
    color: #777777;
  }
` as any

const Title = styled('div')`
  font-size: 15px;
  font-weight: bold;
`

const ScoreBox = styled('div')`
  ${space};
  padding: 3px;
  min-width: 31px;
  height: 22px;
  background: rgba(0,0,0,0.05);
  font-size: 12px;
  display: flex;
  flex: 0 0 auto;
  justify-content: center;
  align-items: center;
  border-radius: 4px;
  color: #666;
` as any

const Source = styled('div')`
  ${space};
  font-size: 12px;
  display: flex;
  color: #666;
` as any

const LinkAreaComments = styled(Link as any)`
  ${space};
  font-size: 14px;
  width: 60px;
  display: flex;
  flex: 0 0 auto;
  justify-content: center;
  align-items: center;
  &:visited {
    color: #777777;
  }
` as any

const CommentBox = styled('div')`
  ${space};
  padding: 2px;
  width: 40px;
  height: 30px;
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
      <Container flex='1 1 auto' py={1} onClickCapture={this.handleContainerClick}>
        <LinkAreaStory px={1} href={story.url} target='_blank'>
          <Title>{story.title}</Title>
          <Flex mt={1} align='center'>
            <ScoreBox mr={1}>{story.points}</ScoreBox>
            <Source>{story.domain}</Source>
          </Flex>
        </LinkAreaStory>
        <Box flex='1 1 auto'/>
          <LinkAreaComments my={-1} link={StoryRoute.link(story.id)}>
            <CommentBox>{story.commentsCount}</CommentBox>
          </LinkAreaComments>
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
      return { id: Home.ID, data: window.pageYOffset }
    })
    this.restoreUiCb = routerStore.addRestoreUiCb(Home.ID, async (data: number) => {
      await whenAsync(() => store.getStories.value != null)
      window.scrollTo(0, data)
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
    return (
      <div>
        {this.renderBody()}
      </div>
    )
  }
}
