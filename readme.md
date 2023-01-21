# Intro

`better-exec` is just a version of [`child_process.exec`](https://nodejs.org/api/child_process.html#child_processexeccommand-options-callback) that prints output in (almost) realtime rather than all at once at the end of the execution. It also offers the option to run multiple commands, optionally interspersed with JS function calls.

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

// run multiple commands
const commands = [
  "cd /my/favorite/directory",
  "npm install --save my-favorite-package",
]

exec(commands).then(() => {
  console.log("Done!")
})

// mix commands and function calls
const fs = require("fs")
const path = require("path")
const dir = "/my/favorite/directory"

const commands = [
  `cd "${dir}"`,
  () =>
    fs.writeFileSync(
      path.join(dir, "comments.txt"),
      "Here are my comments!",
      "utf8"
    ),
  "cat comments.txt",
]

exec(commands).then(...)
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

# Caveats

## Running multiple commands

One major caveat is that you shouldn't try to run multiple commands in single string. For example, this is a bad idea:

```js
exec("cd /my/favorite/directory && npm install --save my-favorite-package")
```

Instead, it should be broken into multiple commands, like this:

```js
const commands = [
  "cd /my/favorite/directory",
  "npm install --save my-favorite-package",
]

exec(commands).then(...)
```

## Changing directories

There's only one command that isn't literally run as given: `cd`. Instead of literally spawning a process that'll run the `cd` command, the current process's working directory is changed via `process.chdir("/some/path")`. I don't think this'll cause many problems so long as you're doing pretty basic stuff. But if you try to get fancy — like, for example, by changing to a directory value that's computed at runtime in a nested command — then I don't know what'll happen. If you need to compute something at runtime, maybe interject a JS function call to compute the value, and then use that value in the next command. For example:

```js
const root = "/my/dir"
let id

const commands = [
  `cd "${root}"`,
  () => (id = Math.random().toString().split(".")[1]),
  `mkdir -p "${id}"`,
  // etc.
]

exec(commands)
```
