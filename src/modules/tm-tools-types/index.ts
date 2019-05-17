//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @file          modules/tm-tools-types/index.ts
 * @copyright     Vivek M. Chawla - 2019
 * @author        Vivek M. Chawla <@VivekMChawla>
 * @summary       Collection of interfaces and types used across TM-Tools modules.
 * @description   Collection of interfaces and types used across TM-Tools modules.
 * @version       1.0.0
 * @license       MIT
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
// Import External Modules/Types
//import {Connection}           from  '@salesforce/core';         // Why?
//import {AnyJson}              from  '@salesforce/ts-types';     // Why?
//import * as inquirer          from  'inquirer';                 // Why?
//import {QueryResult}          from  'jsforce';                  // Why?
//import {Query}                from  'jsforce';                  // Why?
//import {Record}               from  'jsforce';                  // Why?
//import {RequestInfo}          from  'jsforce';                  // Why?
//import {Observable}           from  'rxjs';                     // Why?
//import {Observer}             from  'rxjs';                     // Why?
//import {Subscriber}           from  'rxjs';                     // Why?
//import {Questions}            from  'yeoman-generator';         // Interface. Represents an array of Inquirer "question" objects.
//import {Question}             from  'yeoman-generator';         // Interface. Represents an array of Inquirer "question" objects.

// Import Internal Modules/Types
//import {SfdxFalconResult}     from  '../sfdx-falcon-result';    // Class. Implements a framework for creating results-driven, informational objects with a concept of heredity (child results) and the ability to "bubble up" both Errors (thrown exceptions) and application-defined "failures".
//import {SfdxOrgInfo}          from  '../sfdx-falcon-util/sfdx'; // Class. Stores information about orgs that are connected to the local Salesforce CLI.
//import {SfdxFalconTableData}  from  '../sfdx-falcon-util/ux';   // Interface. Represents and array of SfdxFalconKeyValueTableDataRow objects.


/**
 * Type. Represents an SObject Record ID.
 */
export type SObjectRecordId = string;

/**
 * Interface. Represents a baseline SObject Record.
 */
export interface SObjectRecord {
  Id?:                SObjectRecordId;
  Name?:              string;
  CreatedById?:       SObjectRecordId;
  CreatedDate?:       string;
  LastModifiedById?:  SObjectRecordId;
  LastModifiedDate?:  string;
  SystemModstamp?:    string;
}

/**
 * Interface. Represents a Territory Record.
 */
export interface TerritoryRecord extends SObjectRecord {
  ParentTerritoryId?:           SObjectRecordId;
  DeveloperName?:               string;
  Description?:                 string;
  AccountAccessLevel?:          string;
  CaseAccessLevel?:             string;
  ContactAccessLevel?:          string;
  OpportunityAccessLevel?:      string;
  RestrictOpportunityTransfer?: boolean;
  ForecastUserId?:              SObjectRecordId;
  MayForecastManagerShare?:     boolean;
}

/**
 * Interface. Represents an AccountTerritoryAssignmentRule Record.
 */
export interface AtaRuleRecord extends SObjectRecord {
  TerritoryId?:   SObjectRecordId;
  IsActive?:      boolean;
  IsInherited?:   boolean;
  BooleanFilter?: string;
}

/**
 * Interface. Represents an AccountTerritoryAssignmentRuleItem Record.
 */
export interface AtaRuleItemRecord extends SObjectRecord {
  RuleId?:    SObjectRecordId;
  SortOrder?: number;
  Field?:     string;
  Operation?: string;
  Value?:     string;
}

/**
 * Interface. Represents an UserTerritory Record.
 */
export interface UserTerritoryRecord extends SObjectRecord {
  UserId?:      SObjectRecordId;
  TerritoryId?: SObjectRecordId;
  IsActive?:    boolean;
}

/**
 * Type. Represents an array of Territory Records.
 */
export type TerritoryRecords = TerritoryRecord[];

/**
 * Type. Represents a map of Territory Records by Territory ID.
 */
export type TerritoryRecordsById = Map<SObjectRecordId, TerritoryRecord>;

/**
 * Type. Represents an array of AccountTerritoryAssignmentRule Records.
 */
export type AtaRuleRecords = AtaRuleRecord[];

/**
 * Type. Represents an array of AccountTerritoryAssignmentRuleItem Records.
 */
export type AtaRuleItemRecords = AtaRuleItemRecord[];

/**
 * Type. Represents a map of AccountTerritoryAssignmentRule Records by Rule ID.
 */
export type AtaRuleRecordsById = Map<SObjectRecordId, AtaRuleRecord>;

/**
 * Type. Represents a map of an array of AccountTerritoryAssignmentRuleItem Records by Rule ID.
 */
export type AtaRuleItemRecordsByRuleId = Map<SObjectRecordId, AtaRuleItemRecords>;

/**
 * Type. Represents a map of an array of AccountTerritoryAssignmentRule Records by Territory ID.
 */
export type AtaRuleRecordsByTerritoryId = Map<SObjectRecordId, AtaRuleRecords>;

/**
 * Type. Represents a map of Territory Names by Territory ID.
 */
export type TerritoryNamesByTerritoryId = Map<SObjectRecordId, string>;



/**
 * Interface. Represents the overall grouping of Record Data required by various TM-Tools functions.
 */
export interface TM1Context {
  territoryRecords:           TerritoryRecords;
  territoryRecordsById:       TerritoryRecordsById;
  ataRuleRecords:             AtaRuleRecords;
  ataRuleRecordsById:         AtaRuleRecordsById;
  ataRuleItemRecords:         AtaRuleItemRecords;
  ataRuleItemRecordsByRuleId: AtaRuleItemRecordsByRuleId;
}



