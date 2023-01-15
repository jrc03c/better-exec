const { spawn } = require("child_process")

function betterExec(command, callback) {
  return new Promise((resolve, reject) => {
    try {
      const child = spawn(command.split(" ")[0], command.split(" ").slice(1))
      const stdoutLines = []
      const stderrLines = []
      let stdoutTemp = ""
      let stderrTemp = ""

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
          console.log(newline)
          stdoutTemp = remainder
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
          console.log(newline)
          stderrTemp = remainder
        }
      })

      child.on("close", code => {
        if (stdoutTemp.length > 0) {
          const finalLines = stdoutTemp.split("\n")

          finalLines
            .slice(0, finalLines.at(-1).trim().length === 0 ? -1 : null)
            .forEach(line => {
              stdoutLines.push(line)
              console.log(line)
            })
        }

        if (stderrTemp.length > 0) {
          const finalLines = stderrTemp.split("\n")

          finalLines
            .slice(0, finalLines.at(-1).trim().length === 0 ? -1 : null)
            .forEach(line => {
              stderrLines.push(line)
              console.log(line)
            })
        }

        const stdout = stdoutLines.join("\n")
        const stderr = stderrLines.join("\n")

        if (code > 0) {
          return reject(stdout, stderr)
        } else {
          if (callback) callback(stdout, stderr)
          return resolve(stdout, stderr)
        }
      })
    } catch (e) {
      return reject(e)
    }
  })
}

module.exports = betterExec
