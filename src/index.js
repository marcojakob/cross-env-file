import * as fs from "fs"
import * as path from "path"
import {spawn} from "cross-spawn"
import commandConvert from "./command"
import varValueConvert from "./variable"

module.exports = crossEnvFile

function crossEnvFile(args, options = {}) {
  const [envFile, command, commandArgs] = parseCommand(args)
  const env = getEnvVarsFromFile(envFile)
  if (command) {
    const proc = spawn(
      // run `path.normalize` for command(on windows)
      commandConvert(command, env, true),
      // by default normalize is `false`, so not run for cmd args
      commandArgs.map(arg => commandConvert(arg, env)),
      {
        stdio: "inherit",
        shell: options.shell,
        env
      }
    )
    process.on("SIGTERM", () => proc.kill("SIGTERM"))
    process.on("SIGINT", () => proc.kill("SIGINT"))
    process.on("SIGBREAK", () => proc.kill("SIGBREAK"))
    process.on("SIGHUP", () => proc.kill("SIGHUP"))
    proc.on("exit", (code, signal) => {
      let crossEnvExitCode = code
      // exit code could be null when OS kills the process(out of memory, etc) or due to node handling it
      // but if the signal is SIGINT the user exited the process so we want exit code 0
      if (crossEnvExitCode === null) {
        crossEnvExitCode = signal === "SIGINT" ? 0 : 1
      }
      process.exit(crossEnvExitCode) //eslint-disable-line no-process-exit
    })
    return proc
  }
  return null
}

function parseCommand(args) {
  let remainingArgs = args
  let envFile

  // Check if a path option has been passed.
  if (args[0] === "-p") {
    envFile = path.resolve(process.cwd(), args[1])
    // remove both args.
    remainingArgs = args.slice(2)
  } else {
    envFile = path.resolve(process.cwd(), ".env")
  }

  let command = null
  let commandArgs = []

  // No more env setters, the rest of the line must be the command and args
  let cStart = []
  cStart = remainingArgs
    // Regex:
    // match "\'" or "'"
    // or match "\" if followed by [$"\] (lookahead)
    .map(a => {
      const re = /\\\\|(\\)?'|([\\])(?=[$"\\])/g
      // Eliminate all matches except for "\'" => "'"
      return a.replace(re, m => {
        if (m === "\\\\") return "\\"
        if (m === "\\'") return "'"
        return ""
      })
    })
  command = cStart[0]
  commandArgs = cStart.slice(1)

  return [envFile, command, commandArgs]
}

// Returns the environment variables from the specified file.
function getEnvVarsFromFile(envFile) {
  const envVars = Object.assign({}, process.env)
  if (process.env.APPDATA) {
    envVars.APPDATA = process.env.APPDATA
  }

  // Read from the JSON file.
  const jsonString = fs.readFileSync(path.resolve(process.cwd(), envFile), {
    encoding: "utf8"
  })

  const varsFromFile = JSON.parse(jsonString)

  Object.assign(envVars, flattenVars(varsFromFile))

  return envVars
}

// Returns the key-value pairs of envObject. If the object is nested, the name is flattened
// with underscores.
function flattenVars(envObject) {
  const envVars = {}
  flattenVarsRec(envVars, envObject)
  return envVars
}

// Recursively flattens.
function flattenVarsRec(envVars, envObject, prefix = "") {
  for (const key in envObject) {
    if (typeof envObject[key] === "object") {
      // We have a nested object. Add a prefix and recursively call ourselves.
      flattenVarsRec(envVars, envObject[key], `${prefix}${key}_`)
    } else {
      const prefixedKey = `${prefix}${key}`
      envVars[prefixedKey] = varValueConvert(envObject[key], key)
    }
  }
}
