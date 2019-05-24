//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @file          modules/tm-tools-objects/tm1-context.ts
 * @copyright     Vivek M. Chawla - 2019
 * @author        Vivek M. Chawla <@VivekMChawla>
 * @summary       Models the entirety of an exported set of TM1 data, including helpful transforms.
 * @description   Models the entirety of an exported set of TM1 data, including helpful transforms.
 * @version       1.0.0
 * @license       MIT
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
// Import External Modules/Types
//import {JsonMap}                    from  '@salesforce/ts-types'; // Any JSON compatible object.
import * as path          from  'path';     // Node's path library.

// Import Internal Modules
import {SfdxFalconDebug}          from  '../sfdx-falcon-debug';       // Class. Specialized debug provider for SFDX-Falcon code.
import {SfdxFalconError}          from  '../sfdx-falcon-error';       // Class. Extends SfdxError to provide specialized error structures for SFDX-Falcon modules.
import {parseFile}                from  '../sfdx-falcon-util/csv';    // Class. Extends SfdxError to provide specialized error structures for SFDX-Falcon modules.
import {createDeveloperName}      from  '../sfdx-falcon-util/mdapi';  // Function. Given any string, returns a transformed version of that string that is compatible with the Salesforce Developer Name / Full Name conventions.

// Import TM-Tools Types
import {TerritoryRecord}              from  '../tm-tools-types';   // Interface. Represents a Territory Record.
import {TerritoryRecords}             from  '../tm-tools-types';   // Type. Represents an array of Territory Records.
import {TerritoryRecordsById}         from  '../tm-tools-types';   // Type. Represents a map of Territory Records by Territory ID.
import {AccountShareRecords}          from  '../tm-tools-types';   // Type. Represents an array of AccountShare Records.
import {AtaRuleRecord}                from  '../tm-tools-types';   // Interface. Represents an AccountTerritoryAssignmentRule Record.
import {AtaRuleRecords}               from  '../tm-tools-types';   // Type. Represents an array of AccountTerritoryAssignmentRule Records.
import {AtaRuleRecordsById}           from  '../tm-tools-types';   // Type. Represents a map of AccountTerritoryAssignmentRule Records by Rule ID.
import {AtaRuleRecordsByTerritoryId}  from  '../tm-tools-types';   // Type. Represents a map of an array of AccountTerritoryAssignmentRule Records by Territory ID.
import {AtaRuleDevNamesByRuleId}      from  '../tm-tools-types';   // Type. Represents a map of AccountTerritoryAssignmentRule Developer Names by Rule ID.
//import {AtaRuleItemRecord}            from  '../tm-tools-types';   // Interface. Represents an AccountTerritoryAssignmentRuleItem Record.
import {AtaRuleItemRecords}           from  '../tm-tools-types';   // Type. Represents an array of AccountTerritoryAssignmentRuleItem Records.
import {AtaRuleItemRecordsByRuleId}   from  '../tm-tools-types';   // Type. Represents a map of an array of AccountTerritoryAssignmentRuleItem Records by Rule ID.
import {UserTerritoryRecords}         from  '../tm-tools-types';   // Type. Represents an array of UserTerritory Records.
import {TM1FilePaths}                 from  '../tm-tools-types';   // Interface. Represents the complete suite of CSV and Metadata file paths required to create a TM1 Context.
//import {TerritoryNamesByTerritoryId}  from  '../tm-tools-types';   // Type. Represents a map of Territory Names by Territory ID.


// Set the File Local Debug Namespace
const dbgNs = 'MODULE:tm1-context:';



