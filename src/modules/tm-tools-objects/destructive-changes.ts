//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @file          modules/tm-tools-objects/destructive-changes.ts
 * @copyright     Vivek M. Chawla - 2019
 * @author        Vivek M. Chawla <@VivekMChawla>
 * @summary       Exports a class that models the Destructive Changes metadata object.
 * @description   Exports a class that models the Destructive Changes metadata object.
 * @version       1.0.0
 * @license       MIT
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
// Import External Modules/Types

// Import Internal Modules
import  {SfdxFalconDebug} from  '../sfdx-falcon-debug';         // Specialized debug provider for SFDX-Falcon code.
import  {Metadata}        from  '../tm-tools-objects/metadata'; // Abstract Class. Models Salesforce "Territory2Model" metadata as needed for deployment to a TM2 org.

// Import TM-Tools Types
import  {PackageTypes}    from  '../tm-tools-types';  // Type. Represents an array of Package Types.
import  {PackageVersion}  from  '../tm-tools-types';  // Type. Represents the <version> node in a package manifest (package.xml).

// Set the File Local Debug Namespace
const dbgNs = 'OBJECT:destructive-changes:';
SfdxFalconDebug.msg(`${dbgNs}`, `Debugging initialized for ${dbgNs}`);


//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @interface   DestructiveChangesOptions
 * @description Interface. Represents the options required when creating a Destructive Changes object.
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
interface DestructiveChangesOptions {
  types:    PackageTypes;
  version:  PackageVersion;
  filePath: string;
}

//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @class       DestructiveChanges
 * @extends     Metadata
 * @description Models Salesforce "DestructiveChanges" metadata as needed for deployment to a TM2 org.
 * @public
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export class DestructiveChanges extends Metadata {

  // Private Members
  private   _types:   PackageTypes;
  private   _version: PackageVersion;

  // Public Accessors
  public get types()    { return this.isPrepared() ? this._types : undefined; }
  public get version()  { return this.isPrepared() ? this._version : undefined; }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @constructs  DestructiveChanges
   * @param       {DestructiveChangesOptions} opts
   * @description Constructs a DestructiveChanges object.
   * @public
   */
  //───────────────────────────────────────────────────────────────────────────┘
  constructor(opts:DestructiveChangesOptions) {

    // Debug incoming arguments.
    SfdxFalconDebug.obj(`${dbgNs}constructor:arguments:`, arguments);

    // Specify options that are relevant to Territory2Type objects.
    const resolvedOpts = {
      ...opts,
      ...{
        rootNode:       `Package`,
        developerName:  `destructiveChanges`,
        fileNameSuffix: `.xml`,
        parent:         null
      }
    };

    // Call the parent constructor
    super(resolvedOpts);

    // Set members of this instance
    this._types   = opts.types;
    this._version = opts.version;

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
    for (const type of this.types) {
      const typesNode = this.xmlRoot.ele('types');
      for (const member of type.members) {
        typesNode.ele('members').txt(member);
      }
      typesNode.ele('name').txt(type.name);
    }
    this.xmlRoot.ele('version').txt(this.version);
  }
}
