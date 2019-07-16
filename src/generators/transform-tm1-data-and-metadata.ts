//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @file          generators/transform-tm1-data-and-metadata.ts
 * @copyright     Vivek M. Chawla - 2018
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
// Import External Modules
import * as path  from  'path'; // Library. Helps resolve local paths at runtime.

// Import Internal Modules
import * as iq                          from  '../modules/sfdx-falcon-util/interview-questions';  // Library. Helper functions that create Interview Questions.
import * as listrTasks                  from  '../modules/sfdx-falcon-util/listr-tasks';          // Library. Helper functions that make using Listr with SFDX-Falcon easier.

import {SfdxFalconDebug}                from  '../modules/sfdx-falcon-debug';                     // Class. Provides custom "debugging" services (ie. debug-style info to console.log()).
import {SfdxFalconError}                from  '../modules/sfdx-falcon-error';                     // Class. Extends SfdxError to provide specialized error structures for SFDX-Falcon modules.
import {SfdxFalconInterview}            from  '../modules/sfdx-falcon-interview';                 // Class. Provides a standard way of building a multi-group Interview to collect user input.
import {SfdxFalconResult}               from  '../modules/sfdx-falcon-result';                    // Class. Framework for creating results-driven, informational objects with a concept of heredity (child results).
import {SfdxFalconKeyValueTableDataRow} from  '../modules/sfdx-falcon-util/ux';                   // Interface. Represents a row of data in an SFDX-Falcon data table.
import {SfdxFalconTableData}            from  '../modules/sfdx-falcon-util/ux';                   // Interface. Represents and array of SfdxFalconKeyValueTableDataRow objects.
import {GeneratorOptions}               from  '../modules/sfdx-falcon-yeoman-command';            // Interface. Represents options used by SFDX-Falcon Yeoman generators.
import {SfdxFalconYeomanGenerator}      from  '../modules/sfdx-falcon-yeoman-generator';          // Class. Abstract base class class for building Yeoman Generators for SFDX-Falcon commands.

// Import Falcon Types
//import {YeomanChoice}                   from  '../modules/sfdx-falcon-types';                     // Interface. Represents a Yeoman/Inquirer choice object.
//import {SfdxOrgInfoMap}                 from  '../modules/sfdx-falcon-types';                     // Type. Alias for a Map with string keys holding SfdxOrgInfo values.
import { TmToolsTransform } from '../modules/tm-tools-transform';

// Requires
const chalk = require('chalk');   // Utility for creating colorful console output.

// Set the File Local Debug Namespace
const dbgNs = 'GENERATOR:tm1-transform:';
SfdxFalconDebug.msg(`${dbgNs}`, `Debugging initialized for ${dbgNs}`);


//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @interface   InterviewAnswers
 * @description Represents answers to the questions asked in the Yeoman interview.
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
interface InterviewAnswers {

  // Source and Output Directories
  extractedSourceDir:   string;
  transformedOutputDir: string;
}

