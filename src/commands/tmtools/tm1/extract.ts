//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @author        Vivek M. Chawla <@VivekMChawla>
 * @copyright     2019, Vivek M. Chawla / Salesforce. All rights reserved.
 * @license       BSD-3-Clause For full license text, see the LICENSE file in the repo root or
 *                `https://opensource.org/licenses/BSD-3-Clause`
 * @file          commands/tmtools/tm1/extract.ts
 * @summary       Implements the CLI command `tmtools:tm1:extract`.
 * @description   Salesforce CLI Plugin command `tmtools:tm1:extract`. Allows a Salesforce Admin
 *                to extract Salesforce Territory Management (TM1) data and metadata from an org
 *                that has previously been analyzed by `tmtools:tm1:analyze`, storing that data
 *                locally on the user's filesystem.
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
const dbgNs = 'COMMAND:tmtools-tm1-extract';
SfdxFalconDebug.msg(`${dbgNs}:`, `Debugging initialized for ${dbgNs}`);

// Use SfdxCore's Messages framework to get the message bundles for this command.
Messages.importMessagesDirectory(__dirname);
const commandMessages = Messages.loadMessages('territory-management-toolkit', 'tmtools-tm1-extract');


//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @class       TmtoolsTm1Extract
 * @extends     SfdxFalconGeneratorCommand
 * @summary     Implements the CLI Command `tmtools:tm1:extract`.
 * @description The command `tmtools:tm1:extract` asks the user to specify a directory where a
 *              previously-run TM1 Analysis (`tm1-analysis.json`) can be found. It then takes the
 *              org information found there and proceeds to extract the TM1 config (data & metadata)
 *              from that org and saves it to the user's file system in the same directory where
 *              the `tm1-analysis.json` file was found.
 * @public
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export default class TmtoolsTm1Extract extends SfdxFalconGeneratorCommand {

  // Define the basic properties of this CLI command.
  public static description = commandMessages.getMessage('commandDescription');
  public static hidden      = false;
  public static examples    = [
    `$ sfdx tmtools:tm1:extract`,
    `$ sfdx tmtools:tm1:extract -s ~/tm1-analysis-report-directory`
  ];

  //───────────────────────────────────────────────────────────────────────────┐
  // Define the flags used by this command.
  // -s --SOURCEDIR   Directory that contains a tm1-analysis.json file.
  //                  Defaults to . (current directory) if not specified.
  //───────────────────────────────────────────────────────────────────────────┘
  protected static flagsConfig = {
    sourcedir: flags.directory({
      char: 's',
      required: false,
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
   * @description Entrypoint function for `sfdx tmtools:tm1:extract`.
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
      generatorType:  'tmtools-tm1-extract',
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
