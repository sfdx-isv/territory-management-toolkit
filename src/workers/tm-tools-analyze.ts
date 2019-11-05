//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @author        Vivek M. Chawla <@VivekMChawla>
 * @copyright     2019, Vivek M. Chawla / Salesforce. All rights reserved.
 * @license       BSD-3-Clause For full license text, see the LICENSE file in the repo root or
 *                `https://opensource.org/licenses/BSD-3-Clause`
 * @file          workers/tm-tools-analyze.ts
 * @summary       Implements the worker class `TmToolsAnalyze`.
 * @description   Implements the worker class `TmToolsAnalyze`.
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
// Import External Libraries, Classes, & Functions
import  {SfdxFalconDebug}     from  '@sfdx-falcon/debug';     // Class. Provides custom "debugging" services (ie. debug-style info to console.log()).
import  {SfdxFalconError}     from  '@sfdx-falcon/error';     // Class. Extends SfdxError to provide specialized error structures for SFDX-Falcon modules.
import  {TypeValidator}       from  '@sfdx-falcon/validator'; // Library. Collection of type validation functions.
import  {SfdxFalconWorker}    from  '@sfdx-falcon/worker';    // Abstract Class. Used for building classes that implement task-specific functionality.

// Import External Types
//import  {JsonMap}                 from  '@sfdx-falcon/types';   // Interface. Any JSON-compatible object.
import  {SfdxFalconWorkerOptions} from  '@sfdx-falcon/worker';  // Interface. Represents options that can be passed to the SfdxFalconWorker constructor.

// Import Internal Libraries, Classes, & Functions
import  {Tm1Analysis}         from  '@tmt-models/tm1-analysis'; // Class. Models the analysis of a TM1 org.

// Import Internal Types
import  {TM1AnalysisReport}   from  '@tmt-types'; // Interface. Represents the data that is generated by a TM1 Analysis Report.
import  {TM1AnalyzeFilePaths} from  '@tmt-types'; // Interface. Represents the complete suite of file paths required by the TM1 Analyze command.
import  {TM1HardDependencies} from  '@tmt-types'; // Interface. Represents a complete view of HARD TM1 dependencies in an org.
import  {TM1OrgInfo}          from  '@tmt-types'; // Interface. Represents basic org information for a TM1 org.
import  {TM1SoftDependencies} from  '@tmt-types'; // Interface. Represents a complete view of SOFT TM1 dependencies in an org.
import  {SharingRulesCount}   from  '@tmt-types'; // Interface. Represents a collection of information that tracks the count of Criteria, Owner, and Territory-based Sharing Rules.

// Set the File Local Debug Namespace
const dbgNs = 'WORKER:tm-tools-analyze';
SfdxFalconDebug.msg(`${dbgNs}:`, `Debugging initialized for ${dbgNs}`);


//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * Interface. Represents the collective options object for classes derived from `SfdxFalconWorker`.
 *
 * * `constructorOpts`: Used by the `constructor()` method of the derived class
 * * `prepareOpts`: Used by the `_prepare()` method of the derived class
 *
 * `ClassName` objects support only `constructorOpts`.
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
interface TmToolsAnalyzeOptions extends SfdxFalconWorkerOptions {
  /**
   * Required. Used by the `constructor()` method of `TmToolsAnalyze`.
   */
  constructorOpts: {
    /**
     * Required. The first option.
     */
    aliasOrUsername:      string;
    /**
     * Required. The first option.
     */
    tm1AnalyzeFilePaths:  TM1AnalyzeFilePaths;
    /**
     * Optional. Number of seconds that every Analyze step will wait before executing. Defaults to 1.
     */
    defaultDelay?:        number;
  };
  /**
   * Unused. The `prepare()` method of `TmToolsAnalyze` does not expect any options.
   */
  prepareOpts?: undefined; // Any attempt to provide Constructor Opts should raise a type error.
}

