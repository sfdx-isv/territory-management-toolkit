//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @file          modules/tm-tools-deploy/index.ts
 * @copyright     Vivek M. Chawla - 2019
 * @author        Vivek M. Chawla <@VivekMChawla>
 * @summary       Exports the TmToolsDeploy class. Lets user take a TM2 Context and build TM2 metadata.
 * @description   Exports the Transform class. Lets user take a TM1 Context and build TM2 metadata.
 * @version       1.0.0
 * @license       MIT
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
// Import External Libraries & Modules
import  {fs}                              from  '@salesforce/core'; // File System utility from the Core SFDX library.
//import  {cloneDeep}                       from  'lodash';           // Useful function for detecting empty objects.
//import  * as path                         from  'path';             // Node's path library.

// Import Internal Libraries
//import  * as csv                          from  '../sfdx-falcon-util/csv';  // ???
import  * as sfdxHelper                   from  '../sfdx-falcon-util/sfdx';  // ???

// Import Internal Classes & Functions
import  {SfdxFalconDebug}                 from  '../sfdx-falcon-debug';                     // Specialized debug provider for SFDX-Falcon code.
import  {SfdxFalconError}                 from  '../sfdx-falcon-error';                     // Class. Extends SfdxError to provide specialized error structures for SFDX-Falcon modules.
import  {SfdxFalconResult}                from  '../sfdx-falcon-result';                     // Class. Implements a framework for creating results-driven, informational objects with a concept of heredity (child results) and the ability to "bubble up" both Errors (thrown exceptions) and application-defined "failures".
//import  {DestructiveChanges}              from  '../tm-tools-objects/destructive-changes';  // Class. Models Salesforce "DestructiveChanges" metadata as needed for deployment to a TM2 org.
//import  {Package}                         from  '../tm-tools-objects/package';              // Class. Models Salesforce "Package" metadata as needed for deployment to a TM2 org.
//import  {SharingRules}                    from  '../tm-tools-objects/sharing-rules';        // Class. Models Salesforce "SharingRules" metadata.
//import  {Territory2}                      from  '../tm-tools-objects/territory2';           // Class. Models Salesforce "Territory2" metadata as needed for deployment to a TM2 org.
//import  {Territory2Model}                 from  '../tm-tools-objects/territory2-model';     // Class. Models Salesforce "Territory2Model" metadata as needed for deployment to a TM2 org.
//import  {Territory2Rule}                  from  '../tm-tools-objects/territory2-rule';      // Class. Models Salesforce "Territory2Rule" metadata as needed for deployment to a TM2 org.
//import  {Territory2Type}                  from  '../tm-tools-objects/territory2-type';      // Class. Models Salesforce "Territory2Type" metadata as needed for deployment to a TM2 org.
//import  {Tm1Context}                      from  '../tm-tools-objects/tm1-context';          // Models the entirety of an exported set of TM1 data, including helpful transforms.
import  {Tm2Context}                      from  '../tm-tools-objects/tm2-context';          // Models the entirety of a transformed set of TM2 data, including intermediate data.

// Import TM-Tools Types
import  {DeploymentResult}                from  '../tm-tools-types';   // Type. Represents the JSON returned by a call to force:mdapi:deploy

