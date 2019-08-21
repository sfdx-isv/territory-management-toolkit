//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @file          generators/tmtools-tm1-analyze.ts
 * @copyright     Vivek M. Chawla / Salesforce - 2019
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
import {SfdxFalconInterview}            from  '../modules/sfdx-falcon-interview';                 // Class. Provides a standard way of building a multi-group Interview to collect user input.
import {SfdxFalconKeyValueTableDataRow} from  '../modules/sfdx-falcon-util/ux';                   // Interface. Represents a row of data in an SFDX-Falcon data table.
import {SfdxFalconTableData}            from  '../modules/sfdx-falcon-util/ux';                   // Interface. Represents and array of SfdxFalconKeyValueTableDataRow objects.
import {GeneratorOptions}               from  '../modules/sfdx-falcon-yeoman-command';            // Interface. Represents options used by SFDX-Falcon Yeoman generators.
import {SfdxFalconYeomanGenerator}      from  '../modules/sfdx-falcon-yeoman-generator';          // Class. Abstract base class class for building Yeoman Generators for SFDX-Falcon commands.
import TmFilePaths                      from  '../modules/tm-tools-objects/tm-file-paths';        // Class. Utility class for generatig File Paths required by various TM-Tools commands.
import {Tm1Analysis}                    from  '../modules/tm-tools-objects/tm1-analysis';         // Class. Models the analysis of a TM1 org.

// Import Falcon Types
import {ListrTaskBundle}                from  '../modules/sfdx-falcon-types';                     // Interface. Represents the suite of information required to run a Listr Task Bundle.
import {StandardOrgInfoMap}             from  '../modules/sfdx-falcon-types';                     // Type. Alias for a Map with string keys holding SfdxOrgInfo values.
import {ScratchOrgInfoMap}              from  '../modules/sfdx-falcon-types';                     // Type. Alias for a Map with string keys holding ScratchOrgInfo values.
import {StatusMessageType}              from  '../modules/sfdx-falcon-types';                     // Enum. Represents the various types/states of a Status Message.

