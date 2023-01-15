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
exec("wget https://example.com/path/to/some-file", results => {
  const { stdout, stderr, error } = results
  if (error) throw error
  // do something with stdout & stderr
  console.log("Done!")
})

// Promise style
exec("wget https://example.com/path/to/some-file").then(results => {
  const { stdout, stderr, error } = results
  if (error) throw error
  // do something with stdout & stderr
  console.log("Done!")
})
```

In the above examples, you can do something with `stdout` and `stderr` (from the `results` object) if you want, but do note that they'll already have been printed to the command line by the time you see them in the callback function.

## Silence

By default, `better-exec` prints all output to the command line. If you'd prefer to disable this behavior, though, then simply pass `true` as the second parameter, like this:

```js
const exec = require("@jrc03c/better-exec")
const silent = true

exec("wget https://example.com/path/to/some-file", silent, results => {
  const { stdout, stderr, error } = results
  // ...
})
```
