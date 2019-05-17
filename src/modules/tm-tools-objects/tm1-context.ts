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

// Import TM-Tools Types
//import {TerritoryRecord}                          from  '../tm-tools-types';   // Interface. Represents a Territory Record.
import {TerritoryRecords}                          from  '../tm-tools-types';   // Type. Represents an array of Territory Records.
import {TerritoryRecordsById}                          from  '../tm-tools-types';   // Type. Represents a map of Territory Records by Territory ID.

import {AtaRuleRecords}     from  '../tm-tools-types';   // Type. Represents an array of AccountTerritoryAssignmentRule Records.
import {AtaRuleRecordsById}     from  '../tm-tools-types';   // Type. Represents a map of AccountTerritoryAssignmentRule Records by Rule ID.
import {AtaRuleItemRecords} from  '../tm-tools-types';   // Type. Represents an array of AccountTerritoryAssignmentRuleItem Records.
import {AtaRuleItemRecordsByRuleId} from  '../tm-tools-types';   // Type. Represents a map of an array of AccountTerritoryAssignmentRuleItem Records by Rule ID.
//import {TerritoryNamesByTerritoryId} from  '../tm-tools-types';   // Type. Represents a map of Territory Names by Territory ID.





//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @class       TM1Context
 * @description Models the entirety of an exported set of TM1 data, including helpful transforms.
 * @public
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export class TM1Context {

  // Public Members
  public  readonly  territoryRecords:           TerritoryRecords;
  public  readonly  territoryRecordsById:       TerritoryRecordsById;
  public  readonly  ataRuleRecords:             AtaRuleRecords;
  public  readonly  ataRuleRecordsById:         AtaRuleRecordsById;
  public  readonly  ataRuleItemRecords:         AtaRuleItemRecords;
  public  readonly  ataRuleItemRecordsByRuleId: AtaRuleItemRecordsByRuleId;


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
  constructor(exportedMetadataPath:string, exportedRecordDataPath:string) {



  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      lookupParentTerritoryDevName
   * @return      {string}
   * @description Constructs an SfdxFalconPrompt object.
   * @public
   */
  //───────────────────────────────────────────────────────────────────────────┘

}
