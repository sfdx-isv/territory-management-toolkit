//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @file          modules/tm-tools-objects/territory2.ts
 * @copyright     Vivek M. Chawla - 2019
 * @author        Vivek M. Chawla <@VivekMChawla>
 * @summary       Exports a class that models the Territory2 metadata object.
 * @description   Exports a class that models the Territory2 metadata object.
 * @version       1.0.0
 * @license       MIT
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
// Import External Modules/Types
import * as path                  from  'path';                                 // Node's path library.

// Import Internal Modules
import  {SfdxFalconDebug}         from  '../sfdx-falcon-debug';                 // Specialized debug provider for SFDX-Falcon code.
import  {SfdxFalconError}         from  '../sfdx-falcon-error';                 // Class. Extends SfdxError to provide specialized error structures for SFDX-Falcon modules.
import  {Metadata}                from  '../tm-tools-objects/metadata';         // Abstract Class. Models Salesforce "Territory2Model" metadata as needed for deployment to a TM2 org.
import  {Territory2Model}         from  '../tm-tools-objects/territory2-model'; // Class. Models Salesforce "Territory2Model" metadata as needed for deployment to a TM2 org.
import  {Territory2Type}          from  '../tm-tools-objects/territory2-type';  // Class. Models Salesforce "Territory2Type" metadata as needed for deployment to a TM2 org.

// Import TM-Tools Types
import  {TerritoryRecord}         from  '../tm-tools-types';  // Interface. Represents a Territory Record.
import  {AtaRuleRecords}          from  '../tm-tools-types';  // Type. Represents an array of AccountTerritoryAssignmentRule Records.
import  {AtaRuleDevNamesByRuleId} from  '../tm-tools-types';  // Type. Represents a map of AccountTerritoryAssignmentRule Developer Names by Rule ID.

// Set the File Local Debug Namespace
const dbgNs = 'OBJECT:territory2:';


//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @interface   Territory2Options
 * @description Interface. Represents the options required when creating a Territory2Rule object.
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
interface Territory2Options {
  territory2Model:          Territory2Model;
  territory2Type:           Territory2Type;
  territoryRecord:          TerritoryRecord;
  parentTerritoryRecord:    TerritoryRecord;
  ataRuleRecords:           AtaRuleRecords;
  ataRuleDevNamesByRuleId:  AtaRuleDevNamesByRuleId;
}

