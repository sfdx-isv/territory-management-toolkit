//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @author        Vivek M. Chawla <@VivekMChawla>
 * @copyright     2019, Vivek M. Chawla / Salesforce. All rights reserved.
 * @license       BSD-3-Clause For full license text, see the LICENSE file in the repo root or
 *                `https://opensource.org/licenses/BSD-3-Clause`
 * @file          models/soure-file-name.ts
 * @summary       Implements the model class `ClassName`.
 * @description   Implements the model class `ClassName`.
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
// Import External Libraries, Classes, & Functions
import  {SfdxFalconDebug}         from  '@sfdx-falcon/debug';     // Class. Provides custom "debugging" services (ie. debug-style info to console.log()).
import  {SfdxFalconError}         from  '@sfdx-falcon/error';     // Class. Extends SfdxError to provide specialized error structures for SFDX-Falcon modules.
import  {TypeValidator}           from  '@sfdx-falcon/validator'; // Library. Collection of type validation functions.
import  {SfdxFalconModel}         from  '../src/models/model';    // Abstract Class. Used for building classes that encapsulate a domain model, including associated domain-specific operations.

// Import External Types
import  {SfdxFalconModelOptions}  from  '../src/models/model';    // Abstract Class. Used for building classes that encapsulate a domain model, including associated domain-specific operations.

// Import Internal Libraries, Classes, & Functions

// Import Internal Types

// Set the File Local Debug Namespace
const dbgNs = 'MODEL:source-file-name';
SfdxFalconDebug.msg(`${dbgNs}:`, `Debugging initialized for ${dbgNs}`);


//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * Interface. Represents options used by the `ClassName` constructor.
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export interface ClassNameOptions extends SfdxFalconModelOptions {
  /**
   * Required/Optional. Used by the `constructor()` method of `ClassName`.
   */
  constructorOpts: {
    /**
     *  Required/Optional. ???
     */
    optionOne:  string;
    /**
     * Required/Optional. ???
     */
    optionTwo:  string;
  };
  /**
   * Required/Optional. Used by the `build()` method of `ClassName`.
   */
  //buildOpts?: undefined; // NOTE: Set this to `undefined` if you DO NOT want to expose these options.
  buildOpts: {
    /**
     *  Required/Optional. ???
     */
    optionOne:  string;
    /**
     * Required. The second option.
     */
    optionTwo:  string;
  };
  /**
   * Required/Optional. Used by the `load()` method of `ClassName`.
   */
  //loadOpts?: undefined; // NOTE: Set this to `undefined` if you DO NOT want to expose these options.
  loadOpts: {
    /**
     *  Required/Optional. ???
     */
    optionOne:  string;
    /**
     * Required. The second option.
     */
    optionTwo:  string;
  };
}

