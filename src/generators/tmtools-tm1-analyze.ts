//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @file          generators/tmtools-tm1-analyze.ts
 * @copyright     Vivek M. Chawla - 2019
 * @author        Vivek M. Chawla <@VivekMChawla>
 * @summary       Yeoman Generator for analyzing TM1 config (metadata and data) from an org.
 * @description   Salesforce CLI Plugin command (tmtools:tm1:analyze) that allows a Salesforce
 *                Administrator to analyze Territory Management (TM1) metadata and data from an
 *                org that they have connected their Salesforce CLI to. The analysis is saved to
 *                the user's local system in a special JSON file (tm1-analyze-result.json) that will
 *                be consumed by later use of the EXTRACT command (tmtools:tm1:extract).
 * @version       1.0.0
 * @license       MIT
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
// Import External Libraries & Modules
import chalk      from  'chalk';  // Helps write colored text to the console.
import * as path  from  'path';   // Library. Helps resolve local paths at runtime.

// Import Internal Libraries
import * as iq                          from  '../modules/sfdx-falcon-util/interview-questions';  // Library. Helper functions that create Interview Questions.
import * as listrTasks                  from  '../modules/sfdx-falcon-util/listr-tasks';          // Library. Helper functions that make using Listr with SFDX-Falcon easier.

// Import Internal Classes & Functions
import {SfdxFalconDebug}                from  '../modules/sfdx-falcon-debug';                     // Class. Provides custom "debugging" services (ie. debug-style info to console.log()).
import {SfdxFalconError}                from  '../modules/sfdx-falcon-error';                     // Class. Extends SfdxError to provide specialized error structures for SFDX-Falcon modules.
import {SfdxFalconInterview}            from  '../modules/sfdx-falcon-interview';                 // Class. Provides a standard way of building a multi-group Interview to collect user input.
import {SfdxFalconResult}               from  '../modules/sfdx-falcon-result';                    // Class. Framework for creating results-driven, informational objects with a concept of heredity (child results).
import {SfdxFalconKeyValueTableDataRow} from  '../modules/sfdx-falcon-util/ux';                   // Interface. Represents a row of data in an SFDX-Falcon data table.
import {SfdxFalconTableData}            from  '../modules/sfdx-falcon-util/ux';                   // Interface. Represents and array of SfdxFalconKeyValueTableDataRow objects.
import {GeneratorOptions}               from  '../modules/sfdx-falcon-yeoman-command';            // Interface. Represents options used by SFDX-Falcon Yeoman generators.
import {SfdxFalconYeomanGenerator}      from  '../modules/sfdx-falcon-yeoman-generator';          // Class. Abstract base class class for building Yeoman Generators for SFDX-Falcon commands.

// Import Falcon Types
import {YeomanChoice}                   from  '../modules/sfdx-falcon-types';                     // Interface. Represents a Yeoman/Inquirer choice object.
import {SfdxOrgInfoMap}                 from  '../modules/sfdx-falcon-types';                     // Type. Alias for a Map with string keys holding SfdxOrgInfo values.
import {ScratchOrgInfoMap}              from  '../modules/sfdx-falcon-types';                     // Type. Alias for a Map with string keys holding ScratchOrgInfo values.

// Set the File Local Debug Namespace
const dbgNs = 'GENERATOR:tmtools-tm1-analyze:';
SfdxFalconDebug.msg(`${dbgNs}`, `Debugging initialized for ${dbgNs}`);


//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @interface   InterviewAnswers
 * @description Represents answers to the questions asked in the Yeoman interview.
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
interface InterviewAnswers {

  // Project Settings
  targetDirectory:    string;

  // Target Org Type
  isScratchOrg:       boolean;

  // SFDX Org Aliases
  targetOrgAlias:     string;

  // SFDX Org Usernames
  targetOrgUsername:  string;
}