//import  {ObjectTerritory2AssociationRecord} from  '../tm-tools-types';   // Interface. Represents an ObjectTerritory2Association Record.
//import  {SharingRulesFqdns}                 from  '../tm-tools-types';   // Interface. Represents a FQDN (Fully Qualified Developer Name) collection for Criteria and Owner-based Sharing Rules.
//import  {SharingRulesJson}                  from  '../tm-tools-types';   // Interface. Represents a collection of Criteria, Ownership, and Territory-based Sharing Rules.
//import  {SharingRulesObjectsByDevName}      from  '../tm-tools-types';   // Type. Represents a map of SharingRules Objects by Developer Name.
import  {Status}                           from  '../tm-tools-types';   // Enum. Represents the valid set of Status values that help determine state in the TM-Tools environment.
//import  {TerritoryDevNameMapping}           from  '../tm-tools-types';   // Interface. Represents the mapping of a Territory developer name and record ID to a Territory2 developer name and record ID.
//import  {Territory2ObjectsByDevName}        from  '../tm-tools-types';   // Type. Represents a map of Territory2 Objects by Developer Name.
//import  {Territory2ModelObjectsByDevName}   from  '../tm-tools-types';   // Type. Represents a map of Territory2Model Objects by Developer Name.
//import  {Territory2RuleObjectsByDevName}    from  '../tm-tools-types';   // Type. Represents a map of Territory2Rule Objects by Developer Name.
//import  {Territory2TypeObjectsByDevName}    from  '../tm-tools-types';   // Type. Represents a map of Territory2Type Objects by Developer Name.
import  {TM1AnalysisReport}                 from  '../tm-tools-types';   // Interface. Represents the data that is generated by a TM1 Analysis Report.
import  {TM1ExtractionReport}               from  '../tm-tools-types';   // Interface. Represents the data that is generated by a TM1 Extraction Report.
import  {TM1TransformationReport}           from  '../tm-tools-types';   // Interface. Represents the data that is generated by a TM1 Transformation Report.
//import  {TM1TransformFilePaths}             from  '../tm-tools-types';   // Interface. Represents the complete suite of file paths required by the TM1 Transform command.
import  {TM2DeployFilePaths}                from  '../tm-tools-types';   // Interface. Represents the complete suite of file paths required by the TM2 Deploy command.
import  {TM2DeploymentReport}               from  '../tm-tools-types';   // Interface. Represents the data that is generated by a TM2 Deployment Report.
//import  {UserTerritory2AssociationRecord}   from  '../tm-tools-types';   // Interface. Represents an UserTerritory2Association Record.

// Set file local globals
//const territory2ModelDevName  = 'Imported_Territory';
//const territory2TypeDevName   = 'Imported_Territory';

// Set the File Local Debug Namespace
const dbgNs = 'MODULE:tm-tools-deploy:';
SfdxFalconDebug.msg(`${dbgNs}`, `Debugging initialized for ${dbgNs}`);