//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @class       ClassName
 * @extends     SfdxFalconModel
 * @summary     Models...
 * @description Models...
 * @public
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export class ClassName extends SfdxFalconModel<ClassNameOptions> {

  /**
   * ???
   */
  private _memberOne: string;
  /**
   * ???
   */
  private _memberTwo: string[];
  /**
   * ???
   */
  public get memberOne():string   { if (this.isReady()) return this._memberOne; }
  /**
   * ???
   */
  public get memberTwo():string[] { if (this.isReady()) return this._memberTwo; }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @constructs  ClassName
   * @param       {ClassNameOptions}  opts  Required. Represents the options
   *              required to construct this `ClassName` object.
   * @description Constructs a `ClassName` object.
   * @public
   */
  //───────────────────────────────────────────────────────────────────────────┘
  constructor(opts:ClassNameOptions) {

    // Call the superclass constructor.
    super({
      dbgNsExt: `MODEL`,  // Sets the base debug namespace for this Model.
      trapErrors: false   // Indicates that build/load errors should not be trapped.
    });

    // Define the local debug namespace and echo incoming arguments.
    const dbgNsLocal = `${this.dbgNs}:constructor`;
    SfdxFalconDebug.obj(`${dbgNsLocal}:arguments:`, arguments);

    // Validate the presence of Constructor Options.
    TypeValidator.throwOnEmptyNullInvalidObject(opts,                 `${dbgNsLocal}`, `ClassNameOptions`);
    TypeValidator.throwOnEmptyNullInvalidObject(opts.constructorOpts, `${dbgNsLocal}`, `ClassNameOptions.constructorOpts`);

    // Validate specific Constructor Options.
    const constructorOpts = opts.constructorOpts;
    TypeValidator.throwOnEmptyNullInvalidString(constructorOpts.optionOne, `${dbgNsLocal}`, `constructorOpts.optionOne`);
    TypeValidator.throwOnEmptyNullInvalidString(constructorOpts.optionTwo, `${dbgNsLocal}`, `constructorOpts.optionTwo`);

    // Initialize member vars, but put initialization logic that should be repeated
    // on `refresh()` into the `_initialize()` method's implementation instead of here.

    // TODO: Implement baseline initialization logic here
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      _build
   * @param       {ClassNameOptions}  [opts]  Optional. Custom build options
   *              proxied to this method from the public `build()` method.
   * @return      {Promise<boolean>}
   * @description **Implement this method to support buildable models**
   *              Performs the work of building this model. Returns `true` if
   *              building was successful, `false` (or throw an error) if not.
   *
   *              This method is called by the public method `build()`, which is
   *              defined by the base class. Errors thrown by this method may
   *              be trapped by the base `build()` method if `this.trapErrors`
   *              is set to `true`.
   * @protected @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  protected async _build(opts:ClassNameOptions):Promise<boolean> {

    // Define external debug namespace.
    const funcName  = `_build`;
    const dbgNsExt  = `${this.dbgNs}:${funcName}`;

    // Throw an Error indicating this capability has not been implemented yet.
    throw new SfdxFalconError	( `The ability to build this Model has not been implemented yet.`
                              , `ImplementationError`
                              , `${dbgNsExt}`);

    // Validate the Options object.
    TypeValidator.throwOnNullInvalidObject      (opts,                      `${dbgNsExt}`,  `ClassNameOptions`);
    TypeValidator.throwOnNullInvalidObject      (opts.buildOpts,            `${dbgNsExt}`,  `ClassNameOptions.loadOpts`);
    TypeValidator.throwOnEmptyNullInvalidString (opts.buildOpts.optionOne,  `${dbgNsExt}`,	`ClassNameOptions.loadOpts.optionOne`);
    TypeValidator.throwOnEmptyNullInvalidString (opts.buildOpts.optionTwo,  `${dbgNsExt}`,	`ClassNameOptions.loadOpts.optionTwo`);

    // TODO: Implement this method

  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      _initialize
   * @return      {boolean}
   * @description Initializes all model-specific member variables and structures.
   *              Called by the `constructor` and again by the `refresh()`
   *              method when the caller wants to rebuild/reinitialize the model.
   * @protected @abstract
   */
  //───────────────────────────────────────────────────────────────────────────┘
  protected _initialize():void {

    // TODO: Implement this method (what's below is sample implementation only)
    this._memberOne = 'NOT_SPECIFIED';
    this._memberTwo = [];
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      _finalize
   * @return      {Promise<boolean>}
   * @description **Implement this method to support custom-built models**
   *              Performs the work of determining if this model can be
   *              finalized. Returns `true` if it can, `false` (or throws an
   *              error) if not.
   *
   *              This method is called by the public method `finalize()`,
   *              which is defined by the base class. Errors thrown by this
   *              method may be trapped by the base `finalize()` method if
   *              `this.trapErrors` is set to `true`.
   * @protected @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  protected async _finalize():Promise<boolean> {

    // Define external debug namespace.
    const funcName  = `_finalize`;
    const dbgNsExt  = `${this.dbgNs}:${funcName}`;

    // Throw an Error indicating this capability has not been implemented yet.
    throw new SfdxFalconError	( `The ability to finalize this Model has not been implemented yet.`
                              , `ImplementationError`
                              , `${dbgNsExt}`);

    // TODO: Implement this method

  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      _load
   * @param       {T=object}  [opts]  Optional. Custom load options proxied
   *              to this method from the public `load()` method.
   * @return      {Promise<boolean>}
   * @description **Implement this method to support loadable models**
   *              Performs the work of loading this model. Returns `true` if
   *              loading was successful, `false` (or throws an error) if not.
   *
   *              This method is called by the public method `load()`, which is
   *              defined by the base class. Errors thrown by this method may
   *              be trapped by the base `load()` method if `this.trapErrors`
   *              is set to `true`.
   * @protected @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  protected async _load(opts:ClassNameOptions):Promise<boolean> {

    // Define external debug namespace.
    const funcName  = `_load`;
    const dbgNsExt  = `${this.dbgNs}:${funcName}`;

    // Throw an Error indicating this capability has not been implemented.
    throw new SfdxFalconError	( `The ability to load this Model has not been implemented yet.`
                              , `ImplementationError`
                              , `${dbgNsExt}`);

    // Validate the Options object.
    TypeValidator.throwOnNullInvalidObject      (opts,                    `${dbgNsExt}`,  `ClassNameOptions`);
    TypeValidator.throwOnNullInvalidObject      (opts.loadOpts,           `${dbgNsExt}`,  `ClassNameOptions.loadOpts`);
    TypeValidator.throwOnEmptyNullInvalidString (opts.loadOpts.optionOne, `${dbgNsExt}`,	`ClassNameOptions.loadOpts.optionOne`);
    TypeValidator.throwOnEmptyNullInvalidString (opts.loadOpts.optionTwo, `${dbgNsExt}`,	`ClassNameOptions.loadOpts.optionTwo`);
    
    // TODO: Implement this method

  }
}

/*
const testClass = new ClassName({
  constructorOpts: {optionOne: '', optionTwo: ''},
  buildOpts: {optionOne: '', optionTwo: '2'},
  loadOpts: {optionOne: '', optionTwo: ''}
});
testClass.build(null);
//*/
