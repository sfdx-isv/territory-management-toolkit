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
import {JsonMap}                from  '@salesforce/ts-types';     // Any JSON-compatible object.
import {AnyJson}                from  '@salesforce/ts-types';     // Any valid JSON value.

//
//
//
//
//─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
// Fundamental Types
//─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
//
//
//
//

/**
 * Type. Represents an access level ('None', 'Read', or 'Edit').
 */
export type AccessLevel = 'None'|'Read'|'Edit';

/**
 * Type. Represents a Metadata Component's Developer Name (aka "fullName").
 */
export type DeveloperName = string;

/**
 * Type. Represents an SObject Record ID.
 */
export type SObjectRecordId = string;

/**
 * Enum. Represents the valid set of Status values that help determine state in the TM-Tools environment.
 */
export enum Status {
  NOT_STARTED = 'NOT_STARTED',
  WAITING     = 'WAITING',
  WORKING     = 'WORKING',
  COMPLETE    = 'COMPLETE',
  PENDING     = 'PENDING',
  SKIPPED     = 'SKIPPED',
  FAILED      = 'FAILED'
}

//
//
//
//
//─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
// SObject Record Interfaces and Types
//─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
//
//
//
//

/**
 * Interface. Represents a baseline SObject Record.
 */
export interface SObjectRecord extends JsonMap {
  Id?:                SObjectRecordId;
  Name?:              string;
  CreatedById?:       SObjectRecordId;
  CreatedDate?:       string;
  LastModifiedById?:  SObjectRecordId;
  LastModifiedDate?:  string;
  SystemModstamp?:    string;
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
 * Interface. Represents a Group Record.
 */
export interface GroupRecord extends SObjectRecord {
  DeveloperName?: DeveloperName;
  RelatedId?:     SObjectRecordId;
  Type?:          string;
}

/**
 * Interface. Represents an ObjectTerritory2Association Record.
 */
export interface ObjectTerritory2AssociationRecord extends SObjectRecord {
  AssociationCause?:        string;
  ObjectId?:                SObjectRecordId;
  SobjectType?:             string;
  Territory2Id?:            SObjectRecordId;
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
 * Interface. Represents a Territory2 Record.
 */
export interface Territory2Record extends SObjectRecord {
  Territory2ModelDeveloperName?:  DeveloperName;
  DeveloperName?:                 DeveloperName;
  ParentTerritory2DeveloperName?: DeveloperName;
  ParentTerritory2Id?:            SObjectRecordId;
}

/**
 * Interface. Represents a Territory2Model Record.
 */
export interface Territory2ModelRecord extends SObjectRecord {
  ActivatedDate?:             string;
  DeactivatedDate?:           string;
  Description?:               string;
  DeveloperName?:             string;
  LastOppTerrAssignEndDate?:  string;
  LastRunRulesEndDate?:       string;
  State?:                     string;
}

/**
 * Interface. Represents an UserTerritory Record.
 */
export interface UserTerritoryRecord extends SObjectRecord {
  IsActive?:    string;
  IsDeleted?:   string;
  TerritoryId?: SObjectRecordId;
  UserId?:      SObjectRecordId;
}

/**
 * Interface. Represents an UserTerritory2Association Record.
 */
export interface UserTerritory2AssociationRecord extends SObjectRecord {
  IsActive?:          string;
  RoleInTerritory2?:  'Owner'|'Administrator'|'Sales Rep';
  Territory2Id?:      SObjectRecordId;
  UserId?:            SObjectRecordId;
}

/**
 * Type. Represents an array of AccountShare Records.
 */
export type AccountShareRecords = AccountShareRecord[];

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
 * Type. Represents an array of Group Records.
 */
export type GroupRecords = GroupRecord[];

/**
 * Type. Represents a map of Group Records by Group ID.
 */
export type GroupRecordsById = Map<SObjectRecordId, GroupRecord>;

/**
 * Type. Represents an array of ObjectTerritory2Association Records.
 */
export type ObjectTerritory2AssociationRecords = ObjectTerritory2AssociationRecord[];

/**
 * Type. Represents an array of UserTerritory Records.
 */
export type UserTerritoryRecords = UserTerritoryRecord[];

/**
 * Type. Represents an array of UserTerritory2Association Records.
 */
export type UserTerritory2AssociationRecords = UserTerritory2AssociationRecord[];

/**
 * Type. Represents an array of Territory Records.
 */
export type TerritoryRecords = TerritoryRecord[];

/**
 * Type. Represents a map of Territory Records by Territory ID.
 */
export type TerritoryRecordsById = Map<SObjectRecordId, TerritoryRecord>;

/**
 * Type. Represents an array of Territory2 Records.
 */
export type Territory2Records = Territory2Record[];

/**
 * Type. Represents a map of Territory2 Records by Territory2 ID.
 */
export type Territory2RecordsById = Map<SObjectRecordId, Territory2Record>;

/**
 * Type. Represents a map of Territory2 Records by Territory2 Developer Name.
 */
export type Territory2RecordsByDevName = Map<DeveloperName, Territory2Record>;

//
//
//
//
//─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
// Object Maps and Arrays
//─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
//
//
//
//

/**
 * Type. Represents a map of SharingRules Objects by Developer Name.
 */
export type SharingRulesObjectsByDevName = Map<DeveloperName, import('../tm-tools-objects/sharing-rules').SharingRules>;

/**
 * Type. Represents a map of Territory Names by Territory ID.
 */
export type TerritoryNamesByTerritoryId = Map<SObjectRecordId, string>;

/**
 * Type. Represents a map of Territory2 Objects by Developer Name.
 */
export type Territory2ObjectsByDevName  = Map<DeveloperName, import('../tm-tools-objects/territory2').Territory2>;

/**
 * Type. Represents a map of Territory2Model Objects by Developer Name.
 */
export type Territory2ModelObjectsByDevName = Map<DeveloperName, import('../tm-tools-objects/territory2-model').Territory2Model>;

/**
 * Type. Represents a map of Territory2Rule Objects by Developer Name.
 */
export type Territory2RuleObjectsByDevName = Map<DeveloperName, import('../tm-tools-objects/territory2-rule').Territory2Rule>;

/**
 * Type. Represents a map of Territory2Type Objects by Developer Name.
 */
export type Territory2TypeObjectsByDevName = Map<DeveloperName, import('../tm-tools-objects/territory2-type').Territory2Type>;

//
//
//
//
//─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
// Sharing Rule-related Interfaces and Types
//─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
//
//
//
//

/**
 * Interface. Represents a Sharing Group inside Salesforce.
 */
export interface SharingGroup extends JsonMap {
  groupType:    AnyJson|'allCustomerPortalUsers'|'allInternalUsers'|'allPartnerUsers'|'channelProgramGroup'|'channelProgramGroups'|'group'|'managerSubordinates'|'managers'|'portalRole'|'portalRoleandSubordinates'|'role'|'roleAndSubordinates'|'roleAndSubordinatesInternal'|'territory'|'territoryAndSubordinates'|'queue';
  groupMembers: string;
}

/**
 * Type. Represents the comparison operation that occurs within a single Filter Item.
 */
export type FilterOperation = 'equals'|'notEqual'|'lessThan'|'greaterThan'|'lessOrEqual'|'greaterOrEqual'|'contains'|'notContain'|'startsWith'|'includes'|'excludes'|'within';

/**
 * Interface. Represents a single filter item. Usually used as part an array of Filter Items.
 */
export interface FilterItem extends JsonMap {
  field:        string;
  operation:    FilterOperation;
  value:        string;
  valueField?:  string;
}

/**
 * Interface. Represents the base set of information required to create a Sharing Rule.
 */
export interface SharingBaseRule extends JsonMap {
  fullName:     string;
  accessLevel:  AccessLevel;
  accountSettings: {
    caseAccessLevel:        AccessLevel;
    contactAccessLevel:     AccessLevel;
    opportunityAccessLevel: AccessLevel;
  };
  description:  string;
  label:        string;
  sharedTo:     SharingGroup;
}

/**
 * Interface. Represents a criteria-based Sharing Rule.
 */
export interface SharingCriteriaRule extends SharingBaseRule {
  booleanFilter:  string;
  criteriaItems:  FilterItem[];
}

/**
 * Interface. Represents a ownership-based Sharing Rule.
 */
export interface SharingOwnerRule extends SharingBaseRule {
  sharedFrom: SharingGroup;
}

/**
 * Type. Represents a territory-based Sharing Rule.
 */
export type SharingTerritoryRule = SharingOwnerRule;

/**
 * Interface. Represents a collection of the JSON representation of Criteria, Ownership, and Territory-based Sharing Rules.
 */
export interface SharingRulesJson {
  sharingCriteriaRules:   SharingCriteriaRule[];
  sharingOwnerRules:      SharingOwnerRule[];
  sharingTerritoryRules:  SharingTerritoryRule[];
}

/**
 * Interface. Represents a collection of information that tracks the count of Criteria, Owner, and Territory-based Sharing Rules.
 */
export interface SharingRulesCount extends JsonMap {
  sharingCriteriaRulesCount:   number;
  sharingOwnerRulesCount:      number;
  sharingTerritoryRulesCount?: number;
}

/**
 * Interface. Represents a FQDN (Fully Qualified Developer Name) collection for Criteria and Owner-based Sharing Rules.
 */
export interface SharingRulesFqdns extends JsonMap {
  sharingCriteriaRules:   string[];
  sharingOwnerRules:      string[];
  sharingTerritoryRules:  string[];
}

//
//
//
//
//─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
// DevName Mapping and Context Related Types
//─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
//
//
//
//

/**
 * Interface. Represents the mapping of a Territory developer name and record ID to a Territory2 developer name and record ID.
 */
export interface TerritoryDevNameMapping extends JsonMap {
  territoryDevName:         DeveloperName;
  territoryId:              SObjectRecordId;
  territory2ModelDevName:   DeveloperName;
  territory2DevName:        DeveloperName;
  territory2Id:             SObjectRecordId;
  territory2ParentDevName:  DeveloperName;
  territory2ParentId:       SObjectRecordId;
}

/**
 * Type. Represents a map of TerritoryDevNameMapping JSON objects by either the Territory Developer Name or the Territory2 Developer Name.
 */
export type TerritoryDevNameMapByDevName = Map<DeveloperName, TerritoryDevNameMapping>;

/**
 * Type. Represents a map of TerritoryDevNameMapping JSON objects by either the Territory ID or the Territory2 ID.
 */
export type TerritoryDevNameMapById = Map<SObjectRecordId, TerritoryDevNameMapping>;

/**
 * Type. Represents an array of TerritoryDevNameMapping JSON objects.
 */
export type TerritoryDevNameMappings = TerritoryDevNameMapping[];

/**
 * Interface. Represents the structure of the return value of the Tm1Context.validate() function.
 */
export interface TM1ContextValidation extends JsonMap {
  records:  {
    extractedTerritoryRecords:      TerritoryRecords;
    extractedAtaRuleRecords:        AtaRuleRecords;
    extractedAtaRuleItemRecords:    AtaRuleItemRecords;
    extractedUserTerritoryRecords:  UserTerritoryRecords;
    extractedAccountShareRecords:   AccountShareRecords;
    extractedGroupRecords:          GroupRecords;
  };
  expectedRecordCounts:             TM1RecordCounts;
  actualRecordCounts:               TM1RecordCounts;
  expectedMetadataCounts:           TM1MetadataCounts;
  actualMetadataCounts:             TM1MetadataCounts;
  status: {
    territoryExtractionIsValid:     boolean;
    ataRuleExtractionIsValid:       boolean;
    ataRuleItemExtractionIsValid:   boolean;
    userTerritoryExtractionIsValid: boolean;
    accountShareExtractionIsValid:  boolean;
    groupExtractionIsValid:         boolean;
  };
}

//
//
//
//
//─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
// Metadata XML Types
//─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
//
//
//
//

/**
 * Type. Represents a specific instance of a metadata type in a package manifest (package.xml).
 */
export type PackageTypeMember = string;

/**
 * Type. Represents an array of Package Type Members.
 */
export type PackageTypeMembers = PackageTypeMember[];

/**
 * Type. Represents the name of a specific Metadata type (eg. "Territory2Rule").
 */
export type PackageTypeName = string;

/**
 * Interface. Represents the entire grouping of a <types> node in a package manifest (package.xml).
 */
export interface PackageType extends JsonMap {
  name: PackageTypeName;
  members:  PackageTypeMembers;
}

/**
 * Type. Represents an array of Package Types.
 */
export type PackageTypes = PackageType[];

/**
 * Type. Represents the <version> node in a package manifest (package.xml).
 */
export type PackageVersion = string;

//
//
//
//
//─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
// TM-Tools Reporting Types
//─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
//
//
//
//

/**
 * Interface. Represents a metadata component with a dependency on TM1.
 */
export interface TM1Dependency extends JsonMap {
  componentType:  string;
  componentName:  string;
  dependentOn:    string;
}

/**
 * Interface. Represents a complete view of HARD TM1 dependencies in an org.
 */
export interface TM1HardDependencies extends JsonMap {
  hardTm1DependencyCount: number;
  hardTm1Dependencies:    TM1Dependency[];
}

/**
 * Interface. Represents a complete view of SOFT TM1 dependencies in an org.
 */
export interface TM1SoftDependencies extends JsonMap {
  softTm1DependencyCount: number;
  softTm1Dependencies:    TM1Dependency[];
}

/**
 * Interface. Represents basic org information for a TM1 org
 */
export interface TM1OrgInfo extends JsonMap {
  alias?:               string;
  username?:            string;
  orgId?:               string;
  loginUrl?:            string;
  createdOrgInstance?:  string;
}

/**
 * Interface. Represents the complete set of Metadata Object Counts that are relevant to the config in a TM1 org.
 */
export interface TM1MetadataCounts extends JsonMap {
  accountSharingRulesCount:     SharingRulesCount;
  leadSharingRulesCount:        SharingRulesCount;
  opportunitySharingRulesCount: SharingRulesCount;
}

/**
 * Interface. Represents the complete set of Metadata Object Counts that are relevant to the config in a TM2 org.
 */
export interface TM2MetadataCounts extends JsonMap {
  accountSharingRulesCount:     SharingRulesCount;
  leadSharingRulesCount:        SharingRulesCount;
  opportunitySharingRulesCount: SharingRulesCount;
}

/**
 * Interface. Represents the complete set of Record Counts that are relevant to the config in a TM1 org.
 */
export interface TM1RecordCounts extends JsonMap {
  territoryRecordCount:       number;
  userTerritoryRecordCount:   number;
  ataRuleRecordCount:         number;
  ataRuleItemRecordCount:     number;
  accountShareRecordCount:    number;
  groupRecordCount:           number;
}

/**
 * Interface. Represents the complete set of Record Counts that are relevant to the config in a TM2 org.
 */
export interface TM2RecordCounts extends JsonMap {
  territory2RecordCount:                  number;
  userTerritory2AssociationRecordCount:   number;
  objectTerritory2AssociationRecordCount: number;
}

/**
 * Interface. Represents the set of status information that's specific to SharingRules transformation.
 */
export interface SharingRulesTransformationStatus extends JsonMap {
  sharingCriteriaRules: Status;
  sharingOwnerRules:    Status;
}

/**
 * Interface. Represents the set of status information that is tracked by the tm1:transform and tm2:deploy commands.
 */
export interface TM1TransformationStatus extends JsonMap {
  metadataTransformationStatus: {
    territory2Model:          Status;
    territory2Type:           Status;
    territory2:               Status;
    territory2Rule:           Status;
    accountSharingRules:      SharingRulesTransformationStatus;
    leadSharingRules:         SharingRulesTransformationStatus;
    opportunitySharingRules:  SharingRulesTransformationStatus;
  };
  dataTransformationStatus: {
    territory2:                   Status;
    userTerritory2Association:    Status;
    objectTerritory2Association:  Status;
  };
  intermediateFilesStatus: {
    tm1ToTm2DevnameMap:           Status;
    territory2:                   Status;
    userTerritory2Association:    Status;
    objectTerritory2Association:  Status;
  };
}

/**
 * Interface. Represents the set of status information tracked by the `tmtools:tm2:load` command.
 */
export interface TM2DataLoadStatus extends JsonMap {
  objectT2AssociationBulkLoad:  import('../sfdx-falcon-types').Bulk2OperationStatus;
  userT2AssociationBulkLoad:    import('../sfdx-falcon-types').Bulk2OperationStatus;
}


/**
 * Interface. Represents the full report data generated by the `tmtools:tm1:analyze` command.
 */
export interface TM1AnalysisReport extends JsonMap {
  orgInfo:              TM1OrgInfo;
  tm1RecordCounts:      TM1RecordCounts;
  tm1MetadataCounts:    TM1MetadataCounts;
  hardTm1Dependencies:  TM1HardDependencies;
  softTm1Dependencies:  TM1SoftDependencies;
}

/**
 * Interface. Represents the full report data generated by the `tmtools:tm1:extract` command.
 */
export interface TM1ExtractionReport extends JsonMap {
  orgInfo:                    TM1OrgInfo;
  expectedTm1RecordCounts:    TM1RecordCounts;
  actualTm1RecordCounts:      TM1RecordCounts;
  expectedTm1MetadataCounts:  TM1MetadataCounts;
  actualTm1MetadataCounts:    TM1MetadataCounts;
}

/**
 * Interface. Represents the full report data generated by the `tmtools:tm1:transform` command.
 */
export interface TM1TransformationReport extends JsonMap {
  orgInfo:            TM1OrgInfo;
  status:             TM1TransformationStatus;
  tm1RecordCounts:    TM1RecordCounts;
  tm1MetadataCounts:  TM1MetadataCounts;
  tm2RecordCounts:    TM2RecordCounts;
  tm2MetadataCounts:  TM2MetadataCounts;
}

/**
 * Interface. Represents the full report data generated by the `tmtools:tm1:clean` command.
 */
export interface TM1CleanupReport extends JsonMap {
  orgInfo:          TM1OrgInfo;
  deploymentResult: import('../sfdx-falcon-types').DeployResult;
}

/**
 * Interface. Represents the full report data generated by the `tmtools:tm2:deploy` command.
 */
export interface TM2DeploymentReport extends JsonMap {
  orgInfo:          TM1OrgInfo;
  deploymentResult: import('../sfdx-falcon-types').DeployResult;
}

/**
 * Interface. Represents the full report data generated by the `tmtools:tm2:load` command.
 */
export interface TM2DataLoadReport extends JsonMap {
  orgInfo:  TM1OrgInfo;
  status:   TM2DataLoadStatus;
}

/**
 * Interface. Represents the full report data generated by the `tmtools:tm2:deploysharing` command.
 */
export interface TM2SharingDeploymentReport extends JsonMap {
  orgInfo:  TM1OrgInfo;
  deploymentResult: import('../sfdx-falcon-types').DeployResult;
}

//
//
//
//
//─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
// TM-Tools FilePath Types
//─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
//
//
//
//

/**
 * Interface. Represents the complete suite of CSV and Metadata file paths required to create a TM1 Context.
 */
export interface TM1ContextFilePaths extends JsonMap {
  accountShareCsv:              string;
  ataRuleCsv:                   string;
  ataRuleItemCsv:               string;
  baseDirectory:                string;
  groupCsv:                     string;
  territoryCsv:                 string;
  tm1MetadataDir:               string;
  userTerritoryCsv:             string;
}

/**
 * Interface. Represents the complete suite of file names required by the various TM commands.
 */
export interface TMFileNames extends JsonMap {
  tm1AnalysisReportFileName:                    string;
  tm1ExtractionReportFileName:                  string;
  tm1TransformationReportFileName:              string;
  tm1CleanupReportFileName:                     string;
  tm2DeploymentReportFileName:                  string;
  tm2DataLoadReportFileName:                    string;
  tm2SharingDeploymentReportFileName:           string;
  accountShareCsv:                              string;
  ataRuleCsv:                                   string;
  ataRuleItemCsv:                               string;
  groupCsv:                                     string;
  territoryCsv:                                 string;
  territory2Csv:                                string;
  userTerritoryCsv:                             string;
  userTerritory2AssociationCsv:                 string;
  objectTerritory2AssociationCsv:               string;
  tm1ToTm2DevnameMapCsv:                        string;
  userTerritory2AssociationIntermediateCsv:     string;
  objectTerritory2AssociationIntermediateCsv:   string;
}

/**
 * Interface. Represents the complete suite of file paths required by the `tmtools:tm1:analyze` command.
 */
export interface TM1AnalyzeFilePaths extends JsonMap {
  baseDirectory:          string;
  tm1AnalysisReportPath:  string;
  fileNames:              TMFileNames;
}

/**
 * Interface. Represents the complete suite of file paths required by the `tmtools:tm1:extract` command.
 */
export interface TM1ExtractFilePaths extends TM1AnalyzeFilePaths {
  tm1ExtractionReportPath:          string;
  tm1ExtractionDir:                 string;
    extractedDataDir:               string;
      accountShareCsv:              string;
      ataRuleCsv:                   string;
      ataRuleItemCsv:               string;
      groupCsv:                     string;
      territoryCsv:                 string;
      userTerritoryCsv:             string;
    extractedMetadataDir:           string;
      extractedMetadataPackageDir:  string;
}

/**
 * Interface. Represents the complete suite of file paths required by the `tmtools:tm1:transform` command.
 */
export interface TM1TransformFilePaths extends TM1ExtractFilePaths {
  tm1TransformationReportPath:  string;
  transformedDataDir:                           string;
    userTerritory2AssociationCsv:               string;
    objectTerritory2AssociationCsv:             string;
  transformedMetadataDir:                       string;
    tm1SharingRulesCleanupDir:                  string;
    tm2MainDeploymentDir:                       string;
    tm2SharingRulesDeploymentDir:               string;
  intermediateFilesDir:                         string;
    tm1ToTm2DevnameMapCsv:                      string;
    userTerritory2AssociationIntermediateCsv:   string;
    objectTerritory2AssociationIntermediateCsv: string;
    territory2Csv:                              string;
}

/**
 * Interface. Represents the complete suite of file paths required by the `tmtools:tm1:clean` command.
 */
export interface TM1CleanFilePaths extends TM1TransformFilePaths {
  tm1CleanupReportPath: string;
}

/**
 * Interface. Represents the complete suite of file paths required by the `tmtools:tm2:deploy` command.
 */
export interface TM2DeployFilePaths extends TM1CleanFilePaths {
  tm2DeploymentReportPath:  string;
}

/**
 * Interface. Represents the complete suite of file paths required by the `tmtools:tm2:load` command.
 */
export interface TM2LoadFilePaths extends TM2DeployFilePaths {
  tm2DataLoadReportPath:  string;
}

/**
 * Interface. Represents the complete suite of file paths required by the `tmtools:tm2:deploysharing` command.
 */
export interface TM2DeploySharingFilePaths extends TM2LoadFilePaths {
  tm2SharingDeploymentReportPath:  string;
}

/**
 * Type. Represents the complete suite of file paths required by ALL TM-Tools commands.
 */
export type TMToolsAllFilePaths = TM2DeploySharingFilePaths;
