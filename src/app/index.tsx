import 'tslib'
import * as React from 'react'
import {Component} from 'react'
import * as ReactDOM from 'react-dom'
import {IObservableValue, observable} from 'mobx'
import {inject, observer, Provider} from 'mobx-react'
import * as FontAwesome from '@fortawesome/react-fontawesome'
import {
  faArrowAltCircleUp,
  faBriefcase,
  faChevronLeft,
  faClock,
  faDownload,
  faEllipsisV,
  faEye,
  faFire,
  faInfoCircle,
  faQuestionCircle,
  faSyncAlt,
  faUser
} from '@fortawesome/fontawesome-free-solid'
import {IconDefinition} from '@fortawesome/fontawesome-common-types';
import {css} from 'emotion'
import {injectGlobal} from 'react-emotion'
import {IS_DEV} from './cfg'
import {AboutRoute, HomeRoute, StoryRoute} from './routes'
import {Box, Flex, Overlay, Span} from './comps/basic'
import {canUseDOM} from './utils/utils'
import {Store} from './store'
import {StoriesKind} from './models/models'
import './font-awesome-css'

const MobxDevTools = IS_DEV ? require('mobx-react-devtools').default : null

injectGlobal`
html,body,#root {
  height: 100%; 
}
body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif;
  background: #eee;
  overscroll-behavior: contain;
}
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
a {
  color: inherit; 
  text-decoration: inherit; 
}

/* loading progress bar styles */
#nprogress {
  position: sticky;
  top: 0;
  z-index: 9999;
  pointer-events: none;
}
#nprogress .bar {
  background: #f5cc78;
  position: fixed;
  z-index: 1031;
  top: 0;
  left: 0;
  width: 100%;
  height: 2px;
}
#nprogress .peg {
  display: block;
  position: absolute;
  right: 0;
  width: 100px;
  height: 100%;
  box-shadow: 0 0 10px #eba549, 0 0 5px #eba549;
  opacity: 1.0;
  transform: rotate(3deg) translate(0px, -4px);
}
`

class HeaderButton extends Component<{
  icon: IconDefinition
  onClick: () => void
  marginLeft?: string
}> {
  render() {
    const { icon, onClick, marginLeft } = this.props
    return (
      <Flex
        onClick={onClick}
        f={4}
        align='center' justify='center'
        className={css`
        height: 100%;
        width: 48px;
        cursor: pointer;
        ${marginLeft == null ? '' : `margin-left: ${marginLeft}`};
      `}>
        <FontAwesome icon={icon}/>
      </Flex>
    )
  }
}

@inject('store')
class OverflowMenuEntry extends React.Component<{
  store?: Store
  title: string
  icon: IconDefinition
  onClick: () => void
}> {
  render() {
    const { title, icon, onClick } = this.props
    return (
      <Flex
        p={1}
        onClick={onClick}
        align='center'
        className={css`
        &:hover {
          background: rgba(0,0,0,0.1);
        }
      `}>
        <Flex
          justify='center'
          mr={1}
          className={css`
          color: rgba(255, 255, 255, 0.6);
          width: 20px;
        `}>
          <FontAwesome icon={icon}/>
        </Flex>
        {title}
      </Flex>
    )
  }
}

@inject('store') @observer
class OverflowMenu extends React.Component<{
  store?: Store
  isOpen: IObservableValue<boolean>
  onClick: (e: any) => void
}> {

  handleModal = (e) => {
    this.props.onClick(e)
    e.stopPropagation()
  }

  handleMenuItemClick = (e) => {
    this.props.onClick(e)
    e.stopPropagation()
  }

  handleUpdate = () => {
    window.location.reload(true)
  }

  handleSwitchStories = (kind?: StoriesKind) => () => {
    this.props.store.navigate(HomeRoute.link(kind), {replace: true})
  }

  render() {
    const { store, isOpen } = this.props
    if (!isOpen.get()) return null
    return (
      <Overlay isOpen={isOpen} onClick={this.handleModal}>
        <Box f={3} onClick={this.handleMenuItemClick} className={css`
          position: absolute;
          min-width: 150px;
          user-select: none;
          cursor: pointer;
          font-variant: all-petite-caps;
          right: 4px;
          top: 4px;
          background: #df5d1e;
          color: white;
          box-shadow: 0px 2px 4px rgba(0,0,0,0.5);
          & *:not(:last-child) {
            border-bottom: 2px solid rgba(0,0,0,0);
          }
        `}>
          {false && <OverflowMenuEntry title='Profile' icon={faUser} onClick={() => alert('TODO')}/>}
          <OverflowMenuEntry
            title='Hot' icon={faFire}
            onClick={this.handleSwitchStories()}
          />
          <OverflowMenuEntry
            title='New' icon={faClock}
            onClick={this.handleSwitchStories(StoriesKind.New)}
          />
          <OverflowMenuEntry
            title='Best' icon={faArrowAltCircleUp}
            onClick={this.handleSwitchStories(StoriesKind.Best)}
          />
          <OverflowMenuEntry
            title='Show' icon={faEye}
            onClick={this.handleSwitchStories(StoriesKind.Show)}
          />
          <OverflowMenuEntry
            title='Ask' icon={faQuestionCircle}
            onClick={this.handleSwitchStories(StoriesKind.Ask)}
          />
          <OverflowMenuEntry
            title='Jobs' icon={faBriefcase}
            onClick={this.handleSwitchStories(StoriesKind.Job)}
          />
          <OverflowMenuEntry
            title='Update' icon={faDownload}
            onClick={this.handleUpdate}
          />
          <OverflowMenuEntry
            title='About' icon={faInfoCircle}
            onClick={() => store.navigate(AboutRoute.link())}
          />
        </Box>
      </Overlay>
    )
  }
}

