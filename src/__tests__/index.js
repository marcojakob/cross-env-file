import crossSpawnMock from "cross-spawn"

const crossEnvFile = require("../")

process.setMaxListeners(20)

beforeEach(() => {
  crossSpawnMock.__mock.reset()
})

it(`should read config file and flatten nested keys`, () => {
  crossEnvFile(["-p", "./src/__tests__/config.json", "echo hello"])
  expect(crossSpawnMock.spawn).toHaveBeenCalledWith("echo hello", [], {
    stdio: "inherit",
    env: Object.assign({}, process.env, {
      base_url: "https://example.com", // eslint-disable-line
      aws_my_secret: "my-nested-secret" // eslint-disable-line
    })
  })
})
