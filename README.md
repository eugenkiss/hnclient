WIP

https://hnclient-1b7c9.firebaseapp.com/

based on https://github.com/now-examples/next-news
and https://github.com/manmal/hn-android/

Techs: inferno, react, sspr, typescript, mobx, router5

TODO:
session store for prefilling
switch to glamorous
back button bigger area

- only necessary font-awesome -> SVG fontawesome 5
- comments
- colors hn-android
- pagination
- upvote/downvote, user account, comment etc.
- hnpwa requirements: new, jobs
- pwa 100 score (favicons, 192, 512)


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

Constraints
  - Fast as possible without giving up DX/abstractions
  - Firebase

Opportunities
  - Reduce bundle size
  - Faster CSS-in-JS
      - Emotion's SSR didn't work for me. Empty critical CSS.
  - Starting HN API request earlier
      - If not constrained to Firebase could start initial API
        request server side, stream HTML and stream API result as JSON to end
        of HTML (embedded). Once JS is loaded uses instrumented fetch to get initial result
        from embedded JSON. See react static server TODO
  - Faster HN Api / Streaming API
  - Service Worker config and workflow is PITA: 
