//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @author        Vivek M. Chawla <@VivekMChawla>
 * @copyright     2019, Vivek M. Chawla / Salesforce. All rights reserved.
 * @license       BSD-3-Clause For full license text, see the LICENSE file in the repo root or
 *                `https://opensource.org/licenses/BSD-3-Clause`
 * @file          models/tm1-analysis.ts
 * @summary       Models the analysis of a TM1 org.
 * @description   Models the analysis of a TM1 org. Includes key information such as the number of
 *                `Territory` records, `UserTerritory` records, and `AccountShare` records where
 *                the sharing reason is `TerritoryManual`.
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
// Import External Libraries, Classes, & Functions
import  {Aliases}                   from  '@salesforce/core';       // Aliases specify alternate names for groups of properties used by the Salesforce CLI, such as orgs.
import  {AuthInfo}                  from  '@salesforce/core';       // Handles persistence and fetching of user authentication information using JWT, OAuth, or refresh tokens.
import  {SfdxFalconDebug}           from  '@sfdx-falcon/debug';     // Class. Specialized debug provider for SFDX-Falcon code.
import  {SfdxFalconError}           from  '@sfdx-falcon/error';     // Class. Extends SfdxError to provide specialized error structures for SFDX-Falcon modules.
import  {SfdxFalconResult}          from  '@sfdx-falcon/status';    // Class. Implements a framework for creating results-driven, informational objects with a concept of heredity (child results) and the ability to "bubble up" both Errors (thrown exceptions) and application-defined "failures".
import  {AsyncUtil}                 from  '@sfdx-falcon/util';      // Function. Allows for a simple "wait" to execute.
import  {SfdxUtil}                  from  '@sfdx-falcon/util';      // Library of SFDX Helper functions specific to SFDX-Falcon.
import  {TypeValidator}             from  '@sfdx-falcon/validator'; // Library. Collection of type validation functions.
import  {SfdxFalconModel}           from  '@tmt-models/model';      // Abstract Class. Used for building classes that encapsulate a domain model, including associated domain-specific operations.

// Import External Types
import  {SfdxFalconModelOptions}    from  '@tmt-models/model';    // Interface. Represents the collective options object for classes derived from SfdxFalconModel.

// Import Internal Libraries, Classes & Functions

// Import Internal Types
import  {SharingRulesCount}       from  '@tmt-types';   // Interface. Represents a collection of information that tracks the count of Criteria, Owner, and Territory-based Sharing Rules.
import  {TM1AnalyzeFilePaths}     from  '@tmt-types';   // Interface. Represents the complete suite of file paths required by the TM1 Analyze command.
import  {TM1Dependency}           from  '@tmt-types';   // Interface. Represents a metadata component with a dependency on TM1.
import  {TM1HardDependencies}     from  '@tmt-types';   // Interface. Represents a complete view of HARD TM1 dependencies in an org.
import  {TM1SoftDependencies}     from  '@tmt-types';   // Interface. Represents a complete view of SOFT TM1 dependencies in an org.
import  {TM1OrgInfo}              from  '@tmt-types';   // Interface. Represents basic org information for a TM1 org

// Get a reference to the falcon key in `package.json`.
const {falcon}  = require('../../../package.json'); // The custom "falcon" key from package.json. This holds custom project-level values.

// Set the File Local Debug Namespace
const dbgNs = 'MODEL:tm1-analysis';
SfdxFalconDebug.msg(`${dbgNs}:`, `Debugging initialized for ${dbgNs}`);


//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * Interface. Represents options used by the `Tm1AnalysisOptions` constructor.
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export interface Tm1AnalysisOptions extends SfdxFalconModelOptions {
  /**
   * Required. Used by the `constructor()` method of `Tm1Analysis`.
   */
  constructorOpts: {
    /**
     * Required. Username or alias of a user with access to the Salesforce Org whose TM1 configuration will be analyzed.
     */
    aliasOrUsername:  string;
    /**
     * Optional. Number of seconds that every Analyze step will wait before executing. Defaults to 1.
     */
    defaultDelay?:  number;
  };
  /**
   * Required/Optional. Used by the `build()` method of `Tm1AnalysisOptions`.
   */
  buildOpts?: undefined; // NOTE: Set this to `undefined` if you DO NOT want to expose these options.
  /**
   * Required/Optional. Used by the `load()` method of `Tm1AnalysisOptions`.
   */
  loadOpts?: undefined; // NOTE: Set this to `undefined` if you DO NOT want to expose these options.
}

