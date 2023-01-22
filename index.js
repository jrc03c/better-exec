const { execSync, spawn } = require("child_process")
const fs = require("fs")
const process = require("process")

function betterExec(commands, shouldBeSilent, callback) {
  if (typeof commands === "string") {
    commands = [commands]
  }

  if (typeof shouldBeSilent === "function") {
    callback = shouldBeSilent
    shouldBeSilent = false
  }

  let stdout = ""
  let stderr = ""
  let cwd = process.cwd()
  const origCwd = cwd

  return new Promise(resolve => {
    try {
      async function next() {
        index++

        if (index >= commands.length) {
          const results = { stdout, stderr }
          if (callback) callback(results)
          return resolve(results)
        }

        const command = commands[index]

        if (typeof command === "function") {
          const out = command()

          if (out instanceof Promise) {
            return out.then(() => next())
          } else {
            return next()
          }
        }

        if (command.match(/^\bcd\b/g)) {
          cwd = command.split(" ").slice(1).join(" ")
          return next()
        }

        try {
          process.chdir(cwd)
        } catch (e) {
          process.chdir(origCwd)
        }

        const child = spawn(command.split(" ")[0], command.split(" ").slice(1))

        child.stdout.setEncoding("utf8")
        child.stderr.setEncoding("utf8")

        child.stdout.on("data", data => {
          data = data.toString()
          stdout += data

          if (!shouldBeSilent) {
            process.stdout.write(data)
          }
        })

        child.stderr.on("data", data => {
          data = data.toString()
          stderr += data

          if (!shouldBeSilent) {
            process.stdout.write(data)
          }
        })

        child.on("close", code => {
          if (code > 0) {
            const results = { stdout, stderr }

            results.error = new Error(
              `The command "${command}" exited with code ${code}!`
            )

            if (callback) callback(results)
            return resolve(results)
          } else {
            return next()
          }
        })
      }

      let index = -1
      return next()
    } catch (e) {
      const results = { stdout, stderr }
      results.error = e
      if (callback) callback(results)
      return resolve(results)
    }
  })
}

module.exports = betterExec
