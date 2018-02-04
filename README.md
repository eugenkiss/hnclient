Hacker News Client
==================

A mobile optimized Hacker News client running in the browser: <https://hn.eugenkiss.com>.

Inspired by [HN (Android)](https://github.com/manmal/hn-android/) and [HNPWA](https://hnpwa.com/).

Built using:
- [React](https://reactjs.org)
- [MobX](https://mobx.js.org)
- [TypeScript](https://www.typescriptlang.org)
- [router5](http://router5.github.io)
- [Inferno](https://infernojs.org)
- [emotion](https://emotion.sh)
- [Styled System](http://jxnblk.com/styled-system)

[WebPagetest](https://www.webpagetest.org/easy):
  - Mobile - Regular 3G: <https://www.webpagetest.org/result/180204_TH_bdcc6123911e11a23a90ccf68879d4c0/>

Principles:
- High perceived speed using the UI without giving up DX/abstractions on the programmatic side

Notable Concepts:
  - As part of the build process a server-side rendered HTML shell is generated for each route.
    The necessary Firebase routing configuration is generated, too. The browser is served the pre-rendered 
    HTML file with critical CSS while the JS bundle is being loaded. That is, the user is presented with a 
    skeleton screen as soon as possible. Of course, complete server-side rendering (SSR) for each request, 
    such that data required to display the UI is also retrieved server-side, is superior but also more involved.
  - State management is roughly done as described here: https://mobx.js.org/best/store.html
  - The routing/navigation approach is roughly inspired by: https://vincent.is/testing-a-different-spa-routing/
  - View state restoration (such as scroll positions) is done in a novel way as far as I know.
    It is roughly inspired by how it's done on Android. View state restoration is enabled by the employed routing
    approach. It is assumed that each view/screen is uniquely identifiable by its path.
  - The way requests and their results are handled/cached is special in the sense that I did not
    encounter this way in other projects. It's quite convenient though. The idea is to have an object
    for each kind of request that encapsulates results and meta information and is observable. Slightly
    similar to the Rx Single object but much simpler / smaller in scope and also inspired by:
    https://medium.com/@mweststrate/mobx-utils-community-driven-utility-belt-for-mobx-264346cb2744#3222

Shoutout:
  - Inferno is nice on mobile, considerably less lag
  - emotion is pretty good
  - router5 is awesome
  - MobX is awesome as always

Observations:
  - Official HN Firebase API is admitted bad: https://github.com/HackerNews/API/#design
  - Service Worker configuration and workflow is a pain in the ass:
      - https://github.com/facebook/create-react-app/issues/2554
      - https://twitter.com/dan_abramov/status/954146978564395008
  - Browser history navigation is limited for apps
  - Native development gives you a lot for free by sacrificing part of your freedom/customizability
  - Why doesn't the Chrome browser use the a's title attribute as share title when sharing a link?
  - Even though inferno-compat is quite good it's still a PITA for edge cases
    
TODO:
- Using the firebase HN API the time to consistently interactive sucks
  need to think of something
- Submit to https://github.com/tastejs/hacker-news-pwas
- Instead of having MapReq, have a side-effect of Req and a Story DB (Just Map)
- remember scroll position for comments (scroll, go to about, go back)
- pagination or just more
- (de)serialisation in requester
- Create requester package? Make generic inpute type
- pull to refresh (such a PITA): 
  https://github.com/yusukeshibata/react-pullrefresh/issues/28
  https://github.com/infernojs/inferno/issues/1001
  
TODO Longterm (if ever):
  - compare to https://medium.com/@NareshBhatia/introducing-mobx-state-router-dae4cb9386fb
  - Improve Makefile
  - Would MobX State Tree help somehow? In retaining scroll position for example?
  - Use react-dom-lite once ready instead of Inferno
  - BFF proxy to simulate delay / user etc. in dev mode
      - Failed to load stories: retry button
  - Real SSR with hosted API?
      - http4k
      - https://github.com/bagongkia/react-ssr-with-java
      - https://github.com/kristoferbaxter/react-hn
      - https://github.com/cheeaun/node-hnapi
  - Animations/transitions. E.g. spinner fade out, overflow menu
  - Use this API approach: https://github.com/manmal/hn-android/tree/master/app/src/main/java/com/manuelmaly/hn
      - upvote/downvote, flag, user account, comment etc.
  - React Native version
  - Steal some UI ideas from reddit is fun 
    e.g. selected/active comment, top/hot/... tabs underneath toolbar
  - Reduce bundle size
      - Code splitting
  - If last refresh > 1h, show it in toast bar
  - Refactoring
      - Extract style (color constants etc.)
  - Abstract/extract code into reusable libraries?
      - Routing, pregen, req, scroll restoration
  - Error boundary (e.g. to not break client-side navigation on error)
  - How to make news.ycombinator.com open with a top-left X in Chrome on Android?
    I think it doesn't work for them because hn isn't mobile optimized?
  - Reactive item database. To solve E.g. you go to story, comment count is updated,
    you go back to overview, but overview shows old comment count
    The problem is that you can get the same kind of entity via different requests.
    If you only cache the result of a request but do not save the retrieved entity
    centrally, then there is going to be staleness.
  - User detail page, single comment page
  - Search
  - Don't render deleted if they also don't have children
  - depending on type change path (e.g. /story /job /ask)
  - if type job render differently (e.g. job symbol instead of comments)
  - auto-hiding toolbar
  - Theming (dark mode)
