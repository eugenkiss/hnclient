WIP

https://hn.eugenkiss.com

https://github.com/manmal/hn-android/
https://app.hackerwebapp.com

Techs: mobx, typescript, inferno, router5, react, emotion, pwa, server side prerendering (SSPR), styled-system

- disable refresh
- hnpwa requirements: new, jobs
- pwa 100 score (favicons, 192, 512)
- pagination or just more
- Improve README
- check client-base.ts
- Failed to load stories / story: retry
- Extract style (color constants etc.)
- upvote/downvote, user account, comment etc.
- Create requester package? Make generic inpute type
- React Native


Concepts
  - Shell pregen finite list
of rendered HTML files and respective server.js based on routing
definitions
  - Store, link to mobx
  - Routing TODO: Routing article (my reddit comment)
  - Req own thing (PoC)
  - Scroll restoration
  - Provide data to next view
  - Skeleton loading
  - Critical CSS

Shoutout
  - Inferno is nice on mobile, considerably less lag / faster
  - emotion pretty good
  - router5 awesome
  - mobx awesome anyhow, see blog post

Constraints
  - Fast as possible without giving up DX/abstractions
  - Firebase (for now)
  
TODO
  - Improve Makefile
  - Use react-dom-lite once ready instead of Inferno
  - BFF proxy to simulate delay / user etc. in dev mode
  - Real SSR with hosted API?
      - http4k
      - https://github.com/bagongkia/react-ssr-with-java
      - https://github.com/kristoferbaxter/react-hn
      - https://github.com/cheeaun/node-hnapi
  - Animations/transitions. E.g. spinner fade out, overflow menu

Opportunities
  - Reduce bundle size
      - Code splitting
  - Real SSR
  - Starting HN API request earlier
      - If not constrained to Firebase could start initial API
        request server side, stream HTML and stream API result as JSON to end
        of HTML (embedded). Once JS is loaded uses instrumented fetch to get initial result
        from embedded JSON. See react static server TODO
  - Faster HN Api / Streaming API
  - Service Worker config and workflow is PITA: TODO link from gaeron
      - https://github.com/facebook/create-react-app/issues/2554
      - https://twitter.com/dan_abramov/status/954146978564395008
  - Abstract/extract code into reusable libraries?
      - Routing, pregen, req, scroll restoration
