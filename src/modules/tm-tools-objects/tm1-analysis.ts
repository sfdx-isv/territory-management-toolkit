//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @file          modules/tm-tools-objects/tm1-analysis.ts
 * @copyright     Vivek M. Chawla - 2019
 * @author        Vivek M. Chawla <@VivekMChawla>
 * @summary       Models the analysis of a TM1 org.
 * @description   Models the analysis of a TM1 org. Includes key information such as the number of
 *                Territories, UserTerritory assignments, and AccountShares where the sharing reason
 *                is "TerritoryManual". This can be populated and the results written to disk, or
 *                can be populated by reading previously written results from disk.
 * @version       1.0.0
 * @license       MIT
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
// Import External Libraries & Modules
import {JsonMap}          from  '@salesforce/ts-types'; // Any JSON compatible object.
//import * as path          from  'path';     // Node's path library.

// Import Internal Libraries
import * as sfdxHelper          from  '../sfdx-falcon-util/sfdx';   // Library of SFDX Helper functions specific to SFDX-Falcon.

// Import Internal Classes and Functions
import {SfdxFalconDebug}          from  '../sfdx-falcon-debug';       // Class. Specialized debug provider for SFDX-Falcon code.
import {SfdxFalconError}          from  '../sfdx-falcon-error';       // Class. Extends SfdxError to provide specialized error structures for SFDX-Falcon modules.
import {SfdxFalconResult}         from  '../sfdx-falcon-result';      // Class. Implements a framework for creating results-driven, informational objects with a concept of heredity (child results) and the ability to "bubble up" both Errors (thrown exceptions) and application-defined "failures".
import {waitASecond}              from  '../sfdx-falcon-util/async';  // Function. Allows for a simple "wait" to execute.

// Import TM-Tools Types
import {TM1Dependency}            from  '../tm-tools-types';   // Interface. Represents a metadata component with a dependency on TM1.
import {TM1OrgInfo}               from  '../tm-tools-types';   // Interface. Represents basic org information for a TM1 org

// Requires
const {falcon}  = require('../../../package.json'); // The custom "falcon" key from package.json. This holds custom project-level values.

// Set the File Local Debug Namespace
const dbgNs = 'MODULE:tm1-analysis:';
SfdxFalconDebug.msg(`${dbgNs}`, `Debugging initialized for ${dbgNs}`);