// Import TM-Tools Types
import {TM1AnalyzeFilePaths}            from  '../modules/tm-tools-types';                        // Interface. Represents the complete suite of file paths required by the TM1 Analyze command.

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
  targetDirectory:    string;
  isScratchOrg:       boolean;
  targetOrgAlias:     string;
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
  protected tm1AnalyzeFilePaths:      TM1AnalyzeFilePaths;  // Report data that will be created as part of the TM1 Analyze process.
  protected tm1Analysis:              Tm1Analysis;          // Holds the TM1 Analysis Context used by the TM Tools commands.

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

    // Call the parent constructor.
    super(args, opts);

    // Set the requirements for this Generator.
    this.generatorRequirements.standardOrgs = true;
    this.generatorRequirements.scratchOrgs  = true;

    // Initialize the "Opening Message" and "Confirmation Question".
    this.openingMessage       = `TM-Tools Plugin\n${this.cliCommandName}\nv${this.pluginVersion}`;
    this.confirmationQuestion = `Analyze your org's TM1 configuration using the above settings?`;

    // Initialize DEFAULT Interview Answers.
    this.defaultAnswers.targetDirectory   = path.resolve(opts.outputDir as string);
    this.defaultAnswers.isScratchOrg      = false;
    this.defaultAnswers.targetOrgAlias    = 'NOT_SPECIFIED';
    this.defaultAnswers.targetOrgUsername = 'NOT_SPECIFIED';

    // Initialize Shared Data.
    this.sharedData['reportJson']   = {};
    this.sharedData['tm1Analysis']  = null;
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
        [
          '', // Empty string should force use of the default message.
          'Which org would you like to analyze?',
          'Which scratch org would you like to analyze?'
        ]
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

    // Grab the Standard/Scratch Org Info Maps out of Shared Data.
    const standardOrgInfoMap  = this.sharedData['standardOrgInfoMap'] as StandardOrgInfoMap;
    const scratchOrgInfoMap   = this.sharedData['scratchOrgInfoMap']  as ScratchOrgInfoMap;

    // Project related answers
    tableData.push({option:'Target Directory:', value:`${interviewAnswers.targetDirectory}`});

    // Org alias related answers
    if (interviewAnswers.isScratchOrg === false) {
      const targetOrgAlias = standardOrgInfoMap.get(interviewAnswers.targetOrgUsername) ? standardOrgInfoMap.get(interviewAnswers.targetOrgUsername).alias : 'NOT_SPECIFIED';
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

    // Define a Task Bundle
    const taskBundle:ListrTaskBundle = {
      dbgNsLocal:     `${dbgNs}_analyzeTm1Config`,    // Local Debug Namespace for this function. DO NOT add trailing : char.
      throwOnFailure: true,                           // Define whether to throw an Error on task failure or not.
      preTaskMessage: {                               // Message displayed to the user BEFORE tasks are run.
        message: `Analyzing TM1 Configuration in the Target Org...`,
        styling: `yellow`
      },
      postTaskMessage: {                              // Message displayed to the user AFTER tasks are run.
        message: ``,
        styling: ``
      },
      generatorStatusSuccess: {                       // Generator Status message used on SUCCESS.
        type:     StatusMessageType.SUCCESS,
        title:    `Analyze TM1 Config`,
        message:  `TM1 configuration successfully analzyed`
      },
      generatorStatusFailure: {                       // Generator Status message used on FAILURE.
        type:     StatusMessageType.ERROR,
        title:    `Analyze TM1 Config`,
        message:  `Could not analyze the TM1 config from ${this.finalAnswers.targetOrgAlias}`
      },
      listrObject:                                    // The Listr Tasks that will be run.
        listrTasks.analyzeTm1Config.call( this,
                                          this.finalAnswers.targetOrgAlias,
                                          this.tm1AnalyzeFilePaths)
    };

    // Run the Task Bundle.
    await this._runListrTaskBundle(taskBundle);

    // Pull the Tm1Analysis object out of Shared Data.
    this.tm1Analysis = this.sharedData['tm1Analysis'];
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      _generateReport
   * @returns     {Promise<void>}
   * @description Generates the TM1 Analysis Report (tm1-analysis.json) and
   *              saves it to the user's local system.
   * @protected @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  protected async _generateReport():Promise<void> {
    
    // Define a Task Bundle
    const taskBundle:ListrTaskBundle = {
      dbgNsLocal:     `${dbgNs}_generateReport`,      // Local Debug Namespace for this function. DO NOT add trailing : char.
      throwOnFailure: true,                          // Define whether to throw an Error on task failure or not.
      preTaskMessage: {                               // Message displayed to the user BEFORE tasks are run.
        message: `Generating Final TM1 Analysis Report...`,
        styling: `yellow`
      },
      postTaskMessage: {                              // Message displayed to the user AFTER tasks are run.
        message: ``,
        styling: ``
      },
      generatorStatusSuccess: {                       // Generator Status message used on SUCCESS.
        type:     StatusMessageType.SUCCESS,
        title:    `TM1 Analysis Report`,
        message:  `TM1 analysis report saved to ${this.tm1AnalyzeFilePaths.tm1AnalysisReportPath}`
      },
      generatorStatusFailure: {                       // Generator Status message used on FAILURE.
        type:     StatusMessageType.WARNING,
        title:    `TM1 Analysis Report`,
        message:  `WARNING - TM1 analysis report could not be created`
      },
      listrObject:                                    // The Listr Tasks that will be run.
      listrTasks.generateTm1AnalysisReport.call(this,
                                                this.tm1Analysis)
    };

    // Run the Task Bundle.
    await this._runListrTaskBundle(taskBundle);
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

    // Call the default prompting() function. Replace with custom behavior if desired.
    return this._default_prompting(
      // Pre-Interview Styled Message
      {
        message:  `Starting TM1 config analysis interview...`,
        styling:  `yellow`
      },
      // Post-Interview Styled Message
      {
        message:  ``,
        styling:  ``
      }
    );
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

    // Do nothing if the Generator has been aborted.
    if (this.generatorStatus.aborted) {
      SfdxFalconDebug.msg(`${dbgNs}configuring:`, `Generator has been aborted.`);
      return;
    }

    // Extract the Standard/Scratch Org Info Maps from Shared Data.
    const standardOrgInfoMap  = this.sharedData['standardOrgInfoMap'] as StandardOrgInfoMap;
    const scratchOrgInfoMap   = this.sharedData['scratchOrgInfoMap']  as ScratchOrgInfoMap;

    // Determine the FINAL Org Alias (either a standard org or a scratch org).
    if (this.finalAnswers.isScratchOrg === false) {
      this.finalAnswers.targetOrgAlias = standardOrgInfoMap.get(this.finalAnswers.targetOrgUsername) ? standardOrgInfoMap.get(this.finalAnswers.targetOrgUsername).alias : 'NOT_SPECIFIED';
    }
    else {
      this.finalAnswers.targetOrgAlias = scratchOrgInfoMap.get(this.finalAnswers.targetOrgUsername) ? scratchOrgInfoMap.get(this.finalAnswers.targetOrgUsername).alias : 'NOT_SPECIFIED';
    }

    // Get the file paths required by the TM1 Analyze command.
    this.tm1AnalyzeFilePaths = TmFilePaths.getTm1AnalyzeFilePaths(this.finalAnswers.targetDirectory);
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

    // Do nothing if the Generator has been aborted.
    if (this.generatorStatus.aborted) {
      SfdxFalconDebug.msg(`${dbgNs}writing:`, `Generator has been aborted.`);
      return;
    }

    // Analyze the TM1 config in the Target Org.
    await this._analyzeTm1Config();

    // Generate the final report.
    await this._generateReport();
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