@inject('store') @observer
export class Header extends Component<{
  store?: Store
}> {
  readonly isOverflowOpen = observable(false)

  render() {
    const {store} = this.props
    const {routerStore} = store
    return (
      <Flex align='center' className={css`
        position: relative;
        top: 0;
        background: linear-gradient(to bottom, rgb(255, 102, 0) 0%, rgb(225,100,0) 100%);
        z-index: 9999;
        font-size: 20px;
        align-items: center;
        color: rgba(0,0,0,0.4);
        height: 48px;
      `}>
        {routerStore.current.name !== HomeRoute.id &&
          <HeaderButton
            icon={faChevronLeft}
            marginLeft={'-0.5rem'}
            onClick={() => store.history.back()}
          />
        }
        <Box flex='1' align='center'>
          {routerStore.current.name === StoryRoute.id ? (
            <Box f={2}
              className={css`
              font-weight: 400;
              overflow: hidden;
              text-overflow: ellipsis;
              display: -webkit-box;
              -webkit-line-clamp: 2;
              -webkit-box-orient: vertical;
              text-decoration: none;
              color: #fff;
              text-shadow: 0 0 1px rgba(0,0,0,0.2);
            `}>
              {store.headerTitle}
            </Box>
          ) : (
            <Box f={4} align='center'
              className={css`
              font-weight: 400;
              text-transform: uppercase;
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              text-decoration: none;
              color: #fff;
            `}>
              {routerStore.current.name === HomeRoute.id ? (
                <Span
                  className={css`
                  position: relative;
                `}>
                  HN
                  <Span
                    f={0}
                    className={css`
                    text-transform: lowercase;
                    margin-left: 0.1rem;
                    position: absolute;
                    bottom: 2px;
                  `}>
                    {store.headerTitle}
                  </Span>
                </Span>
              ) : (
                store.headerTitle
              )}
            </Box>
          )}
        </Box>
        {store.refreshAction != null &&
          <HeaderButton
            icon={faSyncAlt}
            onClick={store.refreshAction}
          />
        }
        <HeaderButton
          icon={faEllipsisV}
          onClick={() => this.isOverflowOpen.set(true)}
        />
        <OverflowMenu
          isOpen={this.isOverflowOpen}
          onClick={() => this.isOverflowOpen.set(false)}
        />
      </Flex>
    )
  }
}

@observer
export default class App extends React.Component<{
  initialPath: string
}> {
  store = new Store()

  componentWillMount() {
    const {router} = this.store
    router.start(this.props.initialPath)
  }

  renderBody() {
    const {routerStore, routesMap} = this.store
    const cur = routerStore.current
    if (cur == null) return null
    return routesMap.get(cur.name).comp(cur.params)
  }

  render() {
    return (
      <Provider store={this.store}>
        <Flex flexDirection='column' className={css`
          overflow: hidden;
          height: 100%;
          width: 85%;
          margin: auto;
          padding: 10px 0 0 0;
          @media (max-width: 750px) {
            padding: 0;
            width: auto;
          }
        `}>
          {IS_DEV && false && <MobxDevTools/>}
          <Header/>
          <Box flex='1' className={css`
            position: relative; // For pull to refresh
            height: 100%;
            color: #000;
            background: #ffffff;
            overflow: hidden;
          `}>
            {this.renderBody()}
          </Box>
        </Flex>
      </Provider>
    )
  }
}

if (!IS_DEV && canUseDOM) {
  (function () {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js')
    }
  })()
}

if (canUseDOM) {
  const path = window.location.pathname + window.location.search
  ReactDOM.render(<App initialPath={path}/>, document.getElementById('root'))
}
