const { spawn } = require("child_process")

function betterExec(command, shouldBeSilent, callback) {
  function compileResults() {
    if (stdoutTemp.length > 0) {
      const finalLines = stdoutTemp.split("\n")

      finalLines
        .slice(0, finalLines.at(-1).trim().length === 0 ? -1 : null)
        .forEach(line => {
          stdoutLines.push(line)

          if (!shouldBeSilent) {
            console.log(line)
          }
        })
    }

    if (stderrTemp.length > 0) {
      const finalLines = stderrTemp.split("\n")

      finalLines
        .slice(0, finalLines.at(-1).trim().length === 0 ? -1 : null)
        .forEach(line => {
          stderrLines.push(line)

          if (!shouldBeSilent) {
            console.log(line)
          }
        })
    }

    const stdout = stdoutLines.join("\n")
    const stderr = stderrLines.join("\n")
    return { stdout, stderr }
  }

  if (typeof shouldBeSilent === "function") {
    callback = shouldBeSilent
    shouldBeSilent = false
  }

  const stdoutLines = []
  const stderrLines = []
  let stdoutTemp = ""
  let stderrTemp = ""

  return new Promise((resolve, reject) => {
    try {
      const child = spawn(command.split(" ")[0], command.split(" ").slice(1))

      child.stdout.setEncoding("utf8")
      child.stderr.setEncoding("utf8")

      child.stdout.on("data", data => {
        data = data.toString()
        stdoutTemp += data

        if (stdoutTemp.includes("\n")) {
          const parts = stdoutTemp.split("\n")
          const newline = parts[0]
          const remainder = parts.slice(1).join("\n")
          stdoutLines.push(newline)
          stdoutTemp = remainder

          if (!shouldBeSilent) {
            console.log(newline)
          }
        }
      })

      child.stderr.on("data", data => {
        data = data.toString()
        stderrTemp += data

        if (stderrTemp.includes("\n")) {
          const parts = stderrTemp.split("\n")
          const newline = parts[0]
          const remainder = parts.slice(1).join("\n")
          stderrLines.push(newline)
          stderrTemp = remainder

          if (!shouldBeSilent) {
            console.log(newline)
          }
        }
      })

      child.on("close", code => {
        const results = compileResults()

        if (code > 0) {
          return reject(results)
        } else {
          if (callback) callback(results)
          return resolve(results)
        }
      })
    } catch (e) {
      const results = compileResults()
      results.error = e
      return reject(results)
    }
  })
}

module.exports = betterExec