//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @class       TmToolsAnalyze
 * @extends     SfdxFalconWorker
 * @summary     Worker class that can be used to analyze the configuration of a TM1 org.
 * @description Worker class that can be used to analyze the configuration of a TM1 org.
 * @public
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export class TmToolsAnalyze extends SfdxFalconWorker<TmToolsAnalyzeOptions, TM1AnalysisReport> {

  /**
   * Instance of the `Tm1Analysis` model against which all the work of this class will be done.
   */
  private _tm1Analysis:         Tm1Analysis;
  /**
   * Salesforce username, or the alias to one, that's previously been authenticated by the Salesforce CLI.
   */
  private _aliasOrUsername:     string;
  /**
   * Object containing details of all files paths necessary to the proper functioning of this class.
   */
  private _tm1AnalyzeFilePaths: TM1AnalyzeFilePaths;
  /**
   * Length, in seconds, of the delay introduced on every method invoked by this worker other than
   * `saveReport()` and `generateReport()`.
   */
  private _defaultDelay:        number;
  /**
   * File paths object. Contains details of all file paths necessary to the proper functioning of this class.
   */
  public get filePaths():TM1AnalyzeFilePaths  { this.operationRequiresPreparation(); return this._tm1AnalyzeFilePaths; }
  /**
   * Instance of the `Tm1Analysis` model against which this instance operates.
   */
  public get tm1Analysis():Tm1Analysis        { this.operationRequiresPreparation(); return this._tm1Analysis; }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @constructs  TmToolsAnalyze
   * @param       {TmToolsAnalyzeOptions} opts  Required. Represents the options
   *              required to construct/prepare this `TmToolsAnalyze` object.
   * @description Constructs a `TmToolsAnalyze` object.
   * @public
   */
  //───────────────────────────────────────────────────────────────────────────┘
  constructor(opts:TmToolsAnalyzeOptions) {

    // Call the superclass constructor.
    super({
      dbgNsExt:     `WORKER`, // Sets the base debug namespace for this Worker.
      requiresPrep: false     // Indicates this worker does not require preparation.
    });

    // Define the local debug namespace and echo incoming arguments.
    const dbgNsLocal = `${this.dbgNs}:constructor`;
    SfdxFalconDebug.obj(`${dbgNsLocal}:arguments:`, arguments);

    // Validate REQUIRED options.
    TypeValidator.throwOnEmptyNullInvalidObject(opts,                                     `${dbgNsLocal}`, `TmToolsAnalyzeOptions`);
    TypeValidator.throwOnEmptyNullInvalidString(opts.constructorOpts.aliasOrUsername,     `${dbgNsLocal}`, `constructorOpts.aliasOrUsername`);
    TypeValidator.throwOnEmptyNullInvalidObject(opts.constructorOpts.tm1AnalyzeFilePaths, `${dbgNsLocal}`, `constructorOpts.tm1AnalyzeFilePaths`);
    
    // Validate OPTIONAL options.
    if (TypeValidator.isNotNullUndefined(opts.constructorOpts.defaultDelay))  TypeValidator.throwOnNullInvalidNumber(opts.constructorOpts.defaultDelay, `${dbgNsLocal}`,  `constructorOpts.defaultDelay`);

    // Perform initialization.
    this._aliasOrUsername     = opts.constructorOpts.aliasOrUsername;
    this._tm1AnalyzeFilePaths = opts.constructorOpts.tm1AnalyzeFilePaths;
    this._reportPath          = this._tm1AnalyzeFilePaths.tm1AnalysisReportPath;
    this._defaultDelay        = opts.constructorOpts.defaultDelay || 1;
    this._tm1Analysis         = new Tm1Analysis({
      constructorOpts:{
        aliasOrUsername:  this._aliasOrUsername,
        defaultDelay:     this._defaultDelay
      }
    });
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      analyzeAccountShares
   * @return      {number}  Number of `AccountShare` records present in the
   *              target org with `TerritoryManual` as their `RowCause`.
   * @description Uses a `Tm1Analysis` Model to query the target org for the
   *              count of `AccountShare` records that have `TerritoryManual`
   *              as their `RowCause`.
   * @public @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  public async analyzeAccountShares():Promise<number> {

    // Define function-local and external debug namespaces.
    const funcName    = `analyzeAccountShares`;
    const errName     = `TM1AnalyzeError`;
    const errMsgBase  = `Could not analyze TM1 config.`;
    const dbgNsLocal  = `${dbgNs}:${funcName}`;
    const dbgNsExt    = `${this.dbgNs}:${funcName}`;

    // Use the TM1 Analysis model to analyze Account Shares.
    return await this._tm1Analysis.analyzeAccountShares()
    .then((successResult:number) => {
      SfdxFalconDebug.obj(`${dbgNsLocal}:successResult:`, {successResult: successResult});
      SfdxFalconDebug.obj(`${dbgNsExt}:successResult:`,   {successResult: successResult});
      return successResult;
    })
    .catch((failureResult:Error) => {
      SfdxFalconDebug.obj(`${dbgNsLocal}:failureResult:`, failureResult);
      SfdxFalconDebug.obj(`${dbgNsExt}:failureResult:`,   failureResult);
      throw new SfdxFalconError ( `${errMsgBase} ${failureResult.message}`
                                , `${errName}`
                                , `${dbgNsExt}`
                                ,  failureResult);
    });
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      analyzeAtaRuleItems
   * @return      {number}  Number of TM1 ATA Rule Items present in the target org.
   * @description Uses a `Tm1Analysis` Model to query the target org for the
   *              `AccountTerritoryAssignmentRuleItem` (aka "ATA Rule Item")
   *              record count.
   * @public @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  public async analyzeAtaRuleItems():Promise<number> {

    // Define function-local and external debug namespaces.
    const funcName    = `analyzeAtaRuleItems`;
    const errName     = `TM1AnalyzeError`;
    const errMsgBase  = `Could not analyze TM1 config.`;
    const dbgNsLocal  = `${dbgNs}:${funcName}`;
    const dbgNsExt    = `${this.dbgNs}:${funcName}`;

    // Use the TM1 Analysis model to analyze ATA Rule Items.
    return await this._tm1Analysis.analyzeAtaRuleItems()
    .then((successResult:number) => {
      SfdxFalconDebug.obj(`${dbgNsLocal}:successResult:`, {successResult: successResult});
      SfdxFalconDebug.obj(`${dbgNsExt}:successResult:`,   {successResult: successResult});
      return successResult;
    })
    .catch((failureResult:Error) => {
      SfdxFalconDebug.obj(`${dbgNsLocal}:failureResult:`, failureResult);
      SfdxFalconDebug.obj(`${dbgNsExt}:failureResult:`,   failureResult);
      throw new SfdxFalconError ( `${errMsgBase} ${failureResult.message}`
                                , `${errName}`
                                , `${dbgNsExt}`
                                ,  failureResult);
    });
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      analyzeAtaRules
   * @return      {number}  Number of TM1 ATA Rules present in the target org.
   * @description Uses a `Tm1Analysis` Model to query the target org for the
   *              `AccountTerritoryAssignmentRule` (aka "ATA Rule") record count.
   * @public @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  public async analyzeAtaRules():Promise<number> {

    // Define function-local and external debug namespaces.
    const funcName    = `analyzeAtaRules`;
    const errName     = `TM1AnalyzeError`;
    const errMsgBase  = `Could not analyze TM1 config.`;
    const dbgNsLocal  = `${dbgNs}:${funcName}`;
    const dbgNsExt    = `${this.dbgNs}:${funcName}`;

    // Use the TM1 Analysis model to analyze ATA Rules.
    return await this._tm1Analysis.analyzeAtaRules()
    .then((successResult:number) => {
      SfdxFalconDebug.obj(`${dbgNsLocal}:successResult:`, {successResult: successResult});
      SfdxFalconDebug.obj(`${dbgNsExt}:successResult:`,   {successResult: successResult});
      return successResult;
    })
    .catch((failureResult:Error) => {
      SfdxFalconDebug.obj(`${dbgNsLocal}:failureResult:`, failureResult);
      SfdxFalconDebug.obj(`${dbgNsExt}:failureResult:`,   failureResult);
      throw new SfdxFalconError ( `${errMsgBase} ${failureResult.message}`
                                , `${errName}`
                                , `${dbgNsExt}`
                                ,  failureResult);
    });
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      analyzeGroups
   * @return      {number}  Number of Group records present in the target org
   *              with `Territory` or `TerritoryAndSubordinates` as their `Type`.
   * @description Uses a `Tm1Analysis` Model to query the target org for the
   *              count of `Group` records with `Territory` or
   *              `TerritoryAndSubordinates` as their `Type`.
   * @public @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  public async analyzeGroups():Promise<number> {

    // Define function-local and external debug namespaces.
    const funcName    = `analyzeGroups`;
    const errName     = `TM1AnalyzeError`;
    const errMsgBase  = `Could not analyze TM1 config.`;
    const dbgNsLocal  = `${dbgNs}:${funcName}`;
    const dbgNsExt    = `${this.dbgNs}:${funcName}`;

    // Use the TM1 Analysis model to analyze Groups.
    return await this._tm1Analysis.analyzeAtaRules()
    .then((successResult:number) => {
      SfdxFalconDebug.obj(`${dbgNsLocal}:successResult:`, {successResult: successResult});
      SfdxFalconDebug.obj(`${dbgNsExt}:successResult:`,   {successResult: successResult});
      return successResult;
    })
    .catch((failureResult:Error) => {
      SfdxFalconDebug.obj(`${dbgNsLocal}:failureResult:`, failureResult);
      SfdxFalconDebug.obj(`${dbgNsExt}:failureResult:`,   failureResult);
      throw new SfdxFalconError ( `${errMsgBase} ${failureResult.message}`
                                , `${errName}`
                                , `${dbgNsExt}`
                                ,  failureResult);
    });
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      analyzeHardTm1Dependencies
   * @return      {TM1HardDependencies} Object containing the HARD TM1
   *              Dependency Count and an array of the HARD TM1 Dependencies
   *              that were found.
   * @description Uses a `Tm1Analysis` Model to get a list of all known HARD
   *              (aka compile time) dependencies in the target org.
   * @public @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  public async analyzeHardTm1Dependencies():Promise<TM1HardDependencies> {

    // Define function-local and external debug namespaces.
    const funcName    = `analyzeHardTm1Dependencies`;
    const errName     = `TM1AnalyzeError`;
    const errMsgBase  = `Could not analyze TM1 config.`;
    const dbgNsLocal  = `${dbgNs}:${funcName}`;
    const dbgNsExt    = `${this.dbgNs}:${funcName}`;

    // Use the TM1 Analysis model to analyze ATA Rules.
    return await this._tm1Analysis.analyzeHardTm1Dependencies()
    .then((successResult:TM1HardDependencies) => {
      SfdxFalconDebug.obj(`${dbgNsLocal}:successResult:`, {successResult: successResult});
      SfdxFalconDebug.obj(`${dbgNsExt}:successResult:`,   {successResult: successResult});
      return successResult;
    })
    .catch((failureResult:Error) => {
      SfdxFalconDebug.obj(`${dbgNsLocal}:failureResult:`, failureResult);
      SfdxFalconDebug.obj(`${dbgNsExt}:failureResult:`,   failureResult);
      throw new SfdxFalconError ( `${errMsgBase} ${failureResult.message}`
                                , `${errName}`
                                , `${dbgNsExt}`
                                ,  failureResult);
    });
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      analyzeSoftTm1Dependencies
   * @return      {TM1SoftDependencies}  Object containing the SOFT TM1
   *              Dependency Count and an array of the SOFT TM1 Dependencies
   *              that were found.
   * @description Uses a `Tm1Analysis` Model to get a list of all known SOFT
   *              TM1 dependencies by crawling any metadata that might have
   *              TM1 dependencies that are only visible at runtime. For example,
   *              an Apex class with dynamic SOQL that refers to the `Territory`
   *              object.
   * @public @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  public async analyzeSoftTm1Dependencies():Promise<TM1SoftDependencies> {

    // Define function-local and external debug namespaces.
    const funcName    = `analyzeSoftTm1Dependencies`;
    const errName     = `TM1AnalyzeError`;
    const errMsgBase  = `Could not analyze TM1 config.`;
    const dbgNsLocal  = `${dbgNs}:${funcName}`;
    const dbgNsExt    = `${this.dbgNs}:${funcName}`;

    // Use the TM1 Analysis model to analyze ATA Rules.
    return await this._tm1Analysis.analyzeSoftTm1Dependencies()
    .then((successResult:TM1SoftDependencies) => {
      SfdxFalconDebug.obj(`${dbgNsLocal}:successResult:`, {successResult: successResult});
      SfdxFalconDebug.obj(`${dbgNsExt}:successResult:`,   {successResult: successResult});
      return successResult;
    })
    .catch((failureResult:Error) => {
      SfdxFalconDebug.obj(`${dbgNsLocal}:failureResult:`, failureResult);
      SfdxFalconDebug.obj(`${dbgNsExt}:failureResult:`,   failureResult);
      throw new SfdxFalconError ( `${errMsgBase} ${failureResult.message}`
                                , `${errName}`
                                , `${dbgNsExt}`
                                ,  failureResult);
    });
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      analyzeAccountSharingRules
   * @return      {Promise<SharingRulesCount>} Criteria, Owner, and Territory
   *              Sharing Rule counts for the `Account` object that are shared
   *              TO or FROM a TM1 `Territory` or TM1 `Territories and Subordinates`
   *              group.
   * @description Uses a `Tm1Analysis` Model to do a metadata retrieve of all
   *              `Account` sharing rules and process the resulting XML localy.
   * @public @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  public async analyzeAccountSharingRules():Promise<SharingRulesCount> {

    // Define function-local and external debug namespaces.
    const funcName    = `analyzeAccountSharingRules`;
    const errName     = `TM1AnalyzeError`;
    const errMsgBase  = `Could not analyze TM1 config.`;
    const dbgNsLocal  = `${dbgNs}:${funcName}`;
    const dbgNsExt    = `${this.dbgNs}:${funcName}`;

    // Use the TM1 Analysis model to analyze ATA Rules.
    return await this._tm1Analysis.analyzeAccountSharingRules()
    .then((successResult:SharingRulesCount) => {
      SfdxFalconDebug.obj(`${dbgNsLocal}:successResult:`, {successResult: successResult});
      SfdxFalconDebug.obj(`${dbgNsExt}:successResult:`,   {successResult: successResult});
      return successResult;
    })
    .catch((failureResult:Error) => {
      SfdxFalconDebug.obj(`${dbgNsLocal}:failureResult:`, failureResult);
      SfdxFalconDebug.obj(`${dbgNsExt}:failureResult:`,   failureResult);
      throw new SfdxFalconError ( `${errMsgBase} ${failureResult.message}`
                                , `${errName}`
                                , `${dbgNsExt}`
                                ,  failureResult);
    });
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      analyzeLeadSharingRules
   * @return      {Promise<SharingRulesCount>} Criteria, Owner, and Territory
   *              based Sharing Rule counts for the `Lead` object that are shared
   *              TO or FROM a TM1 `Territory` or TM1 `Territories and Subordinates`
   *              group.
   * @description Uses a `Tm1Analysis` Model to do a metadata retrieve of all
   *              `Lead` sharing rules and process the resulting XML localy.
   * @public @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  public async analyzeLeadSharingRules():Promise<SharingRulesCount> {

    // Define function-local and external debug namespaces.
    const funcName    = `analyzeLeadSharingRules`;
    const errName     = `TM1AnalyzeError`;
    const errMsgBase  = `Could not analyze TM1 config.`;
    const dbgNsLocal  = `${dbgNs}:${funcName}`;
    const dbgNsExt    = `${this.dbgNs}:${funcName}`;

    // Use the TM1 Analysis model to analyze ATA Rules.
    return await this._tm1Analysis.analyzeLeadSharingRules()
    .then((successResult:SharingRulesCount) => {
      SfdxFalconDebug.obj(`${dbgNsLocal}:successResult:`, {successResult: successResult});
      SfdxFalconDebug.obj(`${dbgNsExt}:successResult:`,   {successResult: successResult});
      return successResult;
    })
    .catch((failureResult:Error) => {
      SfdxFalconDebug.obj(`${dbgNsLocal}:failureResult:`, failureResult);
      SfdxFalconDebug.obj(`${dbgNsExt}:failureResult:`,   failureResult);
      throw new SfdxFalconError ( `${errMsgBase} ${failureResult.message}`
                                , `${errName}`
                                , `${dbgNsExt}`
                                ,  failureResult);
    });
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      analyzeOpportunitySharingRules
   * @return      {Promise<SharingRulesCount>} Criteria, Owner, and Territory
   *              based Sharing Rule counts for the `Opportunity` object that
   *              are shared TO or FROM a TM1 `Territory` or TM1
   *              `Territories and Subordinates` group.
   * @description Uses a `Tm1Analysis` Model to do a metadata retrieve of all
   *              `Opportunity` sharing rules and process the resulting XML localy.
   * @public @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  public async analyzeOpportunitySharingRules():Promise<SharingRulesCount> {

    // Define function-local and external debug namespaces.
    const funcName    = `analyzeOpportunitySharingRules`;
    const errName     = `TM1AnalyzeError`;
    const errMsgBase  = `Could not analyze TM1 config.`;
    const dbgNsLocal  = `${dbgNs}:${funcName}`;
    const dbgNsExt    = `${this.dbgNs}:${funcName}`;

    // Use the TM1 Analysis model to analyze ATA Rules.
    return await this._tm1Analysis.analyzeOpportunitySharingRules()
    .then((successResult:SharingRulesCount) => {
      SfdxFalconDebug.obj(`${dbgNsLocal}:successResult:`, {successResult: successResult});
      SfdxFalconDebug.obj(`${dbgNsExt}:successResult:`,   {successResult: successResult});
      return successResult;
    })
    .catch((failureResult:Error) => {
      SfdxFalconDebug.obj(`${dbgNsLocal}:failureResult:`, failureResult);
      SfdxFalconDebug.obj(`${dbgNsExt}:failureResult:`,   failureResult);
      throw new SfdxFalconError ( `${errMsgBase} ${failureResult.message}`
                                , `${errName}`
                                , `${dbgNsExt}`
                                ,  failureResult);
    });
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      analyzeTerritories
   * @return      {number}  Number of TM1 `Territory` records in the target org.
   * @description Uses a `Tm1Analysis` Model to query the target org for the
   *              count of `Territory` records.
   * @public @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  public async analyzeTerritories():Promise<number> {

    // Define function-local and external debug namespaces.
    const funcName    = `analyzeTerritories`;
    const errName     = `TM1AnalyzeError`;
    const errMsgBase  = `Could not analyze TM1 config.`;
    const dbgNsLocal  = `${dbgNs}:${funcName}`;
    const dbgNsExt    = `${this.dbgNs}:${funcName}`;

    // Use the TM1 Analysis model to analyze Groups.
    return await this._tm1Analysis.analyzeTerritories()
    .then((successResult:number) => {
      SfdxFalconDebug.obj(`${dbgNsLocal}:successResult:`, {successResult: successResult});
      SfdxFalconDebug.obj(`${dbgNsExt}:successResult:`,   {successResult: successResult});
      return successResult;
    })
    .catch((failureResult:Error) => {
      SfdxFalconDebug.obj(`${dbgNsLocal}:failureResult:`, failureResult);
      SfdxFalconDebug.obj(`${dbgNsExt}:failureResult:`,   failureResult);
      throw new SfdxFalconError ( `${errMsgBase} ${failureResult.message}`
                                , `${errName}`
                                , `${dbgNsExt}`
                                ,  failureResult);
    });
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      analyzeUserTerritoryAssignments
   * @return      {number}  Number of TM1 `UserTerritory` records in the target org.
   * @description Uses a `Tm1Analysis` Model to query the target org for the
   *              count of `UserTerritory` records.
   * @public @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  public async analyzeUserTerritoryAssignments():Promise<number> {

    // Define function-local and external debug namespaces.
    const funcName    = `analyzeUserTerritoryAssignments`;
    const errName     = `TM1AnalyzeError`;
    const errMsgBase  = `Could not analyze TM1 config.`;
    const dbgNsLocal  = `${dbgNs}:${funcName}`;
    const dbgNsExt    = `${this.dbgNs}:${funcName}`;

    // Use the TM1 Analysis model to analyze Groups.
    return await this._tm1Analysis.analyzeUserTerritoryAssignments()
    .then((successResult:number) => {
      SfdxFalconDebug.obj(`${dbgNsLocal}:successResult:`, {successResult: successResult});
      SfdxFalconDebug.obj(`${dbgNsExt}:successResult:`,   {successResult: successResult});
      return successResult;
    })
    .catch((failureResult:Error) => {
      SfdxFalconDebug.obj(`${dbgNsLocal}:failureResult:`, failureResult);
      SfdxFalconDebug.obj(`${dbgNsExt}:failureResult:`,   failureResult);
      throw new SfdxFalconError ( `${errMsgBase} ${failureResult.message}`
                                , `${errName}`
                                , `${dbgNsExt}`
                                ,  failureResult);
    });
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      gatherOrgInformation
   * @return      {TM1OrgInfo}  Basic information about the target TM1 org.
   * @description Uses a `Tm1Analysis` Model to validate whether or not the
   *              "alias or username" value that was provided to the `constructor`
   *              actually references an authenticated user to the local CLI.
   *              If it does, then return a core set of TM1 Org Information.
   * @public @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  public async gatherOrgInformation():Promise<TM1OrgInfo> {

    // Define function-local and external debug namespaces.
    const funcName    = `gatherOrgInformation`;
    const errName     = `TM1AnalyzeError`;
    const errMsgBase  = `Could not analyze TM1 config.`;
    const dbgNsLocal  = `${dbgNs}:${funcName}`;
    const dbgNsExt    = `${this.dbgNs}:${funcName}`;

    // Use the TM1 Analysis model to analyze Groups.
    return await this._tm1Analysis.gatherOrgInformation()
    .then((successResult:TM1OrgInfo) => {
      SfdxFalconDebug.obj(`${dbgNsLocal}:successResult:`, {successResult: successResult});
      SfdxFalconDebug.obj(`${dbgNsExt}:successResult:`,   {successResult: successResult});
      return successResult;
    })
    .catch((failureResult:Error) => {
      SfdxFalconDebug.obj(`${dbgNsLocal}:failureResult:`, failureResult);
      SfdxFalconDebug.obj(`${dbgNsExt}:failureResult:`,   failureResult);
      throw new SfdxFalconError ( `${errMsgBase} ${failureResult.message}`
                                , `${errName}`
                                , `${dbgNsExt}`
                                ,  failureResult);
    });
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      _generateReport
   * @return      {TM1AnalysisReport} JSON representation or this `TmToolsAnalyze`
   *              object's status.
   * @description Generates a JSON representation providing details about the
   *              status of the operations performed by this `TmToolsAnalyze`
   *              object.
   * @protected
   */
  //───────────────────────────────────────────────────────────────────────────┘
  protected _generateReport():TM1AnalysisReport {

    // Define function-local and external debug namespaces.
    const funcName    = `_generateReport`;
    const dbgNsLocal  = `${dbgNs}:${funcName}`;
    const dbgNsExt    = `${this.dbgNs}:${funcName}`;
    
    const tm1AnalysisReport:TM1AnalysisReport = {
      orgInfo:  this.tm1Analysis.orgInfo,
      tm1RecordCounts:  {
        territoryRecordCount:       this.tm1Analysis.territoryRecordCount,
        userTerritoryRecordCount:   this.tm1Analysis.userTerritoryRecordCount,
        ataRuleRecordCount:         this.tm1Analysis.ataRuleRecordCount,
        ataRuleItemRecordCount:     this.tm1Analysis.ataRuleItemRecordCount,
        accountShareRecordCount:    this.tm1Analysis.accountShareRecordCount,
        groupRecordCount:           this.tm1Analysis.groupRecordCount
      },
      tm1MetadataCounts: {
        accountSharingRulesCount: {
          sharingCriteriaRulesCount:  this.tm1Analysis.accountSharingRulesCount.sharingCriteriaRulesCount,     // NOT_FULLY_IMPLEMENTED
          sharingOwnerRulesCount:     this.tm1Analysis.accountSharingRulesCount.sharingOwnerRulesCount,        // NOT_FULLY_IMPLEMENTED
          sharingTerritoryRulesCount: this.tm1Analysis.accountSharingRulesCount.sharingTerritoryRulesCount     // NOT_FULLY_IMPLEMENTED
        },
        leadSharingRulesCount: {
          sharingCriteriaRulesCount:  this.tm1Analysis.leadSharingRulesCount.sharingCriteriaRulesCount,        // NOT_FULLY_IMPLEMENTED
          sharingOwnerRulesCount:     this.tm1Analysis.leadSharingRulesCount.sharingOwnerRulesCount            // NOT_FULLY_IMPLEMENTED
        },
        opportunitySharingRulesCount: {
          sharingCriteriaRulesCount:  this.tm1Analysis.opportunitySharingRulesCount.sharingCriteriaRulesCount, // NOT_FULLY_IMPLEMENTED
          sharingOwnerRulesCount:     this.tm1Analysis.opportunitySharingRulesCount.sharingOwnerRulesCount     // NOT_FULLY_IMPLEMENTED
        }
      },
      hardTm1Dependencies: {
        hardTm1DependencyCount: this.tm1Analysis.hardTm1DependencyCount,
        hardTm1Dependencies:    this.tm1Analysis.hardTm1Dependencies
      },
      softTm1Dependencies: {
        softTm1DependencyCount: this.tm1Analysis.softTm1DependencyCount,
        softTm1Dependencies:    this.tm1Analysis.softTm1Dependencies
      }
    };
    SfdxFalconDebug.obj(`${dbgNsLocal}:tm1AnalysisReport:`, tm1AnalysisReport);
    SfdxFalconDebug.obj(`${dbgNsExt}:tm1AnalysisReport:`,   tm1AnalysisReport);
    return tm1AnalysisReport;
  }
}
