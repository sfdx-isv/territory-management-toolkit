//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @file          modules/tm-tools-objects/territory2-rule.ts
 * @copyright     Vivek M. Chawla - 2019
 * @author        Vivek M. Chawla <@VivekMChawla>
 * @summary       Exports a class that models the Territory2Rule metadata object.
 * @description   Exports a class that models the Territory2Rule metadata object.
 * @version       1.0.0
 * @license       MIT
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
// Import External Modules/Types
import * as path                      from  'path';                         // Node's path library.

// Import Internal Modules
import  {SfdxFalconDebug}             from  '../sfdx-falcon-debug';         // Specialized debug provider for SFDX-Falcon code.
import  {SfdxFalconError}             from  '../sfdx-falcon-error';         // Class. Extends SfdxError to provide specialized error structures for SFDX-Falcon modules.
import  {Metadata}                    from  '../tm-tools-objects/metadata'; // Abstract Class. Models Salesforce "Territory2Model" metadata as needed for deployment to a TM2 org.
import  {Territory2Model}             from  './territory2-model';           // Class. Models Salesforce "Territory2Model" metadata as needed for deployment to a TM2 org.

// Import TM-Tools Types
import  {AtaRuleRecord}               from  '../tm-tools-types';            // Interface. Represents an AccountTerritoryAssignmentRule Record.
import  {AtaRuleItemRecords}          from  '../tm-tools-types';            // Type. Represents an array of AccountTerritoryAssignmentRuleItem Records.
import  {AtaRuleItemRecordsByRuleId}  from  '../tm-tools-types';            // Type. Represents a map of an array of AccountTerritoryAssignmentRuleItem Records by Rule ID.

// Set the File Local Debug Namespace
const dbgNs = 'OBJECT:territory2-rule:';


//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @interface   Territory2RuleOptions
 * @description Interface. Represents the options required when creating a Territory2Rule object.
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
interface Territory2RuleOptions {
  developerName:              string;
  ataRuleRecord:              AtaRuleRecord;
  ataRuleItemRecordsByRuleId: AtaRuleItemRecordsByRuleId;
  objectType:                 string;
  territory2Model:            Territory2Model;
}

//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @class       Territory2Rule
 * @extends     Metadata
 * @description Models Salesforce "Territory2Rule" metadata as needed for deployment to a TM2 org.
 * @public
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export class Territory2Rule extends Metadata {

  // Private Members
  private _ataRuleRecord:           AtaRuleRecord;
  private _ataRuleItemRecords:      AtaRuleItemRecords;
  private _objectType:              string;

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @constructs  Territory2Rule
   * @param       {Territory2RuleOptions} opts
   * @description Constructs a Territory2Rule object.
   * @public
   */
  //───────────────────────────────────────────────────────────────────────────┘
  constructor(opts:Territory2RuleOptions) {

    // Debug incoming arguments.
    SfdxFalconDebug.obj(`${dbgNs}constructor:arguments:`, arguments);

    // Validate incoming arguments.
    if (typeof opts !== 'object') {
      throw new SfdxFalconError ( `The opts argument must be an object. Got type '${typeof opts}' instead.`
                                , `TypeError`
                                , `${dbgNs}constructor`);
    }
    if (typeof opts.ataRuleRecord !== 'object' || typeof opts.ataRuleRecord.Id !== 'string' || opts.ataRuleRecord.Id.length !== 18) {
      throw new SfdxFalconError ( `The provided ATA Rule Record does not have a valid Record ID (${(opts.ataRuleRecord) ? opts.ataRuleRecord.Id : 'undefined'})`
                                , `TypeError`
                                , `${dbgNs}constructor`);
    }
    if (typeof opts.ataRuleItemRecordsByRuleId !== 'object') {
      throw new SfdxFalconError ( `The ruleItemsByRuleId option must be an object. Got type '${typeof opts.ataRuleItemRecordsByRuleId}' instead.`
                                , `TypeError`
                                , `${dbgNs}constructor`);
    }
    if ((opts.ataRuleItemRecordsByRuleId instanceof Map) !== true) {
      throw new SfdxFalconError ( `The ruleItemsByRuleId option must be an instance of Map. `
                                + `The provided object was an instance of '${(opts.ataRuleItemRecordsByRuleId && opts.ataRuleItemRecordsByRuleId.constructor) ? opts.ataRuleItemRecordsByRuleId.constructor.name : 'unknown'}' instead.`
                                , `TypeError`
                                , `${dbgNs}constructor`);
    }
    if ((opts.territory2Model instanceof Territory2Model) !== true) {
      throw new SfdxFalconError ( `The territory2Model option must be an instance of Territory2Model. `
                                + `The provided object was an instance of '${(opts.territory2Model && opts.territory2Model.constructor) ? opts.territory2Model.constructor.name : 'unknown'}' instead.`
                                , `TypeError`
                                , `${dbgNs}constructor`);
    }
    if (typeof opts.objectType !== 'string' || opts.objectType === '') {
      throw new SfdxFalconError ( `The objectType options must be a non-empty string. Got '${typeof opts.objectType}' instead.`
                                , `TypeError`
                                , `${dbgNs}constructor`);
    }

    // Specify options that are relevant to Territory2Model objects.
    const resolvedOpts = {
      ...opts,
      ...{
        rootNode:       `Territory2Rule`,
        name:           opts.ataRuleRecord.Name,
        developerName:  opts.developerName,
        filePath:       path.join(opts.territory2Model.filePath, 'rules'),
        fileNameSuffix: `.territory2Rule`,
        parent:         opts.territory2Model
      }
    };

    // Call the parent constructor
    super(resolvedOpts);

    // Store references to the ATA Rule and ATA Rule Item Records.
    this._ataRuleRecord       = opts.ataRuleRecord;
    this._ataRuleItemRecords  = opts.ataRuleItemRecordsByRuleId.get(opts.ataRuleRecord.Id) || [];
    this._objectType          = opts.objectType;

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
    if (this._ataRuleRecord.IsActive)       this.xmlRoot.ele('active').txt(this._ataRuleRecord.IsActive);
    if (this._ataRuleRecord.BooleanFilter)  this.xmlRoot.ele('booleanFilter').txt(this._ataRuleRecord.BooleanFilter);
    if (this.name)                          this.xmlRoot.ele('name').txt(this.name);
    if (this._objectType)                   this.xmlRoot.ele('objectType').txt(this._objectType);
    for (const ataRuleItemRecord of this._ataRuleItemRecords) {
      const ruleItemsNode = this.xmlRoot.ele('ruleItems');
      // Ensure that the Field Name is always prepended by "Account."
      const fieldName = (ataRuleItemRecord.Field.startsWith('Account.')) ? ataRuleItemRecord.Field : 'Account.' + ataRuleItemRecord.Field;
      if (fieldName)                    ruleItemsNode.ele('field').txt(fieldName);
      if (ataRuleItemRecord.Operation)  ruleItemsNode.ele('operation').txt(ataRuleItemRecord.Operation);
      if (ataRuleItemRecord.Value)      ruleItemsNode.ele('value').txt(ataRuleItemRecord.Value);
    }
  }
}
