import 'tslib'
import * as React from 'react'
import {Component} from 'react'
import * as ReactDOM from 'react-dom'
import {inject, observer, Provider} from 'mobx-react'
import * as FontAwesome from 'react-fontawesome'
import {space} from 'styled-system'
import styled, {injectGlobal} from 'react-emotion'
import {IS_DEV} from './cfg'
import {HomeRoute} from './routes'
import {Box, Flex} from './comps/basic'
import {canUseDOM} from './utils'
import {Store} from './store'

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

const HeaderContainer = styled(Flex)`
  position: sticky;
  top: 0;
  background: #ffa52a;
  box-shadow: 0 2px 2px -1px rgba(0,0,0,0.4);
  z-index: 9999;
  font-size: 20px;
  align-items: center;
  color: #777777;
  height: 48px;
`

const HeaderTitle = styled('span')`
  font-weight: bold;
  display: inline-block;
  text-decoration: none;
  color: #fff;
  text-shadow: 0 0 1px rgba(0,0,0,0.2);
`

const BackButton = styled((ps) => <FontAwesome name='chevron-left' {...ps}/>)`
  ${space};
  margin-top: 1px;
  cursor: pointer;
` as any

const RefreshButton = styled((ps) => <FontAwesome name='refresh' {...ps}/>)`
  ${space};
  cursor: pointer;
` as any

@inject('store') @observer
export class Header extends Component<{
  store?: Store
}> {

  render() {
    const {store} = this.props
    const {routerStore} = store
    return (
      <HeaderContainer px={1}>
        {routerStore.current.name !== HomeRoute.id &&
          <BackButton mr={1} onClick={() => {
            window.history.back()
          }}/>
        }
        <HeaderTitle>HN</HeaderTitle>
        <Box flex='1 1 auto'/>
        <RefreshButton onClick={() => store.getStories.hardRefresh(300)}/>
      </HeaderContainer>
    )
  }
}

const PageContainer = styled('div')`
  width: 85%;
  margin: auto;
  padding: 10px 0 0 0;
  @media (max-width: 750px) {
    padding: 0;
    width: auto;
  }
`

const BodyContainer = styled('div')`
  color: #000;
  background: #fcfcfc;
`

const MobxDevTools = IS_DEV ? require('mobx-react-devtools').default : null

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
        <PageContainer>
          {IS_DEV && <MobxDevTools/>}
          <Header/>
          <BodyContainer>
            {this.renderBody()}
          </BodyContainer>
        </PageContainer>
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
