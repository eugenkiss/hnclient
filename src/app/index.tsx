import * as React from 'react'
import * as ReactDOM from 'react-dom'
import {Component} from 'react'
import {observer} from 'mobx-react'
import MobxDevTools from 'mobx-react-devtools'
import {Helmet} from 'react-helmet'
import * as FontAwesome from 'react-fontawesome'
import {space} from 'styled-system'
import {injectGlobal} from 'emotion'
import styled from 'react-emotion'
import './utils/extensions'
import {router, routerStore, routesMap, uiStore} from './deps'
import {DATE, GIT_HASH, GIT_STATUS, IS_DEV} from './cfg'
import {HomeRoute} from './routes'
import {Box, Flex} from './comps/basic'

if (!IS_DEV) {
  (function () {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js')
    }
  })()
}

router.start()

injectGlobal`
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
  border-bottom: 1px solid rgba(255,255,255,0.15);
  box-shadow: 0 1px 2px rgba(0,0,0,0.4);
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
`

@observer
export class Header extends Component<{}> {

  render() {
    return (
      <HeaderContainer px={1}>
        {routerStore.current.name !== HomeRoute.id &&
          <BackButton mr={1} onClick={() => window.history.back()}/>
        }
        <HeaderTitle>HN</HeaderTitle>
        <Box flex='1 1 auto'/>
        <RefreshButton onClick={() => uiStore.getStories()}/>
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

@observer
class App extends React.Component {

  renderBody() {
    const cur = routerStore.current
    if (cur == null) return null
    return routesMap.get(cur.name).comp(cur.params)
  }

  render() {
    return (
      <PageContainer>
        {IS_DEV && false && <MobxDevTools/>}
        <Helmet>
          <meta name='GIT_HASH' content={GIT_HASH} />
          <meta name='GIT_STATUS' content={GIT_STATUS} />
          <meta name='BUILD_TIME' content={new Date(DATE).toISOString()} />
        </Helmet>
        <Header/>
        <BodyContainer>
          {this.renderBody()}
        </BodyContainer>
      </PageContainer>
    )
  }
}

ReactDOM.render(<App/>, document.getElementById('root'))