//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @class       Territory2
 * @extends     Metadata
 * @description Models Salesforce "Territory2" metadata as needed for deployment to a TM2 org.
 * @public
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export class Territory2 extends Metadata {

  // Private Members
  private _territory2Model:         Territory2Model;
  private _territory2Type:          Territory2Type;
  private _territoryRecord:         TerritoryRecord;
  private _parentTerritoryRecord:   TerritoryRecord;
  private _ataRuleRecords:          AtaRuleRecords;
  private _ataRuleDevNamesByRuleId: AtaRuleDevNamesByRuleId;

  // Public Accessors
  public get territory2Model()          { return this.isPrepared() ? this._territory2Model : undefined; }
  public get territory2Type()           { return this.isPrepared() ? this._territory2Type : undefined; }
  public get territoryRecord()          { return this.isPrepared() ? this._territoryRecord : undefined; }
  public get parentTerritoryRecord()    { return this.isPrepared() ? this._parentTerritoryRecord : undefined; }
  public get ataRuleRecords()           { return this.isPrepared() ? this._ataRuleRecords : undefined; }
  public get ataRuleDevNamesByRuleId()  { return this.isPrepared() ? this._ataRuleDevNamesByRuleId : undefined; }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @constructs  Territory2
   * @param       {Territory2Options} opts
   * @description Constructs a Territory2 object.
   * @public
   */
  //───────────────────────────────────────────────────────────────────────────┘
  constructor(opts:Territory2Options) {

    // Debug incoming arguments.
    SfdxFalconDebug.obj(`${dbgNs}constructor:arguments:`, arguments);

    // Validate incoming arguments.
    if (typeof opts !== 'object') {
      throw new SfdxFalconError ( `The opts argument must be an object. Got type '${typeof opts}' instead.`
                                , `TypeError`
                                , `${dbgNs}constructor`);
    }
    if (typeof opts.territoryRecord !== 'object') {
      throw new SfdxFalconError ( `The territoryRecord option must be an object. Got type '${typeof opts.territoryRecord}' instead.`
                                , `TypeError`
                                , `${dbgNs}constructor`);
    }
    if (Array.isArray(opts.ataRuleRecords) !== true) {
      throw new SfdxFalconError ( `The ataRuleRecords option must be an array. Got type '${typeof opts.ataRuleRecords}' instead.`
                                , `TypeError`
                                , `${dbgNs}constructor`);
    }
    if ((opts.territory2Model instanceof Territory2Model) !== true) {
      throw new SfdxFalconError ( `The territory2Model option must be an instance of Territory2Model. `
                                + `The provided object was an instance of '${(opts.territory2Model && opts.territory2Model.constructor) ? opts.territory2Model.constructor.name : 'unknown'}' instead.`
                                , `TypeError`
                                , `${dbgNs}constructor`);
    }

    // Specify options that are relevant to Territory2Model objects.
    const resolvedOpts = {
      ...opts,
      ...{
        rootNode:       `Territory2`,
        name:           opts.territoryRecord.Name,
        developerName:  opts.territoryRecord.DeveloperName,
        filePath:       path.join(opts.territory2Model.filePath, 'territories'),
        fileNameSuffix: `.territory2`,
        parent:         opts.territory2Model
      }
    };

    // Call the parent constructor
    super(resolvedOpts);

    // Store references to the ATA Rule and ATA Rule Item Records.
    this._territory2Model         = opts.territory2Model;
    this._territory2Type          = opts.territory2Type;
    this._territoryRecord         = opts.territoryRecord;
    this._parentTerritoryRecord   = opts.parentTerritoryRecord;
    this._ataRuleRecords          = opts.ataRuleRecords;
    this._ataRuleDevNamesByRuleId = opts.ataRuleDevNamesByRuleId;

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
    if (this._territoryRecord.AccountAccessLevel)     this.xmlRoot.ele('accountAccessLevel').txt(this._territoryRecord.AccountAccessLevel);
    if (this._territoryRecord.CaseAccessLevel)        this.xmlRoot.ele('caseAccessLevel').txt(this._territoryRecord.CaseAccessLevel);
    if (this._territoryRecord.ContactAccessLevel)     this.xmlRoot.ele('contactAccessLevel').txt(this._territoryRecord.ContactAccessLevel);
    if (this._territoryRecord.Description)            this.xmlRoot.ele('description').txt(this._territoryRecord.Description);
    if (this.name)                                    this.xmlRoot.ele('name').txt(this.name);
    if (this._territoryRecord.OpportunityAccessLevel) this.xmlRoot.ele('opportunityAccessLevel').txt(this._territoryRecord.OpportunityAccessLevel);
    if (this._parentTerritoryRecord) {
      this.xmlRoot.ele('parentTerritory').txt(this._parentTerritoryRecord.DeveloperName);
    }
    for (const ataRuleRecord of this._ataRuleRecords) {
      const ruleAssociationsNode = this.xmlRoot.ele('ruleAssociations');
      if (ataRuleRecord.IsInherited)                            ruleAssociationsNode.ele('inherited').txt(ataRuleRecord.IsInherited);
      if (this._ataRuleDevNamesByRuleId.get(ataRuleRecord.Id))  ruleAssociationsNode.ele('ruleName').txt(this._ataRuleDevNamesByRuleId.get(ataRuleRecord.Id));
    }
    if (this._territory2Type.developerName) this.xmlRoot.ele('territory2Type').txt(this._territory2Type.developerName);
  }
}
