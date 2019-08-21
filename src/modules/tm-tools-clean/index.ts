//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @file          modules/tm-tools-clean/index.ts
 * @copyright     Vivek M. Chawla / Salesforce - 2019
 * @author        Vivek M. Chawla <@VivekMChawla>
 * @summary       Exports the TmToolsClean class. Lets user...
 * @description   Exports the TmToolsClean class. Lets user...
 * @version       1.0.0
 * @license       MIT
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
// Import External Libraries & Modules
import  * as fse                          from  'fs-extra';                   // File System utility library with extended functionality.

// Import Internal Libraries
import  * as sfdxHelper                   from  '../sfdx-falcon-util/sfdx';   // Library. Collection of helper functions that make calling the Salesforce CLI from code easier.

// Import Internal Classes & Functions
import  {SfdxFalconDebug}                 from  '../sfdx-falcon-debug';             // Specialized debug provider for SFDX-Falcon code.
import  {SfdxFalconError}                 from  '../sfdx-falcon-error';             // Class. Extends SfdxError to provide specialized error structures for SFDX-Falcon modules.
import  {Tm2Context}                      from  '../tm-tools-objects/tm2-context';  // Models the entirety of a transformed set of TM2 data, including intermediate data.

// Import Falcon Types
import  {DeployResult}                    from  '../sfdx-falcon-types'; // Interface. Interface. Modeled on the MDAPI Object DeployResult. Returned by a call to force:mdapi:deploy.

// Import TM-Tools Types
import  {TM1AnalysisReport}               from  '../tm-tools-types';   // Interface. Represents the data that is generated by a TM1 Analysis Report.
import  {TM1CleanupFilePaths}             from  '../tm-tools-types';   // Interface. Represents the data that is generated by a TM1 Analysis Report.
import  {TM1CleanupReport}                from  '../tm-tools-types';   // Interface. Represents the data that is generated by a TM1 Analysis Report.
import  {TM1ExtractionReport}             from  '../tm-tools-types';   // Interface. Represents the data that is generated by a TM1 Extraction Report.
import  {TM1TransformationReport}         from  '../tm-tools-types';   // Interface. Represents the data that is generated by a TM1 Transformation Report.

// Set the File Local Debug Namespace
const dbgNs = 'MODULE:tm-tools-clean:';
SfdxFalconDebug.msg(`${dbgNs}`, `Debugging initialized for ${dbgNs}`);


