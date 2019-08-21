//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @file          generators/tmtools-tm2-load.ts
 * @copyright     Vivek M. Chawla / Salesforce - 2019
 * @author        Vivek M. Chawla <@VivekMChawla>
 * @summary       Yeoman Generator for performing FINAL deploy/load of TM2 comfig (metadata+data).
 * @description   Salesforce CLI Plugin command (tmtools:tm2:load) that allows a Salesforce
 *                Administrator to perform the FINAL deploy/load of TM2 metadata after an initial
 *                TM2 Deployment has successfully occurred.  The target org must contain an ACTIVE
 *                Territory2Model called "IMPORTED_TERRITORY" for this command to work.
 * @version       1.0.0
 * @license       MIT
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
// Import External Libraries, Modules, and Types
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
import {TmToolsLoad}                    from  '../modules/tm-tools-load';                         // Class. Provides TM2 metadata/data loading services given transformed TM2 config.
import TmFilePaths                      from  '../modules/tm-tools-objects/tm-file-paths';        // Class. Utility class for generatig File Paths required by various TM-Tools commands.

// Import Falcon Types
import {ListrTaskBundle}                from  '../modules/sfdx-falcon-types';                     // Interface. Represents the suite of information required to run a Listr Task Bundle.
import {StatusMessageType}              from  '../modules/sfdx-falcon-types';                     // Enum. Represents the various types/states of a Status Message.

// Import TM-Tools Types
import {TM1AnalysisReport}              from  '../modules/tm-tools-types';                        // Interface. Represents the data that is generated by a TM1 Analysis Report.
import {TM1ExtractionReport}            from  '../modules/tm-tools-types';                        // Interface. Represents the data that is generated by a TM1 Extraction Report.
import {TM1TransformationReport}        from  '../modules/tm-tools-types';                        // Interface. Represents the data that is generated by a TM1 Transformation Report.
import {TM2DeploymentReport}            from  '../modules/tm-tools-types';                        // Interface. Represents the data that is generated by a TM2 Deployment Report.
import {TM2LoadFilePaths}           from  '../modules/tm-tools-types';                        // Interface. Represents the complete suite of file paths required by the TM2 DataLoad command.

// Requires
const yosay = require('yosay');   // ASCII art creator brings Yeoman to life.

