//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @file          commands/tmtools/tm1/extract.ts
 * @copyright     Vivek M. Chawla - 2019
 * @author        Vivek M. Chawla <@VivekMChawla>
 * @summary       Implements the CLI command "tmtools:tm1:extract"
 * @description   Salesforce CLI Plugin command (tmtools:tm1:extract) that allows a Salesforce Admin
 *                to extract Salesforce Territory Management (TM1) data and metadata from an org
 *                that has previously been analyzed by tmtools:tm1:analyze, storing that data
 *                locally on the user's filesystem.
 * @version       1.0.0
 * @license       MIT
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
// Import External Modules
import {flags}                        from  '@salesforce/command';  // Allows creation of flags for CLI commands.
import {Messages}                     from  '@salesforce/core';     // Messages library that simplifies using external JSON for string reuse.
import {SfdxError}                    from  '@salesforce/core';     // Generalized SFDX error which also contains an action.
import {AnyJson}                      from  '@salesforce/ts-types'; // Safe type for use where "any" might otherwise be used.

// Import Local Modules
import {SfdxFalconDebug}              from  '../../../modules/sfdx-falcon-debug';           // Class. Provides custom "debugging" services (ie. debug-style info to console.log()).
import {SfdxFalconError}              from  '../../../modules/sfdx-falcon-error';           // Class. Extends SfdxError to provide specialized error structures for SFDX-Falcon modules.
import {SfdxFalconYeomanCommand}      from  '../../../modules/sfdx-falcon-yeoman-command';  // Class. Base class that CLI commands in this project that use Yeoman should use.

// Import Internal Types
import {SfdxFalconCommandType}        from  '../../../modules/sfdx-falcon-command'; // Enum. Represents the types of SFDX-Falcon Commands.

// Set the File Local Debug Namespace
const dbgNs = 'COMMAND:tmtools-tm1-extract:';
SfdxFalconDebug.msg(`${dbgNs}`, `Debugging initialized for ${dbgNs}`);

// Use SfdxCore's Messages framework to get the message bundles for this command.
Messages.importMessagesDirectory(__dirname);
const commandMessages = Messages.loadMessages('territory-management-tools', 'tmtools-tm1-extract');


//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @class       TmtoolsTm1Extract
 * @extends     SfdxFalconYeomanCommand
 * @summary     Implements the CLI Command "tmtools:tm1:extract"
 * @description The command "tmtools:tm1:extract" asks the user to specify a directory where a
 *              previously-run TM1 Analysis (tm1-analysis.json) can be found. It then takes the
 *              org information found there and proceeds to extract the TM1 config (data & metadata)
 *              from that org and saves it to the user's file system in the same directory where
 *              the tm1-analysis.json file was found.
 * @public
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export default class TmtoolsTm1Extract extends SfdxFalconYeomanCommand {

  // Define the basic properties of this CLI command.
  public static description = commandMessages.getMessage('commandDescription');
  public static hidden      = false;
  public static examples    = [
    `$ sfdx tmtools:tm1:extract`,
    `$ sfdx tmtools:tm1:extract -s ~/tm1-analysis-source-directory`
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
    ...SfdxFalconYeomanCommand.falconBaseflagsConfig
  };

  // Identify the core SFDX arguments/features required by this command.
  protected static requiresProject        = false;  // True if an SFDX Project workspace is REQUIRED.
  protected static requiresUsername       = false;  // True if an org username is REQUIRED.
  protected static requiresDevhubUsername = false;  // True if a hub org username is REQUIRED.
  protected static supportsUsername       = false;  // True if an org username is OPTIONAL.
  protected static supportsDevhubUsername = false;  // True if a hub org username is OPTIONAL.

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @function    run
   * @returns     {Promise<AnyJson>}  Resolves with a JSON object that the CLI
   *              will pass to the user as stdout if the --json flag was set.
   * @description Entrypoint function for "sfdx tmtools:tm1:extract".
   * @public @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  public async run():Promise<AnyJson> {

    // Initialize the SfdxFalconCommand (required by ALL classes that extend SfdxFalconCommand).
    this.sfdxFalconCommandInit('tmtools:tm1:extract', SfdxFalconCommandType.UNKNOWN);

    // Run a Yeoman Generator to interact with and run tasks for the user.
    await super.runYeomanGenerator({
      generatorType:    'tmtools-tm1-extract',
      sourceDir:        this.sourceDirectory,
      options: []
    })
    .then(generatorResult   => this.onSuccess(generatorResult)) // Implemented by parent class
    .catch(generatorResult  => this.onError(generatorResult));  // Implemented by parent class

    // Return the JSON Response that was created by onSuccess()
    return this.falconJsonResponse as unknown as AnyJson;
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      buildFinalError
   * @param       {SfdxFalconError} cmdError  Required. Error object used as
   *              the basis for the "friendly error message" being created
   *              by this method.
   * @returns     {SfdxError}
   * @description Builds a user-friendly error message that is appropriate to
   *              the CLI command that's being implemented by this class. The
   *              output of this method will always be used by the onError()
   *              method from the base class to communicate the end-of-command
   *              error state.
   * @protected
   */
  //───────────────────────────────────────────────────────────────────────────┘
  protected buildFinalError(cmdError:SfdxFalconError):SfdxError {

    // If not implementing anything special here, simply return cmdError.
    return cmdError;
  }
}