//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @class       TmToolsClean
 * @summary     Provides...
 * @description ???
 * @public
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export class TmToolsClean {

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      prepare
   * @param       {TM1AnalysisReport} tm1AnalysisReport Required.
   * @param       {TM1ExtractionReport} tm1ExtractionReport Required.
   * @param       {TM1TransformationReport} tm1TransformationReport Required.
   * @param       {TM1CleanupFilePaths}  tm1CleanupFilePaths  Required.
   * @description Given the paths to exported TM1 metadata and record data,
   *              prepares a "Territory Management 1.0 Context" and makes ready
   *              to perform the actual transformation.
   * @public @static @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  public static async prepare(tm1AnalysisReport:TM1AnalysisReport, tm1ExtractionReport:TM1ExtractionReport, tm1TransformationReport:TM1TransformationReport, tm1CleanupFilePaths:TM1CleanupFilePaths):Promise<TmToolsClean> {

    // Define function-local debug namespace and validate incoming arguments.
    const dbgNsLocal = `${dbgNs}prepare`;
    SfdxFalconDebug.obj(`${dbgNsLocal}:arguments:`, arguments);

    // Create a TM2 Context.
    const tm2Context  = await Tm2Context.prepare(tm1TransformationReport, tm1CleanupFilePaths.baseDirectory);
    SfdxFalconDebug.obj(`${dbgNsLocal}:tm2Context:`, tm2Context);

    // Build a TM Tools Cleanup object.
    const tmToolsClean = new TmToolsClean(tm2Context, tm1AnalysisReport, tm1ExtractionReport, tm1TransformationReport, tm1CleanupFilePaths);

    // Mark the instantiated obeject as "prepared".
    tmToolsClean._prepared = true;

    // Return the instantiated TM Tools Cleanup object.
    return tmToolsClean;
  }

  // Private Members
  private _sharingRulesDestruction:         DeployResult;
  private _tm1AnalysisReport:               TM1AnalysisReport;
  private _tm1ExtractionReport:             TM1ExtractionReport;
  private _tm1TransformationReport:         TM1TransformationReport;
  private _tm2Context:                      Tm2Context;
  private _filePaths:                       TM1CleanupFilePaths;
  private _prepared:                        boolean;

  // Public Accessors
  public get sharingRulesDestruction()  { return this.isPrepared()  ? this._sharingRulesDestruction : undefined; }
  public get tm1AnalysisReport()        { return this.isPrepared()  ? this._tm1AnalysisReport       : undefined; }
  public get tm1ExtractionReport()      { return this.isPrepared()  ? this._tm1ExtractionReport     : undefined; }
  public get tm1TransformationReport()  { return this.isPrepared()  ? this._tm1TransformationReport : undefined; }
  public get tm2Context()               { return this.isPrepared()  ? this._tm2Context              : undefined; }
  public get filePaths()                { return this._filePaths; }
  public get prepared()                 { return this._prepared; }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @constructs  TmToolsClean
   * @param       {Tm2Context}  tm2Context  Required.
   * @param       {TM1AnalysisReport} tm1AnalysisReport Required.
   * @param       {TM1ExtractionReport} tm1ExtractionReport Required.
   * @param       {TM1TransformationReport} tm1TransformationReport Required.
   * @param       {TM1CleanupFilePaths}  tm1CleanupFilePaths  Required.
   * @description Takes a Prepared TM1 Context and the directory paths where
   *              transformed TM2 metadata, record data, and intermediate files
   *              will be written.  After construction, the object is NOT ready
   *              for consumption so its "prepared" value is always FALSE on
   *              instantiation.
   * @private
   */
  //───────────────────────────────────────────────────────────────────────────┘
  private constructor(tm2Context:Tm2Context, tm1AnalysisReport:TM1AnalysisReport, tm1ExtractionReport:TM1ExtractionReport, tm1TransformationReport:TM1TransformationReport, tm1CleanupFilePaths:TM1CleanupFilePaths) {

    // Save the TM2 Context and all reports
    this._tm2Context              = tm2Context;
    this._tm1AnalysisReport       = tm1AnalysisReport;
    this._tm1ExtractionReport     = tm1ExtractionReport;
    this._tm1TransformationReport = tm1TransformationReport;

    // Initialize Deployment/Destruction Results to empty objects
    this._sharingRulesDestruction = {};

    // Define the expected TM1 file paths.
    this._filePaths = tm1CleanupFilePaths;

    // Mark this object instance as UNPREPARED.
    this._prepared = false;
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      generateReport
   * @return      {TM1CleanupReport} Builds a complete JSON representation
   *              of the aftermath of a TM1 Transformation.
   * @description ???
   * @public
   */
  //───────────────────────────────────────────────────────────────────────────┘
  public generateReport():TM1CleanupReport {
    const report:TM1CleanupReport = {
      orgInfo: this._tm1TransformationReport.orgInfo,
      status:   {
        sharingRulesDestruction: this._sharingRulesDestruction
      }
    };
    SfdxFalconDebug.obj(`${dbgNs}generateReport:report:`, report);
    return report;
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      saveReport
   * @param       {string}  [targetFile] Optional.
   * @return      {Promise<TM1CleanupReport>}
   * @description Generates a TM1 Transformation Report and writes it to the
   *              local filesystem at the default TM File path, or to the
   *              filepath specified by the caller.
   * @public @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  public async saveReport(targetFile?:string):Promise<TM1CleanupReport> {

    // Define function-local debug namespace and validate incoming arguments.
    const dbgNsLocal = `${dbgNs}saveReport`;
    SfdxFalconDebug.obj(`${dbgNsLocal}:arguments:`, arguments);

    // Default target file to the one from the TM File Paths collection unless the caller overrides.
    targetFile = targetFile || this.filePaths.tm1CleanupReportPath;

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
   * @method      destroySharingRules
   * @return      {Promise<DeployResult>}
   * @description Deploys the "main" set of TM2 metadata to a TM2 activated org.
   * @public @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  public async destroySharingRules():Promise<DeployResult> {

    // Define function-local debug namespace.
    const dbgNsLocal = `${dbgNs}destroySharingRules`;

    // Do the deployment.
    await sfdxHelper.deployMetadata(this._tm1TransformationReport.orgInfo.username, this._filePaths.tm1SharingRulesCleanupDir)
    .then(successResult => {
      SfdxFalconDebug.obj(`${dbgNsLocal}:successResult:`, successResult);
      this._sharingRulesDestruction = successResult.detail['stdOutParsed']['result'] as DeployResult;
    })
    .catch(errorResult => {
      SfdxFalconDebug.obj(`${dbgNsLocal}:errorResult:`, errorResult);
      throw errorResult;
    });

    // Send the results back to the caller.
    SfdxFalconDebug.obj(`${dbgNsLocal}:_sharingRulesDestruction:`, this._sharingRulesDestruction);
    return this._sharingRulesDestruction;
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
      throw new SfdxFalconError ( `Operations against TmToolsClean objects are not available until the instance is prepared`
                                , `ObjectNotPrepared`
                                , `${dbgNs}isPrepared`);
    }
    else {
      return this._prepared;
    }
  }
}
