//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @file          modules/tm-tools-objects/territory2-model.ts
 * @copyright     Vivek M. Chawla - 2019
 * @author        Vivek M. Chawla <@VivekMChawla>
 * @summary       Exports a class that models the Territory2Model metadata object.
 * @description   Exports a class that models the Territory2Model metadata object.
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
const dbgNs = 'OBJECT:territory2-model:';


//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @interface   Territory2ModelOptions
 * @description Interface. Represents the options required when creating a Territory2Model object.
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
interface Territory2ModelOptions {
  name:           string;
  developerName:  string;
  description:    string;
  filePath:       string;
}

//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @class       Territory2Model
 * @extends     Metadata
 * @description Models Salesforce "Territory2Model" metadata as needed for deployment to a TM2 org.
 * @public
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export class Territory2Model extends Metadata {

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @constructs  Territory2Model
   * @param       {Territory2ModelOptions} opts
   * @description Constructs a Territory2Model object.
   * @public
   */
  //───────────────────────────────────────────────────────────────────────────┘
  constructor(opts:Territory2ModelOptions) {

    // Debug incoming arguments.
    SfdxFalconDebug.obj(`${dbgNs}constructor:arguments:`, arguments);

    // Specify options that are relevant to Territory2Model objects.
    const resolvedOpts = {
      ...opts,
      ...{
        rootNode:       `Territory2Model`,
        fileNameSuffix: `.territory2Model`,
        parent:         null
      }
    };

    // Call the parent constructor
    super(resolvedOpts);

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
    if (this.description) this.xmlRoot.ele('description').txt(this.description);
    if (this.name)        this.xmlRoot.ele('name').txt(this.name);
  }
}