// Set the File Local Debug Namespace
const dbgNs = 'GENERATOR:tmtools-tm2-load:';
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
 * @class       Tm2Load
 * @extends     SfdxFalconYeomanGenerator
 * @summary     Yeoman generator class. Performs FINAL deploy/load of TM2 comfig (metadata+data).
 * @description Uses Yeoman to run through an interview, then checks to see if the target org is
 *              ready to receive the FINAL upload of TM2 data, and finally performs a sharing rules
 *              deployment and queues a Bulk 2.0 Data Load for User/Object associations.
 * @public
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export default class Tm2Load extends SfdxFalconYeomanGenerator<InterviewAnswers> {

  // Define class members specific to this Generator.
  protected tm2LoadFilePaths:         TM2LoadFilePaths;         // Holds a complete set of known (and knowable) file paths needed by the Load command.
  protected tm1AnalysisReport:        TM1AnalysisReport;        // Report data created by a previously executed TM1 Analysis.
  protected tm1ExtractionReport:      TM1ExtractionReport;      // Report data created by a previously executed TM1 Extraction.
  protected tm1TransformationReport:  TM1TransformationReport;  // Report data that will be created as part of the TM1 Transform process.
  protected tm2DeploymentReport:      TM2DeploymentReport;      // Report data that will be created as part of the TM2 Deploy process.
  protected tmToolsLoad:              TmToolsLoad;              // Holds the Data Load Context used by the TM Tools commands.

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @constructs  Tm2Load
   * @param       {string|string[]} args Required. Not used (as far as I know).
   * @param       {GeneratorOptions}  opts Required. Sets generator options.
   * @description Constructs a Tm2Load object.
   * @public
   */
  //───────────────────────────────────────────────────────────────────────────┘
  constructor(args:string|string[], opts:GeneratorOptions) {

    // Call the parent constructor to initialize the Yeoman Generator.
    super(args, opts);

    // Initialize the "Opening Message" and "Confirmation Question".
    this.openingMessage       = `TM-Tools Plugin\n${this.cliCommandName}\nv${this.pluginVersion}`;
    this.confirmationQuestion = 'Load the FINAL set of TM2 config (data+metadata) to your TM2 org using the above settings?';

    // Initialize all TM1/TM2 Reports to NULL.
    this.tm1AnalysisReport        = null;
    this.tm1ExtractionReport      = null;
    this.tm1TransformationReport  = null;
    this.tm2DeploymentReport      = null;

    // Initialize DEFAULT Interview Answers.
    this.defaultAnswers.baseDirectory = path.resolve(opts.sourceDir as string);

    // Initialize Shared Data.
    this.sharedData['reportJson']   = {};
    this.sharedData['tmToolsLoad']  = null;
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
      title:          chalk.yellow('\nTM2 Deployment Report Directory:'),
      questions:      iq.provideReportDirectory,
      questionsArgs:  [TmFilePaths.getTmFileNames().tm2DeploymentReportFileName]
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

    // Grab the TM2 Deployment Report from Shared Data, then extract required fields from it.
    const tm2DeploymentReport           = this.sharedData['reportJson'] as TM1TransformationReport;
    const orgId                         = tm2DeploymentReport.orgInfo.orgId;
    const alias                         = tm2DeploymentReport.orgInfo.alias;
    const username                      = tm2DeploymentReport.orgInfo.username;
    const loginUrl                      = tm2DeploymentReport.orgInfo.loginUrl;
    const createdOrgInstance            = tm2DeploymentReport.orgInfo.createdOrgInstance;
//    const territoryRecordCount          = tm1TransformationReport.actualTm1RecordCounts.territoryRecordCount;
//    const userTerritoryRecordCount      = tm1TransformationReport.actualTm1RecordCounts.userTerritoryRecordCount;
//    const ataRuleRecordCount            = tm1TransformationReport.actualTm1RecordCounts.ataRuleRecordCount;
//    const ataRuleItemRecordCount        = tm1TransformationReport.actualTm1RecordCounts.ataRuleItemRecordCount;
//    const accountShareRecordCount       = tm1TransformationReport.actualTm1RecordCounts.accountShareRecordCount;
//    const accountSharingRulesCount      = `${tm1ExtractionReport.actualTm1MetadataCounts.accountSharingRulesCount.sharingCriteriaRulesCount} Criteria-Based | ${tm1ExtractionReport.actualTm1MetadataCounts.accountSharingRulesCount.sharingOwnerRulesCount} Owner-Based`;
//    const leadSharingRulesCount         = `${tm1ExtractionReport.actualTm1MetadataCounts.leadSharingRulesCount.sharingCriteriaRulesCount} Criteria-Based | ${tm1ExtractionReport.actualTm1MetadataCounts.leadSharingRulesCount.sharingOwnerRulesCount} Owner-Based`;
//    const opportunitySharingRulesCount  = `${tm1ExtractionReport.actualTm1MetadataCounts.opportunitySharingRulesCount.sharingCriteriaRulesCount} Criteria-Based | ${tm1ExtractionReport.actualTm1MetadataCounts.opportunitySharingRulesCount.sharingOwnerRulesCount} Owner-Based`;

    // User-supplied answer.
    tableData.push({option:'TM2 Deployment Directory:', value:`${interviewAnswers.baseDirectory}`});

    // Answers read from the specified tm1-extraction.json file.
    tableData.push({option:'Alias:',                      value:`${alias}`});
    tableData.push({option:'Username:',                   value:`${username}`});
    tableData.push({option:'Org ID:',                     value:`${orgId}`});
    tableData.push({option:'Login Url:',                  value:`${loginUrl}`});
    tableData.push({option:'Org Instance:',               value:`${createdOrgInstance}`});
//    tableData.push({option:'Territories:',                value:`${territoryRecordCount}`});
//    tableData.push({option:'User/Territory Assignments:', value:`${userTerritoryRecordCount}`});
//    tableData.push({option:'Assignment Rules:',           value:`${ataRuleRecordCount}`});
//    tableData.push({option:'Assignment Rule Items:',      value:`${ataRuleItemRecordCount}`});
//    tableData.push({option:'Account Shares:',             value:`${accountShareRecordCount}`});
//    tableData.push({option:'Account Sharing Rules:',      value:`${accountSharingRulesCount}`});
//    tableData.push({option:'Lead Sharing Rules:',         value:`${leadSharingRulesCount}`});
//    tableData.push({option:'Opportunity Sharing Rules:',  value:`${opportunitySharingRulesCount}`});

    // Return the Falcon Table Data.
    return tableData;
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      _deployFinalTm2Config
   * @returns     {Promise<void>}
   * @description Uses information from the User's "Final Answers" to deploy and
   *              load the final set of TM2 config using the pre and post-deploy
   *              transformed data and metadata.  These tasks will only work
   *              against an org with an active Territory2 Model.
   * @protected @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  protected async _deployFinalTm2Config():Promise<void> {
    
    // Make sure that the TM2 Activation Validation was successful by testing for a TM Tools Load context.
    if (this.tmToolsLoad === null || (this.tmToolsLoad instanceof TmToolsLoad) !== true)  {

      // Add a warning message
      this.generatorStatus.addMessage({
        type:     StatusMessageType.ERROR,
        title:    `TM2 Model Activation`,
        message:  `The migrated Territory2 model was not activated in the target org`
      });

      // Exit without doing anything.
      return;
    }

    // Define a Task Bundle
    const taskBundle:ListrTaskBundle = {
      dbgNsLocal:     `${dbgNs}_deployFinalTm2Config`,  // Local Debug Namespace for this function. DO NOT add trailing : char.
      throwOnFailure: false,                            // Define whether to throw an Error on task failure or not.
      preTaskMessage: {                                 // Message displayed to the user BEFORE tasks are run.
        message: `Deploying final set of TM2 Metadata...`,
        styling: `yellow`
      },
      postTaskMessage: {                              // Message displayed to the user AFTER tasks are run.
        message: ``,
        styling: ``
      },
      generatorStatusSuccess: {                       // Generator Status message used on SUCCESS.
        type:     StatusMessageType.SUCCESS,
        title:    `TM2 Sharing Rules`,
        message:  `Deployment of TM2 Sharing Rules has been completed successfully`
      },
      generatorStatusFailure: {                       // Generator Status message used on FAILURE.
        type:     StatusMessageType.WARNING,
        title:    `TM2 Sharing Rules`,
        message:  `WARNING - TM2 Sharing Rules did not deploy successfully`
      },
      listrObject:                                    // The Listr Tasks that will be run.
      listrTasks.deployFinalTm2Metadata.call( this,
                                              this.tmToolsLoad)
    };

    // Run the Task Bundle.
    await this._runListrTaskBundle(taskBundle);
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      _generateReport
   * @returns     {Promise<void>}
   * @description Generates the TM2 Dataload Report (tm2-dataload.json) and
   *              saves it to the user's local system.
   * @protected @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  protected async _generateReport():Promise<void> {
    
    // Define a Task Bundle
    const taskBundle:ListrTaskBundle = {
      dbgNsLocal:     `${dbgNs}_generateReport`,      // Local Debug Namespace for this function. DO NOT add trailing : char.
      throwOnFailure: false,                          // Define whether to throw an Error on task failure or not.
      preTaskMessage: {                               // Message displayed to the user BEFORE tasks are run.
        message: `Generating Final TM2 Data Load Report...`,
        styling: `yellow`
      },
      postTaskMessage: {                              // Message displayed to the user AFTER tasks are run.
        message: ``,
        styling: ``
      },
      generatorStatusSuccess: {                       // Generator Status message used on SUCCESS.
        type:     StatusMessageType.SUCCESS,
        title:    `TM2 Data Load Report`,
        message:  `TM2 data load report saved to ${this.tm2LoadFilePaths.tm2DataLoadReportPath}`
      },
      generatorStatusFailure: {                       // Generator Status message used on FAILURE.
        type:     StatusMessageType.WARNING,
        title:    `TM2 Data Load Report`,
        message:  `WARNING - TM2 data load report could not be created`
      },
      listrObject:                                    // The Listr Tasks that will be run.
      listrTasks.generateTm2DataLoadReport.call(this,
                                                this.tmToolsLoad)
    };

    // Run the Task Bundle.
    await this._runListrTaskBundle(taskBundle);
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      _loadFinalTm2Config
   * @returns     {Promise<void>}
   * @description Uses information from the User's "Final Answers" to deploy and
   *              load the final set of TM2 config using the pre and post-deploy
   *              transformed data and metadata.  These tasks will only work
   *              against an org with an active Territory2 Model.
   * @protected @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  protected async _loadFinalTm2Config():Promise<void> {
    
    // Check if the Generator was aborted by _deployFinalTm2Config().
    if (this.generatorStatus.aborted) {
      this.generatorStatus.addMessage({
        type:     StatusMessageType.WARNING,
        title:    `TM2 Data Load`,
        message:  `WARNING - Final TM2 data load skipped because the sharing rules deployment failed`
      });
      return;
    }

    // Define a Task Bundle
    const taskBundle:ListrTaskBundle = {
      dbgNsLocal:     `${dbgNs}_loadTm2Config`,       // Local Debug Namespace for this function. DO NOT add trailing : char.
      throwOnFailure: false,                          // Define whether to throw an Error on task failure or not.
      preTaskMessage: {                               // Message displayed to the user BEFORE tasks are run.
        message: `Loading final set of TM2 Data...`,
        styling: `yellow`
      },
      postTaskMessage: {                              // Message displayed to the user AFTER tasks are run.
        message: ``,
        styling: ``
      },
      generatorStatusSuccess: {                       // Generator Status message used on SUCCESS.
        type:     StatusMessageType.SUCCESS,
        title:    `TM2 Data Load`,
        message:  `Final TM2 data load has been completed successfully`
      },
      generatorStatusFailure: {                       // Generator Status message used on FAILURE.
        type:     StatusMessageType.WARNING,
        title:    `TM2 Data Load`,
        message:  `WARNING - Final TM2 data load had some errors (see above)`
      },
      listrObject:                                    // The Listr Tasks that will be run.
      listrTasks.loadFinalTm2Config.call( this,
                                          this.tmToolsLoad)
    };

    // Run the Task Bundle.
    await this._runListrTaskBundle(taskBundle);
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      _validateActiveT2Model
   * @returns     {Promise<void>}
   * @description Inspects the TM2 org specified in the Org Info section of the
   *              TM2 Deployment Report and validates that the appropriate
   *              model is ACTIVE.
   * @protected @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  protected async _validateActiveT2Model():Promise<void> {

    // Define a Task Bundle
    const taskBundle:ListrTaskBundle = {
      dbgNsLocal:     `${dbgNs}_validateActiveT2Model`, // Local Debug Namespace for this function. DO NOT add trailing : char.
      throwOnFailure: false,                            // Define whether to throw an Error on task failure or not.
      preTaskMessage: {                                 // Message displayed to the user BEFORE tasks are run.
        message: `Checking for Active Territory2 Model...`,
        styling: `yellow`
      },
      postTaskMessage: {                              // Message displayed to the user AFTER tasks are run.
        message: ``,
        styling: ``
      },
      generatorStatusSuccess: {                       // Generator Status message used on SUCCESS.
        type:     StatusMessageType.SUCCESS,
        title:    `TM2 Model Activation`,
        message:  `The migrated Territory2 is activated in the target org`
      },
      generatorStatusFailure: {                       // Generator Status message used on FAILURE.
        type:     StatusMessageType.ERROR,
        title:    `TM2 Model Activation`,
        message:  `The migrated Territory2 model was not activated in the target org`
      },
      listrObject:                                    // The Listr Tasks that will be run.
        listrTasks.validateTm2Activation.call(this,
                                              this.tm1AnalysisReport,
                                              this.tm1ExtractionReport,
                                              this.tm1TransformationReport,
                                              this.tm2DeploymentReport,
                                              this.tm2LoadFilePaths)
    };

    // Run the Task Bundle.
    await this._runListrTaskBundle(taskBundle);

    // Pull the TmToolsLoad object out of Shared Data.
    this.tmToolsLoad = this.sharedData['tmToolsLoad'];
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
        message:  `Starting TM2 data load interview...`,
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
    this.tm2LoadFilePaths = TmFilePaths.getTm2DataLoadFilePaths(this.finalAnswers.baseDirectory);

    // Attempt to load the TM1 Analysis Report
    this.tm1AnalysisReport  = await fs.readJsonMap(this.tm2LoadFilePaths.tm1AnalysisReportPath, true)
    .catch(readJsonMapError => {
      throw new SfdxFalconError( `Required TM1 Analysis Report could not be found at ${this.tm2LoadFilePaths.tm1AnalysisReportPath}. Aborting data load.`
                               , `TM1AnalysisNotFound`
                               , `${dbgNs}writing`
                               , readJsonMapError);
    }) as TM1AnalysisReport;

    // Attempt to load the TM1 Extraction Report
    this.tm1ExtractionReport  = await fs.readJsonMap(this.tm2LoadFilePaths.tm1ExtractionReportPath, true)
    .catch(readJsonMapError => {
      throw new SfdxFalconError( `Required TM1 Extraction Report could not be found at ${this.tm2LoadFilePaths.tm1ExtractionReportPath}. Aborting data load.`
                               , `TM1ExtractionNotFound`
                               , `${dbgNs}writing`
                               , readJsonMapError);
    }) as TM1ExtractionReport;

    // Attempt to load the TM1 Transformation Report
    this.tm1TransformationReport  = await fs.readJsonMap(this.tm2LoadFilePaths.tm1TransformationReportPath, true)
    .catch(readJsonMapError => {
      throw new SfdxFalconError( `Required TM1 Transformation Report could not be found at ${this.tm2LoadFilePaths.tm1TransformationReportPath}. Aborting data load.`
                               , `TM1TransformationNotFound`
                               , `${dbgNs}writing`
                               , readJsonMapError);
    }) as TM1TransformationReport;

    // Attempt to load the TM2 Deployment Report
    this.tm2DeploymentReport  = await fs.readJsonMap(this.tm2LoadFilePaths.tm2DeploymentReportPath, true)
    .catch(readJsonMapError => {
      throw new SfdxFalconError( `Required TM2 Deployment Report could not be found at ${this.tm2LoadFilePaths.tm2DeploymentReportPath}. Aborting data load.`
                               , `TM1TransformationNotFound`
                               , `${dbgNs}writing`
                               , readJsonMapError);
    }) as TM2DeploymentReport;

    // Make sure the TM2 Org is ready for the final deployment and data load.
    await this._validateActiveT2Model();
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

    // Perform the final Metadata Deployment.
    await this._deployFinalTm2Config();

    // Perform the final Data Load.
    await this._loadFinalTm2Config();

    // Generate the final report.
    await this._generateReport();
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
