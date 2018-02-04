WIP

https://hn.eugenkiss.com

https://github.com/manmal/hn-android/
https://hnpwa.com/

Techs: mobx, typescript, inferno, router5, react, emotion, pwa, server side prerendering (SSPR), styled-system

- pwa 100 score (favicons, 192, 512)
- Improve README
- Merge and Tag 1.0
- Submit to https://github.com/tastejs/hacker-news-pwas

Concepts
  - Shell pregen finite list of rendered HTML files and 
    respective server.js based on routing definitions
  - Store, link to mobx
  - Routing TODO: Routing article (my reddit comment)
  - Req own thing (PoC)
  - Scroll restoration
  - Provide data to next view
  - Skeleton loading
  - Critical CSS

Shoutout
  - Inferno is nice on mobile, considerably less lag
  - emotion pretty good
  - router5 awesome
  - mobx awesome anyhow, see blog post

Constraints on Programmatic Design
  - Fast as possible without giving up DX/abstractions
  - Firebase (for now)
  
Observations
  - Official HN Firebase API is admitted bad: https://github.com/HackerNews/API/#design
  - Service Worker config and workflow is PITA: TODO link from gaeron
      - https://github.com/facebook/create-react-app/issues/2554
      - https://twitter.com/dan_abramov/status/954146978564395008
  - Browser history navigation seriously too limited for apps
  - Native development gives you a lot for free by sacrificing part of your freedom/customizability
  - Why doesn't the Chrome browser use tha a's title attribute as share title
    when sharing a link?
  - Even though inferno-compat is quite good it's still a PITA for edge
    cases.
    
TODO
- pull to refresh: 
  https://github.com/yusukeshibata/react-pullrefresh/issues/28
  https://github.com/infernojs/inferno/issues/1001
- If last refresh > 1h, show it in toast bar
- remember scroll position for comments (scroll, go to about, go back)
- pagination or just more
- (de)serialisation in requester
- Create requester package? Make generic inpute type
- handle deleted comments
- Extract style (color constants etc.)
  
TODO Longterm (if ever)
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
  - Abstract/extract code into reusable libraries?
      - Routing, pregen, req, scroll restoration
  - Error boundary (e.g. to not break client-side navigation on error)
  - How to make news.ycombinator.com open with a top-left X in Chrome on Android?
    I think it doesn't work for them because hn isn't mobile optimized?
  - Reactive item database. To solve E.g. you go to story, comment count is updated,
    you go back to overview, but overview shows old comment count
  - User detail page, single comment page
  - Search
  - depending on type change path (e.g. /story /job /ask)
  - if type job render differently (e.g. job symbol instead of comments)
  - auto-hiding toolbar
  - Theming (dark mode)
