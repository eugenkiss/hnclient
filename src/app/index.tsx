import 'tslib'
import * as React from 'react'
import {Component} from 'react'
import * as ReactDOM from 'react-dom'
import {inject, observer, Provider} from 'mobx-react'
import * as FontAwesome from '@fortawesome/react-fontawesome'
import {faChevronLeft, faEllipsisV, faSync} from '@fortawesome/fontawesome-free-solid'
import {css} from 'emotion'
import {injectGlobal} from 'react-emotion'
import {IS_DEV} from './cfg'
import {HomeRoute} from './routes'
import {Box, Flex} from './comps/basic'
import {canUseDOM} from './utils'
import {Store} from './store'
import {IconDefinition} from '@fortawesome/fontawesome-common-types';

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

@inject('store') @observer
export class Header extends Component<{
  store?: Store
}> {
  render() {
    const {store} = this.props
    const {routerStore} = store
    return (
      <Flex className={css`
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
          <HeaderButton icon={faChevronLeft} onClick={() => window.history.back()}/>
        }
        <Box flex='1 1 auto'/>
        <Box f={4}
          className={css`
          font-weight: bold;
          position: absolute;
          left: 50%;
          transform: translate(-50%, 0);
          text-decoration: none;
          color: #fff;
          text-shadow: 0 0 1px rgba(0,0,0,0.2);
        `}>
          HN
        </Box>
        <Box flex='1 1 auto'/>
        <HeaderButton icon={faSync} onClick={() => store.getStories.hardRefresh(300)}/>
        <HeaderButton icon={faEllipsisV} onClick={() => alert('TODO')}/>
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
        <div className={css`
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
          <div className={css`
            color: #000;
            background: #fcfcfc;
          `}>
            {this.renderBody()}
          </div>
        </div>
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
