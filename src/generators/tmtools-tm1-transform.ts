//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @file          generators/tmtools-tm1-transform.ts
 * @copyright     Vivek M. Chawla / Salesforce - 2019
 * @author        Vivek M. Chawla <@VivekMChawla>
 * @summary       Yeoman Generator for transforming TM1 metadata and data into a TM2-ready bundle.
 * @description   Salesforce CLI Plugin command (tmtools:tm1:transform) that allows a Salesforce
 *                Administrator to transform previously extracted Territory Management (TM1)
 *                metadata and data into a format that is ready to be deployed to the org the data
 *                was extracted from once it's converted to TM2.
 * @version       1.0.0
 * @license       MIT
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
// Import External Libraries & Modules
import {fs}       from  '@salesforce/core'; // File System utility from the Core SFDX library.
import chalk      from  'chalk';            // Helps write colored text to the console.
import * as path  from  'path';             // Library. Helps resolve local paths at runtime.

// Import Internal Libraries
import * as iq                          from  '../modules/sfdx-falcon-util/interview-questions';  // Library. Helper functions that create Interview Questions.
import * as listrTasks                  from  '../modules/sfdx-falcon-util/listr-tasks';          // Library. Helper functions that make using Listr with SFDX-Falcon easier.

// Import Internal Classes & Functions
import {SfdxFalconDebug}                from  '../modules/sfdx-falcon-debug';                     // Class. Provides custom "debugging" services (ie. debug-style info to console.log()).
import {SfdxFalconError}                from  '../modules/sfdx-falcon-error';                     // Class. Extends SfdxError to provide specialized error structures for SFDX-Falcon modules.
import {SfdxFalconInterview}            from  '../modules/sfdx-falcon-interview';                 // Class. Provides a standard way of building a multi-group Interview to collect user input.
import {SfdxFalconKeyValueTableDataRow} from  '../modules/sfdx-falcon-util/ux';                   // Interface. Represents a row of data in an SFDX-Falcon data table.
import {SfdxFalconTableData}            from  '../modules/sfdx-falcon-util/ux';                   // Interface. Represents and array of SfdxFalconKeyValueTableDataRow objects.
import {GeneratorOptions}               from  '../modules/sfdx-falcon-yeoman-command';            // Interface. Represents options used by SFDX-Falcon Yeoman generators.
import {SfdxFalconYeomanGenerator}      from  '../modules/sfdx-falcon-yeoman-generator';          // Class. Abstract base class class for building Yeoman Generators for SFDX-Falcon commands.
import TmFilePaths                      from  '../modules/tm-tools-objects/tm-file-paths';        // Class. Utility class for generatig File Paths required by various TM-Tools commands.

// Import Falcon Types
import {ListrTaskBundle}                from  '../modules/sfdx-falcon-types';                     // Interface. Represents the suite of information required to run a Listr Task Bundle.
import {StatusMessageType}              from  '../modules/sfdx-falcon-types';                     // Enum. Represents the various types/states of a Status Message.

// Import TM-Tools Types
import {TM1AnalysisReport}              from  '../modules/tm-tools-types';                        // Interface. Represents the data that is generated by a TM1 Analysis Report.
import {TM1ExtractionReport}            from  '../modules/tm-tools-types';                        // Interface. Represents the data that is generated by a TM1 Extraction Report.
import {TM1TransformFilePaths}          from  '../modules/tm-tools-types';                        // Interface. Represents the complete suite of file paths required by the TM1 Transform command.

// Requires
const yosay = require('yosay');   // ASCII art creator brings Yeoman to life.

// Set the File Local Debug Namespace
const dbgNs = 'GENERATOR:tmtools-tm1-transform:';
SfdxFalconDebug.msg(`${dbgNs}`, `Debugging initialized for ${dbgNs}`);


//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @interface   InterviewAnswers
 * @description Represents answers to the questions asked in the Yeoman interview.
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
interface InterviewAnswers {
  baseDirectory:  string;
}

