//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @file          workers/tm-tools-deploysharing.ts
 * @copyright     Vivek M. Chawla / Salesforce - 2019
 * @author        Vivek M. Chawla <@VivekMChawla>
 * @summary       Exports the TmToolsDeploySharing class.
 * @description   Exports the TmToolsDeploySharing class. Implements servcies allowing the user to
 *                deploy the FINAL set of TM2 metadata (sharing rules) given a successful TM2
 *                deploy and subsequent activation of the migrated Territory2Model.
 * @version       1.0.0
 * @license       MIT
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
// Import External Libraries & Modules
import * as fse                 from  'fs-extra';   // File System utility library with extended functionality.

// Import Internal Libraries
import * as sfdxHelper          from  '../modules/sfdx-falcon-util/sfdx';                 // Library of SFDX Helper functions specific to SFDX-Falcon.
import * as typeValidator       from  '../modules/sfdx-falcon-validators/type-validator'; // Library of SFDX Helper functions specific to SFDX-Falcon.

// Import Internal Classes & Functions
import  {SfdxFalconDebug}                 from  '../modules/sfdx-falcon-debug';           // Specialized debug provider for SFDX-Falcon code.
import  {SfdxFalconError}                 from  '../modules/sfdx-falcon-error';           // Class. Extends SfdxError to provide specialized error structures for SFDX-Falcon modules.
import  {SfdxCliError}                    from  '../modules/sfdx-falcon-error';           // Class. Extends SfdxFalconError to provide specialized error handling of error results returned from CLI commands run via shell exec.
import  {SfdxFalconResult}                from  '../modules/sfdx-falcon-result';          // Class. Implements a framework for creating results-driven, informational objects with a concept of heredity (child results) and the ability to "bubble up" both Errors (thrown exceptions) and application-defined "failures".
import  {parseDeployResult}               from  '../modules/sfdx-falcon-util/sfdx';       // Function. Given an object variable that should contain the "raw" JSON resulting from a call to force:mdapi:deploy, validates and parses the contents into as fleshed-out as possible an instance of a DeployResult JsonMap.

// Import Falcon Types
import  {DeployResult}                    from  '../modules/sfdx-falcon-types';   // Interface. Interface. Modeled on the MDAPI Object DeployResult. Returned by a call to force:mdapi:deploy.

// Import TM-Tools Types
import  {Territory2ModelRecord}           from  '../modules/tm-tools-types';      // Interface. Represents a Territory2Model Record.
import  {TM1AnalysisReport}               from  '../modules/tm-tools-types';      // Interface. Represents the data that is generated by a TM1 Analysis Report.
import  {TM1ExtractionReport}             from  '../modules/tm-tools-types';      // Interface. Represents the data that is generated by a TM1 Extraction Report.
import  {TM1TransformationReport}         from  '../modules/tm-tools-types';      // Interface. Represents the data that is generated by a TM1 Transformation Report.
import  {TM2DeploymentReport}             from  '../modules/tm-tools-types';      // Interface. Represents the data that is generated by a TM2 Deployment Report.
import  {TM2SharingDeploymentReport}      from  '../modules/tm-tools-types';      // Interface. Represents the full report data generated by the tmtools:tm2:deploysharing command.
import  {TM2DeploySharingFilePaths}       from  '../modules/tm-tools-types';      // Interface. Represents the complete suite of file paths required by the tmtools:tm2:deploysharing command.

// Set file local globals.
const territory2ModelDevName  = 'Imported_Territory';
const {falcon}                = require('../../package.json');       // The custom "falcon" key from package.json. This holds custom project-level values.

// Set the File Local Debug Namespace
const dbgNs = 'WORKER:tm-tools-deploysharing:';
SfdxFalconDebug.msg(`${dbgNs}`, `Debugging initialized for ${dbgNs}`);


