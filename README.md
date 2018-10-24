<div align="center">
<h1>cross-env-file</h1>

Run scripts that set environment across platforms via JSON file.

This is a fork of [cross-env](https://github.com/kentcdodds/cross-env) that uses a JSON file to
read the environment variables.

</div>

<hr />

## Installation

This module is distributed via [npm][npm] which is bundled with [node][node] and
should be installed as one of your project's `devDependencies`:

```
npm install --save-dev cross-env-file
```

## Usage

I use this in your npm scripts:

```json
{
  "scripts": {
    "build": "cross-env-file -p ./.my-env.json webpack --config build/webpack.config.js"
  }
}
```

Ultimately, the command that is executed (using [`cross-spawn`][cross-spawn])
is:

```
webpack --config build/webpack.config.js
```

If no path is
specified with `-p` the default name `.env` is used.

This is how a JSON environment file could look like:

```json
{
  "base_url": "https://example.com",
  "aws": {
    "my_secret": "my-nested-secret"
  }
}
```

This will add the following environment variables to `process.env`:

```
base_url=https://example.com
aws_my_secret=my-nested-secret
```

## `cross-env-file` vs `cross-env-file-shell`

The `cross-env-file` module exposes two bins: `cross-env-file` and `cross-env-file-shell`. The
first one executes commands using [`cross-spawn`][cross-spawn], while the
second one uses the `shell` option from Node's `spawn`.

The main use case for `cross-env-file-shell` is when you need an environment
variable to be set across an entire inline shell script, rather than just one
command.

For example, if you want to have the environment variable apply to several
commands in series then you will need to wrap those in quotes and use
`cross-env-file-shell` instead of `cross-env-file`.

## LICENSE

MIT
