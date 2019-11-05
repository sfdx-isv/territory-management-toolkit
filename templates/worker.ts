/**
 * **TEMPLATE NOTE: Follow these instructions to customize this template.**
 * 1. Do a case-sensitive, partial match replace of `ClassName` with the name of your class.
 * 2. Do a case-sensitive, partial match replace of `source-file-name` with the name of your source file.
 * 3. Customize the `ClassNameOptions` interface per the requirements of your class. Note that the
 *    the name of this interface will have changed based on the replace you did in step 1.
 * 4. Add member variables and acessors.
 * 5. Implement your constructor. Make sure to set the `requiresPrep` option if your class requires
 *    preparation before being able to function.
 * 6. Implement the `_prepare()` method if your class requires preparation. Otherwise delete it.
 * 7. Implement whatever classes and methods are required.
 * 8. Delete all **TEMPLATE NOTE** comments.
 */

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
import  {SfdxFalconDebug}         from  '@sfdx-falcon/debug';     // Class. Provides custom "debugging" services (ie. debug-style info to console.log()).
import  {SfdxFalconError}         from  '@sfdx-falcon/error';     // Class. Extends SfdxError to provide specialized error structures for SFDX-Falcon modules.
import  {TypeValidator}           from  '@sfdx-falcon/validator'; // Library. Collection of type validation functions.
import  {SfdxFalconWorker}        from  '@sfdx-falcon/worker';    // Abstract Class. Used for building classes that implement task-specific functionality.

// Import External Types
import  {JsonMap}                 from  '@sfdx-falcon/types';     // Interface. Any JSON-compatible object.
import  {SfdxFalconWorkerOptions} from  '@sfdx-falcon/worker';    // Interface. Represents options that can be passed to the SfdxFalconWorker constructor.

// Import Internal Libraries, Classes, & Functions

// Import Internal Types

// Set the File Local Debug Namespace
const dbgNs = 'WORKER:source-file-name';
SfdxFalconDebug.msg(`${dbgNs}:`, `Debugging initialized for ${dbgNs}`);


//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * Interface. Represents the collective options object for classes derived from `SfdxFalconWorker`.
 *
 * * `constructorOpts`: Used by the `constructor()` method of the derived class
 * * `prepareOpts`: Used by the `_prepare()` method of the derived class
 *
 * **TEMPLATE NOTE: Choose one of the following lines and delete the other two**
 * `ClassName` objects support both `constructorOpts` and `prepareOpts`.
 * `ClassName` objects support only `constructorOpts`/`prepareOpts`.
 * `ClassName` objects do not support either `constructorOpts` or `prepareOpts`.
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
interface ClassNameOptions extends SfdxFalconWorkerOptions {
  /**
   * **TEMPLATE NOTE: Choose one of the following lines and delete the other two**
   * Required. Used by the `constructor()` method of `ClassName`.
   * Optional. Used by the `constructor()` method of `ClassName`.
   * Unused. The `constructor()` method of `ClassName` does not expect any options.
   */
  constructorOpts: {
    /**
     * Required. The first option.
     */
    optionOne:  string;
    /**
     * Optional. The second option.
     */
    optionTwo?:  string;
  };
  /**
   * **TEMPLATE NOTE: If Constructor Options are not required, uncomment the line below and use instead of the other `constructorOpts` definition**
   */
  //constructorOpts?: undefined; // Any attempt to provide Constructor Opts should raise a type error.
  /**
   * **TEMPLATE NOTE: Choose one of the following lines and delete the other two**
   * Required. Used by the `prepare()` method of `ClassName`.
   * Optional. Used by the `prepare()` method of `ClassName`.
   * Unused. The `prepare()` method of `ClassName` does not expect any options.
   */
  prepareOpts: {
    /**
     * Required. The first option.
     */
    optionOne:  string;
    /**
     * Optional. The second option.
     */
    optionTwo?:  string;
  };
  /**
   * **TEMPLATE NOTE: If Prepare Options are not required, uncomment the line below and use instead of the other `prepareOpts` definition**
   */
  //prepareOpts?: undefined; // Any attempt to provide Constructor Opts should raise a type error.
}