//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @class       Tm1Analysis
 * @extends     SfdxFalconModel
 * @description Models the analysis of a TM1 org.
 * @public
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export class Tm1Analysis extends SfdxFalconModel<Tm1AnalysisOptions> {

  // Private Members
  private _accountShareRecordCount:       number;
  private _ataRuleRecordCount:            number;
  private _ataRuleItemRecordCount:        number;
  private _hardTm1DependencyCount:        number;
  private _softTm1DependencyCount:        number;
  private _hardTm1Dependencies:           TM1Dependency[];
  private _softTm1Dependencies:           TM1Dependency[];
  private _accountSharingRulesCount:      SharingRulesCount;
  private _leadSharingRulesCount:         SharingRulesCount;
  private _opportunitySharingRulesCount:  SharingRulesCount;
  private _groupRecordCount:              number;
  private _territoryRecordCount:          number;
  private _userTerritoryRecordCount:      number;
  private _dateAnalyzed:                  string;
  private _orgInfo:                       TM1OrgInfo;
  private _aliasOrUsername:               string;
  private _defaultDelay:                  number;
  private _filePaths:                     TM1AnalyzeFilePaths;

  // Public Accessors
  public get accountShareRecordCount()      { this.isReady(); return this._accountShareRecordCount; }
  public get ataRuleRecordCount()           { this.isReady(); return this._ataRuleRecordCount; }
  public get ataRuleItemRecordCount()       { this.isReady(); return this._ataRuleItemRecordCount; }
  public get hardTm1DependencyCount()       { this.isReady(); return this._hardTm1DependencyCount; }
  public get softTm1DependencyCount()       { this.isReady(); return this._softTm1DependencyCount; }
  public get hardTm1Dependencies()          { this.isReady(); return this._hardTm1Dependencies; }
  public get softTm1Dependencies()          { this.isReady(); return this._softTm1Dependencies; }
  public get dateAnalyzed()                 { this.isReady(); return this._dateAnalyzed; }
  public get orgInfo()                      { this.isReady(); return this._orgInfo; }
  public get aliasOrUsername()              { this.isReady(); return this._aliasOrUsername; }
  public get accountSharingRulesCount()     { this.isReady(); return this._accountSharingRulesCount; }
  public get leadSharingRulesCount()        { this.isReady(); return this._leadSharingRulesCount; }
  public get opportunitySharingRulesCount() { this.isReady(); return this._opportunitySharingRulesCount; }
  public get groupRecordCount()             { this.isReady(); return this._groupRecordCount; }
  public get territoryRecordCount()         { this.isReady(); return this._territoryRecordCount; }
  public get userTerritoryRecordCount()     { this.isReady(); return this._userTerritoryRecordCount; }
  public get filePaths()                    { return this._filePaths; }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @constructs  Tm1Analysis
   * @param       {Tm1AnalysisOptions}  opts  Required. Options object for this
   *              Model. Only requires `constructorOpts` to be fully fleshed out.
   * @description Constructs a TM1 Analysis object that can either be prepared
   *              manually by an external actor or prepared by reading the
   *              contents of a previously-created TM1 Analysis Results File.
   * @public
   */
  //───────────────────────────────────────────────────────────────────────────┘
  public constructor(opts:Tm1AnalysisOptions) {

    // Call the superclass constructor.
    super({
      dbgNsExt: `MODEL`,  // Sets the base debug namespace for this Model.
      trapErrors: false   // Indicates that build/load errors should not be trapped.
    });

    // Define the local debug namespace and echo incoming arguments.
    const dbgNsLocal = `${this.dbgNs}:constructor`;
    SfdxFalconDebug.obj(`${dbgNsLocal}:arguments:`, arguments);

    // Validate the presence of Constructor Options.
    TypeValidator.throwOnEmptyNullInvalidObject(opts,                 `${dbgNsLocal}`, `Tm1AnalysisOptions`);
    TypeValidator.throwOnEmptyNullInvalidObject(opts.constructorOpts, `${dbgNsLocal}`, `Tm1AnalysisOptions.constructorOpts`);

    // Validate REQUIRED Constructor Options.
    const constructorOpts = opts.constructorOpts;
    TypeValidator.throwOnEmptyNullInvalidString(constructorOpts.aliasOrUsername,  `${dbgNsLocal}`,  `constructorOpts.aliasOrUsername`);

    // Validate OPTIONAL Constructor Options.
    if (TypeValidator.isNotNullUndefined(constructorOpts.defaultDelay)) TypeValidator.throwOnNullInvalidNumber(constructorOpts.defaultDelay,  `${dbgNsLocal}`, `constructorOpts.defaultDelay`);

    // Initialize member vars NOT related to storing details about the Model.
    this._aliasOrUsername = opts.constructorOpts.aliasOrUsername;
    this._defaultDelay    = opts.constructorOpts.defaultDelay || 1;
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      analyzeAccountShares
   * @return      {number}  Number of `AccountShare` records present in the
   *              target org with `TerritoryManual` as their `RowCause`.
   * @description Queries the target org for the count of `AccountShare` records
   *              that have `TerritoryManual` as their `RowCause`.
   * @public @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  public async analyzeAccountShares():Promise<number> {

    // Define function-local and external debug namespaces.
    const funcName    = `analyzeAccountShares`;
    const dbgNsLocal  = `${dbgNs}:${funcName}`;
    const dbgNsExt    = `${this.dbgNs}:${funcName}`;

    // Add a delay for dramatic effect.
    await AsyncUtil.waitASecond(this._defaultDelay);

    // Prep the SOQL Query
    const soqlQuery = `SELECT count() FROM AccountShare WHERE RowCause='TerritoryManual'`;

    // Execute the SOQL Query
    await SfdxUtil.executeSoqlQuery(
      this._aliasOrUsername,
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
      SfdxFalconDebug.obj(`${dbgNsLocal}:successResult:`, successResult);
      SfdxFalconDebug.obj(`${dbgNsExt}:successResult:`,   successResult);
      this._accountShareRecordCount = SfdxUtil.getRecordCountFromResult(successResult);
    })
    .catch((failureResult:SfdxFalconResult|Error) => {
      SfdxFalconDebug.obj(`${dbgNsLocal}:failureResult:`, failureResult);
      SfdxFalconDebug.obj(`${dbgNsExt}:failureResult:`,   failureResult);
      if (failureResult instanceof SfdxFalconResult) {
        // Add additional context and repackage the Error contained by the SfdxFalconResult
        throw failureResult.error(
          new SfdxFalconError ( `The target org (${this._aliasOrUsername}) does not appear to have Territory Management (TM1) enabled.`
                              , `MissingTM1Config`
                              , `${dbgNsExt}`
                              ,  failureResult.errObj)
        );
      }
      else {
        throw failureResult;
      }
    });

    // Set the related build requirement as ready and return the result.
    this.setReady(funcName);
    return this._accountShareRecordCount;
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      analyzeAtaRuleItems
   * @return      {number}  Number of TM1 ATA Rule Items present in the target org.
   * @description Queries the target org for the `AccountTerritoryAssignmentRuleItem`
   *              (aka "ATA Rule Item") record count.
   * @public @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  public async analyzeAtaRuleItems():Promise<number> {

    // Define function-local and external debug namespaces.
    const funcName    = `analyzeAtaRuleItems`;
    const dbgNsLocal  = `${dbgNs}:${funcName}`;
    const dbgNsExt    = `${this.dbgNs}:${funcName}`;

    // Add a delay for dramatic effect.
    await AsyncUtil.waitASecond(this._defaultDelay);

    // Prep the SOQL Query
    const soqlQuery = `SELECT count() FROM AccountTerritoryAssignmentRuleItem`;

    // Execute the SOQL Query
    await SfdxUtil.executeSoqlQuery(
      this._aliasOrUsername,
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
      SfdxFalconDebug.obj(`${dbgNsLocal}:successResult:`, successResult);
      SfdxFalconDebug.obj(`${dbgNsExt}:successResult:`,   successResult);
      this._ataRuleItemRecordCount = SfdxUtil.getRecordCountFromResult(successResult);
    })
    .catch((failureResult:SfdxFalconResult|Error) => {
      SfdxFalconDebug.obj(`${dbgNsLocal}:failureResult:`, failureResult);
      SfdxFalconDebug.obj(`${dbgNsExt}:failureResult:`,   failureResult);
      if (failureResult instanceof SfdxFalconResult) {
        // Add additional context and repackage the Error contained by the SfdxFalconResult
        throw failureResult.error(
          new SfdxFalconError ( `The target org (${this._aliasOrUsername}) does not appear to have Territory Management (TM1) enabled.`
                              , `MissingTM1Config`
                              , `${dbgNsExt}`
                              ,  failureResult.errObj)
        );
      }
      else {
        throw failureResult;
      }
    });

    // Set the related build requirement as ready and return the result.
    this.setReady(funcName);
    return this._ataRuleItemRecordCount;
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      analyzeAtaRules
   * @return      {number}  Number of TM1 ATA Rules present in the target org.
   * @description Queries the target org for the `AccountTerritoryAssignmentRule`
   *              (aka "ATA Rule") record count.
   * @public @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  public async analyzeAtaRules():Promise<number> {

    // Define function-local and external debug namespaces.
    const funcName    = `analyzeAtaRules`;
    const dbgNsLocal  = `${dbgNs}:${funcName}`;
    const dbgNsExt    = `${this.dbgNs}:${funcName}`;

    // Add a delay for dramatic effect.
    await AsyncUtil.waitASecond(this._defaultDelay);

    // Prep the SOQL Query
    const soqlQuery = `SELECT count() FROM AccountTerritoryAssignmentRule`;

    // Execute the SOQL Query
    await SfdxUtil.executeSoqlQuery(
      this._aliasOrUsername,
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
      SfdxFalconDebug.obj(`${dbgNsLocal}:successResult:`, successResult);
      SfdxFalconDebug.obj(`${dbgNsExt}:successResult:`,   successResult);
      this._ataRuleRecordCount = SfdxUtil.getRecordCountFromResult(successResult);
    })
    .catch((failureResult:SfdxFalconResult|Error) => {
      SfdxFalconDebug.obj(`${dbgNsLocal}:failureResult:`, failureResult);
      SfdxFalconDebug.obj(`${dbgNsExt}:failureResult:`,   failureResult);
      if (failureResult instanceof SfdxFalconResult) {
        // Add additional context and repackage the Error contained by the SfdxFalconResult
        throw failureResult.error(
          new SfdxFalconError ( `The target org (${this._aliasOrUsername}) does not appear to have Territory Management (TM1) enabled.`
                              , `MissingTM1Config`
                              , `${dbgNsExt}`
                              ,  failureResult.errObj)
        );
      }
      else {
        throw failureResult;
      }
    });

    // Set the related build requirement as ready and return the result.
    this.setReady(funcName);
    return this._ataRuleRecordCount;
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      analyzeGroups
   * @return      {number}  Number of Group records present in the target org
   *              with `Territory` or `TerritoryAndSubordinates` as their `Type`.
   * @description Queries the target org for the count of `Group` records with
   *              `Territory` or `TerritoryAndSubordinates` as their `Type`.
   * @public @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  public async analyzeGroups():Promise<number> {

    // Define function-local and external debug namespaces.
    const funcName    = `analyzeGroups`;
    const dbgNsLocal  = `${dbgNs}:${funcName}`;
    const dbgNsExt    = `${this.dbgNs}:${funcName}`;

    // Add a delay for dramatic effect.
    await AsyncUtil.waitASecond(this._defaultDelay);

    // Prep the SOQL Query
    const soqlQuery = `SELECT count() FROM Group WHERE Type='Territory' OR Type='TerritoryAndSubordinates'`;

    // Execute the SOQL Query
    await SfdxUtil.executeSoqlQuery(
      this._aliasOrUsername,
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
      SfdxFalconDebug.obj(`${dbgNsLocal}:successResult:`, successResult);
      SfdxFalconDebug.obj(`${dbgNsExt}:successResult:`,   successResult);
      this._groupRecordCount = SfdxUtil.getRecordCountFromResult(successResult);
    })
    .catch((failureResult:SfdxFalconResult|Error) => {
      SfdxFalconDebug.obj(`${dbgNsLocal}:failureResult:`, failureResult);
      SfdxFalconDebug.obj(`${dbgNsExt}:failureResult:`,   failureResult);
      if (failureResult instanceof SfdxFalconResult) {
        // Add additional context and repackage the Error contained by the SfdxFalconResult
        throw failureResult.error(
          new SfdxFalconError ( `The target org (${this._aliasOrUsername}) does not appear to have Territory Management (TM1) enabled.`
                              , `MissingTM1Config`
                              , `${dbgNsExt}`
                              ,  failureResult.errObj)
        );
      }
      else {
        throw failureResult;
      }
    });

    // Set the related build requirement as ready and return the result.
    this.setReady(funcName);
    return this._groupRecordCount;
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      analyzeHardTm1Dependencies
   * @return      {TM1HardDependencies} Object containing the HARD TM1
   *              Dependency Count and an array of the HARD TM1 Dependencies
   *              that were found.
   * @description TODO: Not implemented yet. Intent is to use the Dependency API
   *              to get all known HARD (aka compile time) dependencies.
   * @public @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  public async analyzeHardTm1Dependencies():Promise<TM1HardDependencies> {

    // Define function-local and external debug namespaces.
    const funcName    = `analyzeHardTm1Dependencies`;
    //const dbgNsLocal  = `${dbgNs}:${funcName}`;
    //const dbgNsExt    = `${this.dbgNs}:${funcName}`;

    // Add a delay for dramatic effect.
    await AsyncUtil.waitASecond(this._defaultDelay);

    // TODO: Implement the analysis logic for this method.

    // Set the related build requirement as ready and return the result.
    this.setReady(funcName);
    return {
      hardTm1DependencyCount: this._hardTm1DependencyCount,
      hardTm1Dependencies:    this._hardTm1Dependencies
    };
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      analyzeSoftTm1Dependencies
   * @return      {TM1SoftDependencies}  Object containing the SOFT TM1
   *              Dependency Count and an array of the SOFT TM1 Dependencies
   *              that were found.
   * @description TODO: Not implemented yet. Intent is to crawl any metadata
   *              that might have TM1 dependencies that are only visible at
   *              runtime. For example, an Apex class with dynamic SOQL that
   *              refers to the `Territory` object.
   * @public @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  public async analyzeSoftTm1Dependencies():Promise<TM1SoftDependencies> {

    // Define function-local and external debug namespaces.
    const funcName    = `analyzeSoftTm1Dependencies`;
    //const dbgNsLocal  = `${dbgNs}:${funcName}`;
    //const dbgNsExt    = `${this.dbgNs}:${funcName}`;

    // Add a delay for dramatic effect.
    await AsyncUtil.waitASecond(this._defaultDelay);

    // TODO: Implement the analysis logic for this method.

    // Set the related build requirement as ready and return the result.
    this.setReady(funcName);
    return {
      softTm1DependencyCount: this._softTm1DependencyCount,
      softTm1Dependencies:    this._softTm1Dependencies
    };
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      analyzeAccountSharingRules
   * @return      {Promise<SharingRulesCount>} Criteria, Owner, and Territory
   *              Sharing Rule counts for the `Account` object that are shared
   *              TO or FROM a TM1 `Territory` or TM1 `Territories and Subordinates`
   *              group.
   * @description TODO: Not implemented yet. Intent is to do a metadata retrieve
   *              of all sharing rules and process the resulting XML localy.
   * @public @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  public async analyzeAccountSharingRules():Promise<SharingRulesCount> {

    // Define function-local and external debug namespaces.
    const funcName    = `analyzeAccountSharingRules`;
    //const dbgNsLocal  = `${dbgNs}:${funcName}`;
    //const dbgNsExt    = `${this.dbgNs}:${funcName}`;

    // Add a delay for dramatic effect.
    await AsyncUtil.waitASecond(this._defaultDelay);

    // TODO: Implement the analysis logic for this method.

    // Set the related build requirement as ready and return the result.
    this.setReady(funcName);
    return this._accountSharingRulesCount;
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      analyzeLeadSharingRules
   * @return      {Promise<SharingRulesCount>} Criteria, Owner, and Territory
   *              based Sharing Rule counts for the `Lead` object that are shared
   *              TO or FROM a TM1 `Territory` or TM1 `Territories and Subordinates`
   *              group.
   * @description TODO: Not implemented yet. Intent is to do a metadata retrieve
   *              of all sharing rules and process the resulting XML localy.
   * @public @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  public async analyzeLeadSharingRules():Promise<SharingRulesCount> {

    // Define function-local and external debug namespaces.
    const funcName    = `analyzeLeadSharingRules`;
    //const dbgNsLocal  = `${dbgNs}:${funcName}`;
    //const dbgNsExt    = `${this.dbgNs}:${funcName}`;

    // Add a delay for dramatic effect.
    await AsyncUtil.waitASecond(this._defaultDelay);

    // TODO: Implement the analysis logic for this method.

    // Set the related build requirement as ready and return the result.
    this.setReady(funcName);
    return this._leadSharingRulesCount;
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      analyzeOpportunitySharingRules
   * @return      {Promise<SharingRulesCount>} Criteria, Owner, and Territory
   *              based Sharing Rule counts for the `Opportunity` object that
   *              are shared TO or FROM a TM1 `Territory` or TM1
   *              `Territories and Subordinates` group.
   * @description TODO: Not implemented yet. Intent is to do a metadata retrieve
   *              of all sharing rules and process the resulting XML localy.
   * @public @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  public async analyzeOpportunitySharingRules():Promise<SharingRulesCount> {

    // Define function-local and external debug namespaces.
    const funcName    = `analyzeOpportunitySharingRules`;
    //const dbgNsLocal  = `${dbgNs}:${funcName}`;
    //const dbgNsExt    = `${this.dbgNs}:${funcName}`;

    // Add a delay for dramatic effect.
    await AsyncUtil.waitASecond(this._defaultDelay);

    // TODO: Implement the analysis logic for this method.

    // Set the related build requirement as ready and return the result.
    this.setReady(funcName);
    return this._opportunitySharingRulesCount;
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      analyzeTerritories
   * @return      {number}  Number of TM1 `Territory` records in the target org.
   * @description Queries the target org for the count of `Territory` records.
   * @public @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  public async analyzeTerritories():Promise<number> {

    // Define function-local and external debug namespaces.
    const funcName    = `analyzeTerritories`;
    const dbgNsLocal  = `${dbgNs}:${funcName}`;
    const dbgNsExt    = `${this.dbgNs}:${funcName}`;

    // Add a delay for dramatic effect.
    await AsyncUtil.waitASecond(this._defaultDelay);

    // Prep the SOQL Query
    const soqlQuery = `SELECT count() FROM Territory`;

    // Execute the SOQL Query
    await SfdxUtil.executeSoqlQuery(
      this._aliasOrUsername,
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
      SfdxFalconDebug.obj(`${dbgNsLocal}:successResult:`, successResult);
      SfdxFalconDebug.obj(`${dbgNsExt}:successResult:`,   successResult);
      this._territoryRecordCount = SfdxUtil.getRecordCountFromResult(successResult);
    })
    .catch((failureResult:SfdxFalconResult|Error) => {
      SfdxFalconDebug.obj(`${dbgNsLocal}:failureResult:`, failureResult);
      SfdxFalconDebug.obj(`${dbgNsExt}:failureResult:`,   failureResult);
      if (failureResult instanceof SfdxFalconResult) {
        // Add additional context and repackage the Error contained by the SfdxFalconResult
        throw failureResult.error(
          new SfdxFalconError ( `The target org (${this._aliasOrUsername}) does not appear to have Territory Management (TM1) enabled.`
                              , `MissingTM1Config`
                              , `${dbgNsExt}`
                              ,  failureResult.errObj)
        );
      }
      else {
        throw failureResult;
      }
    });

    // Set the related build requirement as ready and return the result.
    this.setReady(funcName);
    return this._territoryRecordCount;
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      analyzeUserTerritoryAssignments
   * @return      {number}  Number of TM1 `UserTerritory` records in the target org.
   * @description Queries the target org for the count of `UserTerritory` records.
   * @public @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  public async analyzeUserTerritoryAssignments():Promise<number> {

    // Define function-local and external debug namespaces.
    const funcName    = `analyzeUserTerritoryAssignments`;
    const dbgNsLocal  = `${dbgNs}:${funcName}`;
    const dbgNsExt    = `${this.dbgNs}:${funcName}`;

    // Add a delay for dramatic effect.
    await AsyncUtil.waitASecond(this._defaultDelay);

    // Prep the SOQL Query
    const soqlQuery = `SELECT count() FROM UserTerritory`;

    // Execute the SOQL Query
    await SfdxUtil.executeSoqlQuery(
      this._aliasOrUsername,
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
      SfdxFalconDebug.obj(`${dbgNsLocal}:successResult:`, successResult);
      SfdxFalconDebug.obj(`${dbgNsExt}:successResult:`,   successResult);
      this._userTerritoryRecordCount = SfdxUtil.getRecordCountFromResult(successResult);
    })
    .catch((failureResult:SfdxFalconResult|Error) => {
      SfdxFalconDebug.obj(`${dbgNsLocal}:failureResult:`, failureResult);
      SfdxFalconDebug.obj(`${dbgNsExt}:failureResult:`,   failureResult);
      if (failureResult instanceof SfdxFalconResult) {
        // Add additional context and repackage the Error contained by the SfdxFalconResult
        throw failureResult.error(
          new SfdxFalconError ( `The target org (${this._aliasOrUsername}) does not appear to have Territory Management (TM1) enabled.`
                              , `MissingTM1Config`
                              , `${dbgNsExt}`
                              ,  failureResult.errObj)
        );
      }
      else {
        throw failureResult;
      }
    });

    // Set the related build requirement as ready and return the result.
    this.setReady(funcName);
    return this._userTerritoryRecordCount;
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      gatherOrgInformation
   * @return      {TM1OrgInfo}  Basic information about the target TM1 org.
   * @description Validates whether or not the supplied "alias or username"
   *              actually references an authenticated user to the local CLI.
   *              If it does, then return a core set of TM1 Org Information.
   * @public @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  public async gatherOrgInformation():Promise<TM1OrgInfo> {

    // Define function-local and external debug namespaces.
    const funcName    = `gatherOrgInformation`;
    const dbgNsLocal  = `${dbgNs}:${funcName}`;
    const dbgNsExt    = `${this.dbgNs}:${funcName}`;

    // Add a delay for dramatic effect.
    await AsyncUtil.waitASecond(this._defaultDelay);

    // Convert the "alias or username" to a for-sure username.
    this._orgInfo.username = (await Aliases.fetch(this._aliasOrUsername)) || this._aliasOrUsername;
    SfdxFalconDebug.str(`${dbgNsLocal}:_orgInfo.username`,  this._orgInfo.username);
    SfdxFalconDebug.str(`${dbgNsExt}:_orgInfo.username`,    this._orgInfo.username);

    // Try to get the AuthInfo data for that username.
    const authInfo = await AuthInfo.create({
      username: this._orgInfo.username
    })
    .catch(authInfoError => {
      throw new SfdxFalconError ( `The supplied Alias or Username (${this._aliasOrUsername}) does not map to any authenticated orgs in the local environment.`
                                , `InvalidAliasOrUsername`
                                , `${dbgNsExt}`
                                , authInfoError);
    }) as AuthInfo;
    SfdxFalconDebug.obj(`${dbgNsLocal}:authInfo.fields:`, authInfo.getFields());
    SfdxFalconDebug.obj(`${dbgNsExt}:authInfo.fields:`,   authInfo.getFields());

    // Get the Alias, Org ID, login URL, and Created Org Instance from the retrieved Auth Info.
    this._orgInfo.alias               = (this._aliasOrUsername !== this._orgInfo.username) ? this._aliasOrUsername : undefined;
    this._orgInfo.orgId               = authInfo.getFields().orgId;
    this._orgInfo.loginUrl            = authInfo.getFields().loginUrl;
    this._orgInfo.createdOrgInstance  = authInfo.getFields().createdOrgInstance;

    // Set the related build requirement as ready and return the result.
    this.setReady(funcName);
    return this._orgInfo;
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      generateReport
   * @return      {TM1AnalysisReport} Complete JSON representation of the TM1
   *              analysis based on the values currently known to this instance.
   * @description ???
   * @public
   */
  //───────────────────────────────────────────────────────────────────────────┘
  /*
  public generateReport():TM1AnalysisReport {
    const tm1AnalysisReport:TM1AnalysisReport = {
      orgInfo:  this._orgInfo,
      tm1RecordCounts:  {
        territoryRecordCount:       this._territoryRecordCount,
        userTerritoryRecordCount:   this._userTerritoryRecordCount,
        ataRuleRecordCount:         this._ataRuleRecordCount,
        ataRuleItemRecordCount:     this._ataRuleItemRecordCount,
        accountShareRecordCount:    this._accountShareRecordCount,
        groupRecordCount:           this._groupRecordCount
      },
      tm1MetadataCounts: {
        accountSharingRulesCount: {
          sharingCriteriaRulesCount:  this._accountSharingRulesCount.sharingCriteriaRulesCount,     // NOT_FULLY_IMPLEMENTED
          sharingOwnerRulesCount:     this._accountSharingRulesCount.sharingOwnerRulesCount,        // NOT_FULLY_IMPLEMENTED
          sharingTerritoryRulesCount: this._accountSharingRulesCount.sharingTerritoryRulesCount     // NOT_FULLY_IMPLEMENTED
        },
        leadSharingRulesCount: {
          sharingCriteriaRulesCount:  this._leadSharingRulesCount.sharingCriteriaRulesCount,        // NOT_FULLY_IMPLEMENTED
          sharingOwnerRulesCount:     this._leadSharingRulesCount.sharingOwnerRulesCount            // NOT_FULLY_IMPLEMENTED
        },
        opportunitySharingRulesCount: {
          sharingCriteriaRulesCount:  this._opportunitySharingRulesCount.sharingCriteriaRulesCount, // NOT_FULLY_IMPLEMENTED
          sharingOwnerRulesCount:     this._opportunitySharingRulesCount.sharingOwnerRulesCount     // NOT_FULLY_IMPLEMENTED
        }
      },
      hardTm1Dependencies: {
        hardTm1DependencyCount: this._hardTm1DependencyCount,
        hardTm1Dependencies:    this._hardTm1Dependencies
      },
      softTm1Dependencies: {
        softTm1DependencyCount: this._softTm1DependencyCount,
        softTm1Dependencies:    this._softTm1Dependencies
      }
    };
    SfdxFalconDebug.obj(`${dbgNs}generateReport:tm1AnalysisReport:`, tm1AnalysisReport);
    return tm1AnalysisReport;
  }//*/

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      saveReport
   * @param       {string}  [targetFile]  Optional. Path to the directory and file
   *              into which the user would like to save the Results. This file
   *              should end with the .json extension.
   * @return      {Promise<TM1AnalysisReport>} Complete JSON representation of
   *              the TM1 analysis that was written to the user's filesystem.
   * @description Given a complete filepath (directory plus filename), writes
   *              out all of this object's known analysis information in JSON
   *              format to the specified file.
   * @public @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  /*
  public async saveReport(targetFile?:string):Promise<TM1AnalysisReport> {

    // Debug incoming arguments.
    SfdxFalconDebug.obj(`${dbgNs}saveReport:arguments:`, arguments);

    // Default target file to the one from the TM File Paths collection unless the caller overrides.
    targetFile = targetFile || this._filePaths.tm1AnalysisReportPath;

    // Validate incoming arguments.
    if (typeof targetFile !== 'string' || targetFile === '' || targetFile === null) {
      throw new SfdxFalconError ( `The targetFile must be a non-empty string. Got '${typeof targetFile}' instead.`
                                , `TypeError`
                                , `${dbgNs}saveReport`);
    }
    if (targetFile.endsWith('.json') !== true) {
      throw new SfdxFalconError ( `The targetFile must end with the '.json' extension. The path/file '${targetFile}' is invalid.`
                                , `InvalidFileName`
                                , `${dbgNs}saveReport`);
    }

    // Generate the report.
    const report = this.generateReport();
    SfdxFalconDebug.obj(`${dbgNs}saveReport:report:`, report);

    // Write the report to the local filesystem.
    await fse.ensureFile(targetFile);
    await fse.writeJson(targetFile, report, {spaces: '\t'});

    // Send the report back to the caller.
    return report;
  }//*/

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      _initialize
   * @return      {boolean}
   * @description Initializes all model-specific member variables and structures.
   *              Called by the `constructor` and again by the `refresh()`
   *              method when the caller wants to rebuild/reinitialize the model.
   * @protected @abstract
   */
  //───────────────────────────────────────────────────────────────────────────┘
  protected _initialize():void {

    // Initialize all counts to -1 to indicate an unset value.
    this._accountShareRecordCount   = -1;
    this._ataRuleItemRecordCount    = -1;
    this._ataRuleRecordCount        = -1;
    this._hardTm1DependencyCount    = -1;
    this._softTm1DependencyCount    = -1;
    this._territoryRecordCount      = -1;
    this._groupRecordCount          = -1;
    this._userTerritoryRecordCount  = -1;
    this._accountSharingRulesCount  = {
      sharingCriteriaRulesCount:  -1,
      sharingOwnerRulesCount:     -1,
      sharingTerritoryRulesCount: -1
    };
    this._leadSharingRulesCount = {
      sharingCriteriaRulesCount:  -1,
      sharingOwnerRulesCount:     -1
    };
    this._opportunitySharingRulesCount  = {
      sharingCriteriaRulesCount:    -1,
      sharingOwnerRulesCount:       -1
    };

    // Initialize the Hard and Soft TM1 Dependency arrays.
    this._hardTm1Dependencies = [];
    this._softTm1Dependencies = [];

    // Initialize the Org Info object.
    this._orgInfo = {
      alias:              'NOT_SPECIFIED',
      username:           'NOT_SPECIFIED',
      orgId:              'NOT_SPECIFIED',
      loginUrl:           'NOT_SPECIFIED',
      createdOrgInstance: 'NOT_SPECIFIED'
    };

    // Initialize the "date analyzed" value to NOW.
    const dateNow       = new Date(Date.now());
    this._dateAnalyzed  = dateNow.toString();

    // Specify the "ready" requirements. Determines what's needed for the model
    // to be ready for use. Use `this.setReady()` to mark completed requirements.
    this.addReadyRequirement('analyzeAccountShares');
    this.addReadyRequirement('analyzeAtaRuleItems');
    this.addReadyRequirement('analyzeAtaRules');
    this.addReadyRequirement('analyzeGroups');
    this.addReadyRequirement('analyzeHardTm1Dependencies');
    this.addReadyRequirement('analyzeSoftTm1Dependencies');
    this.addReadyRequirement('analyzeAccountSharingRules');
    this.addReadyRequirement('analyzeLeadSharingRules');
    this.addReadyRequirement('analyzeOpportunitySharingRules');
    this.addReadyRequirement('analyzeTerritories');
    this.addReadyRequirement('analyzeUserTerritoryAssignments');
    this.addReadyRequirement('gatherOrgInformation');
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      checkPrepared
   * @return      {void}
   * @description Checks if the analysis is prepared. If not, an Error is thrown.
   * @private
   */
  //───────────────────────────────────────────────────────────────────────────┘
  /*
  private checkPrepared():void {
    if (this._prepared !== true) {
      throw new SfdxFalconError ( `The requested operation is not allowed until the analysis is prepared`
                                , `AnalysisNotPrepared`
                                , `${dbgNs}checkPrepared`);
    }
  }//*/

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      checkAliasOrUsername
   * @return      {void}
   * @description Checks if a UserName was provided when this object was
   *              constructed. If not, an Error is thrown.
   * @private
   */
  //───────────────────────────────────────────────────────────────────────────┘
  /*
  private checkAliasOrUsername():void {
    if (! this._aliasOrUsername) {
      throw new SfdxFalconError ( `The requested operation requires an Alias or Username, but one was not provided when this Tm1Analysis object was constructed.`
                                , `UserNameMissing`
                                , `${dbgNs}checkAliasOrUsername`);
    }
  }//*/
}
