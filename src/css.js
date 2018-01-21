// I have no idea why styled component doesn't do this itself
module.exports.css
  // = `<style>
  = `
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
