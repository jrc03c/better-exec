# Intro

`better-exec` is just a version of [`child_process.exec`](https://nodejs.org/api/child_process.html#child_processexeccommand-options-callback) that prints output in realtime rather than all at once at the end of the execution.

# Installation

```bash
npm install --save https://github.com/jrc03c/better-exec
```

# Usage

```js
const exec = require("@jrc03c/better-exec")

// callback style
exec("wget https://example.com/path/to/some-file", (stdout, stderr) => {
  console.log("Done!")
})

// Promise style
exec("wget https://example.com/path/to/some-file").then((stdout, stderr) => {
  console.log("Done!")
})
```

In the above examples, you can do something with `stdout` and `stderr` if you want, but do note that they'll already have been printed to the command line by the time you see them in the callback function.