//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @class       Tm1Transform
 * @extends     SfdxFalconYeomanGenerator
 * @summary     Yeoman generator class. Transforms local TM1 configuration (data+metadata) files.
 * @description Uses Yeoman to run through an interview, then transforms TM1 configuration based on
 *              the specifications found in the user's tm1-extraction.json file.
 * @public
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export default class Tm1Transform extends SfdxFalconYeomanGenerator<InterviewAnswers> {

  // Define class members specific to this Generator.
  protected tm1TransformFilePaths:    TM1TransformFilePaths;    // Holds a complete set of known (and knowable) file paths needed by the Transform command.
  protected tm1AnalysisReport:        TM1AnalysisReport;        // Report data created by a previously executed TM1 Analysis.
  protected tm1ExtractionReport:      TM1ExtractionReport;      // Report data created by a previously executed TM1 Extraction.

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @constructs  Tm1Transform
   * @param       {string|string[]} args Required. Not used (as far as I know).
   * @param       {GeneratorOptions}  opts Required. Sets generator options.
   * @description Constructs a Tm1Transform object.
   * @public
   */
  //───────────────────────────────────────────────────────────────────────────┘
  constructor(args:string|string[], opts:GeneratorOptions) {

    // Call the parent constructor to initialize the Yeoman Generator.
    super(args, opts);

    // Initialize the "Opening Message" and "Confirmation Question".
    this.openingMessage       = `TM-Tools Plugin\n${this.cliCommandName}\nv${this.pluginVersion}`;
    this.confirmationQuestion = 'Transform TM1 configuration (data/metadata) to TM2 using the above settings?';

    // Initialize all Reports to NULL.
    this.tm1AnalysisReport        = null;
    this.tm1ExtractionReport      = null;

    // Initialize DEFAULT Interview Answers.
    this.defaultAnswers.baseDirectory = path.resolve(opts.sourceDir as string);

    // Initialize Shared Data.
    this.sharedData['reportJson'] = {};
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

    // Group 0: Specify the directory containing the TM1 config extraction.
    interview.createGroup({
      title:          chalk.yellow('\nTM1 Extraction Directory:'),
      questions:      iq.provideReportDirectory,
      questionsArgs:  [TmFilePaths.getTmFileNames().tm1ExtractionReportFileName]
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

    // Grab the TM1 Extraction Report from Shared Data, then extract required fields from it.
    const tm1ExtractionReport           = this.sharedData['reportJson'] as TM1ExtractionReport;
    const orgId                         = tm1ExtractionReport.orgInfo.orgId;
    const alias                         = tm1ExtractionReport.orgInfo.alias;
    const username                      = tm1ExtractionReport.orgInfo.username;
    const loginUrl                      = tm1ExtractionReport.orgInfo.loginUrl;
    const createdOrgInstance            = tm1ExtractionReport.orgInfo.createdOrgInstance;
    const territoryRecordCount          = tm1ExtractionReport.actualTm1RecordCounts.territoryRecordCount;
    const userTerritoryRecordCount      = tm1ExtractionReport.actualTm1RecordCounts.userTerritoryRecordCount;
    const ataRuleRecordCount            = tm1ExtractionReport.actualTm1RecordCounts.ataRuleRecordCount;
    const ataRuleItemRecordCount        = tm1ExtractionReport.actualTm1RecordCounts.ataRuleItemRecordCount;
    const accountShareRecordCount       = tm1ExtractionReport.actualTm1RecordCounts.accountShareRecordCount;
    const accountSharingRulesCount      = `${tm1ExtractionReport.actualTm1MetadataCounts.accountSharingRulesCount.sharingCriteriaRulesCount} Criteria-Based | ${tm1ExtractionReport.actualTm1MetadataCounts.accountSharingRulesCount.sharingOwnerRulesCount} Owner-Based`;
    const leadSharingRulesCount         = `${tm1ExtractionReport.actualTm1MetadataCounts.leadSharingRulesCount.sharingCriteriaRulesCount} Criteria-Based | ${tm1ExtractionReport.actualTm1MetadataCounts.leadSharingRulesCount.sharingOwnerRulesCount} Owner-Based`;
    const opportunitySharingRulesCount  = `${tm1ExtractionReport.actualTm1MetadataCounts.opportunitySharingRulesCount.sharingCriteriaRulesCount} Criteria-Based | ${tm1ExtractionReport.actualTm1MetadataCounts.opportunitySharingRulesCount.sharingOwnerRulesCount} Owner-Based`;

    // User-supplied answer.
    tableData.push({option:'TM1 Extraction Directory:', value:`${interviewAnswers.baseDirectory}`});

    // Answers read from the specified tm1-extraction.json file.
    tableData.push({option:'Alias:',                      value:`${alias}`});
    tableData.push({option:'Username:',                   value:`${username}`});
    tableData.push({option:'Org ID:',                     value:`${orgId}`});
    tableData.push({option:'Login Url:',                  value:`${loginUrl}`});
    tableData.push({option:'Org Instance:',               value:`${createdOrgInstance}`});
    tableData.push({option:'Territories:',                value:`${territoryRecordCount}`});
    tableData.push({option:'User/Territory Assignments:', value:`${userTerritoryRecordCount}`});
    tableData.push({option:'Assignment Rules:',           value:`${ataRuleRecordCount}`});
    tableData.push({option:'Assignment Rule Items:',      value:`${ataRuleItemRecordCount}`});
    tableData.push({option:'Account Shares:',             value:`${accountShareRecordCount}`});
    tableData.push({option:'Account Sharing Rules:',      value:`${accountSharingRulesCount}`});
    tableData.push({option:'Lead Sharing Rules:',         value:`${leadSharingRulesCount}`});
    tableData.push({option:'Opportunity Sharing Rules:',  value:`${opportunitySharingRulesCount}`});

    // Return the Falcon Table Data.
    return tableData;
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      _transformTm1Config
   * @returns     {Promise<void>}
   * @description Uses information from the User's "Final Answers" to transform
   *              a set of local TM1 Config (data and metadata) into a suite of
   *              files that can be used to deploy/load TM2 Config back into the
   *              original source org once Enterprise Territory Management (TM2)
   *              has been activated.
   * @protected @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  protected async _transformTm1Config():Promise<void> {

    // Define a Task Bundle
    const taskBundle:ListrTaskBundle = {
      dbgNsLocal:     `${dbgNs}_transformTm1Config`,  // Local Debug Namespace for this function. DO NOT add trailing : char.
      throwOnFailure: true,                           // Define whether to throw an Error on task failure or not.
      preTaskMessage: {                               // Message displayed to the user BEFORE tasks are run.
        message: `Transforming TM1 Data/Metadata to TM2...`,
        styling: `yellow`
      },
      postTaskMessage: {                              // Message displayed to the user AFTER tasks are run.
        message: ``,
        styling: ``
      },
      generatorStatusSuccess: {                       // Generator Status message used on SUCCESS.
        type:     StatusMessageType.SUCCESS,
        title:    `Transform TM1 Config`,
        message:  `TM1 configuration (data/metadata) successfully transformed to TM2`
      },
      generatorStatusFailure: {                       // Generator Status message used on FAILURE.
        type:     StatusMessageType.ERROR,
        title:    `Transform TM1 Config`,
        message:  `TM1 configuration could not be transformed to TM2`
      },
      listrObject:                                    // The Listr Tasks that will be run.
        listrTasks.transformTm1Config.call( this,
                                            this.tm1AnalysisReport,
                                            this.tm1ExtractionReport,
                                            this.tm1TransformFilePaths)
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

    // Show the Yeoman to announce that the generator is running.
    this.log(yosay(this.openingMessage));
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
        message:  `Starting TM1 transformation interview...`,
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

    // Get the file paths required by the TM1 Transform command.
    this.tm1TransformFilePaths = TmFilePaths.getTm1TransformFilePaths(this.finalAnswers.baseDirectory);

    // Attempt to load the TM1 Analysis Report
    this.tm1AnalysisReport  = await fs.readJsonMap(this.tm1TransformFilePaths.tm1AnalysisReportPath, true)
    .catch(readJsonMapError => {
      throw new SfdxFalconError( `Required TM1 Analysis Report could not be found at ${this.tm1TransformFilePaths.tm1AnalysisReportPath}. Aborting transformation.`
                               , `TM1AnalysisNotFound`
                               , `${dbgNs}configuring`
                               , readJsonMapError);
    }) as TM1AnalysisReport;

    // Attempt to load the TM1 Extraction Report
    this.tm1ExtractionReport  = await fs.readJsonMap(this.tm1TransformFilePaths.tm1ExtractionReportPath, true)
    .catch(readJsonMapError => {
      throw new SfdxFalconError( `Required TM1 Extraction Report could not be found at ${this.tm1TransformFilePaths.tm1ExtractionReportPath}. Aborting transformation.`
                               , `TM1ExtractionNotFound`
                               , `${dbgNs}configuring`
                               , readJsonMapError);
    }) as TM1ExtractionReport;
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

    // Transform the user's TM1 config.
    await this._transformTm1Config();
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      install
   * @returns     {void}
   * @description STEP FIVE in the Yeoman run-loop. Typically, this is where
   *              you perform operations that must happen AFTER files are
   *              written to disk. For example, if the "writing" step downloaded
   *              an app to install, the "install" step would run the
   *              installation.
   * @protected @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  protected async install() {

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