//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @class       Tm1Analyze
 * @extends     SfdxFalconYeomanGenerator
 * @summary     Yeoman generator class. Analyzes the TM1 configuration (data+metadata) in target org.
 * @description Uses Yeoman to run the user through an interview, analyzes the TM1 configuration
 *              data and metadata inside the target org specified by the user, then saves that
 *              analysis to the user's local system as a special JSON result file.
 * @public
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export default class Tm1Analyze extends SfdxFalconYeomanGenerator<InterviewAnswers> {

  // Define class members specific to this Generator.
  protected targetOrgAliasChoices:  YeomanChoice[];     // Array of target org aliases/usernames in the form of Yeoman choices.
  protected scratchOrgAliasChoices: YeomanChoice[];     // Array of scratch org aliases/usernames in the form of Yeoman choices.

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @constructs  Tm1Analyze
   * @param       {string|string[]} args Required. Not used (as far as I know).
   * @param       {GeneratorOptions}  opts Required. Sets generator options.
   * @description Constructs a Tm1Analyze object.
   * @public
   */
  //───────────────────────────────────────────────────────────────────────────┘
  constructor(args:string|string[], opts:GeneratorOptions) {

    // Call the parent constructor to initialize the Yeoman Generator.
    super(args, opts);

    // Initialize the "Confirmation Question".
    this.confirmationQuestion = `Analyze your org's TM1 configuration using the above settings?`;

    // Initialize Target/Scratch Org "Alias Choices".
    this.targetOrgAliasChoices  = new Array<YeomanChoice>();
    this.scratchOrgAliasChoices = new Array<YeomanChoice>();

    // Initialize DEFAULT Interview Answers.
    // Project Settings
    this.defaultAnswers.targetDirectory   = path.resolve(opts.outputDir as string);

    // Target Org Type
    this.defaultAnswers.isScratchOrg      = null;

    // SFDX Org Aliases
    this.defaultAnswers.targetOrgAlias    = 'NOT_SPECIFIED';

    // SFDX Org Usernames
    this.defaultAnswers.targetOrgUsername = 'NOT_SPECIFIED';

    // Initialize Shared Data.
    this.sharedData['targetOrgAliasChoices']  = this.targetOrgAliasChoices;
    this.sharedData['scratchOrgAliasChoices'] = this.scratchOrgAliasChoices;
    this.sharedData['cliCommandName']         = this.cliCommandName;
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      _buildInterview
   * @returns     {SfdxFalconInterview<InterviewAnswers>} Returns a fully fleshed
   *              SfdxFalconInterview object with zero or more prompts that the
   *              user will answer in an interview once this is run.
   * @description Allows the developer to build a complex, multi-step interview
   *              that Yeoman will execute during the "prompting" phase.
   * @protected
   */
  //───────────────────────────────────────────────────────────────────────────┘
  protected _buildInterview():SfdxFalconInterview<InterviewAnswers> {

    // Initialize the Interview object.
    const interview = new SfdxFalconInterview<InterviewAnswers>({
      defaultAnswers:     this.defaultAnswers,
      confirmation:       iq.confirmProceedRestart,
      confirmationHeader: chalk.yellow('Review Your Settings:'),
      display:            this._buildInterviewAnswersTableData,
      context:            this,
      sharedData:         this.sharedData
    });

    // Group 0: Provide a target directory for this project.
    interview.createGroup({
      title:        chalk.yellow('\nTarget Directory:'),
      questions:    iq.provideTargetDirectory
    });
    // Group 1: Choose a TM1 source org.
    interview.createGroup({
      title:        chalk.yellow('\nOrg Selection:'),
      questions:    iq.chooseTm1Org,
      questionsArgs: [
        '', // Empty string should force use of the default message.
        'Which org would you like to analyze?',
        'Which scratch org would you like to analyze?'
      ],
      confirmation: iq.confirmNoTm1TargetOrg,
      abort:  groupAnswers => {
        if (groupAnswers.targetOrgUsername === 'NOT_SPECIFIED') {
          return 'A connection to an org is required to continue.';
        }
        else {
          return false;
        }
      }
    });

    // Finished building the Interview.
    return interview;
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      _buildInterviewAnswersTableData
   * @param       {InterviewAnswers}  userAnswers Required.
   * @returns     {Promise<SfdxFalconTableData>}
   * @description Builds an SfdxFalconTableData object based on the Interview
   *              Answer values provided by the caller. This function can be
   *              used by an SfdxFalconInterview to reflect input to the user
   *              at the end of an Interview.
   * @protected @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  protected async _buildInterviewAnswersTableData(interviewAnswers:InterviewAnswers):Promise<SfdxFalconTableData> {

    // Declare an array of Falcon Table Data Rows
    const tableData = new Array<SfdxFalconKeyValueTableDataRow>();

    // Grab the SFDX Org Info Map out of Shared Data.
    const sfdxOrgInfoMap    = this.sharedData['sfdxOrgInfoMap']     as SfdxOrgInfoMap;
    const scratchOrgInfoMap = this.sharedData['scratchOrgInfoMap']  as ScratchOrgInfoMap;

    // Project related answers
    tableData.push({option:'Target Directory:', value:`${interviewAnswers.targetDirectory}`});

    // Org alias related answers
    if (interviewAnswers.isScratchOrg === false) {
      const targetOrgAlias = sfdxOrgInfoMap.get(interviewAnswers.targetOrgUsername) ? sfdxOrgInfoMap.get(interviewAnswers.targetOrgUsername).alias : 'NOT_SPECIFIED';
      tableData.push({option:'Target Org Alias:', value:`${targetOrgAlias}`});
    }
    else {
      const targetOrgAlias = scratchOrgInfoMap.get(interviewAnswers.targetOrgUsername) ? scratchOrgInfoMap.get(interviewAnswers.targetOrgUsername).alias : 'NOT_SPECIFIED';
      tableData.push({option:'Scratch Org Alias:', value:`${targetOrgAlias}`});
    }

    // Return the Falcon Table Data.
    return tableData;
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      _analyzeTm1Config
   * @returns     {Promise<void>}
   * @description Uses information from the User's "Final Answers" to perform
   *              an analysis of the TM1 configuration in the Target Org as
   *              indicated by the Final Answers.
   * @protected @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  protected async _analyzeTm1Config():Promise<void> {

    // Define tasks for fetching the packaged metadata.
    const analyzeTm1Config =
      listrTasks.analyzeTm1Config.call(this,
                                       this.finalAnswers.targetOrgAlias,
                                       this.destinationRoot());

    // Show a message to the User letting them know we're going to start these tasks.
    console.log(chalk`{yellow Analyzing TM1 Configuration in the Target Org...}`);
    
    // Run the "Fetch and Convert Package" tasks. Make sure to use await since Listr will run asynchronously.
    const tm1AnalysisResults = await analyzeTm1Config.run()
    .then(listrResult => {
      SfdxFalconDebug.obj(`${dbgNs}_analyzeTm1Config:listrResult:`, listrResult);

      // Add a success message
      this.generatorStatus.addMessage({
        type:     'success',
        title:    `Analyze TM1 Config`,
        message:  `Success - TM1 configuration successfully analzyed`
      });
      return listrResult;
    })
    .catch(utilityResult => {
      SfdxFalconDebug.obj(`${dbgNs}_analyzeTm1Config:utilityResult:`, utilityResult);

      // TM1 config analysis failed. Mark the request as ABORTED.
      this.generatorStatus.abort({
        type:     'error',
        title:    `Analyze TM1 Config`,
        message:  `Error - Could not analyze the TM1 config from ${this.finalAnswers.targetOrgAlias}`
      });

      // If we get an Error, just throw it.
      if (utilityResult instanceof Error) {
        throw utilityResult;
      }

      // If we get an SfdxFalconResult, link its Error Object to a new SfdxFalconError and throw it.
      if (utilityResult instanceof SfdxFalconResult) {
        throw new SfdxFalconError( `Analysis of TM1 configuration from ${this.finalAnswers.targetOrgAlias} failed.`
                                  , `Tm1AnalysisError`
                                  , `${dbgNs}:_analyzeTm1Config`
                                  , utilityResult.errObj);
      }

      // If we get here, who knows what we got. Wrap it as an SfdxFalconError and throw it.
      throw SfdxFalconError.wrap(utilityResult);
    });

    // DEBUG
    SfdxFalconDebug.obj(`${dbgNs}_analyzeTm1Config:tm1AnalysisResults:`, tm1AnalysisResults);

    // Add a line break to separate the output of this section from others
    console.log('');
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      initializing
   * @returns     {Promise<void>}
   * @description STEP ONE in the Yeoman run-loop.  Uses Yeoman's "initializing"
   *              run-loop priority.
   * @protected @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  protected async initializing():Promise<void> {

    // Call the default initializing() function. Replace with custom behavior if desired.
    return this._default_initializing();
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      prompting
   * @returns     {Promise<void>}
   * @description STEP TWO in the Yeoman run-loop. Interviews the User to get
   *              information needed by the "writing" and "installing" phases.
   * @protected @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  protected async prompting():Promise<void> {

    // Let the User know that the Interview is starting.
    console.log(chalk`{yellow Starting TM1 config analysis interview...}`);

    // Call the default prompting() function. Replace with custom behavior if desired.
    return this._default_prompting();
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      configuring
   * @returns     {Promise<void>}
   * @description STEP THREE in the Yeoman run-loop. Perform any pre-install
   *              configuration steps based on the answers provided by the User.
   * @protected @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  protected async configuring():Promise<void> {

    // Call the default configuring() function. Replace with custom behavior if desired.
    return this._default_configuring();
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      writing
   * @returns     {Promise<void>}
   * @description STEP FOUR in the Yeoman run-loop. Typically, this is where
   *              you perform filesystem writes, git clone operations, etc.
   * @protected @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  protected async writing():Promise<void> {

    // Check if we need to abort the Yeoman interview/installation process.
    if (this.generatorStatus.aborted) {
      SfdxFalconDebug.msg(`${dbgNs}writing:`, `generatorStatus.aborted found as TRUE inside writing()`);
      return;
    }

    // Extract the SFDX/Scratch Org Info Maps from Shared Data.
    const sfdxOrgInfoMap    = this.sharedData['sfdxOrgInfoMap']     as SfdxOrgInfoMap;
    const scratchOrgInfoMap = this.sharedData['scratchOrgInfoMap']  as ScratchOrgInfoMap;

    // Determine the FINAL Org Alias (either a standard org or a scratch org).
    if (this.finalAnswers.isScratchOrg === false) {
      this.finalAnswers.targetOrgAlias = sfdxOrgInfoMap.get(this.finalAnswers.targetOrgUsername) ? sfdxOrgInfoMap.get(this.finalAnswers.targetOrgUsername).alias : 'NOT_SPECIFIED';
    }
    else {
      this.finalAnswers.targetOrgAlias = scratchOrgInfoMap.get(this.finalAnswers.targetOrgUsername) ? scratchOrgInfoMap.get(this.finalAnswers.targetOrgUsername).alias : 'NOT_SPECIFIED';
    }

    // Set Yeoman's DESTINATION ROOT. This determines where we save the tm1-analyze-result.json file to.
    this.destinationRoot(path.resolve(this.finalAnswers.targetDirectory));

    // Analyze the TM1 config in the Target Org.
    await this._analyzeTm1Config();

    // Done with writing()
    return;
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      install
   * @returns     {Promise<void>}
   * @description STEP FIVE in the Yeoman run-loop. Typically, this is where
   *              you perform operations that must happen AFTER files are
   *              written to disk. For example, if the "writing" step downloaded
   *              an app to install, the "install" step would run the
   *              installation.
   * @protected @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  protected async install():Promise<void> {

    // Call the default install() function. Replace with custom behavior if desired.
    return this._default_install();
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      end
   * @returns     {Promise<void>}
   * @description STEP SIX in the Yeoman run-loop. This is the FINAL step that
   *              Yeoman runs and it gives us a chance to do any post-Yeoman
   *              updates and/or cleanup.
   * @protected @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  protected async end():Promise<void> {

    // Call the default end() function. Replace with custom behavior if desired.
    return this._default_end();
  }
}