//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @class       TM1Context
 * @description Models the entirety of an exported set of TM1 data, including helpful transforms.
 * @public
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export class TM1Context {

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      prepare
   * @param       {string} exportedMetadataPath
   * @param       {string} exportedRecordDataPath
   * @description Given the paths to exported TM1 metadata and record data,
   *              performs a number of import and transformation operations.
   *              The end result is a fully-populated "Territory Management 1.0
   *              Context" which can be used to create an "import deployment"
   *              for a TM2 org.
   * @public @static @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  public static async prepare(exportedMetadataPath:string, exportedRecordDataPath:string):Promise<TM1Context> {

    const tm1Context = new TM1Context(exportedMetadataPath, exportedRecordDataPath);
    await tm1Context.parseCsvFiles();
    await tm1Context.transformCsvFiles();
    tm1Context._prepared = true;
    return tm1Context;
  }

  // Private Members
  private _accountShareRecords:         AccountShareRecords;
  private _ataRuleRecords:              AtaRuleRecords;
  private _ataRuleItemRecords:          AtaRuleItemRecords;
  private _territoryRecords:            TerritoryRecords;
  private _userTerritoryRecords:        UserTerritoryRecords;
  private _territoryRecordsById:        TerritoryRecordsById;
  private _ataRuleRecordsById:          AtaRuleRecordsById;
  private _ataRuleRecordsByTerritoryId: AtaRuleRecordsByTerritoryId;
  private _ataRuleItemRecordsByRuleId:  AtaRuleItemRecordsByRuleId;
  private _ataRuleDevNamesByRuleId:     AtaRuleDevNamesByRuleId;
  private _tm1FilePaths:                TM1FilePaths;
  private _prepared:                    boolean;

  // Public Accessors
  public get territoryRecords()             { return this.contextIsPrepared() ? this._territoryRecords : undefined; }
  public get territoryRecordsById()         { return this.contextIsPrepared() ? this._territoryRecordsById : undefined; }
  public get ataRuleRecords()               { return this.contextIsPrepared() ? this._ataRuleRecords : undefined; }
  public get ataRuleRecordsById()           { return this.contextIsPrepared() ? this._ataRuleRecordsById : undefined; }
  public get ataRuleRecordsByTerritoryId()  { return this.contextIsPrepared() ? this._ataRuleRecordsByTerritoryId : undefined; }
  public get ataRuleItemRecords()           { return this.contextIsPrepared() ? this._ataRuleItemRecords : undefined; }
  public get ataRuleItemRecordsByRuleId()   { return this.contextIsPrepared() ? this._ataRuleItemRecordsByRuleId : undefined; }
  public get ataRuleDevNamesByRuleId()      { return this.contextIsPrepared() ? this._ataRuleDevNamesByRuleId : undefined; }
  public get userTerritoryRecords()         { return this.contextIsPrepared() ? this._userTerritoryRecords : undefined; }
  public get accountShareRecords()          { return this.contextIsPrepared() ? this._accountShareRecords : undefined; }
  public get tm1FilePaths()                 { return this._tm1FilePaths; }
  public get prepared()                     { return this._prepared; }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @constructs  TM1Context
   * @param       {string} exportedMetadataPath
   * @param       {string} exportedRecordDataPath
   * @description Given the paths to exported TM1 metadata and record data,
   *              performs a number of import and transformation operations.
   *              The end result is a fully-populated "Territory Management 1.0
   *              Context" which can be used to prepare an "import deployment"
   *              for a TM2 org.
   * @public
   */
  //───────────────────────────────────────────────────────────────────────────┘
  private constructor(exportedMetadataPath:string, exportedRecordDataPath:string) {

    // Define the expected TM1 file paths.
    this._tm1FilePaths = {
      accountShareCsv:  path.join(exportedRecordDataPath, 'AccountShare.csv'),
      ataRuleCsv:       path.join(exportedRecordDataPath, 'AccountTerritoryAssignmentRule.csv'),
      ataRuleItemCsv:   path.join(exportedRecordDataPath, 'AccountTerritoryAssignmentRuleItem.csv'),
      territoryCsv:     path.join(exportedRecordDataPath, 'Territory.csv'),
      userTerritoryCsv: path.join(exportedRecordDataPath, 'UserTerritory.csv'),
      tm1MetadataDir:   path.join(exportedMetadataPath,   'unpackaged')
    };

    // Initialize Maps
    this._territoryRecordsById        = new Map<string, TerritoryRecord>();
    this._ataRuleRecordsById          = new Map<string, AtaRuleRecord>();
    this._ataRuleRecordsByTerritoryId = new Map<string, AtaRuleRecords>();
    this._ataRuleItemRecordsByRuleId  = new Map<string, AtaRuleItemRecords>();
    this._ataRuleDevNamesByRuleId     = new Map<string, string>();

    // Mark this as an UNPREPARED context
    this._prepared = false;
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      addAtaRuleDeveloperName
   * @param       {ataRuleRecord} ataRuleRecord Required.
   * @return      {string}  The final Developer Named for the ATA Rule Record.
   * @description Given an ATA Rule Record, determines an appropriate and valid
   *              Developer Name, ensures that Developer Name is unique within
   *              the current context, the saves that name to a map that's keyed
   *              by the ATA Rule ID.
   * @private
   */
  //───────────────────────────────────────────────────────────────────────────┘
  private addAtaRuleDeveloperName(ataRuleRecord:AtaRuleRecord):string {
    
    // Convert the ATA Rule's Name to a Developer Name.
    const baseDevName = createDeveloperName(ataRuleRecord.Name);
    let   newDevName  = baseDevName;

    // Make sure that this Developer Name is NOT already in use
    const devNameMaxLength  = 80;
    let   counter           = 2;
    while (this.matchAtaRuleDeveloperName(newDevName)) {
      const counterString = counter.toString();
      newDevName = baseDevName.substring(0, devNameMaxLength-counterString.length) + counterString;
      counter += 1;
    }

    // Add the new Developer Name to the Map.
    this._ataRuleDevNamesByRuleId.set(ataRuleRecord.Id, newDevName);

    // Done! Return the new Dev Name (in case anyone cares).
    return newDevName;
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      addAtaRuleToTerritoryGroup
   * @param       {ataRuleRecord} ataRuleRecord Required.
   * @return      {AtaRuleRecords}  The array of ATA Rule Records that are
   *              associated with the Territory that the ATA Rule Record we
   *              were given is associated with.
   * @description Given an ATA Rule Record, find out what Territory it belongs
   *              to, then add it to the matching Array of ATA Rule Records in
   *              the ATA Rule Records by Territory ID map. Return the Array
   *              just in case the caller needs it.
   * @private
   */
  //───────────────────────────────────────────────────────────────────────────┘
  private addAtaRuleToTerritoryGroup(ataRuleRecord:AtaRuleRecord):AtaRuleRecords {
    
    // See if there is already an Array of ATA Rule Records for this Rule's associated Territory.
    let ataRuleRecords = this._ataRuleRecordsByTerritoryId.get(ataRuleRecord.TerritoryId);

    // If it's not already an array, initialize one and add it to the Map.
    if (Array.isArray(ataRuleRecords) !== true) {
      ataRuleRecords = [] as AtaRuleRecords;
      this._ataRuleRecordsByTerritoryId.set(ataRuleRecord.TerritoryId, ataRuleRecords);
    }

    // Add the incoming ATA Rule Record to the array.
    ataRuleRecords.push(ataRuleRecord);

    // Return the array in case the caller needs it. (they probably won't)
    return ataRuleRecords;
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      contextIsPrepared
   * @return      {boolean}
   * @description Returns true if the context is prepared, throws error otherwise.
   * @private
   */
  //───────────────────────────────────────────────────────────────────────────┘
  private contextIsPrepared():boolean {
    if (this._prepared !== true) {
      throw new SfdxFalconError ( `TM1 Context members are not accessible until the context is prepared`
                                , `ContextNotPrepared`
                                , `${dbgNs}contextIsPrepared`);
    }
    else {
      return this._prepared;
    }
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      matchAtaRuleDeveloperName
   * @param       {string} devNameToMatch Required.
   * @return      {boolean} TRUE if a match was found. FALSE if not.
   * @description Given a string, searches the list of values in this object's
   *              _ataRuleDevNamesByRuleId Map, returning TRUE if a matching
   *              name was found and FALSE if not.
   * @private
   */
  //───────────────────────────────────────────────────────────────────────────┘
  private matchAtaRuleDeveloperName(devNameToMatch:string):boolean {
    for (const devName of this._ataRuleDevNamesByRuleId.values()) {
      if (devName === devNameToMatch) {
        return true;
      }
    }
    return false;
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      parseCsvFiles
   * @return      {Promise<void>}
   * @description Returns true if the context is prepared, throws error otherwise.
   * @private @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  private async parseCsvFiles():Promise<void> {
    this._accountShareRecords   = await parseFile(this._tm1FilePaths.accountShareCsv);
    this._ataRuleRecords        = await parseFile(this._tm1FilePaths.ataRuleCsv);
    this._ataRuleItemRecords    = await parseFile(this._tm1FilePaths.ataRuleItemCsv);
    this._territoryRecords      = await parseFile(this._tm1FilePaths.territoryCsv);
    this._userTerritoryRecords  = await parseFile(this._tm1FilePaths.userTerritoryCsv);

    // DEBUG
    SfdxFalconDebug.obj(
      `${dbgNs}parseCsvFiles`,
      {
        _territoryRecords:      this._territoryRecords,
        _ataRuleRecords:        this._ataRuleRecords,
        _ataRuleItemRecords:    this._ataRuleItemRecords,
        _userTerritoryRecords:  this._userTerritoryRecords,
        _accountShareRecords:   this._accountShareRecords
      },
      `parseCsvFiles: `
    );
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      transformCsvFiles
   * @return      {Promise<void>}
   * @description Returns true if the transformations are successful, throws
   *              error otherwise.
   * @private @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  private async transformCsvFiles():Promise<void> {

    // Build TerritoryRecordsById Map.
    for (const territoryRecord of this._territoryRecords) {
      this._territoryRecordsById.set(territoryRecord.Id, territoryRecord);
    }

    // Build AtaRuleRecordsById Map.
    for (const ataRuleRecord of this._ataRuleRecords) {
      this._ataRuleRecordsById.set(ataRuleRecord.Id, ataRuleRecord);

      // Create and store a Developer Name for this ATA rule.
      this.addAtaRuleDeveloperName(ataRuleRecord);

      // Add this Rule Record to the appropriate map of of ATA Rules by Territory ID.
      this.addAtaRuleToTerritoryGroup(ataRuleRecord);

      // Build a group of the ATA Rule Item records related to the current ATA Rule.
      const ataRuleItemRecords = [] as AtaRuleItemRecords;
      for (const ataRuleItemRecord of this._ataRuleItemRecords) {
        if (ataRuleItemRecord.RuleId === ataRuleRecord.Id) {
          ataRuleItemRecords.push(ataRuleItemRecord);
        }
      }

      // Add the group of related ATA Rule Item records to the AtaRuleItemRecordsByRuleId Map.
      this._ataRuleItemRecordsByRuleId.set(ataRuleRecord.Id, ataRuleItemRecords);
    }
  }
}