//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @class       TmToolsDeploy
 * @summary     Provides TM2 metadata deployment services given the location of transformed TM1 config.
 * @description If provided with the location of transformed TM1 config (data and metadata), provides
 *              a full set of metadata deployment services into a TM2-activated org.
 * @public
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export class TmToolsDeploy {

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      prepare
   * @param       {TM1AnalysisReport} tm1AnalysisReport Required.
   * @param       {TM1ExtractionReport} tm1ExtractionReport Required.
   * @param       {TM1TransformationReport} tm1TransformationReport Required.
   * @param       {TM2DeployFilePaths}  tm2DeployFilePaths  Required.
   * @description Given...
   * @public @static @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  public static async prepare(tm1AnalysisReport:TM1AnalysisReport, tm1ExtractionReport:TM1ExtractionReport, tm1TransformationReport:TM1TransformationReport, tm2DeployFilePaths:TM2DeployFilePaths):Promise<TmToolsDeploy> {

    // Debug incoming arguments
    SfdxFalconDebug.obj(`${dbgNs}prepare:arguments:`, arguments);

    // Create a TM2 Context.
    const tm2Context  = await Tm2Context.prepare(tm1TransformationReport, tm2DeployFilePaths.baseDirectory);
    SfdxFalconDebug.obj(`${dbgNs}prepare:tm2Context:`, tm2Context);

    // Build a TM Tools Deploy object.
    const tmToolsDeploy = new TmToolsDeploy(tm2Context, tm1AnalysisReport, tm1ExtractionReport, tm1TransformationReport, tm2DeployFilePaths);

    // Mark the instantiated object as "prepared".
    tmToolsDeploy._prepared = true;

    // Return the instantiated TM Tools Deploy object.
    return tmToolsDeploy;
  }

  // Private Members
  private _mainDeploymentResult:            DeploymentResult;
  private _sharingRulesDeploymentResult:    DeploymentResult;
  private _tm2Context:                      Tm2Context;
  private _tm1AnalysisReport:               TM1AnalysisReport;
  private _tm1ExtractionReport:             TM1ExtractionReport;
  private _tm1TransformationReport:         TM1TransformationReport;
  private _filePaths:                       TM2DeployFilePaths;
  private _prepared:                        boolean;

  // Public Accessors
  public get mainDeploymentResult()         { return this.isPrepared()  ? this._mainDeploymentResult          : undefined; }
  public get sharingRulesDeploymentResult() { return this.isPrepared()  ? this._sharingRulesDeploymentResult  : undefined; }
  public get tm2Context()                   { return this.isPrepared()  ? this._tm2Context                    : undefined; }
  public get tm1AnalysisReport()            { return this.isPrepared()  ? this._tm1AnalysisReport             : undefined; }
  public get tm1ExtractionReport()          { return this.isPrepared()  ? this._tm1ExtractionReport           : undefined; }
  public get tm1TransformationReport()      { return this.isPrepared()  ? this._tm1TransformationReport       : undefined; }
  public get filePaths()                    { return this._filePaths; }
  public get prepared()                     { return this._prepared; }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @constructs  TmToolsDeploy
   * @param       {TM2Context}  tm2Context  Required.
   * @param       {TM1AnalysisReport} tm1AnalysisReport Required.
   * @param       {TM1ExtractionReport} tm1ExtractionReport Required.
   * @param       {TM1TransformationReport} tm1TransformationReport Required.
   * @param       {TM2DeployFilePaths}  tm2DeployFilePaths  Required.
   * @description Takes a Prepared TM1 Context and the directory paths where
   *              transformed TM2 metadata, record data, and intermediate files
   *              will be written.  After construction, the object is NOT ready
   *              for consumption so its "prepared" value is always FALSE on
   *              instantiation.
   * @private
   */
  //───────────────────────────────────────────────────────────────────────────┘
  private constructor(tm2Context:Tm2Context, tm1AnalysisReport:TM1AnalysisReport, tm1ExtractionReport:TM1ExtractionReport, tm1TransformationReport:TM1TransformationReport, tm2DeployFilePaths:TM2DeployFilePaths) {

    // Save the TM2 Context and all reports
    this._tm2Context              = tm2Context;
    this._tm1AnalysisReport       = tm1AnalysisReport;
    this._tm1ExtractionReport     = tm1ExtractionReport;
    this._tm1TransformationReport = tm1TransformationReport;

    // Initialize Deployment Results to empty objects
    this._mainDeploymentResult          = {};
    this._sharingRulesDeploymentResult  = {};

    // Define the expected TM1 file paths.
    this._filePaths = tm2DeployFilePaths;

    // Mark this object instance as UNPREPARED.
    this._prepared = false;
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      deployMainMetadata
   * @return      {Promise<DeploymentResults>}
   * @description Deploys the "main" set of TM2 metadata to a TM2 activated org.
   * @public @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  public async deployMainMetadata():Promise<DeploymentResult> {

    // Do the deployment.
    //const deploymentResults =
    await sfdxHelper.deployMetadata(this._tm1TransformationReport.orgInfo.username, this._filePaths.tm2MainDeploymentDir)
    .then(successResult => {
      SfdxFalconDebug.obj(`${dbgNs}deployMainMetadata:successResult:`, successResult);
      this._mainDeploymentResult = successResult.detail['stdOutParsed']['result'] as DeploymentResult;
    })
    .catch(errorResult => {
      SfdxFalconDebug.obj(`${dbgNs}deployMainMetadata:errorResult:`, errorResult);
      throw errorResult;
    });

    // Do something with the results.

    // Send the results back to the caller.
    SfdxFalconDebug.obj(`${dbgNs}deployMainMetadata:_mainDeploymentResult:`, this._mainDeploymentResult);
    return this._mainDeploymentResult;
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      fetchTerritory2Records
   * @return      {Promise<void>}
   * @description ???
   * @public @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  public async fetchTerritory2Records():Promise<void> {

    // Build the SOQL query
    const territory2Soql = `SELECT Territory2Model.DeveloperName, DeveloperName, Id, ParentTerritory2.DeveloperName, ParentTerritory2Id FROM Territory2`;

    // Run the SOQL query and send output to the Territory2 CSV file.
    await sfdxHelper.executeSoqlQuery(
      this._tm1TransformationReport.orgInfo.username,
      territory2Soql,
      {
        resultFormat:   'csv',
        apiVersion:     '46.0',
        logLevel:       'warn',
        useToolingApi:  false,
        perfLog:        false,
        json:           false
      },
      this._filePaths.territory2Csv
    )
    .then((successResult:SfdxFalconResult) => {
      SfdxFalconDebug.debugObject(`${dbgNs}fetchTerritory2Records:successResult:`, successResult);
    })
    .catch((failureResult:SfdxFalconResult|Error) => {
      SfdxFalconDebug.debugObject(`${dbgNs}fetchTerritory2Records:failureResult:`, failureResult);
    });
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      generateReport
   * @return      {TM2DeploymentReport} Builds a complete JSON representation
   *              of the aftermath of a TM2 Deployment.
   * @description ???
   * @public
   */
  //───────────────────────────────────────────────────────────────────────────┘
  public generateReport():TM2DeploymentReport {
    const tm2DeploymentReport:TM2DeploymentReport = {
      orgInfo: this._tm1TransformationReport.orgInfo,
      status: {
        metadataDeploymentStatus: {
          mainDeployment:           Status.PENDING,
          cleanupDeployment:        Status.PENDING,
          sharingRulesDeployment:   Status.PENDING
        },
        dataRetrievalStatus: {
          territory2:               Status.PENDING
        }
      },
      tm2RecordCounts: {
        territory2RecordCount:                  -1,
        userTerritory2AssociationRecordCount:   -1,
        objectTerritory2AssociationRecordCount: -1
      },
      tm2MetadataCounts: {
        accountSharingRulesCount: {
          sharingCriteriaRulesCount:  -1,
          sharingOwnerRulesCount:     -1,
          sharingTerritoryRulesCount: -1
        },
        leadSharingRulesCount: {
          sharingCriteriaRulesCount:  -1,
          sharingOwnerRulesCount:     -1
        },
        opportunitySharingRulesCount: {
          sharingCriteriaRulesCount:  -1,
          sharingOwnerRulesCount:     -1
        }
      },
      deploymentResults: {
        mainDeployment:         this._mainDeploymentResult,
        sharingRulesDeployment: this._sharingRulesDeploymentResult
      }
    };
    SfdxFalconDebug.obj(`${dbgNs}generateReport:tm2DeploymentReport:`, tm2DeploymentReport);
    return tm2DeploymentReport;
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      saveReport
   * @param       {string}  [targetFile] Optional.
   * @return      {Promise<TM2DeploymentReport>}
   * @description Generates a TM2 Deployment Report and writes it to the
   *              local filesystem at the default TM File path, or to the
   *              filepath specified by the caller.
   * @public @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  public async saveReport(targetFile?:string):Promise<TM2DeploymentReport> {

    // Debug incoming arguments.
    SfdxFalconDebug.obj(`${dbgNs}saveReport:arguments:`, arguments);

    // Default target file to the one from the TM File Paths collection unless the caller overrides.
    targetFile = targetFile || this.filePaths.tm2DeploymentReportPath;

    // Validate the target file.
    if (typeof targetFile !== 'string' || targetFile === '' || targetFile === null) {
      throw new SfdxFalconError ( `Expected targetFile to be a non-empty, non-null string${typeof targetFile !== 'string' ? ` but got '${typeof targetFile}' instead.` : `.`}`
                                , `TypeError`
                                , `${dbgNs}save`);
    }
    if (targetFile.endsWith('.json') !== true) {
      throw new SfdxFalconError ( `The targetFile must end with the '.json' extension. The path/file '${targetFile}' is invalid.`
                                , `InvalidFileName`
                                , `${dbgNs}save`);
    }

    // Generate the report.
    const tm2DeploymentReport = this.generateReport();
    SfdxFalconDebug.obj(`${dbgNs}saveReport:tm2DeploymentReport:`, tm2DeploymentReport);

    // Write the TM2 Deployment Report to the local filesystem.
    await fs.writeJson(targetFile, tm2DeploymentReport);

    // Send the report back to the caller.
    return tm2DeploymentReport;
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      transformIntermediateData
   * @return      {Promise<void>}
   * @description ???
   * @public @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  public async transformIntermediateData():Promise<void> {

    // TODO: Implement this method.

    // transformOT2Associations
    // transformUT2Associations

  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      updateTerritoryDevNameMap
   * @return      {Promise<void>}
   * @description ???
   * @public @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  public async updateTerritoryDevNameMap():Promise<void> {

    // TODO: Implement this method.
  }





// deployMainMetadata
// deployCleanupMetadata
// deploySharingRulesMetadata

// fetchTerritory2Records

// transformOT2Associations
// transformUT2Associations

// updateTerritoryDevNameMap






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
      throw new SfdxFalconError ( `Operations against TmToolsDeploy objects are not available until the instance is prepared`
                                , `ObjectNotPrepared`
                                , `${dbgNs}isPrepared`);
    }
    else {
      return this._prepared;
    }
  }
}