//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @class       Tm1Transform
 * @extends     SfdxFalconYeomanGenerator
 * @summary     Yeoman generator class. Transforms local TM1 configuration (data+metadata) files.
 * @description Uses Yeoman to run through the TM1 data transformation process.  There is very
 *              little user interaction in the process, other than final success/error messages.
 * @public
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export default class Tm1Transform extends SfdxFalconYeomanGenerator<InterviewAnswers> {

  // Define class members specific to this Generator.
  protected extractedMetadataDir:   string;   // Fully qualified path to location where extracted source METADATA (ie. package manifest and other XML) are already stored.
  protected extractedDataDir:       string;   // Fully qualified path to location where extracted source DATA (ie. CSV files) are already stored.
  protected transformedMetadataDir: string;   // Fully qualified path to location where transformed METADATA (ie. package manifest and other XML) will be stored.
  protected transformedDataDir:     string;   // Fully qualified path to location where transformed DATA (ie. CSV files) will be stored.
  protected tm1Transform:           TmToolsTransform; // ???

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

    // Initialize the "Confirmation Question".
    this.confirmationQuestion = 'Transform TM1 configuration data/metadata to TM2 using the above settings?';

    // Initialize extract and transform directory variables.
    this.extractedMetadataDir   = '';
    this.extractedDataDir       = '';
    this.transformedMetadataDir = '';
    this.transformedDataDir     = '';

    // Initialize DEFAULT Interview Answers.
    // Source and Output Directories
    this.defaultAnswers.extractedSourceDir    = opts.sourceDir as string;
    this.defaultAnswers.transformedOutputDir  = opts.outputDir as string;

    // Initialize Shared Data.
//    this.sharedData['extractedMetadataDir']   = this.extractedMetadataDir;
//    this.sharedData['extractedDataDir']       = this.extractedDataDir;
//    this.sharedData['transformedMetadataDir'] = this.transformedMetadataDir;
//    this.sharedData['transformedDataDir']     = this.transformedDataDir;
    this.sharedData['extractedSourceDir']     = this.defaultAnswers.extractedSourceDir;
    this.sharedData['transformedDataDir']     = this.defaultAnswers.transformedOutputDir;
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

    // Group 0: Specify the directory containing the TM1 configuration data/metadta.
    interview.createGroup({
      title:        chalk.yellow('\nPath to TM1 Extract Directory (SOURCE):'),
      questions:    iq.provideTm1SourceDirectory
    });
    // Group 1: Specify the directory where the transformed TM2 config will be stored.
    interview.createGroup({
      title:        chalk.yellow('\nPath to TM2 Transform Directory (TARGET):'),
      questions:    iq.provideTm2TransformDirectory
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

    // Developer related answers
    tableData.push({option:'Source Directory:', value:`${interviewAnswers.extractedSourceDir}`});
    tableData.push({option:'Output Directory:', value:`${interviewAnswers.transformedOutputDir}`});

    // Return the Falcon Table Data.
    return tableData;
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

    // Check if we need to abort the Yeoman interview/installation process.
    if (this.generatorStatus.aborted) {
      SfdxFalconDebug.msg(`${dbgNs}initializing:`, `generatorStatus.aborted found as TRUE inside initializing()`);
      return;
    }
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

    // Check if we need to abort the Yeoman interview/installation process.
    if (this.generatorStatus.aborted) {
      SfdxFalconDebug.msg(`${dbgNs}configuring:`, `generatorStatus.aborted found as TRUE inside configuring()`);
      return;
    }

    // Define paths for all Source and Target directories.
    this.extractedMetadataDir    = path.join(this.finalAnswers.extractedSourceDir,    'extracted-metadata');
    this.extractedDataDir        = path.join(this.finalAnswers.extractedSourceDir,    'extracted-data');
    this.transformedMetadataDir  = path.join(this.finalAnswers.transformedOutputDir,  'tm1-transform',  'transformed-metadata');
    this.transformedDataDir      = path.join(this.finalAnswers.transformedOutputDir,  'tm1-transform',  'transformed-data');

    // DEBUG
    SfdxFalconDebug.str(`${dbgNs}configuring:finalAnswers.extractedSourceDir`,    this.finalAnswers.extractedSourceDir);
    SfdxFalconDebug.str(`${dbgNs}configuring:finalAnswers.transformedOutputDir`,  this.finalAnswers.transformedOutputDir);
    SfdxFalconDebug.str(`${dbgNs}configuring:extractedMetadataDir`,               this.extractedMetadataDir);
    SfdxFalconDebug.str(`${dbgNs}configuring:extractedDataDir`,                   this.extractedDataDir);
    SfdxFalconDebug.str(`${dbgNs}configuring:transformedMetadataDir`,             this.transformedMetadataDir);
    SfdxFalconDebug.str(`${dbgNs}configuring:transformedDataDir`,                 this.transformedDataDir);

    // Done with configuring()
    return;
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

    // Define Listr Tasks for executing the transformation.
    const tm1DataTransformation =
      listrTasks.tm1DataTransform.call(this,
                                       this.extractedMetadataDir,
                                       this.extractedDataDir,
                                       this.transformedMetadataDir,
                                       this.transformedDataDir);

    // Show a message to the User letting them know we're going to start these tasks.
    console.log(chalk`{yellow Transforming TM1 Data/Metadata to TM2...}`);
    
    // Run the "Fetch and Convert Package" tasks. Make sure to use await since Listr will run asynchronously.
    const tm1TransformationResults = await tm1DataTransformation.run()
      .catch(utilityResult => {

        // DEBUG
        SfdxFalconDebug.obj(`${dbgNs}writing:utilityResult:`, utilityResult);

        // If we get an Error, just throw it.
        if (utilityResult instanceof Error) {
          throw utilityResult;
        }

        // If we get an SfdxFalconResult, link its Error Object to a new SfdxFalconError and throw it.
        if (utilityResult instanceof SfdxFalconResult) {
          throw new SfdxFalconError( `Transformation of TM1 data/metadata failed.`
                                   , `Tm1TransformationError`
                                   , `${dbgNs}writing`
                                   , utilityResult.errObj);
        }

        // If we get here, who knows what we got. Wrap it as an SfdxFalconError and throw it.
        throw SfdxFalconError.wrap(utilityResult);
      });

    // DEBUG
    SfdxFalconDebug.obj(`${dbgNs}writing:tm1TransformationResults:`, tm1TransformationResults);

    // Add a success message
    this.generatorStatus.addMessage({
      type:     'success',
      title:    `Transform TM1 Config`,
      message:  `Success - TM1 configuration (data/metadata) successfully transformed to TM2`
    });

    // Add a line break to separate the output of this section from others
    console.log('');

    // Done with writing()
    return;
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
