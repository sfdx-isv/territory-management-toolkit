//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @file          modules/tm-tools-objects/metadata.ts
 * @copyright     Vivek M. Chawla - 2019
 * @author        Vivek M. Chawla <@VivekMChawla>
 * @summary       Abstract base class. Provides core actions and attributes common to all Metadata.
 * @description   Abstract base class. Provides core actions and attributes common to all Metadata.
 * @version       1.0.0
 * @license       MIT
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
// Import External Modules/Types
//import  * as  fs          from  'fs';         // Node's FileStream library.
import  * as  path        from  'path';       // Node's path library.
import  * as  xmlBuilder  from 'xmlbuilder';  // ???

// Import Internal Modules
import {SfdxFalconDebug}          from  '../sfdx-falcon-debug';             // Specialized debug provider for SFDX-Falcon code.
import {SfdxFalconError}          from  '../sfdx-falcon-error';             // Class. Extends SfdxError to provide specialized error structures for SFDX-Falcon modules.

// Set the File Local Debug Namespace
const dbgNs = 'OBJECT:metadata:';


//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @interface   MetadataOptions
 * @description Interface. Represents the XML keys and data common to all Metadata objects.
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export interface MetadataOptions {
  developerName:  string;
  filePath:       string;
  fileNameSuffix: string;
  rootNode:       string;
  parent:         Metadata;
  name?:          string;
  description?:   string;
}

//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @class       Metadata
 * @description Abstract base class. Forms the basis of a common model for all Metadata objects.
 * @public @abstract
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export abstract class Metadata {

  // Protected Members
  protected _prepared:      boolean;

  // Private Members
  private   _developerName:   string;
  private   _name:            string;
  private   _description:     string;
  private   _filePath:        string;
  private   _fileName:        string;
  private   _fileNameSuffix:  string;
  private   _parent:          Metadata;
  private   _rootNode:        string;
  private   _xmlRoot:         xmlBuilder.XMLElement;

  // Public Accessors
  public get developerName()  { return this.isPrepared() ? this._developerName : undefined; }
  public get name()           { return this.isPrepared() ? this._name : undefined; }
  public get description()    { return this.isPrepared() ? this._description : undefined; }
  public get filePath()       { return this.isPrepared() ? this._filePath : undefined; }
  public get fileName()       { return this.isPrepared() ? this._fileName : undefined; }
  public get fileNameSuffix() { return this.isPrepared() ? this._fileNameSuffix : undefined; }
  public get parent()         { return this.isPrepared() ? this._parent : undefined; }
  public get rootNode()       { return this.isPrepared() ? this._rootNode : undefined; }
  public get xmlRoot()        { return this.isPrepared() ? this._xmlRoot : undefined; }
  public get prepared()       { return this._prepared; }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @constructs  Metadata
   * @param       {MetadataOptions} opts
   * @description Constructs a Metadata object.
   * @public
   */
  //───────────────────────────────────────────────────────────────────────────┘
  constructor(opts:MetadataOptions) {

    // Debug incoming arguments.
    SfdxFalconDebug.obj(`${dbgNs}constructor:arguments:`, arguments);

    this._developerName   = opts.developerName  ||  '';
    this._name            = opts.name           ||  '';
    this._description     = opts.description    ||  '';
    this._filePath        = opts.filePath       ||  '';
    this._fileNameSuffix  = opts.fileNameSuffix ||  '';
    this._rootNode        = opts.rootNode       ||  '';
    this._parent          = opts.parent;

    // Validate the current state of this Metadata object.
    this.validateInitialization();

    // Construct the correct filename (Developer Name + File Name Suffix).
    this._fileName = this._developerName + this._fileNameSuffix;

    // Initialize the XML Root of this Metadata component.
    this._xmlRoot = xmlBuilder.create(
      this._rootNode,
      {
        version:    '1.0',
        encoding:   'UTF-8',
        standalone: null
      },
      {
        pubID:  null,
        sysID:  null
      },
      {
        keepNullNodes:      false,  // ???
        keepNullAttributes: false,  // ???
        headless:           false,  // ???
        ignoreDecorators:   false,  // ???
        separateArrayItems: false,  // ???
        noDoubleEncoding:   false,  // ???
        stringify: {}               // ???
      }
    )
    .attribute('xmlns', 'http://soap.sforce.com/2006/04/metadata');

    // Initialize as NOT prepared. Child classes will need to determine when they are prepared.
    this._prepared = false;
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      writeXml
   * @return      {Promise<void>}
   * @description Builds the XML for this object and writes it to the local
   *              filesystem at the path specified by the _filePath member var.
   * @public @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  public async writeXml():Promise<void> {

    // Make sure this instance is Prepared.
    this.isPrepared();

    // Build the XML that we're about to write.
    await this.buildXml();

    // Convert the built XML to a string.
    const xml = this.xmlRoot.end({
      pretty:           true,
      indent:           '    ',
      newline:          '\n',
      width:            0,
      allowEmpty:       false,
      spaceBeforeSlash: ''
    });

    // DEBUG
    SfdxFalconDebug.debugString(`DEVTEST:xml:`, xml, `${path.join(this.filePath, this.fileName)}:\n`);

    // Write the XML to the local filesystem.
    // TODO: power this part up using fs.createWriteStream()

  }

  // Abstract Methods
  protected abstract async buildXml():Promise<void>;

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      isPrepared
   * @return      {boolean}
   * @description Returns true if an object instance is prepared. Throws an
   *              error otherwise.
   * @protected
   */
  //───────────────────────────────────────────────────────────────────────────┘
  protected isPrepared():boolean {
    if (this._prepared !== true) {
      throw new SfdxFalconError ( `Properties and methods of Metadata objects are not accessible until the instance is prepared`
                                , `ObjectNotPrepared`
                                , `${dbgNs}isPrepared`);
    }
    else {
      return this._prepared;
    }
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      validateInitialization
   * @return      {void}
   * @description Ensures that the current state of this instance reflects a
   *              valid set of data/settings.
   * @private
   */
  //───────────────────────────────────────────────────────────────────────────┘
  private validateInitialization():void {

    // Root Node must be provided.
    if (typeof this._rootNode !== 'string' || this._rootNode === '') {
      throw new SfdxFalconError ( `Expected rootNode to be a non-empty string but got '${typeof this._rootNode}' instead.`
                                , `InitialzationError`
                                , `${dbgNs}validateInitialization`);
    }

    // File Path must be provided.
    if (typeof this._filePath !== 'string' || this._filePath === '') {
      throw new SfdxFalconError ( `Expected filePath to be a non-empty string but got '${typeof this._filePath}' instead.`
                                , `InitialzationError`
                                , `${dbgNs}validateInitialization`);
    }

    // Developer Name must be provided.
    if (typeof this._developerName !== 'string' || this._developerName === '') {
      throw new SfdxFalconError ( `Expected developerName to be a non-empty string but got '${typeof this._developerName}' instead.`
                                , `InitialzationError`
                                , `${dbgNs}validateInitialization`);
    }

    // File Name Suffix must be provided.
    if (typeof this._fileNameSuffix !== 'string' || this._fileNameSuffix === '') {
      throw new SfdxFalconError ( `Expected fileNameSuffix to be a non-empty string but got '${typeof this._fileNameSuffix}' instead.`
                                , `InitialzationError`
                                , `${dbgNs}validateInitialization`);
    }
  }
}
