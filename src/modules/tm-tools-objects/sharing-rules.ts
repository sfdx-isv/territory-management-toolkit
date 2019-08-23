//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @file          modules/tm-tools-objects/sharing-rules.ts
 * @copyright     Vivek M. Chawla - 2019
 * @author        Vivek M. Chawla <@VivekMChawla>
 * @summary       Exports a class that models the SharingRules metadata object.
 * @description   Exports a class that models the SharingRules metadata object.
 * @version       1.0.0
 * @license       MIT
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
// Import Internal Modules
import  {SfdxFalconDebug}         from  '../sfdx-falcon-debug';                 // Specialized debug provider for SFDX-Falcon code.
import  {SfdxFalconError}         from  '../sfdx-falcon-error';                 // Class. Extends SfdxError to provide specialized error structures for SFDX-Falcon modules.
import  {Metadata}                from  '../tm-tools-objects/metadata';         // Abstract Class. Models Salesforce "Territory2Model" metadata as needed for deployment to a TM2 org.

// Import TM-Tools Types
import  {SharingCriteriaRule}     from  '../tm-tools-types';  // Interface. Represents a criteria-based Sharing Rule.
import  {SharingOwnerRule}        from  '../tm-tools-types';  // Interface. Represents a ownership-based Sharing Rule.
import  {SharingTerritoryRule}    from  '../tm-tools-types';  // Type. Represents a territory-based Sharing Rule.

// Set the File Local Debug Namespace
const dbgNs = 'OBJECT:sharing-rules:';


//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @interface   SharingRulesOptions
 * @description Interface. Represents the options required when creating a SharingRules object.
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
interface SharingRulesOptions {
  developerName:          string;
  filePath:               string;
  sharingCriteriaRules:   SharingCriteriaRule[];
  sharingOwnerRules:      SharingOwnerRule[];
  sharingTerritoryRules:  SharingTerritoryRule[];
}

