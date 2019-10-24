//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @author        Vivek M. Chawla <@VivekMChawla>
 * @copyright     2019, Vivek M. Chawla / Salesforce. All rights reserved.
 * @license       BSD-3-Clause For full license text, see the LICENSE file in the repo root or
 *                `https://opensource.org/licenses/BSD-3-Clause`
 * @file          commands/tmtools/tm2/deploy.ts
 * @summary       Implements the CLI command `tmtools:tm2:deploy`.
 * @description   Salesforce CLI Plugin command `tmtools:tm2:deploy`. Allows a Salesforce Admin
 *                to deploy Salesforce Enterprise Territory Management (TM2) metadata from a local
 *                directory into an org with TM2 enabled. This command MUST operate on a directory
 *                that holds a TM1 Transformation Report (`tm1-transformation.json`).
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
// Import External Libraries, Classes, & Functions
import  {flags}                       from  '@salesforce/command';  // Allows creation of flags for CLI commands.
import  {Messages}                    from  '@salesforce/core';     // Messages library that simplifies using external JSON for string reuse.
import  {SfdxFalconGeneratorCommand}  from  '@sfdx-falcon/command'; // Abstract Class. Extend when building Salesforce CLI commands that use the SFDX-Falcon Library.
import  {SfdxFalconDebug}             from  '@sfdx-falcon/debug';   // Class. Provides custom "debugging" services (ie. debug-style info to console.log()).
import  {SfdxFalconResult}            from  '@sfdx-falcon/status';  // Class. Implements a framework for creating results-driven, informational objects with a concept of heredity (child results) and the ability to "bubble up" both Errors (thrown exceptions) and application-defined "failures".
import  path                          = require('path');            // NodeJS native file path library.

// Set the File Local Debug Namespace
const dbgNs = 'COMMAND:tmtools-tm2-deploy';
SfdxFalconDebug.msg(`${dbgNs}:`, `Debugging initialized for ${dbgNs}`);

// Use SfdxCore's Messages framework to get the message bundles for this command.
Messages.importMessagesDirectory(__dirname);
const commandMessages = Messages.loadMessages('territory-management-toolkit', 'tmtools-tm2-deploy');


//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @class       TmtoolsTm2Deploy
 * @extends     SfdxFalconGeneratorCommand
 * @summary     Implements the CLI Command `tmtools:tm2:deploy`.
 * @description The command `tmtools:tm2:deploy` asks the user to...
 *              TODO: Add description
 * @public
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export default class TmtoolsTm2Deploy extends SfdxFalconGeneratorCommand {

  // Define the basic properties of this CLI command.
  public static description = commandMessages.getMessage('commandDescription');
  public static hidden      = false;
  public static examples    = [
    `$ sfdx tmtools:tm2:deploy`,
    `$ sfdx tmtools:tm2:deploy -s ~/tm1-transformation-report-directory`
  ];

  //───────────────────────────────────────────────────────────────────────────┐
  // Define the flags used by this command.
  // -s --SOURCEDIR   Directory that contains a tm1-transformation.json file.
  //                  Defaults to . (current directory) if not specified.
  //───────────────────────────────────────────────────────────────────────────┘
  protected static flagsConfig = {
    sourcedir: flags.directory({
      char: 's',
      required: true,
      description: commandMessages.getMessage('sourcedir_FlagDescription'),
      default: '.',
      hidden: false
    }),

    // IMPORTANT! The next line MUST be here to import the FalconDebug flags.
    ...SfdxFalconGeneratorCommand.falconBaseflagsConfig
  };

  // Identify the core SFDX arguments/features required by this command.
  protected static requiresProject        = false;  // True if an SFDX Project workspace is REQUIRED.
  protected static requiresUsername       = false;  // True if an org username is REQUIRED.
  protected static requiresDevhubUsername = false;  // True if a hub org username is REQUIRED.
  protected static supportsUsername       = false;  // True if an org username is OPTIONAL.
  protected static supportsDevhubUsername = false;  // True if a hub org username is OPTIONAL.

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @function    runCommand
   * @returns     {Promise<AnyJson>}  Resolves with a JSON object that the CLI
   *              will pass to the user as stdout if the `--json` flag was set.
   * @description Entrypoint function for `sfdx tmtools:tm2:import`.
   * @public @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  public async runCommand():Promise<SfdxFalconResult> {

    // Set function-local debug namespace.
    const funcName  = `runCommand`;
    const dbgNsLocal  = `${dbgNs}:${funcName}`;

    // Run a Yeoman Generator to interact with and run tasks for the user.
    const generatorResult = await super.runGenerator({
      commandName:    this.commandName,
      generatorPath:  path.resolve(__dirname, '../../../generators'),
      generatorType:  'tmtools-tm2-deploy',
      packageJson:    this.packageJson,
      customOpts: {
        sourceDir:    this.sourceDirectory
      }
    });

    // Debug and send the results back to the caller.
    SfdxFalconDebug.obj(`${dbgNsLocal}:generatorResult:`, generatorResult);
    return generatorResult;
  }
}
