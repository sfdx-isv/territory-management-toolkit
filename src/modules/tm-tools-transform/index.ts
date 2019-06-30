//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @file          modules/tm-tools-transform/index.ts
 * @copyright     Vivek M. Chawla - 2019
 * @author        Vivek M. Chawla <@VivekMChawla>
 * @summary       Exports the Transform class. Lets user take a TM1 Context and build TM2 metadata.
 * @description   Exports the Transform class. Lets user take a TM1 Context and build TM2 metadata.
 * @version       1.0.0
 * @license       MIT
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
// Import External Modules
import * as path                          from  'path';                                 // Node's path library.

// Import Internal Modules
import  {SfdxFalconDebug}                 from  '../sfdx-falcon-debug';                 // Specialized debug provider for SFDX-Falcon code.
import  {SfdxFalconError}                 from  '../sfdx-falcon-error';                 // Class. Extends SfdxError to provide specialized error structures for SFDX-Falcon modules.
import  {Package}                         from  '../tm-tools-objects/package';          // ???
import  {Territory2}                      from  '../tm-tools-objects/territory2';       // ???
import  {Territory2Model}                 from  '../tm-tools-objects/territory2-model'; // ???
import  {Territory2Rule}                  from  '../tm-tools-objects/territory2-rule';  // ???
import  {Territory2Type}                  from  '../tm-tools-objects/territory2-type';  // ???
import  {TM1Context}                      from  '../tm-tools-objects/tm1-context';      // Models the entirety of an exported set of TM1 data, including helpful transforms.

// Import TM-Tools Types
import  {Territory2ObjectsByDevName}      from  '../tm-tools-types';   // Type. Represents a map of Territory2 Objects by Developer Name.
import  {Territory2ModelObjectsByDevName} from  '../tm-tools-types';   // Type. Represents a map of Territory2Model Objects by Developer Name.
import  {Territory2RuleObjectsByDevName}  from  '../tm-tools-types';   // Type. Represents a map of Territory2Rule Objects by Developer Name.
import  {Territory2TypeObjectsByDevName}  from  '../tm-tools-types';   // Type. Represents a map of Territory2Type Objects by Developer Name.
import  {TM2FilePaths}                    from  '../tm-tools-types';   // Interface. Represents the complete suite of CSV and Metadata file paths required for a TM2 Transform.

// Set file local globals
const territory2ModelDevName  = 'Imported_Territory';
const territory2TypeDevName   = 'Imported_Territory';

// Set the File Local Debug Namespace
const dbgNs = 'MODULE:tm-tools-transform:';