//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * Interface. `JsonMap` representing the report generated by the `ClassName` object.
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export interface ClassNameReport extends JsonMap {
  thingOne: string;
  thingTwo: string;
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
export class ClassName extends SfdxFalconWorker<ClassNameOptions> {

  // Static members

  // Private members
  /**
   * Documentation for this member variable.
   */
  private _memberVar: string;
  // Protected members

  // Public members

  // Public accessors
  /**
   * Documentation for this accessor
   */
  public get memberVar():string { this.operationRequiresPreparation(); return this._memberVar; }

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
      dbgNsExt:     `WORKER`, // Sets the base debug namespace for this Worker.
      requiresPrep: true      // Indicates this worker DOES/DOES NOT requires preparation.
    });

    // Define the local debug namespace and echo incoming arguments.
    const dbgNsLocal = `${this.dbgNs}:constructor`;
    SfdxFalconDebug.obj(`${dbgNsLocal}:arguments:`, arguments);

    // Validate REQUIRED options.
    TypeValidator.throwOnEmptyNullInvalidObject(opts,                           `${dbgNsLocal}`, `ClassNameOptions`);
    TypeValidator.throwOnEmptyNullInvalidObject(opts.constructorOpts,           `${dbgNsLocal}`, `constructorOpts`);
    TypeValidator.throwOnEmptyNullInvalidString(opts.constructorOpts.optionOne, `${dbgNsLocal}`, `constructorOpts.optionOne`);

    // Validate OPTIONAL options.
    if (TypeValidator.isNotNullUndefined(opts.constructorOpts.optionTwo)) TypeValidator.throwOnEmptyNullInvalidString(opts.constructorOpts.optionTwo, `${dbgNsLocal}`, `constructorOpts.optionTwo`);

    // Initialize the Report Path.
    this._reportPath = `path/to/your/report.json`;

    // Perform initialization.
    // TODO: Add initialization logic here.
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      _generateReport
   * @return      {ClassNameReport} JSON representation of this `ClassName`
   *              object's status.
   * @description Generates a JSON representation providing details about the
   *              status of the operations performed by this `ClassName` object.
   * @protected
   */
  //───────────────────────────────────────────────────────────────────────────┘
  protected _generateReport():ClassNameReport {
    return {
      thingOne: 'something',
      thingTwo: 'something else'
    };
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      _prepare
   * @param       {ClassNameOptions}  [opts]  Optional. Represents the options
   *              required to construct/prepare this `SfdxFalconWorker`-derived
   *              object.
   * @return      {Promise<void>} Throws an error if preparation fails.
   * @description Prepares this `ClassName` object for use. Required when full
   *              preparation requires asynchronous operations which can't be
   *              carried out inside the `constructor`.
   * @protected @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  protected async _prepare(opts?:ClassNameOptions):Promise<void> {

    // Define local debug namespace and echo incoming arguments.
    const dbgNsLocal = `${this.dbgNs}:_prepare`;
    SfdxFalconDebug.obj(`${dbgNsLocal}:arguments:`, arguments);

    // Validate incoming options.
    if (typeof opts !== 'undefined') {

      // Validate the OPTIONS object.
      TypeValidator.throwOnNullInvalidObject(opts,              `${dbgNsLocal}`,  `ClassNameOptions`);
      TypeValidator.throwOnNullInvalidObject(opts.prepareOpts,  `${dbgNsLocal}`,  `prepareOpts`);

      // Validate REQUIRED Options.
      TypeValidator.throwOnEmptyNullInvalidString(opts.prepareOpts.optionOne, `${dbgNsLocal}`, `prepareOpts.optionOne`);
  
      // Validate OPTIONAL Options.
      if (TypeValidator.isNotNullUndefined(opts.prepareOpts.optionTwo)) TypeValidator.throwOnEmptyNullInvalidString(opts.prepareOpts.optionTwo, `${dbgNsLocal}`, `prepareOpts.optionTwo`);
    }
    else {

      // Initialize an empty opts object.
      opts = {
        constructorOpts: undefined,
        prepareOpts: {
          optionOne:  undefined,
          optionTwo:  undefined
        }
      };
    }

    // Do stuf to prepare this instance...
    // **STUFF**
    return;
  }
}
