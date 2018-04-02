import 'tslib'
import * as React from 'react'
import {Component} from 'react'
import * as ReactDOM from 'react-dom'
import {IObservableValue, observable} from 'mobx'
import {inject, observer, Provider} from 'mobx-react'
import {css} from 'emotion'
import {injectGlobal} from 'react-emotion'
import {ThemeProvider} from 'emotion-theming'
import FontAwesome from '@fortawesome/react-fontawesome'
import {
  faChevronLeft,
  faDownload,
  faEllipsisV,
  faInfoCircle,
  faSyncAlt,
  faUser
} from '@fortawesome/fontawesome-free-solid'
import {IconDefinition} from '@fortawesome/fontawesome-common-types'
import {IS_DEV} from './cfg'
import {AboutRoute, FeedRoute, StoryRoute} from './routes'
import {Box, BoxClickable, Comp, Flex, FlexClickable} from './comps/basic'
import {canUseDOM} from './utils/utils'
import {Store} from './store'
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

@keyframes glowing {
  0% {  background: initial; }
  30% {  background: initial; }
  40% {  background: #fdd0c3;  }
  100% {  background: iniitial; }
}

@keyframes pulsating {
  0% {  opacity: 1; }
  50% {  opacity: 0.5; }
  100% {  opacity: 1; }
}
`

const theme = {
  space: [4, 8, 16, 32, 64, 128, 256, 512],
}

class HeaderButton extends Component<{
  icon: IconDefinition
  onClick: () => void
  marginLeft?: string
}> {
  render() {
    const { icon, onClick, marginLeft } = this.props
    return (
      <FlexClickable
        onClick={onClick}
        f={4}
        align='center' justify='center'
        className={css`
        height: 100%;
        width: 48px;
        ${marginLeft == null ? '' : `margin-left: ${marginLeft}`};
      `}>
        <FontAwesome icon={icon}/>
      </FlexClickable>
    )
  }
}

@inject('store')
class OverflowMenuEntry extends React.Component<{
  store?: Store
  title: string
  icon: IconDefinition
  onClick: (...args: any[]) => void
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
class OverflowMenu extends Comp<{
  store?: Store
  isOpen: IObservableValue<boolean>
  onClick: (e: any) => void
}> {
  ref = null

  componentDidMount() {
    this.autorun(() => {
      if (this.props.isOpen.get()) {
        window.addEventListener('click', this.handleOutsideClick, true)
      } else {
        window.removeEventListener('click', this.handleOutsideClick, true)
      }
    })
  }

  handleOutsideClick = (e) => {
    // TODO: Why does innerref not give the node directly?
    const container = ReactDOM.findDOMNode(this.ref)
    if (container.contains(e.target)) return
    this.props.onClick(e)
    e.stopPropagation()
  }

  handleMenuItemClick = (e) => {
    this.props.onClick(e)
    e.stopPropagation()
  }

  handleUpdate = (e) => {
    this.props.onClick(e)
    window.location.reload(true)
  }

  handleAbout = (e) => {
    this.props.onClick(e)
    this.props.store.navigate(AboutRoute.link())
  }

  render() {
    const { isOpen } = this.props
    if (!isOpen.get()) return null
    const zIndex = Header.zIndex + 1
    return (
      <BoxClickable
        innerRef={r => this.ref = r}
        f={3}
        onClick={this.handleMenuItemClick}
        className={css`
        position: absolute;
        z-index: ${zIndex};
        min-width: 150px;
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
          title='Update' icon={faDownload}
          onClick={this.handleUpdate}
        />
        <OverflowMenuEntry
          title='About' icon={faInfoCircle}
          onClick={this.handleAbout}
        />
      </BoxClickable>
    )
  }
}

@inject('store') @observer
export class Header extends Component<{
  store?: Store
}> {
  static zIndex = 1000

  readonly isOverflowOpen = observable.box(false)

  render() {
    const {store} = this.props
    const {routerStore} = store
    return (
      <Flex align='center' className={css`
        position: relative;
        top: 0;
        background: linear-gradient(to bottom, rgb(255, 102, 0) 0%, rgb(225,100,0) 100%);
        z-index: ${Header.zIndex};
        font-size: 20px;
        align-items: center;
        color: rgba(0,0,0,0.4);
        height: ${store.headerHeight}px;
      `}>
        {routerStore.current.name !== FeedRoute.id &&
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
              {store.headerTitle}
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

  renderScreenStack() {
    const {routerStore, routesMap} = this.store
    const lastIndex = routerStore.history.length - 1
    //console.log(routerStore.history.map(x => x.name))
    return routerStore.history.map((x, i) =>
        routesMap.get(x.name).comp(i, i === lastIndex, x.params)
    )
  }

  render() {
    return (
      <ThemeProvider theme={theme}>
        <Provider store={this.store}>
          <Flex flexDirection='column' className={css`
            overflow: hidden;
            height: 100%;
            min-width: 740px;
            max-width: 900px;
            width: 85%;
            margin: auto;
            padding: 10px 0 0 0;
            @media (max-width: 750px) {
              padding: 0;
              width: auto;
              min-width: auto;
              max-width: auto;
            }
          `}>
            {IS_DEV && <MobxDevTools position={{bottom: 0, right: 0}}/>}
            <Header/>
            <Box flex='1' className={css`
              position: relative; // For pull to refresh
              height: 100%;
              color: #000;
              background: #ffffff;
              overflow: hidden;
            `}>
              {this.renderScreenStack()}
            </Box>
          </Flex>
        </Provider>
      </ThemeProvider>
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
