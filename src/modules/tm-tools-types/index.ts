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
import {Territory2}             from  '../tm-tools-objects/territory2';       // Class. Models Salesforce "Territory2" metadata as needed for deployment to a TM2 org.
import {Territory2Model}        from  '../tm-tools-objects/territory2-model'; // Class. Models Salesforce "Territory2Model" metadata as needed for deployment to a TM2 org.
import {Territory2Rule}         from  '../tm-tools-objects/territory2-rule';  // Class. Models Salesforce "Territory2Rule" metadata as needed for deployment to a TM2 org.
import {Territory2Type}         from  '../tm-tools-objects/territory2-type';  // Class. Models Salesforce "Territory2Type" metadata as needed for deployment to a TM2 org.



/**
 * Type. Represents an SObject Record ID.
 */
export type SObjectRecordId = string;

/**
 * Type. Represents a Metadata Component's Developer Name (aka "fullName").
 */
export type DeveloperName = string;

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
  RestrictOpportunityTransfer?: string;
  ForecastUserId?:              SObjectRecordId;
  MayForecastManagerShare?:     string;
}

/**
 * Interface. Represents an AccountTerritoryAssignmentRule Record.
 */
export interface AtaRuleRecord extends SObjectRecord {
  TerritoryId?:   SObjectRecordId;
  IsActive?:      string;
  IsInherited?:   string;
  BooleanFilter?: string;
}

/**
 * Interface. Represents an AccountTerritoryAssignmentRuleItem Record.
 */
export interface AtaRuleItemRecord extends SObjectRecord {
  RuleId?:    SObjectRecordId;
  SortOrder?: string;
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
  IsActive?:    string;
}

/**
 * Interface. Represents an AccountShare Record.
 */
export interface AccountShareRecord extends SObjectRecord {
  AccountId?:               SObjectRecordId;
  UserOrGroupId?:           SObjectRecordId;
  RowCause?:                string;
  AccountAccessLevel?:      string;
  CaseAccessLevel?:         string;
  ContactAccessLevel?:      string;
  OpportunityAccessLevel?:  string;
  IsDeleted?:               string;

}

/**
 * Type. Represents an array of AccountShare Records.
 */
export type AccountShareRecords = AccountShareRecord[];

/**
 * Type. Represents an array of UserTerritory Records.
 */
export type UserTerritoryRecords = UserTerritoryRecord[];

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
 * Type. Represents a map of AccountTerritoryAssignmentRule Developer Names by Rule ID.
 */
export type AtaRuleDevNamesByRuleId = Map<SObjectRecordId, DeveloperName>;

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
 * Type. Represents a map of Territory2 Objects by Developer Name.
 */
export type Territory2ObjectsByDevName  = Map<DeveloperName, Territory2>;

/**
 * Type. Represents a map of Territory2Model Objects by Developer Name.
 */
export type Territory2ModelObjectsByDevName = Map<DeveloperName, Territory2Model>;

/**
 * Type. Represents a map of Territory2Rule Objects by Developer Name.
 */
export type Territory2RuleObjectsByDevName = Map<DeveloperName, Territory2Rule>;

/**
 * Type. Represents a map of Territory2Type Objects by Developer Name.
 */
export type Territory2TypeObjectsByDevName = Map<DeveloperName, Territory2Type>;

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

/**
 * Interface. Represents a metadata component with a dependency on TM1.
 */
export interface TM1Dependency {
  componentType:  string;
  componentName:  string;
  dependentOn:    string;
}

/**
 * Interface. Represents a complete view of HARD TM1 dependencies in an org.
 */
export interface TM1HardDependencies {
  hardTm1DependencyCount: number;
  hardTm1Dependencies:    TM1Dependency[];
}

/**
 * Interface. Represents a complete view of SOFT TM1 dependencies in an org.
 */
export interface TM1SoftDependencies {
  softTm1DependencyCount: number;
  softTm1Dependencies:    TM1Dependency[];
}

/**
 * Interface. Represents basic org information for a TM1 org
 */
export interface TM1OrgInfo {
  username?:            string;
  orgId?:               string;
  loginUrl?:            string;
  createdOrgInstance?:  string;
}

/**
 * Interface. Represents the complete suite of CSV and Metadata file paths required to create a TM1 Context.
 */
export interface TM1FilePaths {
  accountShareCsv:  string;
  ataRuleCsv:       string;
  ataRuleItemCsv:   string;
  territoryCsv:     string;
  userTerritoryCsv: string;
  tm1MetadataDir:   string;
}

/**
 * Interface. Represents the complete suite of CSV and Metadata file paths required for a TM2 Transform.
 */
export interface TM2FilePaths {
  objectTerritory2AssociationCsv: string;
  territory2Csv:                  string;
  userTerritory2AssociationCsv:   string;
  tm2MetadataDir:                 string;
}

/**
 * Type. Represents a specific instance of a metadata type in a package manifest (package.xml).
 */
export type PackageTypeMember   = string;

/**
 * Type. Represents an array of Package Type Members.
 */
export type PackageTypeMembers  = PackageTypeMember[];

/**
 * Type. Represents the name of a specific Metadata type (eg. "Territory2Rule").
 */
export type PackageTypeName     = string;

/**
 * Interface. Represents the entire grouping of a <types> node in a package manifest (package.xml).
 */
export interface PackageType {
  name: PackageTypeName;
  members:  PackageTypeMembers;
}

/**
 * Type. Represents an array of Package Types.
 */
export type PackageTypes    = PackageType[];

/**
 * Type. Represents the <version> node in a package manifest (package.xml).
 */
export type PackageVersion  = string;