//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @class       TmToolsTransform
 * @summary     Provides TM1 to TM2 transformation services given the location of source config.
 * @description If provided with the location of TM1 metadata and TM1 data, as well as the location
 *              on disk where the transformed config (data+metadata) should go, provides the full
 *              set of transformation services.
 * @public
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export class TmToolsTransform {

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      prepare
   * @param       {string} exportedMetadataPath
   * @param       {string} exportedRecordDataPath
   * @param       {string} transformedMetadataPath
   * @param       {string} transformedDataPath
   * @description Given the paths to exported TM1 metadata and record data,
   *              prepares a "Territory Management 1.0 Context" and makes ready
   *              to perform the actual transformation.
   * @public @static @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  public static async prepare(exportedMetadataPath:string, exportedRecordDataPath:string, transformedMetadataPath:string, transformedDataPath:string):Promise<TmToolsTransform> {

    // Debug incoming arguments
    SfdxFalconDebug.obj(`${dbgNs}prepare:arguments:`, arguments);

    // Create a TM1 Context.
    const tm1Context  = await TM1Context.prepare(exportedMetadataPath, exportedRecordDataPath);
    SfdxFalconDebug.obj(`${dbgNs}prepare:tm1Context:`, tm1Context);

    // Build a TM Tools Transform object.
    const tmToolsTransform = new TmToolsTransform(tm1Context, transformedMetadataPath, transformedDataPath);

    // Mark the instantiated obeject as "prepared".
    tmToolsTransform._prepared = true;

    // Return the instantiated TM Tools Transform object.
    return tmToolsTransform;
  }

  // Private Members
  private _tm1Context:                      TM1Context;
  private _tm2FilePaths:                    TM2FilePaths;
  private _package:                         Package;
  private _territory2ObjectsByDevName:      Territory2ObjectsByDevName;
  private _territory2ModelObjectsByDevName: Territory2ModelObjectsByDevName;
  private _territory2TypeObjectsByDevName:  Territory2TypeObjectsByDevName;
  private _territory2RuleObjectsByDevName:  Territory2RuleObjectsByDevName;
  private _prepared:                        boolean;

  // Public Accessors
  public get tm1Context()                       { return this.isPrepared() ? this._tm1Context : undefined; }
  public get package()                          { return this.isPrepared() ? this._package : undefined; }
  public get territory2ObjectsByDevName()       { return this.isPrepared() ? this._territory2ObjectsByDevName : undefined; }
  public get territory2ModelObjectsByDevName()  { return this.isPrepared() ? this._territory2ModelObjectsByDevName : undefined; }
  public get territory2TypeObjectsByDevName()   { return this.isPrepared() ? this._territory2TypeObjectsByDevName : undefined; }
  public get territory2RuleObjectsByDevName()   { return this.isPrepared() ? this._territory2RuleObjectsByDevName : undefined; }
  public get tm2FilePaths()                     { return this._tm2FilePaths; }
  public get prepared()                         { return this._prepared; }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @constructs  TmToolsTransform
   * @param       {string} transformedMetadataPath  Required.
   * @param       {string} transformedDataPath  Required.
   * @param       {TM1Context}  tm1Context  Required.
   * @description Given the paths to locations where transformed TM2 metadata
   *              and record data will be saved...
   * @public
   */
  //───────────────────────────────────────────────────────────────────────────┘
  private constructor(tm1Context:TM1Context, transformedMetadataPath:string, transformedDataPath:string) {

    // Save the TM1 Context
    this._tm1Context = tm1Context;

    // Define the expected TM1 file paths.
    this._tm2FilePaths = {
      objectTerritory2AssociationCsv: path.join(transformedDataPath,      'ObjectTerritory2Association.csv'),
      territory2Csv:                  path.join(transformedDataPath,      'Territory2Csv.csv'),
      userTerritory2AssociationCsv:   path.join(transformedDataPath,      'UserTerritory2AssociationCsv.csv'),
      tm2MetadataDir:                 path.join(transformedMetadataPath,  'unpackaged')
    };

    // Initialize Maps
    this._territory2ObjectsByDevName       = new Map<string, Territory2>();
    this._territory2ModelObjectsByDevName  = new Map<string, Territory2Model>();
    this._territory2TypeObjectsByDevName   = new Map<string, Territory2Type>();
    this._territory2RuleObjectsByDevName   = new Map<string, Territory2Rule>();

    // Mark this object instance as UNPREPARED.
    this._prepared = false;
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      execute
   * @return      {Promise<void>}
   * @description Executes the transformation of TM1 metadata and data into TM2
   *              metadata and data.
   * @public
   */
  //───────────────────────────────────────────────────────────────────────────┘
  public async execute():Promise<void> {
    
    // Create Territory2Model Objects
    this.createTerritory2ModelObjects();

    // Create Territory2Type Objects
    this.createTerritory2TypeObjects();

    // Create Territory2Rule Objects
    this.createTerritory2RuleObjects();

    // Create Territory2 Objects
    this.createTerritory2Objects();

    // Create Package Object
    this.createPackageObject();

  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      write
   * @return      {Promise<void>}
   * @description Writes the transformed TM2 data and metadata to the local
   *              filesystem.
   * @public @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  public async write():Promise<void> {

    await this.writeData();
    await this.writeMetadata();

  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      createPackageObject
   * @return      {void}
   * @description Creates a Package object (ie. package.xml).
   * @private
   */
  //───────────────────────────────────────────────────────────────────────────┘
  private createPackageObject():void {
    const packageTypes  = [];
    const {falcon}      = require('../../../package.json'); // The version of the SFDX-Falcon plugin

    // Territory2
    packageTypes.push({
      members:  ['*'],
      name:     'Territory2'
    });

    // Territory2Model
    packageTypes.push({
      members:  ['*'],
      name:     'Territory2Model'
    });

    // Territory2Rule
    packageTypes.push({
      members:  ['*'],
      name:     'Territory2Rule'
    });

    // Territory2Type
    packageTypes.push({
      members:  ['*'],
      name:     'Territory2Type'
    });

    // Create the Package object.
    this._package = new Package({
      types:    packageTypes,
      version:  falcon.sfdcApiVersion,
      filePath: this._tm2FilePaths.tm2MetadataDir
    });
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      createTerritory2Objects
   * @return      {void}
   * @description Creates all required Territory2 objects.
   * @private
   */
  //───────────────────────────────────────────────────────────────────────────┘
  private createTerritory2Objects():void {
    for (const territoryRecord of this._tm1Context.territoryRecords) {
      const parentTerritoryRecord = this._tm1Context.territoryRecordsById.get(territoryRecord.ParentTerritoryId);
      const territory2Model       = this._territory2ModelObjectsByDevName.get('Imported_Territory');
      const territory2Type        = this._territory2TypeObjectsByDevName.get('Imported_Territory');

      // TODO: Validate territory2Model
      // TODO: Validate territory2Type

      this._territory2ObjectsByDevName.set(
        territoryRecord.DeveloperName,
        new Territory2({
          territory2Model:            territory2Model,
          territory2Type:             territory2Type,
          territoryRecord:            territoryRecord,
          parentTerritoryRecord:      parentTerritoryRecord,
          ataRuleRecords:             this._tm1Context.ataRuleRecordsByTerritoryId.get(territoryRecord.Id) || [],
          ataRuleDevNamesByRuleId:    this._tm1Context.ataRuleDevNamesByRuleId
        })
      );
    }
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      createTerritory2ModelObjects
   * @return      {void}
   * @description Creates all required Territory2Model objects.
   * @private
   */
  //───────────────────────────────────────────────────────────────────────────┘
  private createTerritory2ModelObjects():void {
    this._territory2ModelObjectsByDevName.set(
      territory2ModelDevName,
      new Territory2Model({
        name:           `Imported Territory`,
        developerName:  territory2ModelDevName,
        description:    `Auto-generated Territory Model. Created as part of the TM1 to TM2 migration process.`,
        filePath:       path.join(this._tm2FilePaths.tm2MetadataDir, 'territory2Models', territory2ModelDevName)
      })
    );
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      createTerritory2RuleObjects
   * @return      {void}
   * @description Creates all required Territory2Rule objects.
   * @private
   */
  //───────────────────────────────────────────────────────────────────────────┘
  private createTerritory2RuleObjects():void {
    for (const ataRuleRecord of this._tm1Context.ataRuleRecords) {
      const ataRuleDevName  = this._tm1Context.ataRuleDevNamesByRuleId.get(ataRuleRecord.Id);
      const territory2Model = this._territory2ModelObjectsByDevName.get(territory2ModelDevName);
      this._territory2RuleObjectsByDevName.set(
        ataRuleDevName,
        new Territory2Rule({
          developerName:              ataRuleDevName,
          ataRuleRecord:              ataRuleRecord,
          ataRuleItemRecordsByRuleId: this._tm1Context.ataRuleItemRecordsByRuleId,
          objectType:                 'Account',
          territory2Model:            territory2Model
        })
      );
    }
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      createTerritory2TypeObjects
   * @return      {void}
   * @description Creates all required Territory2Type objects.
   * @private
   */
  //───────────────────────────────────────────────────────────────────────────┘
  private createTerritory2TypeObjects():void {
    this._territory2TypeObjectsByDevName.set(
      territory2TypeDevName,
      new Territory2Type({
        name:           `Imported Territory`,
        developerName:  territory2TypeDevName,
        priority:       `1`,
        filePath:       path.join(this._tm2FilePaths.tm2MetadataDir, 'territory2Types')
      })
    );
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      isPrepared
   * @return      {boolean}
   * @description Returns true if an object instance is prepared. Throws an
   *              error otherwise.
   * @private
   */
  //───────────────────────────────────────────────────────────────────────────┘
  private isPrepared():boolean {
    if (this._prepared !== true) {
      throw new SfdxFalconError ( `TmToolsTransform members are not accessible until the instance is prepared`
                                , `ContextNotPrepared`
                                , `${dbgNs}isPrepared`);
    }
    else {
      return this._prepared;
    }
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      writeData
   * @return      {Promise<void>}
   * @description Writes transformed TM2 data to the local filesystem.
   * @private @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  private async writeData():Promise<void> {

    // TODO: Need to power this up.
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      writeMetadata
   * @return      {Promise<void>}
   * @description Writes transformed TM2 metadata to the local filesystem.
   * @private @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  private async writeMetadata():Promise<void> {

    // Write package manifest (package.xml).
    await this.package.writeXml(this.tm2FilePaths.tm2MetadataDir);

    // Write Territory2Type metadata files (territory2Types/DEV_NAME.territory2Type)
    for (const territory2Type of this.territory2TypeObjectsByDevName.values()) {
      await territory2Type.writeXml(this.tm2FilePaths.tm2MetadataDir);
    }

    // Write Territory2Model metadata files (territory2Models/DEV_NAME/DEV_NAME.territory2Model)
    for (const territory2Model of this.territory2ModelObjectsByDevName.values()) {
      await territory2Model.writeXml(this.tm2FilePaths.tm2MetadataDir);
    }

    // Write Territory2Rule metadata files (territory2Models/PARENT_MODEL_DEV_NAME/rules/DEV_NAME.territory2Rule)
    for (const territory2Rule of this.territory2RuleObjectsByDevName.values()) {
      await territory2Rule.writeXml(this.tm2FilePaths.tm2MetadataDir);
    }

    // Write Territory2 metadata files (territory2Models/PARENT_MODEL_DEV_NAME/territories/DEV_NAME.territory2)
    for (const territory2 of this.territory2ObjectsByDevName.values()) {
      await territory2.writeXml(this.tm2FilePaths.tm2MetadataDir);
    }
  }
}
