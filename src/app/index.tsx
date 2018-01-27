import 'tslib'
import * as React from 'react'
import {Component} from 'react'
import * as ReactDOM from 'react-dom'
import {IObservableValue, observable} from 'mobx'
import {inject, observer, Provider} from 'mobx-react'
import * as FontAwesome from '@fortawesome/react-fontawesome'
import {
  faBriefcase,
  faChevronLeft,
  faClock,
  faDownload,
  faEllipsisV,
  faExternalLinkSquareAlt,
  faInfoCircle,
  faSync,
  faUser
} from '@fortawesome/fontawesome-free-solid'
import {IconDefinition} from '@fortawesome/fontawesome-common-types';
import {css} from 'emotion'
import {injectGlobal} from 'react-emotion'
import {IS_DEV} from './cfg'
import {HomeRoute} from './routes'
import {Box, Flex, Overlay} from './comps/basic'
import {canUseDOM} from './utils'
import {Store} from './store'

const MobxDevTools = IS_DEV ? require('mobx-react-devtools').default : null

injectGlobal`
html,body,#root {
  height: 100%; 
}
body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif;
  background: #eee;
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
}> {
  render() {
    const { icon, onClick } = this.props
    return (
      <Flex
          onClick={onClick}
          f={4}
          align='center' justify='center'
          className={css`
          height: 100%;
          width: 48px;
          cursor: pointer;
        `}>
          <FontAwesome icon={icon}/>
        </Flex>
    )
  }
}

class OverflowMenuEntry extends React.Component<{
  title: string
  icon: IconDefinition
  onClick: () => void
}> {
  render() {
    const { title, icon, onClick } = this.props
    return (
      <Flex p={1} onClick={onClick} className={css`
        &:hover {
          background: rgba(0,0,0,0.1);
        }
      `}>
        <Box className={css`
          color: rgba(255, 255, 255, 0.6);
          width: 30px;
        `}>
          <FontAwesome icon={icon}/>
        </Box>
        <span>{title}</span>
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

  render() {
    const { isOpen } = this.props
    if (!isOpen.get()) return null
    return (
      <Overlay isOpen={isOpen} onClick={this.handleModal}>
        <Box f={3} onClick={this.handleMenuItemClick} className={css`
          position: absolute;
          min-width: 200px;
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
          <OverflowMenuEntry title='User' icon={faUser} onClick={() => alert('TODO')}/>
          <OverflowMenuEntry title='New' icon={faClock} onClick={() => alert('TODO')}/>
          <OverflowMenuEntry title='Jobs' icon={faBriefcase} onClick={() => alert('TODO')}/>
          <OverflowMenuEntry title='Upgrade' icon={faDownload} onClick={() => alert('TODO')}/>
          <OverflowMenuEntry title='About' icon={faInfoCircle} onClick={() => alert('TODO')}/>
          <OverflowMenuEntry title='Open External' icon={faExternalLinkSquareAlt} onClick={() => alert('TODO')}/>
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
        position: sticky;
        top: 0;
        background: linear-gradient(to bottom, #df5d1e 0%, #c15019 100%);
        border-bottom: 1px solid #666;
        z-index: 9999;
        font-size: 20px;
        align-items: center;
        color: rgba(0,0,0,0.4);
        height: 48px;
      `}>
        {routerStore.current.name !== HomeRoute.id &&
          <HeaderButton
            icon={faChevronLeft}
            onClick={() => store.history.back()}
          />
        }
        <Box flex='1' align='center'>
          {routerStore.current.name !== HomeRoute.id ? (
            <Box f={2} px={1}
              className={css`
              font-weight: bold;
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
              font-weight: bold;
              text-transform: uppercase;
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              text-decoration: none;
              color: #fff;
            `}>
              HN
            </Box>
          )}
        </Box>
        <HeaderButton
          icon={faSync}
          onClick={() => store.getStoriesManualRefresh = store.getStories.refresh(300)}
        />
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
            color: #000;
            background: #fcfcfc;
            height: 100%;
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
