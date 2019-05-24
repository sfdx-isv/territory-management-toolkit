//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @file          modules/tm-tools-objects/territory.ts
 * @copyright     Vivek M. Chawla - 2019
 * @author        Vivek M. Chawla <@VivekMChawla>
 * @summary       Models Salesforce "Territory" metadata as exported from a TM1 org.
 * @description   Models Salesforce "Territory" metadata as exported from a TM1 org.
 * @version       1.0.0
 * @license       MIT
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
// Import External Modules/Types
//import {JsonMap}                    from  '@salesforce/ts-types'; // Any JSON compatible object.

// Import TM-Tools Types
import {TerritoryRecord}                          from  '../tm-tools-types';   // Interface. Represents a Territory Record.
import {AtaRuleRecords}     from  '../tm-tools-types';   // Type. Represents an array of AccountTerritoryAssignmentRule Records.
import {AtaRuleItemRecords} from  '../tm-tools-types';   // Type. Represents an array of AccountTerritoryAssignmentRuleItem Records.
//import {TerritoryNamesByTerritoryId} from  '../tm-tools-types';   // Type. Represents a map of Territory Names by Territory ID.





//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @class       Territory
 * @description Models Salesforce "Territory" metadata as exported from a TM1 org.
 * @public
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export class Territory {

  // Public Members
  public  readonly  id:                           string;     // ???
  public  readonly  parentTerritoryId:            string;     // ???
  public  readonly  parentTerritory:              string;     // ???
  public  readonly  developerName:                string;     // Equivalent to fullName
  public  readonly  name:                         string;     // ???
  public  readonly  description:                  string;     // ???

  // Object Access Levels
  public  readonly  accountAccessLevel:           string;     // ???
  public  readonly  caseAccessLevel:              string;     // ???
  public  readonly  contactAccessLevel:           string;     // ???
  public  readonly  opportunityAccessLevel:       string;     // ???

  // Miscellaneous fields (not used by TM2)
  public  readonly  restrictOpportunityTransfer:  string;     // ???
  public  readonly  forecastUserId:               string;     // ???
  public  readonly  mayForecastManagerShare:      string;     // ???

  // Public Accessors
  public get fullName():string {
    return this.developerName;
  }

  // Private Members
//  private readonly  _ataRules:                  AtaRuleRecords;
//  private readonly  _ataRuleItems:              AtaRuleItemRecords;
//  private readonly  _territoryNamesById:        TerritoryNamesByTerritoryId;

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @constructs  Territory
   * @param       {TerritoryRecord} territory
   * @param       {Map<string, string>} territoryNamesById
   * @param       {AccountTerritoryAssignmentRuleRecord[]}  ataRules
   * @param       {AccountTerritoryAssignmentRuleItemRecord[]}  ataRuleItems
   * @description Constructs an SfdxFalconPrompt object.
   * @public
   */
  //───────────────────────────────────────────────────────────────────────────┘
  constructor(territory:TerritoryRecord={}, territoryNamesById:Map<string, string>, ataRules:AtaRuleRecords=[], ataRuleItems:AtaRuleItemRecords=[]) {

    // Core properties
    this.id                           = territory.Id;
    this.parentTerritoryId            = territory.ParentTerritoryId;
    this.developerName                = territory.DeveloperName;
    this.name                         = territory.Name;
    this.description                  = territory.Description;

    // Object Access Levels
    this.accountAccessLevel           = territory.AccountAccessLevel;
    this.caseAccessLevel              = territory.CaseAccessLevel;
    this.contactAccessLevel           = territory.ContactAccessLevel;
    this.opportunityAccessLevel       = territory.OpportunityAccessLevel;
  
    // Miscellaneous fields (not used by TM2)
    this.restrictOpportunityTransfer  = territory.RestrictOpportunityTransfer;
    this.forecastUserId               = territory.ForecastUserId;
    this.mayForecastManagerShare      = territory.MayForecastManagerShare;

    // ATA Rules and Rule Items
//    this._ataRules                    = ataRules;
//    this._ataRuleItems                = ataRuleItems;
//    this._territoryNamesById          = territoryNamesById;

    // Set complex member values
    this.parentTerritory              = territoryNamesById.get(this.parentTerritoryId);
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
