//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @file          modules/tm-tools-objects/territory2-type.ts
 * @copyright     Vivek M. Chawla - 2019
 * @author        Vivek M. Chawla <@VivekMChawla>
 * @summary       Exports a class that models the Territory2Type metadata object.
 * @description   Exports a class that models the Territory2Type metadata object.
 * @version       1.0.0
 * @license       MIT
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
// Import External Modules/Types

// Import Internal Modules
import  {SfdxFalconDebug} from  '../sfdx-falcon-debug';         // Specialized debug provider for SFDX-Falcon code.
import  {Metadata}        from  '../tm-tools-objects/metadata'; // Abstract Class. Models Salesforce "Territory2Model" metadata as needed for deployment to a TM2 org.

// Import TM-Tools Types

// Set the File Local Debug Namespace
const dbgNs = 'OBJECT:territory2-type:';


//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @interface   Territory2TypeOptions
 * @description Interface. Represents the options required when creating a Territory2Type object.
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
interface Territory2TypeOptions {
  name:           string;
  developerName:  string;
  priority:       string;
  filePath:       string;
}

//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @class       Territory2Type
 * @extends     Metadata
 * @description Models Salesforce "Territory2Type" metadata as needed for deployment to a TM2 org.
 * @public
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export class Territory2Type extends Metadata {

  // Private Members
  private   _priority:  string;

  // Public Accessors
  public get priority()  { return this.isPrepared() ? this._priority : undefined; }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @constructs  Territory2Type
   * @param       {Territory2TypeOptions} opts
   * @description Constructs a Territory2Type object.
   * @public
   */
  //───────────────────────────────────────────────────────────────────────────┘
  constructor(opts:Territory2TypeOptions) {

    // Debug incoming arguments.
    SfdxFalconDebug.obj(`${dbgNs}constructor:arguments:`, arguments);

    // Specify options that are relevant to Territory2Type objects.
    const resolvedOpts = {
      ...opts,
      ...{
        rootNode:       `Territory2Type`,
        fileNameSuffix: `.territory2Type`,
        parent:         null
      }
    };

    // Call the parent constructor
    super(resolvedOpts);

    // Set members of this instance
    this._priority  = opts.priority;

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
    this.xmlRoot.ele('name').txt(this.name);
    this.xmlRoot.ele('priority').txt(this.priority);
  }
}