//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @class       TmToolsDeploySharing
 * @summary     Provides FINAL TM2 metadata deployment services given an activated Territory2Model.
 * @description If provided with the location of FINAL transformed data/metadata, as well as a
 *              deployed AND activated Territory2 model, enables the final metadata deployment of
 *              sharing rules required to complete a TM1 to TM2 migration.
 * @public
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export class TmToolsDeploySharing {

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      prepare
   * @param       {TM1AnalysisReport} tm1AnalysisReport Required.
   * @param       {TM1ExtractionReport} tm1ExtractionReport Required.
   * @param       {TM1TransformationReport} tm1TransformationReport Required.
   * @param       {TM2DeploymentReport} tm2DeploymentReport Required.
   * @param       {TM2DeploySharingFilePaths}  tm2DeploySharingFilePaths  Required.
   * @returns     {TmToolsDeploySharing}  Instantiated and prepared TM-Tools
   *              Deploy Sharing worker object.
   * @description Given reports for all TM-Tools commands that should have been
   *              executed before deploying Sharing Rules, and the set of TM2
   *              Sharing Rules Deployment file paths, prepares a
   *              `TmToolsDeploySharing` object which can be used to perform the
   *              FINAL sharing rules deployment.
   * @public @static @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  public static async prepare(tm1AnalysisReport:TM1AnalysisReport,
                              tm1ExtractionReport:TM1ExtractionReport,
                              tm1TransformationReport:TM1TransformationReport,
                              tm2DeploymentReport:TM2DeploymentReport,
                              tm2DeploySharingFilePaths:TM2DeploySharingFilePaths):Promise<TmToolsDeploySharing> {

    // Debug incoming arguments
    SfdxFalconDebug.obj(`${dbgNs}prepare:arguments:`, arguments);

    // Define a query to find a Territory2 Model with the Developer Name used by TM-Tools.
    const soqlQuery = `SELECT Id,Name,DeveloperName,State,ActivatedDate,DeactivatedDate,LastModifiedById,LastModifiedDate FROM Territory2Model WHERE DeveloperName='${territory2ModelDevName}'`;

    // Query the org specified in the TM2 Deployment Report for the expected Territory2 Model.
    const queryResults:Territory2ModelRecord[] = await sfdxHelper.executeSoqlQuery(
      tm2DeploymentReport.orgInfo.username,
      soqlQuery,
      {
        apiVersion:     falcon.sfdcApiVersion,
        logLevel:       'warn',
        useToolingApi:  false,
        perfLog:        false,
        json:           true
      }
    )
    .then((successResult:SfdxFalconResult) => {
      SfdxFalconDebug.obj(`${dbgNs}prepare:successResult:`, successResult);
      return sfdxHelper.getRecordsFromResult(successResult);
    })
    .catch((failureResult:SfdxFalconResult|Error) => {
      SfdxFalconDebug.obj(`${dbgNs}prepare:failureResult:`, failureResult);
      if (failureResult instanceof SfdxFalconResult) {
        // Add additional context and repackage the Error contained by the SfdxFalconResult
        throw failureResult.error(
          new SfdxFalconError ( `The state of the Territory2 Model '${territory2ModelDevName}' in target org (${tm2DeploymentReport.orgInfo.username}) could not be determined.`
                              , `TM2ModelStateUnknown`
                              , `${dbgNs}prepare`
                              ,  failureResult.errObj)
        );
      }
      else {
        throw failureResult;
      }
    });
    SfdxFalconDebug.obj(`${dbgNs}prepare:queryResults:`, queryResults);

    // Inspect the Query Results to see if the State is "Active". Anything else is NOT acceptable.
    if (typeValidator.isEmptyNullInvalidArray(queryResults)
        || queryResults.length !== 1
        || queryResults[0].State !== 'Active') {

      throw new SfdxFalconError ( `Territory2 Model '${territory2ModelDevName}' in target org (${tm2DeploymentReport.orgInfo.username}) is not Active. `
                                + (queryResults[0].State ? `The model's current state is '${queryResults[0].State}'.` : ``)
                                , `TM2ModelStateInvalid`
                                , `${dbgNs}prepare`);
    }

    // Build a TM Tools Load object.
    const tmToolsDeploySharing = new TmToolsDeploySharing(tm1AnalysisReport,
                                                          tm1ExtractionReport,
                                                          tm1TransformationReport,
                                                          tm2DeploymentReport,
                                                          tm2DeploySharingFilePaths);

    // Mark the instantiated object as "prepared".
    tmToolsDeploySharing._prepared = true;

    // Return the instantiated object.
    return tmToolsDeploySharing;
  }

  // Private Members
  private _tm1AnalysisReport:             TM1AnalysisReport;
  private _tm1ExtractionReport:           TM1ExtractionReport;
  private _tm1TransformationReport:       TM1TransformationReport;
  private _tm2DeploymentReport:           TM2DeploymentReport;
  private _tm2SharingDeploymentReport:    TM2SharingDeploymentReport;
  private _sharingRulesDeploymentResult:  DeployResult;
  private _filePaths:                     TM2DeploySharingFilePaths;
  private _prepared:                      boolean;

  // Public Accessors
  public get tm1AnalysisReport()              { return this.isPrepared()  ? this._tm1AnalysisReport             : undefined; }
  public get tm1ExtractionReport()            { return this.isPrepared()  ? this._tm1ExtractionReport           : undefined; }
  public get tm1TransformationReport()        { return this.isPrepared()  ? this._tm1TransformationReport       : undefined; }
  public get tm2DeploymentReport()            { return this.isPrepared()  ? this._tm2DeploymentReport           : undefined; }
  public get tm2SharingDeploymentReport()     { return this.isPrepared()  ? this._tm2SharingDeploymentReport    : undefined; }
  public get sharingRulesDeploymentResult()   { return this.isPrepared()  ? this._sharingRulesDeploymentResult  : undefined; }
  public get filePaths()                      { return this._filePaths; }
  public get prepared()                       { return this._prepared; }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @constructs  TmToolsDeploySharing
   * @param       {TM1AnalysisReport} tm1AnalysisReport Required.
   * @param       {TM1ExtractionReport} tm1ExtractionReport Required.
   * @param       {TM1TransformationReport} tm1TransformationReport Required.
   * @param       {TM2DeploymentReport} tm2DeploymentReport Required.
   * @param       {TM2DeploySharingFilePaths}  tm2DeploySharingFilePaths  Required.
   * @description Takes a reports from all previous TM-Tools commands.  After
   *              construction, the object should be ready to perform the FINAL
   *              TM2 sharing rules deployment.
   * @private
   */
  //───────────────────────────────────────────────────────────────────────────┘
  private constructor(tm1AnalysisReport:TM1AnalysisReport,
                      tm1ExtractionReport:TM1ExtractionReport,
                      tm1TransformationReport:TM1TransformationReport,
                      tm2DeploymentReport:TM2DeploymentReport,
                      tm2DeploySharingFilePaths:TM2DeploySharingFilePaths) {

    // Save the various Reports.
    this._tm1AnalysisReport       = tm1AnalysisReport;
    this._tm1ExtractionReport     = tm1ExtractionReport;
    this._tm1TransformationReport = tm1TransformationReport;
    this._tm2DeploymentReport     = tm2DeploymentReport;

    // Intialize the deployment and data load status members
    this._sharingRulesDeploymentResult  = {error: 'Deployment Failed'};

    // Define the expected file paths.
    this._filePaths = tm2DeploySharingFilePaths;

    // Mark this object instance as UNPREPARED.
    this._prepared = false;
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      deploySharingRules
   * @return      {Promise<DeployResult>}
   * @description Deploys all Sharing Rules metadata to the TM2 org.
   * @public @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  public async deploySharingRules():Promise<DeployResult> {
    const dbgNsLocal = `${dbgNs}deploySharingRules`;
    await sfdxHelper.deployMetadata(this._tm2DeploymentReport.orgInfo.username, this._filePaths.tm2SharingRulesDeploymentDir)
    .then((successResult:SfdxFalconResult) => {
      SfdxFalconDebug.obj(`${dbgNsLocal}:successResult:`, successResult);
      this._sharingRulesDeploymentResult = successResult.detail['stdOutParsed']['result'] as DeployResult;
    })
    .catch((errorResult:SfdxFalconResult|Error) => {
      SfdxFalconDebug.obj(`${dbgNsLocal}:errorResult:`, errorResult);
      let deploymentError:Error = null;
      if (errorResult instanceof Error) {
        deploymentError = errorResult;
      }
      if (errorResult instanceof SfdxFalconResult) {
        deploymentError = errorResult.errObj;
        if (errorResult.errObj instanceof SfdxCliError && errorResult.errObj.cliError) {
          if (typeof errorResult.errObj.cliError.result === 'object') {
            this._sharingRulesDeploymentResult = parseDeployResult(errorResult.errObj.cliError.result);
          }
        }
      }
      throw new SfdxFalconError ( `Deployment of Sharing Rules failed. ${typeof deploymentError === 'object' ? deploymentError.message : ``}`
                                , `DeploymentError`
                                , `${dbgNsLocal}`
                                , deploymentError);
    });

    // Send the results back to the caller.
    SfdxFalconDebug.obj(`${dbgNsLocal}:_sharingRulesDeploymentResult:`, this._sharingRulesDeploymentResult);
    return this._sharingRulesDeploymentResult;
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      generateReport
   * @return      {TM2SharingDeploymentReport} Builds a complete JSON
   *              representation of the aftermath of a TM2 Sharing Rules deployment.
   * @description ???
   * @public
   */
  //───────────────────────────────────────────────────────────────────────────┘
  public generateReport():TM2SharingDeploymentReport {
    const dbgNsLocal = `${dbgNs}generateReport`;
    const report:TM2SharingDeploymentReport = {
      orgInfo: this._tm2DeploymentReport.orgInfo,
      deploymentResult: this._sharingRulesDeploymentResult
    };
    SfdxFalconDebug.obj(`${dbgNsLocal}:report:`, report);
    return report;
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      saveReport
   * @param       {string}  [targetFile] Optional.
   * @return      {Promise<TM2SharingDeploymentReport>}
   * @description Generates a TM2 Data Load Report and writes it to the
   *              local filesystem at the default TM File path, or to the
   *              filepath specified by the caller.
   * @public @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  public async saveReport(targetFile?:string):Promise<TM2SharingDeploymentReport> {

    // Define function-local debug namespace and debug incoming arguments.
    const dbgNsLocal = `${dbgNs}saveReport`;
    SfdxFalconDebug.obj(`${dbgNsLocal}:arguments:`, arguments);

    // Default target file to the one from the TM File Paths collection unless the caller overrides.
    targetFile = targetFile || this.filePaths.tm2SharingDeploymentReportPath;

    // Validate the target file.
    if (typeof targetFile !== 'string' || targetFile === '' || targetFile === null) {
      throw new SfdxFalconError ( `Expected targetFile to be a non-empty, non-null string${typeof targetFile !== 'string' ? ` but got '${typeof targetFile}' instead.` : `.`}`
                                , `TypeError`
                                , `${dbgNsLocal}`);
    }
    if (targetFile.endsWith('.json') !== true) {
      throw new SfdxFalconError ( `The targetFile must end with the '.json' extension. The path/file '${targetFile}' is invalid.`
                                , `InvalidFileName`
                                , `${dbgNsLocal}`);
    }

    // Generate the report.
    const report = this.generateReport();
    SfdxFalconDebug.obj(`${dbgNsLocal}:report:`, report);

    // Write the report to the local filesystem.
    await fse.ensureFile(targetFile);
    await fse.writeJson(targetFile, report, {spaces: '\t'});

    // Send the report back to the caller.
    return report;
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      isPrepared
   * @return      {boolean}
   * @description Returns true if an object instance is prepared. Throws an
   *              error otherwise.
   * @private
   */
  //───────────────────────────────────────────────────────────────────────────┘
  private isPrepared():boolean {
    if (this._prepared !== true) {
      throw new SfdxFalconError ( `Operations against TmToolsDeploySharing objects are not available until the instance is prepared`
                                , `ObjectNotPrepared`
                                , `${dbgNs}isPrepared`);
    }
    else {
      return this._prepared;
    }
  }
}
