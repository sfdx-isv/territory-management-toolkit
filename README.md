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
* [`sfdx falcon:adk:clone [-d <directory>] [--falcondebug <array>] [--falcondebugerror] [--falcondebugsuccess] [--falcondebugdepth <number>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-falconadkclone--d-directory---falcondebug-array---falcondebugerror---falcondebugsuccess---falcondebugdepth-number---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx falcon:adk:create [-d <directory>] [--falcondebug <array>] [--falcondebugerror] [--falcondebugsuccess] [--falcondebugdepth <number>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-falconadkcreate--d-directory---falcondebug-array---falcondebugerror---falcondebugsuccess---falcondebugdepth-number---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx falcon:adk:install [-d <directory>] [-f <string>] [-x <string>] [--falcondebug <array>] [--falcondebugerror] [--falcondebugsuccess] [--falcondebugdepth <number>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-falconadkinstall--d-directory--f-string--x-string---falcondebug-array---falcondebugerror---falcondebugsuccess---falcondebugdepth-number---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx falcon:apk:clone [-d <directory>] [--falcondebug <array>] [--falcondebugerror] [--falcondebugsuccess] [--falcondebugdepth <number>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-falconapkclone--d-directory---falcondebug-array---falcondebugerror---falcondebugsuccess---falcondebugdepth-number---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx falcon:apk:create [-d <directory>] [--falcondebug <array>] [--falcondebugerror] [--falcondebugsuccess] [--falcondebugdepth <number>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-falconapkcreate--d-directory---falcondebug-array---falcondebugerror---falcondebugsuccess---falcondebugdepth-number---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx tmtools:tm1:export [-d <directory>] [--falcondebug <array>] [--falcondebugerror] [--falcondebugsuccess] [--falcondebugdepth <number>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-tmtoolstm1export--d-directory---falcondebug-array---falcondebugerror---falcondebugsuccess---falcondebugdepth-number---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx tmtools:tm1:transform -s <directory> [-d <directory>] [--falcondebug <array>] [--falcondebugerror] [--falcondebugsuccess] [--falcondebugdepth <number>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-tmtoolstm1transform--s-directory--d-directory---falcondebug-array---falcondebugerror---falcondebugsuccess---falcondebugdepth-number---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx tmtools:tm2:import -s <directory> [-d <directory>] [--falcondebug <array>] [--falcondebugerror] [--falcondebugsuccess] [--falcondebugdepth <number>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-tmtoolstm2import--s-directory--d-directory---falcondebug-array---falcondebugerror---falcondebugsuccess---falcondebugdepth-number---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)

## `sfdx falcon:adk:clone [-d <directory>] [--falcondebug <array>] [--falcondebugerror] [--falcondebugsuccess] [--falcondebugdepth <number>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

Clones an AppExchange Demo Kit (ADK) project from a remote Git repository.

```
USAGE
  $ sfdx falcon:adk:clone [-d <directory>] [--falcondebug <array>] [--falcondebugerror] [--falcondebugsuccess] 
  [--falcondebugdepth <number>] [--json] [--loglevel 
  trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

ARGUMENTS
  GIT_REMOTE_URI  URI (https only) of the Git repository to clone (eg. https://github.com/GitHubUser/my-repository.git)
  GIT_CLONE_DIR   Directory name of the cloned repository (defaults to repo name if not specified)

OPTIONS
  -d, --outputdir=outputdir                                                         [default: .] Directory to clone the
                                                                                    AppExchange Demo Kit (ADK) project
                                                                                    into

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
  $ sfdx falcon:adk:clone https://github.com/GitHubUser/my-repository.git
  $ sfdx falcon:adk:clone https://github.com/GitHubUser/my-repository.git MyRepoDirName
  $ sfdx falcon:adk:clone https://github.com/GitHubUser/my-repository.git MyRepoDirName \
                          --outputdir ~/demos/appexchange-demo-kit-projects
```

_See code: [src/commands/falcon/adk/clone.ts](https://github.com/sfdx-isv/territory-management-tools/blob/v0.0.0/src/commands/falcon/adk/clone.ts)_

## `sfdx falcon:adk:create [-d <directory>] [--falcondebug <array>] [--falcondebugerror] [--falcondebugsuccess] [--falcondebugdepth <number>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

Creates an AppExchange Demo Kit (ADK) project

```
USAGE
  $ sfdx falcon:adk:create [-d <directory>] [--falcondebug <array>] [--falcondebugerror] [--falcondebugsuccess] 
  [--falcondebugdepth <number>] [--json] [--loglevel 
  trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -d, --outputdir=outputdir                                                         [default: .] Directory where your
                                                                                    ADK project will be created

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
  $ sfdx falcon:adk:create
  $ sfdx falcon:adk:create --outputdir ~/ADK-Projects
```

_See code: [src/commands/falcon/adk/create.ts](https://github.com/sfdx-isv/territory-management-tools/blob/v0.0.0/src/commands/falcon/adk/create.ts)_

## `sfdx falcon:adk:install [-d <directory>] [-f <string>] [-x <string>] [--falcondebug <array>] [--falcondebugerror] [--falcondebugsuccess] [--falcondebugdepth <number>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

Reads an AppExchange Demo Kit (ADK) Recipe and builds a customized org

```
USAGE
  $ sfdx falcon:adk:install [-d <directory>] [-f <string>] [-x <string>] [--falcondebug <array>] [--falcondebugerror] 
  [--falcondebugsuccess] [--falcondebugdepth <number>] [--json] [--loglevel 
  trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -d, --projectdir=projectdir                                                       [default: .] Path to a directory
                                                                                    that contains a fully-configured ADK
                                                                                    project

  -f, --recipefile=recipefile                                                       Overrides 'demoRecipes' setting from
                                                                                    sfdx-project.json to run a specific
                                                                                    Recipe

  -x, --extendedoptions=extendedoptions                                             [default: {}] Options for overriding
                                                                                    internal settings passed as a JSON
                                                                                    string

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
  $ sfdx falcon:adk:install
  $ sfdx falcon:adk:install --projectdir ~/demos/adk-projects/my-adk-project
  $ sfdx falcon:adk:install --projectdir ~/demos/adk-projects/my-adk-project \
                            --configfile my-alternate-demo-config.json
```

_See code: [src/commands/falcon/adk/install.ts](https://github.com/sfdx-isv/territory-management-tools/blob/v0.0.0/src/commands/falcon/adk/install.ts)_

## `sfdx falcon:apk:clone [-d <directory>] [--falcondebug <array>] [--falcondebugerror] [--falcondebugsuccess] [--falcondebugdepth <number>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

Clones an SFDX-Falcon project from a remote Git repository.

```
USAGE
  $ sfdx falcon:apk:clone [-d <directory>] [--falcondebug <array>] [--falcondebugerror] [--falcondebugsuccess] 
  [--falcondebugdepth <number>] [--json] [--loglevel 
  trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

ARGUMENTS
  GIT_REMOTE_URI  URI (https only) of the Git repository to clone (eg. https://github.com/GitHubUser/my-repository.git)
  GIT_CLONE_DIR   Directory name of the cloned repository (defaults to repo name if not specified)

OPTIONS
  -d, --outputdir=outputdir                                                         [default: .] Directory to clone the
                                                                                    project into

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
  $ sfdx falcon:apk:clone git@github.com:GitHubUser/my-repository.git
  $ sfdx falcon:apk:clone https://github.com/GitHubUser/my-repository.git MyRepoDirName
  $ sfdx falcon:apk:clone https://github.com/GitHubUser/my-repository.git MyRepoDirName \
                         --outputdir ~/projects/appexchange-package-kit-projects
```

_See code: [src/commands/falcon/apk/clone.ts](https://github.com/sfdx-isv/territory-management-tools/blob/v0.0.0/src/commands/falcon/apk/clone.ts)_

## `sfdx falcon:apk:create [-d <directory>] [--falcondebug <array>] [--falcondebugerror] [--falcondebugsuccess] [--falcondebugdepth <number>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

Creates an AppExchange Package Kit (APK) project

```
USAGE
  $ sfdx falcon:apk:create [-d <directory>] [--falcondebug <array>] [--falcondebugerror] [--falcondebugsuccess] 
  [--falcondebugdepth <number>] [--json] [--loglevel 
  trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -d, --outputdir=outputdir                                                         [default: .] Directory where your
                                                                                    APK project will be created

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
  $ sfdx falcon:apk:create
  $ sfdx falcon:apk:create --outputdir ~/projects/sfdx-falcon-projects
```

_See code: [src/commands/falcon/apk/create.ts](https://github.com/sfdx-isv/territory-management-tools/blob/v0.0.0/src/commands/falcon/apk/create.ts)_

## `sfdx tmtools:tm1:export [-d <directory>] [--falcondebug <array>] [--falcondebugerror] [--falcondebugsuccess] [--falcondebugdepth <number>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

TODO: Write Description

```
USAGE
  $ sfdx tmtools:tm1:export [-d <directory>] [--falcondebug <array>] [--falcondebugerror] [--falcondebugsuccess] 
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
  $ sfdx tmtools:tm1:export
  $ sfdx tmtools:tm1:export TODO: finish this example
```

_See code: [src/commands/tmtools/tm1/export.ts](https://github.com/sfdx-isv/territory-management-tools/blob/v0.0.0/src/commands/tmtools/tm1/export.ts)_

## `sfdx tmtools:tm1:transform -s <directory> [-d <directory>] [--falcondebug <array>] [--falcondebugerror] [--falcondebugsuccess] [--falcondebugdepth <number>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

TODO: Write Description

```
USAGE
  $ sfdx tmtools:tm1:transform -s <directory> [-d <directory>] [--falcondebug <array>] [--falcondebugerror] 
  [--falcondebugsuccess] [--falcondebugdepth <number>] [--json] [--loglevel 
  trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -d, --outputdir=outputdir                                                         [default: .] TODO: Validate need for
                                                                                    this flag then write description

  -s, --sourcedir=sourcedir                                                         (required) TODO: Validate need for
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
  $ sfdx tmtools:tm1:transform
  $ sfdx tmtools:tm1:transform TODO: finish this example
```

_See code: [src/commands/tmtools/tm1/transform.ts](https://github.com/sfdx-isv/territory-management-tools/blob/v0.0.0/src/commands/tmtools/tm1/transform.ts)_

## `sfdx tmtools:tm2:import -s <directory> [-d <directory>] [--falcondebug <array>] [--falcondebugerror] [--falcondebugsuccess] [--falcondebugdepth <number>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

TODO: Write Description

```
USAGE
  $ sfdx tmtools:tm2:import -s <directory> [-d <directory>] [--falcondebug <array>] [--falcondebugerror] 
  [--falcondebugsuccess] [--falcondebugdepth <number>] [--json] [--loglevel 
  trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -d, --outputdir=outputdir                                                         [default: .] TODO: Validate need for
                                                                                    this flag then write description

  -s, --sourcedir=sourcedir                                                         (required) TODO: Validate need for
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
  $ sfdx tmtools:tm2:import
  $ sfdx tmtools:tm2:import TODO: finish this example
```

_See code: [src/commands/tmtools/tm2/import.ts](https://github.com/sfdx-isv/territory-management-tools/blob/v0.0.0/src/commands/tmtools/tm2/import.ts)_
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
