territory-management-tools
==========================

Tools for territory management

[![Version](https://img.shields.io/npm/v/territory-management-tools.svg)](https://npmjs.org/package/territory-management-tools)
[![CircleCI](https://circleci.com/gh/sfdx-isv/territory-management-tools/tree/master.svg?style=shield)](https://circleci.com/gh/sfdx-isv/territory-management-tools/tree/master)
[![Appveyor CI](https://ci.appveyor.com/api/projects/status/github/sfdx-isv/territory-management-tools?branch=master&svg=true)](https://ci.appveyor.com/project/heroku/territory-management-tools/branch/master)
[![Codecov](https://codecov.io/gh/sfdx-isv/territory-management-tools/branch/master/graph/badge.svg)](https://codecov.io/gh/sfdx-isv/territory-management-tools)
[![Greenkeeper](https://badges.greenkeeper.io/sfdx-isv/territory-management-tools.svg)](https://greenkeeper.io/)
[![Known Vulnerabilities](https://snyk.io/test/github/sfdx-isv/territory-management-tools/badge.svg)](https://snyk.io/test/github/sfdx-isv/territory-management-tools)
[![Downloads/week](https://img.shields.io/npm/dw/territory-management-tools.svg)](https://npmjs.org/package/territory-management-tools)
[![License](https://img.shields.io/npm/l/territory-management-tools.svg)](https://github.com/sfdx-isv/territory-management-tools/blob/master/package.json)

<!-- toc -->
* [Debugging your plugin](#debugging-your-plugin)
<!-- tocstop -->
<!-- install -->
<!-- usage -->
```sh-session
$ npm install -g territory-management-tools
$ sfdx COMMAND
running command...
$ sfdx (-v|--version|version)
territory-management-tools/0.0.0 darwin-x64 node-v10.12.0
$ sfdx --help [COMMAND]
USAGE
  $ sfdx COMMAND
...
```
<!-- usagestop -->
<!-- commands -->
* [`sfdx tmtools:tm1:analyze [-d <directory>] [--falcondebug <array>] [--falcondebugerror] [--falcondebugsuccess] [--falcondebugdepth <number>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-tmtoolstm1analyze--d-directory---falcondebug-array---falcondebugerror---falcondebugsuccess---falcondebugdepth-number---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx tmtools:tm1:extract [-s <directory>] [--falcondebug <array>] [--falcondebugerror] [--falcondebugsuccess] [--falcondebugdepth <number>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-tmtoolstm1extract--s-directory---falcondebug-array---falcondebugerror---falcondebugsuccess---falcondebugdepth-number---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx tmtools:tm1:transform -s <directory> [--falcondebug <array>] [--falcondebugerror] [--falcondebugsuccess] [--falcondebugdepth <number>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-tmtoolstm1transform--s-directory---falcondebug-array---falcondebugerror---falcondebugsuccess---falcondebugdepth-number---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx tmtools:tm2:clean -s <directory> [--falcondebug <array>] [--falcondebugerror] [--falcondebugsuccess] [--falcondebugdepth <number>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-tmtoolstm2clean--s-directory---falcondebug-array---falcondebugerror---falcondebugsuccess---falcondebugdepth-number---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx tmtools:tm2:deploy -s <directory> [--falcondebug <array>] [--falcondebugerror] [--falcondebugsuccess] [--falcondebugdepth <number>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-tmtoolstm2deploy--s-directory---falcondebug-array---falcondebugerror---falcondebugsuccess---falcondebugdepth-number---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx tmtools:tm2:load -s <directory> [--falcondebug <array>] [--falcondebugerror] [--falcondebugsuccess] [--falcondebugdepth <number>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-tmtoolstm2load--s-directory---falcondebug-array---falcondebugerror---falcondebugsuccess---falcondebugdepth-number---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)

## `sfdx tmtools:tm1:analyze [-d <directory>] [--falcondebug <array>] [--falcondebugerror] [--falcondebugsuccess] [--falcondebugdepth <number>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

TODO: Write Description

```
USAGE
  $ sfdx tmtools:tm1:analyze [-d <directory>] [--falcondebug <array>] [--falcondebugerror] [--falcondebugsuccess] 
  [--falcondebugdepth <number>] [--json] [--loglevel 
  trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -d, --outputdir=outputdir                                                         [default: .] TODO: Validate need for
                                                                                    this flag then write description

  --falcondebug=falcondebug                                                         [default: ] List of debug namespaces
                                                                                    which should render output

  --falcondebugdepth=falcondebugdepth                                               [default: 2] Sets the depth of
                                                                                    object inspection when debug output
                                                                                    is displayed

  --falcondebugerror                                                                Display extended information for
                                                                                    uncaught Errors

  --falcondebugsuccess                                                              Display extended information upon
                                                                                    successful command completion

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

EXAMPLES
  $ sfdx tmtools:tm1:analyze
  $ sfdx tmtools:tm1:analyze -d ~/custom-target-directory
```

_See code: [src/commands/tmtools/tm1/analyze.ts](https://github.com/sfdx-isv/territory-management-tools/blob/v0.0.0/src/commands/tmtools/tm1/analyze.ts)_

## `sfdx tmtools:tm1:extract [-s <directory>] [--falcondebug <array>] [--falcondebugerror] [--falcondebugsuccess] [--falcondebugdepth <number>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

Given the location of a TM1 Analysis file (tm1-analysis.json), extracts all TM1 config (data & metadata) from the associated org and saves it locally.

```
USAGE
  $ sfdx tmtools:tm1:extract [-s <directory>] [--falcondebug <array>] [--falcondebugerror] [--falcondebugsuccess] 
  [--falcondebugdepth <number>] [--json] [--loglevel 
  trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -s, --sourcedir=sourcedir                                                         [default: .] Directory that contains
                                                                                    a tm1-analysis.json file. Defaults
                                                                                    to . (current directory) if not
                                                                                    specified.

  --falcondebug=falcondebug                                                         [default: ] List of debug namespaces
                                                                                    which should render output

  --falcondebugdepth=falcondebugdepth                                               [default: 2] Sets the depth of
                                                                                    object inspection when debug output
                                                                                    is displayed

  --falcondebugerror                                                                Display extended information for
                                                                                    uncaught Errors

  --falcondebugsuccess                                                              Display extended information upon
                                                                                    successful command completion

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

EXAMPLES
  $ sfdx tmtools:tm1:extract
  $ sfdx tmtools:tm1:extract -s ~/tm1-analysis-directory
```

_See code: [src/commands/tmtools/tm1/extract.ts](https://github.com/sfdx-isv/territory-management-tools/blob/v0.0.0/src/commands/tmtools/tm1/extract.ts)_

## `sfdx tmtools:tm1:transform -s <directory> [--falcondebug <array>] [--falcondebugerror] [--falcondebugsuccess] [--falcondebugdepth <number>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

Transforms locally stored TM1 data and metadata into bundles that can be deployed back into the source org once Enterprise Territory Management (TM2) is activated.

```
USAGE
  $ sfdx tmtools:tm1:transform -s <directory> [--falcondebug <array>] [--falcondebugerror] [--falcondebugsuccess] 
  [--falcondebugdepth <number>] [--json] [--loglevel 
  trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -s, --sourcedir=sourcedir                                                         (required) [default: .] Directory
                                                                                    that contains a tm1-extraction.json
                                                                                    file. Defaults to . (current
                                                                                    directory) if not specified.

  --falcondebug=falcondebug                                                         [default: ] List of debug namespaces
                                                                                    which should render output

  --falcondebugdepth=falcondebugdepth                                               [default: 2] Sets the depth of
                                                                                    object inspection when debug output
                                                                                    is displayed

  --falcondebugerror                                                                Display extended information for
                                                                                    uncaught Errors

  --falcondebugsuccess                                                              Display extended information upon
                                                                                    successful command completion

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

EXAMPLES
  $ sfdx tmtools:tm1:transform
  $ sfdx tmtools:tm1:transform -s ~/tm1-extraction-directory
```

_See code: [src/commands/tmtools/tm1/transform.ts](https://github.com/sfdx-isv/territory-management-tools/blob/v0.0.0/src/commands/tmtools/tm1/transform.ts)_

## `sfdx tmtools:tm2:clean -s <directory> [--falcondebug <array>] [--falcondebugerror] [--falcondebugsuccess] [--falcondebugdepth <number>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

TODO: Write Description

```
USAGE
  $ sfdx tmtools:tm2:clean -s <directory> [--falcondebug <array>] [--falcondebugerror] [--falcondebugsuccess] 
  [--falcondebugdepth <number>] [--json] [--loglevel 
  trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -s, --sourcedir=sourcedir                                                         (required) [default: .] TODO: Write
                                                                                    Description

  --falcondebug=falcondebug                                                         [default: ] List of debug namespaces
                                                                                    which should render output

  --falcondebugdepth=falcondebugdepth                                               [default: 2] Sets the depth of
                                                                                    object inspection when debug output
                                                                                    is displayed

  --falcondebugerror                                                                Display extended information for
                                                                                    uncaught Errors

  --falcondebugsuccess                                                              Display extended information upon
                                                                                    successful command completion

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

EXAMPLES
  $ sfdx tmtools:tm2:clean
  $ sfdx tmtools:tm2:clean -s ~/tm1-transformation-directory
```

_See code: [src/commands/tmtools/tm2/clean.ts](https://github.com/sfdx-isv/territory-management-tools/blob/v0.0.0/src/commands/tmtools/tm2/clean.ts)_

## `sfdx tmtools:tm2:deploy -s <directory> [--falcondebug <array>] [--falcondebugerror] [--falcondebugsuccess] [--falcondebugdepth <number>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

TODO: Write Description

```
USAGE
  $ sfdx tmtools:tm2:deploy -s <directory> [--falcondebug <array>] [--falcondebugerror] [--falcondebugsuccess] 
  [--falcondebugdepth <number>] [--json] [--loglevel 
  trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -s, --sourcedir=sourcedir                                                         (required) [default: .] TODO: Write
                                                                                    Description

  --falcondebug=falcondebug                                                         [default: ] List of debug namespaces
                                                                                    which should render output

  --falcondebugdepth=falcondebugdepth                                               [default: 2] Sets the depth of
                                                                                    object inspection when debug output
                                                                                    is displayed

  --falcondebugerror                                                                Display extended information for
                                                                                    uncaught Errors

  --falcondebugsuccess                                                              Display extended information upon
                                                                                    successful command completion

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

EXAMPLES
  $ sfdx tmtools:tm2:deploy
  $ sfdx tmtools:tm2:deploy -s ~/tm1-transformation-directory
```

_See code: [src/commands/tmtools/tm2/deploy.ts](https://github.com/sfdx-isv/territory-management-tools/blob/v0.0.0/src/commands/tmtools/tm2/deploy.ts)_

## `sfdx tmtools:tm2:load -s <directory> [--falcondebug <array>] [--falcondebugerror] [--falcondebugsuccess] [--falcondebugdepth <number>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

TODO: Write Description

```
USAGE
  $ sfdx tmtools:tm2:load -s <directory> [--falcondebug <array>] [--falcondebugerror] [--falcondebugsuccess] 
  [--falcondebugdepth <number>] [--json] [--loglevel 
  trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -s, --sourcedir=sourcedir                                                         (required) [default: .] TODO: Write
                                                                                    Description

  --falcondebug=falcondebug                                                         [default: ] List of debug namespaces
                                                                                    which should render output

  --falcondebugdepth=falcondebugdepth                                               [default: 2] Sets the depth of
                                                                                    object inspection when debug output
                                                                                    is displayed

  --falcondebugerror                                                                Display extended information for
                                                                                    uncaught Errors

  --falcondebugsuccess                                                              Display extended information upon
                                                                                    successful command completion

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

EXAMPLES
  $ sfdx tmtools:tm2:load
  $ sfdx tmtools:tm2:load -s ~/tm1-transformation-directory
```

_See code: [src/commands/tmtools/tm2/load.ts](https://github.com/sfdx-isv/territory-management-tools/blob/v0.0.0/src/commands/tmtools/tm2/load.ts)_
<!-- commandsstop -->
<!-- debugging-your-plugin -->
# Debugging your plugin
We recommend using the Visual Studio Code (VS Code) IDE for your plugin development. Included in the `.vscode` directory of this plugin is a `launch.json` config file, which allows you to attach a debugger to the node process when running your commands.

To debug the `hello:org` command: 
1. Start the inspector
  
If you linked your plugin to the sfdx cli, call your command with the `dev-suspend` switch: 
```sh-session
$ sfdx hello:org -u myOrg@example.com --dev-suspend
```
  
Alternatively, to call your command using the `bin/run` script, set the `NODE_OPTIONS` environment variable to `--inspect-brk` when starting the debugger:
```sh-session
$ NODE_OPTIONS=--inspect-brk bin/run hello:org -u myOrg@example.com
```

2. Set some breakpoints in your command code
3. Click on the Debug icon in the Activity Bar on the side of VS Code to open up the Debug view.
4. In the upper left hand corner of VS Code, verify that the "Attach to Remote" launch configuration has been chosen.
5. Hit the green play button to the left of the "Attach to Remote" launch configuration window. The debugger should now be suspended on the first line of the program. 
6. Hit the green play button at the top middle of VS Code (this play button will be to the right of the play button that you clicked in step #5).
<br><img src=".images/vscodeScreenshot.png" width="480" height="278"><br>
Congrats, you are debugging!
