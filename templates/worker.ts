//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @author        Vivek M. Chawla <@VivekMChawla>
 * @copyright     2019, Vivek M. Chawla / Salesforce. All rights reserved.
 * @license       BSD-3-Clause For full license text, see the LICENSE file in the repo root or
 *                `https://opensource.org/licenses/BSD-3-Clause`
 * @file          workers/soure-file-name.ts
 * @summary       Implements the worker class `ClassName`.
 * @description   Implements the worker class `ClassName`.
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
// Import External Libraries, Classes, & Functions
import  {SfdxFalconDebug}     from  '@sfdx-falcon/debug';     // Class. Provides custom "debugging" services (ie. debug-style info to console.log()).
import  {SfdxFalconError}     from  '@sfdx-falcon/error';     // Class. Extends SfdxError to provide specialized error structures for SFDX-Falcon modules.
import  {TypeValidator}       from  '@sfdx-falcon/validator'; // Library. Collection of type validation functions.
import  {SfdxFalconWorker}    from  '@sfdx-falcon/worker';    // Abstract Class. Used for building classes that implement task-specific functionality.

// Import External Types
import  {JsonMap}             from  '@sfdx-falcon/types';   // Interface. Any JSON-compatible object.

// Import Internal Libraries, Classes, & Functions

// Import Internal Types

// Set the File Local Debug Namespace
const dbgNs = 'WORKER:source-file-name';
SfdxFalconDebug.msg(`${dbgNs}:`, `Debugging initialized for ${dbgNs}`);


//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * Interface. Represents options used by the `ClassName` constructor. These options are also used
 * by `SfdxFalconWorker.prepare()` when preparing instances of `ClassName` objects.
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
interface ClassNameOptions {
  /** Required. The first option. */
  optionOne:  string;
  /** Required. The second option. */
  optionTwo:  string;
}

//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @class       ClassName
 * @extends     SfdxFalconWorker
 * @summary     Worker class that can be used to...
 * @description Worker class that can be used to...
 * @public
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export class ClassName extends SfdxFalconWorker {


  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @constructs  ClassName
   * @param       {ClassNameOptions}  [opts]  Optional. Represents the options
   *              required to construct/prepare this `ClassName` object.
   * @description Constructs a `ClassName` object.
   * @public
   */
  //───────────────────────────────────────────────────────────────────────────┘
  constructor(opts?:ClassNameOptions) {

    // Call the superclass constructor.
    super({
      dbgNsExt: `WORKER`, // Sets the base debug namespace for this Worker.
      prepared: false     // Indicates this worker requires preparation.
    });

    // Define the local debug namespace and echo incoming arguments.
    const dbgNsLocal = `${this.dbgNs}:constructor`;
    SfdxFalconDebug.obj(`${dbgNsLocal}:arguments:`, arguments);

    // Validate incoming options.
    TypeValidator.throwOnEmptyNullInvalidObject(opts,           `${dbgNsLocal}`, `ClassNameOptions`);
    TypeValidator.throwOnEmptyNullInvalidString(opts.optionOne, `${dbgNsLocal}`, `ClassNameOptions.optionOne`);
    TypeValidator.throwOnEmptyNullInvalidString(opts.optionTwo, `${dbgNsLocal}`, `ClassNameOptions.optionTwo`);

    // Perform initialization.
    // TODO: Add initialization logic here.
  }



  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      _generateReport
   * @return      {JsonMap} JSON representation of this `Worker` object's status.
   * @description Generates a JSON representation providing details about the
   *              status of the operations performed by this `Worker` object.
   * @protected
   */
  //───────────────────────────────────────────────────────────────────────────┘
  protected _generateReport():JsonMap {
    return {};
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      _prepare
   * @param       {ClassNameOptions}  [opts]  Optional. Represents the options
   *              required to construct/prepare this `SfdxFalconWorker`-derived
   *              object.
   * @return      {Promise<ClassName>}  A fully "prepared" version of `this` instance.
   * @description Generates a fully "prepared" version of `this` instance. This
   *              method is called by the static method `SfdxFalconWorker.prepare()`
   *              when an instance of an `SfdxFalconWorker`-derived object
   *              requires asynchronous operations to reach a state where it can
   *              be considered fully "prepared" since `constructor` functions
   *              can not implement async code.
   * @protected @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  protected async _prepare(opts?:ClassNameOptions):Promise<ClassName> {

    // Define local debug namespace and echo incoming arguments.
    const dbgNsLocal = `${this.dbgNs}:_prepare`;
    SfdxFalconDebug.obj(`${dbgNsLocal}:arguments:`, arguments);

    // Validate OPTIONAL incoming options.
    if (typeof opts !== 'undefined') {
      TypeValidator.throwOnNullInvalidObject(opts, `${dbgNsLocal}`, `ClassNameOptions`);
    }

    // Validate REQUIRED incoming options.
    TypeValidator.throwOnEmptyNullInvalidObject(opts,           `${dbgNsLocal}`, `ClassNameOptions`);
    TypeValidator.throwOnEmptyNullInvalidString(opts.optionOne, `${dbgNsLocal}`, `ClassNameOptions.optionOne`);
    TypeValidator.throwOnEmptyNullInvalidString(opts.optionTwo, `${dbgNsLocal}`, `ClassNameOptions.optionTwo`);

    // Do stuf to prepare this instance...
    // **STUFF**

    // Mark this instance as "prepared".
    this._prepared = true;
    return this;
  }
}