//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @class       SharingRules
 * @extends     Metadata
 * @description Models Salesforce "SharingRules" metadata.
 * @public
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export class SharingRules extends Metadata {

  // Private Members
  private _sharingCriteriaRules:  SharingCriteriaRule[];
  private _sharingOwnerRules:     SharingOwnerRule[];
  private _sharingTerritoryRules: SharingTerritoryRule[];

  // Public Accessors
  public get sharingCriteriaRules()     { return this.isPrepared() ? this._sharingCriteriaRules : undefined; }
  public get sharingOwnerRules()        { return this.isPrepared() ? this._sharingOwnerRules : undefined; }
  public get sharingTerritoryRules()    { return this.isPrepared() ? this._sharingTerritoryRules : undefined; }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @constructs  SharingRules
   * @param       {SharingRulesOptions} opts
   * @description Constructs a SharingRules object.
   * @public
   */
  //───────────────────────────────────────────────────────────────────────────┘
  constructor(opts:SharingRulesOptions) {

    // Debug incoming arguments.
    SfdxFalconDebug.obj(`${dbgNs}constructor:arguments:`, arguments);

    // Validate incoming arguments.
    if (typeof opts !== 'object') {
      throw new SfdxFalconError ( `The opts argument must be an object. Got type '${typeof opts}' instead.`
                                , `TypeError`
                                , `${dbgNs}constructor`);
    }
    if (Array.isArray(opts.sharingCriteriaRules) !== true) {
      throw new SfdxFalconError ( `The sharingCriteriaRules option must be an array. Got type '${typeof opts.sharingCriteriaRules}' instead.`
                                , `TypeError`
                                , `${dbgNs}constructor`);
    }
    if (Array.isArray(opts.sharingOwnerRules) !== true) {
      throw new SfdxFalconError ( `The sharingOwnerRules option must be an array. Got type '${typeof opts.sharingOwnerRules}' instead.`
                                , `TypeError`
                                , `${dbgNs}constructor`);
    }
    if (Array.isArray(opts.sharingTerritoryRules) !== true) {
      throw new SfdxFalconError ( `The sharingTerritoryRules option must be an array. Got type '${typeof opts.sharingTerritoryRules}' instead.`
                                , `TypeError`
                                , `${dbgNs}constructor`);
    }

    // Specify options that are relevant to SharingRules objects.
    const resolvedOpts = {
      ...opts,
      ...{
        rootNode:       `SharingRules`,
        fileNameSuffix: `.sharingRules`,
        parent:         null
      }
    };

    // Call the parent constructor
    super(resolvedOpts);

    // Store references to the various Sharing Rules provided by the caller.
    this._sharingCriteriaRules  = opts.sharingCriteriaRules;
    this._sharingOwnerRules     = opts.sharingOwnerRules;
    this._sharingTerritoryRules = opts.sharingTerritoryRules;

    // Mark this object as prepared.
    this._prepared = true;
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      buildXml
   * @return      {Promise<void>}
   * @description Builds an XML string that can be saved to the filesystem as
   *              a valid XML file.
   * @protected @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  protected async buildXml():Promise<void> {

    // DEBUG
    SfdxFalconDebug.obj(`${dbgNs}buildXml:this:`, this);

    // Build Criteria-based Sharing Rules
    for (const sharingCriteriaRule of this._sharingCriteriaRules) {
      const sharingCriteriaRulesNode = this.xmlRoot.ele('sharingCriteriaRules');
      if (sharingCriteriaRule.fullName)       sharingCriteriaRulesNode.ele('fullName').txt(sharingCriteriaRule.fullName);
      if (sharingCriteriaRule.accessLevel)    sharingCriteriaRulesNode.ele('accessLevel').txt(sharingCriteriaRule.accessLevel);
      if (sharingCriteriaRule.description)    sharingCriteriaRulesNode.ele('description').txt(sharingCriteriaRule.description);
      if (sharingCriteriaRule.label)          sharingCriteriaRulesNode.ele('label').txt(sharingCriteriaRule.label);
      if (sharingCriteriaRule.booleanFilter)  sharingCriteriaRulesNode.ele('booleanFilter').txt(sharingCriteriaRule.booleanFilter);

      // Only Build the accountSettings key if that data is present.
      if (sharingCriteriaRule.accountSettings.caseAccessLevel || sharingCriteriaRule.accountSettings.contactAccessLevel || sharingCriteriaRule.accountSettings.opportunityAccessLevel) {
        const accountSettingsNode = sharingCriteriaRulesNode.ele('accountSettings');
        if (sharingCriteriaRule.accountSettings.caseAccessLevel)        accountSettingsNode.ele('caseAccessLevel').txt(sharingCriteriaRule.accountSettings.caseAccessLevel);
        if (sharingCriteriaRule.accountSettings.contactAccessLevel)     accountSettingsNode.ele('contactAccessLevel').txt(sharingCriteriaRule.accountSettings.contactAccessLevel);
        if (sharingCriteriaRule.accountSettings.opportunityAccessLevel) accountSettingsNode.ele('opportunityAccessLevel').txt(sharingCriteriaRule.accountSettings.opportunityAccessLevel);
      }

      // Build the sharedTo node.
      const sharedToNode = sharingCriteriaRulesNode.ele('sharedTo');
      if (sharingCriteriaRule.sharedTo.groupMembers) sharedToNode.ele(sharingCriteriaRule.sharedTo.groupType).txt(sharingCriteriaRule.sharedTo.groupMembers);

      // Build the criteriaItems nodes.
      for (const criteriaItem of sharingCriteriaRule.criteriaItems) {
        const criteriaItemsNode = sharingCriteriaRulesNode.ele('criteriaItems');
        if (criteriaItem.field)       criteriaItemsNode.ele('field').txt(criteriaItem.field);
        if (criteriaItem.operation)   criteriaItemsNode.ele('operation').txt(criteriaItem.operation);
        if (criteriaItem.value)       criteriaItemsNode.ele('value').txt(criteriaItem.value);
        if (criteriaItem.valueField)  criteriaItemsNode.ele('valueField').txt(criteriaItem.valueField);
      }
    }

    // Build Ownership-based Sharing Rules
    for (const sharingOwnerRule of this._sharingOwnerRules) {
      const sharingOwnerRulesNode = this.xmlRoot.ele('sharingOwnerRules');
      if (sharingOwnerRule.fullName)    sharingOwnerRulesNode.ele('fullName').txt(sharingOwnerRule.fullName);
      if (sharingOwnerRule.accessLevel) sharingOwnerRulesNode.ele('accessLevel').txt(sharingOwnerRule.accessLevel);
      if (sharingOwnerRule.description) sharingOwnerRulesNode.ele('description').txt(sharingOwnerRule.description);
      if (sharingOwnerRule.label)       sharingOwnerRulesNode.ele('label').txt(sharingOwnerRule.label);

      // Only Build the accountSettings key if that data is present.
      if (sharingOwnerRule.accountSettings.caseAccessLevel || sharingOwnerRule.accountSettings.contactAccessLevel || sharingOwnerRule.accountSettings.opportunityAccessLevel) {
        const accountSettingsNode = sharingOwnerRulesNode.ele('accountSettings');
        if (sharingOwnerRule.accountSettings.caseAccessLevel)         accountSettingsNode.ele('caseAccessLevel').txt(sharingOwnerRule.accountSettings.caseAccessLevel);
        if (sharingOwnerRule.accountSettings.contactAccessLevel)      accountSettingsNode.ele('contactAccessLevel').txt(sharingOwnerRule.accountSettings.contactAccessLevel);
        if (sharingOwnerRule.accountSettings.opportunityAccessLevel)  accountSettingsNode.ele('opportunityAccessLevel').txt(sharingOwnerRule.accountSettings.opportunityAccessLevel);
      }

      // Build the sharedFrom node.
      const sharedFromNode = sharingOwnerRulesNode.ele('sharedFrom');
      if (sharingOwnerRule.sharedTo.groupMembers) sharedFromNode.ele(sharingOwnerRule.sharedTo.groupType).txt(sharingOwnerRule.sharedTo.groupMembers);

      // Build the sharedTo node.
      const sharedToNode = sharingOwnerRulesNode.ele('sharedTo');
      if (sharingOwnerRule.sharedTo.groupMembers) sharedToNode.ele(sharingOwnerRule.sharedTo.groupType).txt(sharingOwnerRule.sharedTo.groupMembers);
    }
  }
}