//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @class       Tm1Analysis
 * @description Models the analysis of a TM1 org.
 * @public
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export class Tm1Analysis {

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      load
   * @param       {string}  tm1AnalysisResultsPath  Required. Path to a JSON
   *              file containing a previously completed TM1 Analysis.
   * @description Given the path to a TM1 Analysis Results JSON file, reads that
   *              file and populates all relevant member variables based on its
   *              contents.
   * @public @static @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  public static async load(tm1AnalysisResultsPath:string):Promise<Tm1Analysis> {
    const tm1Analysis = new Tm1Analysis();

    // TODO: Add code to load the provided TM1 Analysis JSON and read it into the tm1Analysis object.

    tm1Analysis._prepared = true;
    return tm1Analysis;
  }

  // Private Members
  private _accountShareRecordCount:     number;
  private _ataRuleRecordCount:          number;
  private _ataRuleItemRecordCount:      number;
  private _hardTm1DependencyCount:      number;
  private _softTm1DependencyCount:      number;
  private _hardTm1Dependencies:         TM1Dependency[];
  private _softTm1Dependencies:         TM1Dependency[];
  private _sharingCriteriaRuleCount:    number;
  private _sharingOwnerRuleCount:       number;
  private _sharingTerritoryRuleCount:   number;
  private _territoryRecordCount:        number;
  private _userTerritoryRecordCount:    number;
  private _dateAnalyzed:                string;
  private _orgId:                       string;
  private _aliasOrUsername:             string;
  private _username:                    string;
  private _prepared:                    boolean;

  // Public Accessors
  public get accountShareRecordCount()      { this.checkPrepared(); return this._accountShareRecordCount; }
  public get ataRuleRecordCount()           { this.checkPrepared(); return this._ataRuleRecordCount; }
  public get ataRuleItemRecordCount()       { this.checkPrepared(); return this._ataRuleItemRecordCount; }
  public get hardTm1DependencyCount()       { this.checkPrepared(); return this._hardTm1DependencyCount; }
  public get softTm1DependencyCount()       { this.checkPrepared(); return this._softTm1DependencyCount; }
  public get hardTm1Dependencies()          { this.checkPrepared(); return this._hardTm1Dependencies; }
  public get softTm1Dependencies()          { this.checkPrepared(); return this._softTm1Dependencies; }
  public get dateAnalyzed()                 { this.checkPrepared(); return this._dateAnalyzed; }
  public get orgId()                        { this.checkPrepared(); return this._orgId; }
  public get aliasOrUsername()              { this.checkPrepared(); return this._aliasOrUsername; }
  public get username()                     { this.checkPrepared(); return this._username; }
  public get sharingCriteriaRuleCount()     { this.checkPrepared(); return this._sharingCriteriaRuleCount; }
  public get sharingOwnerRuleCount()        { this.checkPrepared(); return this._sharingOwnerRuleCount; }
  public get sharingTerritoryRuleCount()    { this.checkPrepared(); return this._sharingTerritoryRuleCount; }
  public get territoryRecordCount()         { this.checkPrepared(); return this._territoryRecordCount; }
  public get userTerritoryRecordCount()     { this.checkPrepared(); return this._userTerritoryRecordCount; }
  public get prepared()                     { return this._prepared; }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @constructs  Tm1Analysis
   * @param       {string}  [aliasOrUsername]  Optional.
   * @description Constructs a TM1 Analysis object that can either be prepared
   *              manually by an external actor or prepared by reading the
   *              contents of a previously-created TM1 Analysis Results File.
   * @public
   */
  //───────────────────────────────────────────────────────────────────────────┘
  public constructor(aliasOrUsername?:string) {

    // Initialize all counts to -1 to indicate an unset value.
    this._accountShareRecordCount   = -1;
    this._ataRuleItemRecordCount    = -1;
    this._ataRuleRecordCount        = -1;
    this._hardTm1DependencyCount    = -1;
    this._softTm1DependencyCount    = -1;
    this._sharingCriteriaRuleCount  = -1;
    this._sharingOwnerRuleCount     = -1;
    this._sharingTerritoryRuleCount = -1;
    this._territoryRecordCount      = -1;
    this._userTerritoryRecordCount  = -1;

    // Initialize the Hard and Soft TM1 Dependency arrays.
    this._hardTm1Dependencies = [];
    this._softTm1Dependencies = [];

    // Initialize the Org ID to an empty string.
    this._orgId = '';

    // Make sure that the "Alias or User Name" (if provided) is a string, then initialize the member var.
    if (typeof aliasOrUsername !== 'undefined' && typeof aliasOrUsername !== 'string') {
      throw new SfdxFalconError ( `The aliasOrUsername argument, when provided, must be string. Got type '${typeof aliasOrUsername}' instead.`
                                , `TypeError`
                                , `${dbgNs}constructor`);
    }
    this._aliasOrUsername = aliasOrUsername || '';

    // Initialize Username to an empty string for now since we need an async call to properly get it.
    this._username  = '';

    // Initialize the "date analyzed" value to NOW.
    const dateNow       = new Date(Date.now());
    this._dateAnalyzed  = dateNow.toString();

    // There's not much if the user READS various properties before being PREPARED, so just initialize as TRUE.
    this._prepared = true;
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      analyzeAccountShares
   * @return      {number}  Number of Account Share records present in the
   *              target org with "TerritoryManual" as their RowCause.
   * @description ???
   * @public @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  public async analyzeAccountShares():Promise<number> {

    // Make sure we have a UserName
    this.checkAliasOrUsername();

    // Prep the SOQL Query
    const accountShareSoql = `SELECT count() FROM AccountShare WHERE RowCause = 'TerritoryManual'`;

    // Execute the SOQL Query
    sfdxHelper.executeSoqlQuery(
      this._aliasOrUsername,
      accountShareSoql,
      {
        apiVersion:     '45.0',
        logLevel:       'warn',
        useToolingApi:  false,
        perfLog:        false,
        json:           true
      }
    )
    .then((successResult:SfdxFalconResult) => {
      SfdxFalconDebug.obj(`${dbgNs}analyzeAccountShares:successResult:`, successResult);
    })
    .catch((failureResult:SfdxFalconResult|Error) => {
      SfdxFalconDebug.obj(`${dbgNs}analyzeAccountShares:failureResult:`, failureResult);
    });

    // Return the result.
    return -1;
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      analyzeAtaRuleItems
   * @return      {number}  Number of TM1 ATA Rule Items present in the target org.
   * @description ???
   * @public @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  public async analyzeAtaRuleItems():Promise<number> {

    // Make sure we have a UserName
    this.checkAliasOrUsername();

    // Do stuff...

    // Return the result.
    return -1;
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      analyzeAtaRules
   * @return      {number}  Number of TM1 ATA Rules present in the target org.
   * @description ???
   * @public @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  public async analyzeAtaRules():Promise<number> {

    // Make sure we have a UserName
    this.checkAliasOrUsername();

    // Add a delay for dramatic effect.
    await waitASecond(5);

    // Prep the SOQL Query
    const soqlQuery = `SELECT count() FROM AccountTerritoryAssignmentRule`;

    // Execute the SOQL Query
    await sfdxHelper.executeSoqlQuery(
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
      SfdxFalconDebug.obj(`${dbgNs}analyzeAtaRules:successResult:`, successResult);
      this._ataRuleRecordCount = sfdxHelper.getRecordCountFromResult(successResult);
    })
    .catch((failureResult:SfdxFalconResult|Error) => {
      SfdxFalconDebug.obj(`${dbgNs}analyzeAtaRules:failureResult:`, failureResult);
      if (failureResult instanceof SfdxFalconResult) {
        // Add additional context and repackage the Error contained by the SfdxFalconResult
        throw failureResult.error(
          new SfdxFalconError ( `The target org (${this._aliasOrUsername}) does not appear to have Territory Management (TM1) enabled.`
                              , `MissingTM1Config`
                              , `${dbgNs}analyzeAtaRules`
                              ,  failureResult.errObj)
        );
      }
      else {
        throw failureResult;
      }
    });

    // Return the result.
    return this._ataRuleRecordCount;
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      analyzeHardTm1Dependencies
   * @return      {object}  Object containing the HARD TM1 Dependency Count and
   *              an array of the HARD TM1 Dependencies that were found.
   * @description ???
   * @public @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  public async analyzeHardTm1Dependencies():Promise<object> {

    // Make sure we have a UserName
    this.checkAliasOrUsername();

    // Do stuff...

    // Return the result.
    return {
      hardTm1DependencyCount: this._hardTm1DependencyCount,
      hardTm1Dependencies:    this._hardTm1Dependencies
    };
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      analyzeSoftTm1Dependencies
   * @return      {object}  Object containing the SOFT TM1 Dependency Count and
   *              an array of the SOFT TM1 Dependencies that were found.
   * @description ???
   * @public @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  public async analyzeSoftTm1Dependencies():Promise<object> {

    // Make sure we have a UserName
    this.checkAliasOrUsername();

    // Do stuff...

    // Return the result.
    return {
      softTm1DependencyCount: this._softTm1DependencyCount,
      softTm1Dependencies:    this._softTm1Dependencies
    };
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      analyzeSharingCriteriaRules
   * @return      {number}  Number of SharingCriteriaRules in the org that
   *              are shared TO or FROM a TM1 Territory or TM1 "Territories
   *              and Subordinates" group.
   * @description ???
   * @public @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  public async analyzeSharingCriteriaRules():Promise<number> {

    // Make sure we have a UserName
    this.checkAliasOrUsername();

    // Do stuff...

    // Return the result.
    return -1;
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      analyzeSharingOwnerRules
   * @return      {number}  Number of SharingOwnerRules in the org that
   *              are shared TO or FROM a TM1 Territory or TM1 "Territories
   *              and Subordinates" group.
   * @description ???
   * @public @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  public async analyzeSharingOwnerRules():Promise<number> {

    // Make sure we have a UserName
    this.checkAliasOrUsername();

    // Do stuff...

    // Return the result.
    return -1;
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      analyzeSharingTerritoryRules
   * @return      {number}  Number of SharingTerritoryRules in the org.
   * @description ???
   * @public @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  public async analyzeSharingTerritoryRules():Promise<number> {

    // Make sure we have a UserName
    this.checkAliasOrUsername();

    // Do stuff...

    // Return the result.
    return -1;
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      analyzeTerritories
   * @return      {number}  Number of TM1 Territories in the target org.
   * @description ???
   * @public @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  public async analyzeTerritories():Promise<number> {

    // Make sure we have a UserName
    this.checkAliasOrUsername();

    // Add a delay for dramatic effect.
    await waitASecond(5);

    // Prep the SOQL Query
    const soqlQuery = `SELECT count() FROM Territory`;

    // Execute the SOQL Query
    await sfdxHelper.executeSoqlQuery(
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
      SfdxFalconDebug.obj(`${dbgNs}analyzeTerritories:successResult:`, successResult);
      this._territoryRecordCount = sfdxHelper.getRecordCountFromResult(successResult);
    })
    .catch((failureResult:SfdxFalconResult|Error) => {
      SfdxFalconDebug.obj(`${dbgNs}analyzeTerritories:failureResult:`, failureResult);
      if (failureResult instanceof SfdxFalconResult) {
        // Add additional context and repackage the Error contained by the SfdxFalconResult
        throw failureResult.error(
          new SfdxFalconError ( `The target org (${this._aliasOrUsername}) does not appear to have Territory Management (TM1) enabled.`
                              , `MissingTM1Config`
                              , `${dbgNs}analyzeTerritories`
                              ,  failureResult.errObj)
        );
      }
      else {
        throw failureResult;
      }
    });

    // Return the result.
    return this._territoryRecordCount;
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      analyzeUserTerritoryAssignments
   * @return      {number}  Number of TM1 UserTerritory records in the target org.
   * @description ???
   * @public @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  public async analyzeUserTerritoryAssignments():Promise<number> {

    // Make sure we have a UserName
    this.checkAliasOrUsername();

    // Add a delay for dramatic effect.
    await waitASecond(5);

    // Prep the SOQL Query
    const soqlQuery = `SELECT count() FROM UserTerritory`;

    // Execute the SOQL Query
    await sfdxHelper.executeSoqlQuery(
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
      SfdxFalconDebug.obj(`${dbgNs}analyzeUserTerritoryAssignments:successResult:`, successResult);
      this._userTerritoryRecordCount = sfdxHelper.getRecordCountFromResult(successResult);
    })
    .catch((failureResult:SfdxFalconResult|Error) => {
      SfdxFalconDebug.obj(`${dbgNs}analyzeUserTerritoryAssignments:failureResult:`, failureResult);
      if (failureResult instanceof SfdxFalconResult) {
        // Add additional context and repackage the Error contained by the SfdxFalconResult
        throw failureResult.error(
          new SfdxFalconError ( `The target org (${this._aliasOrUsername}) does not appear to have Territory Management (TM1) enabled.`
                              , `MissingTM1Config`
                              , `${dbgNs}analyzeUserTerritoryAssignments`
                              ,  failureResult.errObj)
        );
      }
      else {
        throw failureResult;
      }
    });

    // Return the result.
    return this._userTerritoryRecordCount;
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      save
   * @param       {string}  tm1AnalysisResultsPath  Required. Path to the
   *              directory and file into which the user would like to save the
   *              Results.  This file should end with the .json extension.
   * @return      {void}
   * @description Given a complete filepath (directory plus filename), writes
   *              out all of this object's known analysis information in JSON
   *              format to the specified file.
   * @public @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  public async save(tm1AnalysisResultsPath:string):Promise<void> {

    // Debug incoming arguments.
    SfdxFalconDebug.obj(`${dbgNs}save:`, arguments);

    // Validate incoming arguments.
    if (typeof tm1AnalysisResultsPath !== 'string' || tm1AnalysisResultsPath === '') {
      throw new SfdxFalconError ( `The tm1AnalysisResultsPath must be a non-empty string. Got '${typeof tm1AnalysisResultsPath}' instead.`
                                , `TypeError`
                                , `${dbgNs}save`);
    }

    // TODO: Need to implement this function.

  }


  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      gatherOrgInformation
   * @return      {TM1OrgInfo}  Basic information about the target TM1 org.
   * @description ???
   * @public @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  public async gatherOrgInformation():Promise<TM1OrgInfo> {

    // Make sure we have a UserName
    this.checkAliasOrUsername();

    // Add a delay for dramatic effect.
    await waitASecond(5);

    // Do stuff...

    // Return the result.
    return {};
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      writeReport
   * @param       {string}  resultFile  Required. Complete path to the file into
   *              which the TM1 analysis should be written.
   * @return      {JsonMap} Complete JSON representation of the TM1 analysis
   *              that was written to the user's local filesystem.
   * @description ???
   * @public @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  public async writeReport(resultFile:string):Promise<JsonMap> {

    // Debug incoming arguments
    SfdxFalconDebug.obj(`${dbgNs}writeReport:arguments:`, arguments);

    // Make sure we got a non-empty string for the resultFile argument.
    if (typeof resultFile !== 'string' || resultFile === '') {
      throw new SfdxFalconError( `Expected resultFile to non-empty string but got '${typeof resultFile}' instead.`
                               , `TypeError`
                               , `${dbgNs}writeReport`);
    }
  
    // Add a delay for dramatic effect.
    await waitASecond(5);

    // Do stuff...

    // Return the result.
    return {};
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      checkPrepared
   * @return      {void}
   * @description Checks if the analysis is prepared. If not, an Error is thrown.
   * @private
   */
  //───────────────────────────────────────────────────────────────────────────┘
  private checkPrepared():void {
    if (this._prepared !== true) {
      throw new SfdxFalconError ( `The requested operation is not allowed until the analysis is prepared`
                                , `AnalysisNotPrepared`
                                , `${dbgNs}checkPrepared`);
    }
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      checkAliasOrUsername
   * @return      {void}
   * @description Checks if a UserName was provided when this object was
   *              constructed. If not, an Error is thrown.
   * @private
   */
  //───────────────────────────────────────────────────────────────────────────┘
  private checkAliasOrUsername():void {
    if (! this._aliasOrUsername) {
      throw new SfdxFalconError ( `The requested operation requires an Alias or Username, but one was not provided when this Tm1Analysis object was constructed.`
                                , `UserNameMissing`
                                , `${dbgNs}checkAliasOrUsername`);
    }
  }
}
