//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @author        Vivek M. Chawla <@VivekMChawla>
 * @copyright     2019, Vivek M. Chawla / Salesforce. All rights reserved.
 * @license       BSD-3-Clause For full license text, see the LICENSE file in the repo root or
 *                `https://opensource.org/licenses/BSD-3-Clause`
 * @file          packages/model/src/model.ts
 * @summary       Exports `SfdxFalconModel`, an abstract class for building classes that encapsulate
 *                a domain model, including associated domain-specific operations.
 * @description   Exports `SfdxFalconModel`, an abstract class for building classes that encapsulate
 *                a domain model, including associated domain-specific operations. **Model** classes
 *                implement several state management methods which allow the **Model** class to be
 *                built, loaded, or reloaded as needed.
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
// Import External Libraries, Modules, and Types
//import  * as  fse           from  'fs-extra';               // Module that adds a few extra file system methods that aren't included in the native fs module. It is a drop in replacement for fs.

// Import SFDX-Falcon Libraries
import  {TypeValidator}     from  '@sfdx-falcon/validator'; // Library. Collection of Type Validation helper functions.

// Import SFDX-Falcon Classes & Functions
import  {SfdxFalconDebug}   from  '@sfdx-falcon/debug';     // Class. Provides custom "debugging" services (ie. debug-style info to console.log()).
import  {SfdxFalconError}   from  '@sfdx-falcon/error';     // Class. Extends SfdxError to provide specialized error structures for SFDX-Falcon modules.

// Import SFDX-Falcon Types
//import  {AnyConstructor}    from  '@sfdx-falcon/types';     // Type. A constructor for any type T. T defaults to object when not explicitly supplied.
//import  {JsonMap}           from  '@sfdx-falcon/types';     // Interface. Any JSON-compatible object.

// Set the File Local Debug Namespace
const dbgNs = '@sfdx-falcon:model';
SfdxFalconDebug.msg(`${dbgNs}:`, `Debugging initialized for ${dbgNs}`);


//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * Interface. Collection of state representations for an `SfdxFalconModel`.
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export interface ModelState {
  /**
   * Indicates that the model was made ready via `SfdxFalconModel.build()`.
   */
  built:        boolean;
  /**
   * Indicates that the model was made ready via `SfdxFalconModel.load()`.
   */
  loaded:       boolean;
  /**
   * Indicates that the model encountered one or more errors during building/loading.
   */
  failed:       boolean;
  /**
   * Indicates that the model has been either `built` or `loaded` and is now ready for use.
   */
  ready:        boolean;
  /**
   * Indicates that information in the model may no longer be relevant and should be refreshed.
   */
  stale:        boolean;
}

//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * Interface. Represents options that can be passed to the `SfdxFalconModel` constructor.
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export interface SfdxFalconModelOptions {
  /**
   * Optional. Sets the base debug namespace (`this.dbgNs`) of the class being instantiated. Useful
   * for normalizing the namespace when set by the code that's instantiating an `SfdxFalconModel`
   * derived class. Defaults to `@sfdx-falcon:model` if not provided.
   */
  dbgNsExt?:    string;
  /**
   * Optional. Indicates whether errors during model building/loading should be captured.
   */
  trapErrors?:  boolean;
}

//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @abstract
 * @class       SfdxFalconModel
 * @summary     Abstract class for building classes that encapsulate a domain model, including
 *              associated domain-specific operations.
 * @description Classes that extend `SfdxFalconModel` must implement several state management
 *              methods which allow the model represented by the derived class to be built,
 *              loaded, and/or reloaded as needed.
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export abstract class SfdxFalconModel {

  /**
   * Indicates whether errors during model building/loading should be captured.
   */
  protected trapErrors: boolean;
  /**
   * The debug namespace for this instance. Set automatically by the constructor in the
   * `SfdxFalconWorker` base class.
   */
  private readonly _dbgNs:  string;
  /**
   * Tracks the state (`built`/`loaded`/`ready`/`stale`) of this model.
   */
  private readonly _state:  ModelState;
  /**
   * Collection of `SfdxFalconError` objects that were trapped during building/loading.
   */
  private readonly _errors: SfdxFalconError[];
  /**
   * Options object that was provided to the `build()` method. These options will be reused
   * if the model is refreshed.
   */
  private _buildOpts:  object;
  /**
   * Options object that was provided to the `load()` method. These options will be reused
   * if the model is refreshed.
   */
  private _loadOpts:  object;
  /**
   * The debug namespace for this instance. Will always return `@sfdx-falcon:worker`
   * appended by `:` and the name of the derived class, eg. `@sfdx-falcon:worker:MyCustomWorker`.
   */
  public get dbgNs() { return this._dbgNs; }
  /**
   * Indicates wheter or not the methods and properties of this instance are ready for use.
   */
  public get ready() { return this._state.ready; }
  /**
   * Indicates wheter or not the model was made ready via the `build()` method.
   */
  public get built() { return this._state.built; }
  /**
   * Indicates wheter or not the model was made ready via the `loaded()` method.
   */
  public get loaded() { return this._state.loaded; }
  /**
   * Indicates that an error was trapped while executing the `build()`, `load()`, or `refresh()` method.
   */
  public get failed() { return this._state.failed; }
  /**
   * Indicates wheter or not the model currently requires a refresh.
   */
  public get stale() { return this._state.stale; }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @constructs  SfdxFalconModel
   * @param       {SfdxFalconModelOptions} [opts]  Optional. Allows the caller
   *              to customize how this `SfdxFalconModel`-derived object is
   *              constructed.
   * @description Constructs an `SfdxFalconModel` object.
   * @public
   */
  //───────────────────────────────────────────────────────────────────────────┘
  public constructor(opts?:SfdxFalconModelOptions) {

    // Define the local and external debug namespaces.
    const funcName          = `constructor`;
    const derivedClassName  = this.constructor.name;
    const dbgNsLocal        = `${dbgNs}:${funcName}`;
    const dbgNsExt          = `${determineDbgNsExt(opts, derivedClassName, dbgNs)}`;

    // Debug the incoming arguments.
    SfdxFalconDebug.obj(`${dbgNsLocal}:arguments:`, arguments);
    if (dbgNsLocal !== dbgNsExt) SfdxFalconDebug.obj(`${dbgNsExt}:arguments:`, arguments);

    // If the caller provided options, make sure it's a valid object. Otherwise just initialize an empty object.
    if (typeof opts !== 'undefined') {
      TypeValidator.throwOnNullInvalidObject(opts, `${dbgNsExt}:${funcName}`, `SfdxFalconModelOptions`);
    }
    else {
      opts = {};
    }

    // Validate the members of the options object, if provided.
    if (typeof opts.dbgNsExt    !== 'undefined')  TypeValidator.throwOnEmptyNullInvalidString (opts.dbgNsExt,   `${dbgNsExt}:${funcName}`,  `SfdxFalconModelOptions.dbgNsExt`);
    if (typeof opts.trapErrors  !== 'undefined')  TypeValidator.throwOnNullInvalidBoolean     (opts.trapErrors, `${dbgNsExt}:${funcName}`,  `SfdxFalconModelOptions.trapErrors`);

    // Initialize member variables.
    this.trapErrors   = (typeof opts.trapErrors !== 'undefined') ? opts.trapErrors : false;
    this._dbgNs       = `${dbgNsExt}`;
    this._errors      = [];
    this._buildOpts   = {};
    this._loadOpts    = {};
    this._state       = {
      built:        false,
      loaded:       false,
      failed:       false,
      ready:        false,
      stale:        false
    };

    // Call the initialize() method.
    try {
      this.initialize();
    }
    catch (initializationError) {
      throw new SfdxFalconError	( `Constructor initialization failed. ${initializationError.message}`
                                , `InitializationError`
                                , `${dbgNsExt}:${funcName}`
                                , initializationError);
    }
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      build
   * @param       {T=object}  [opts]  Optional. Build-specific options.
   * @return      {Promise<ModelState>}  Representation of this `SfdxFalconModel`
   *              object's state at the conclusion of the build process.
   * @description Executes the `_build()` method from the dervied class and
   *              traps any errors if `this.trapErrors` is set to `true`. Returns
   *              the state of the model once build stops.
   * @public @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  public async build<T extends object = object>(opts?:T):Promise<ModelState> {

    // Define function-local and external debug namespaces.
    const funcName    = `build`;
    const dbgNsLocal  = `${dbgNs}:${funcName}`;
    const dbgNsExt    = `${this._dbgNs}:${funcName}`;
    
    // Debug incoming arguments.
    SfdxFalconDebug.obj(`${dbgNsLocal}:arguments:`, arguments);
    SfdxFalconDebug.obj(`${dbgNsExt}:arguments:`,   arguments);
    
    // Make sure this model has not already been initialzied/loaded.
    if (this._state.ready) {
      throw new SfdxFalconError	( `This model has already been built/loaded. Use this `
                                + `object's refresh() method if rebuilding is required.`
                                , `BuildError`
                                , `${dbgNsExt}`);
    }

    // If provided, Make sure that the `opts` argument is an object
    if (typeof opts !== 'undefined') {
      TypeValidator.throwOnEmptyNullInvalidObject(opts,	`${dbgNsExt}`,	`BuildOptions`);
    }
    else {
      opts = {} as T;
    }

    // Keep a copy of the Options object that the caller provided.
    this._buildOpts = opts;

    // Build the model using the method implemented by the derived class.
    await this._build<T>(opts)
    .then((success:boolean) => {
      if (success) {
        this._state.built   = true;
        this._state.ready   = true;
        this._state.loaded  = false;
        this._state.failed  = false;
        this._state.stale   = false;
      }
      else {
        throw new SfdxFalconError ( `The _build() function failed but did not provide specifics.`
                                  , `BuildError`
                                  , `${dbgNsExt}`);
      }
    })
    .catch((buildError:Error) => {
      this._state.failed  = true;
      this._state.ready   = false;
      this._state.built   = false;
      this._state.loaded  = false;
      this._state.stale   = false;

      // Craft an SfdxFalconError to either trap or throw.
      const caughtError = new SfdxFalconError	( `The _build() function failed. ${buildError.message}`
                                              , `BuildError`
                                              , `${dbgNsExt}`
                                              , buildError);
      SfdxFalconDebug.obj(`${dbgNsLocal}:caughtError:`, caughtError);
      SfdxFalconDebug.obj(`${dbgNsExt}:caughtError:`,   caughtError);
      
      // Save the caught Error.
      this._errors.push(caughtError);

      // Throw the error unless the caller has asked to Trap Errors.
      if (this.trapErrors !== true) {
        throw caughtError;
      }
    });
    
    // Return the final state of this Model.
    SfdxFalconDebug.obj(`${dbgNsLocal}:ModelState:`, this._state);
    SfdxFalconDebug.obj(`${dbgNsExt}:ModelState:`,   this._state);
    return this._state;
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      load
   * @param       {T=object}  [opts]  Optional. Loading-specific options.
   * @return      {Promise<ModelState>}  Representation of this `SfdxFalconModel`
   *              object's state at the conclusion of the loading process.
   * @description Executes the `_load()` method from the dervied class and
   *              traps any errors if `this.trapErrors` is set to `true`. Returns
   *              the state of the model once loading stops.
   * @public @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  public async load<T extends object = object>(opts?:T):Promise<ModelState> {

    // Define function-local and external debug namespaces.
    const funcName    = `load`;
    const dbgNsLocal  = `${dbgNs}:${funcName}`;
    const dbgNsExt    = `${this._dbgNs}:${funcName}`;
    
    // Debug incoming arguments.
    SfdxFalconDebug.obj(`${dbgNsLocal}:arguments:`, arguments);
    SfdxFalconDebug.obj(`${dbgNsExt}:arguments:`,   arguments);
    
    // Make sure this model has not already been initialzied/loaded.
    if (this._state.ready) {
      throw new SfdxFalconError	( `This model has already been built/loaded. Use this `
                                + `object's refresh() method if reloading is required.`
                                , `LoadError`
                                , `${dbgNsExt}`);
    }

    // If provided, Make sure that the `opts` argument is an object
    if (typeof opts !== 'undefined') {
      TypeValidator.throwOnEmptyNullInvalidObject(opts,	`${dbgNsExt}`,	`LoadOptions`);
    }
    else {
      opts = {} as T;
    }

    // Keep a copy of the Options object that the caller provided.
    this._loadOpts = opts;
    
    // Load the model using the method implemented by the derived class.
    await this._load<T>(opts)
    .then((success:boolean) => {
      if (success) {
        this._state.loaded  = true;
        this._state.ready   = true;
        this._state.built   = false;
        this._state.failed  = false;
        this._state.stale   = false;
      }
      else {
        throw new SfdxFalconError ( `The _load() function failed but did not provide specifics.`
                                  , `LoadError`
                                  , `${dbgNsExt}`);
      }
    })
    .catch((loadError:Error) => {
      this._state.failed  = true;
      this._state.ready   = false;
      this._state.loaded  = false;
      this._state.built   = false;
      this._state.stale   = false;

      // Craft an SfdxFalconError to either trap or throw.
      const caughtError = new SfdxFalconError	( `The _load() function failed. ${loadError.message}`
                                              , `LoadError`
                                              , `${dbgNsExt}`
                                              , loadError);
      SfdxFalconDebug.obj(`${dbgNsLocal}:caughtError:`, caughtError);
      SfdxFalconDebug.obj(`${dbgNsExt}:caughtError:`,   caughtError);
      
      // Save the caught Error.
      this._errors.push(caughtError);

      // Throw the error unless the caller has asked to Trap Errors.
      if (this.trapErrors !== true) {
        throw caughtError;
      }
    });
    
    // Return the final state of this Model.
    return this._state;
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      refresh
   * @return      {Promise<ModelState>}  Representation of this `SfdxFalconModel`
   *              object's state at the conclusion of the refresh process.
   * @description Executes either the `_load()` or `_build()` method from
   *              the dervied class, depending on which one was used to
   *              initially put the Model into a `ready` state. Will also trap
   *              any errors if `this.trapErrors` is set to `true`. Returns
   *              the state of the model once the refresh stops.
   * @public @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  public async refresh():Promise<ModelState> {

    // Define function-local and external debug namespaces.
    const funcName    = `refresh`;
    const dbgNsLocal  = `${dbgNs}:${funcName}`;
    const dbgNsExt    = `${this._dbgNs}:${funcName}`;
    
    // Debug incoming arguments.
    SfdxFalconDebug.obj(`${dbgNsLocal}:arguments:`, arguments);
    SfdxFalconDebug.obj(`${dbgNsExt}:arguments:`,   arguments);
    
    // Make sure this model HAS already been initialzied/loaded.
    if (this._state.ready !== true) {
      throw new SfdxFalconError	( `This model has not been built/loaded. The refresh() method `
                                + `can only be called after a successful call to build() or load().`
                                , `RefreshError`
                                , `${dbgNsExt}`);
    }

    // Initialize the model to reset everything to the starting state.
    this.initialize();

    // Refresh via `_build()`.
    if (this.built === true && this.loaded === false) {
      TypeValidator.throwOnNullInvalidObject(this._buildOpts,	`${dbgNsExt}`,	`cached Build Options (this._buildOpts)`);
      await this._build(this._buildOpts)
      .then((success:boolean) => {
        if (success) {
          this._state.ready   = true;
          this._state.failed  = false;
        }
        else {
          throw new SfdxFalconError ( `The _build() function failed during refresh but did not provide specifics.`
                                    , `RefreshError`
                                    , `${dbgNsExt}`);
        }
      })
      .catch((buildError:Error) => {
        this._state.ready   = false;
        this._state.failed  = true;
  
        // Craft an SfdxFalconError to either trap or throw.
        const caughtError = new SfdxFalconError	( `The _build() function failed during refresh. ${buildError.message}`
                                                , `RefreshError`
                                                , `${dbgNsExt}`
                                                , buildError);
        SfdxFalconDebug.obj(`${dbgNsLocal}:caughtError:`, caughtError);
        SfdxFalconDebug.obj(`${dbgNsExt}:caughtError:`,   caughtError);
        
        // Save the caught Error.
        this._errors.push(caughtError);
  
        // Throw the error unless the caller has asked to Trap Errors.
        if (this.trapErrors !== true) {
          throw caughtError;
        }
      });
      
      // Return the final state of the REBUILT Model.
      SfdxFalconDebug.obj(`${dbgNsLocal}:RebuiltModelState:`, this._state);
      SfdxFalconDebug.obj(`${dbgNsExt}:RebuiltModelState:`,   this._state);
      return this._state;
    }

    // Refresh via `_load()`.
    if (this.loaded === true && this.built === false) {
      TypeValidator.throwOnNullInvalidObject(this._loadOpts,	`${dbgNsExt}`,	`cached Load Options (this._loadOpts)`);
      await this._load(this._loadOpts)
      .then((success:boolean) => {
        if (success) {
          this._state.ready   = true;
          this._state.failed  = false;
        }
        else {
          throw new SfdxFalconError ( `The _load() function failed during refresh but did not provide specifics.`
                                    , `RefreshError`
                                    , `${dbgNsExt}`);
        }
      })
      .catch((loadError:Error) => {
        this._state.failed  = true;
        this._state.ready   = false;
  
        // Craft an SfdxFalconError to either trap or throw.
        const caughtError = new SfdxFalconError	( `The _load() function failed during refresh. ${loadError.message}`
                                                , `RefreshError`
                                                , `${dbgNsExt}`
                                                , loadError);
        SfdxFalconDebug.obj(`${dbgNsLocal}:caughtError:`, caughtError);
        SfdxFalconDebug.obj(`${dbgNsExt}:caughtError:`,   caughtError);
        
        // Save the caught Error.
        this._errors.push(caughtError);
  
        // Throw the error unless the caller has asked to Trap Errors.
        if (this.trapErrors !== true) {
          throw caughtError;
        }
      });

      // Return the final state of the RELOADED Model.
      SfdxFalconDebug.obj(`${dbgNsLocal}:ReloadedModelState:`, this._state);
      SfdxFalconDebug.obj(`${dbgNsExt}:ReloadedModelState:`,   this._state);
      return this._state;
    }

    // If we get here, the state of the object was screwed up.
    throw new SfdxFalconError	( `The refresh failed because the Model was in an unexpected state.`
                              , `RefreshError`
                              , `${dbgNsExt}`
                              , null
                              , {modelState: this._state});
  }
    
  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      _build
   * @param       {T=object}  [opts]  Optional. Custom build options proxied
   *              to this method from the public `build()` method.
   * @return      {Promise<boolean>}
   * @description **IMPORTANT: Must be overriden by derived class**
   *              Performs the work of building this model. Must return `true` if
   *              building was successful, `false` (or throw an error) if not.
   *              This method is called by the public method `build()`, which is
   *              defined by the base class. Errors thrown by this method may
   *              be trapped by the base `build()` method if `this.trapErrors`
   *              is set to `true`.
   * @protected @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  protected async _build<T extends object = object>(opts?:T):Promise<boolean> {

    // Define external debug namespace.
    const funcName  = `_build`;
    const dbgNsExt  = `${this._dbgNs}:${funcName}`;

    // Throw an Error indicating this capability has not been implemented.
    throw new SfdxFalconError	( `The ability to build this Model has not been implemented. `
                              + `Please override the _build() method in the ${this.constructor.name} `
                              + `class if you'd like to support the use of this feature.`
                              , `ImplementationError`
                              , `${dbgNsExt}`);
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
  protected abstract _initialize():void;

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      isReady
   * @return      {boolean}
   * @description Returns `true` if the `_state.ready` member of an `SfdxFalconModel`
   *              derived instance is `true`. Throws an error otherwise.
   * @protected
   */
  //───────────────────────────────────────────────────────────────────────────┘
  protected isReady():boolean {

    // Define external debug namespace.
    const dbgNsExt = `${this._dbgNs}:isReady`;

    // Check if this instance is explicitly NOT ready (eg. strict inequality for `true`).
    if (this._state.ready !== true) {
      throw new SfdxFalconError ( `The operation against this ${this.constructor.name} object is not allowed until the model is ready.`
                                , `ModelNotReady`
                                , `${dbgNsExt}`);
    }
    else {
      return this._state.ready;
    }
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      _load
   * @param       {T=object}  [opts]  Optional. Custom load options proxied
   *              to this method from the public `load()` method.
   * @return      {Promise<boolean>}
   * @description **IMPORTANT: Must be overriden by derived class**
   *              Performs the work of loading this model. Must return `true` if
   *              loading was successful, `false` (or throw an error) if not.
   *              This method is called by the public method `load()`, which is
   *              defined by the base class. Errors thrown by this method may
   *              be trapped by the base `load()` method if `this.trapErrors`
   *              is set to `true`.
   * @protected @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  protected async _load<T extends object = object>(opts?:T):Promise<boolean> {

    // Define external debug namespace.
    const funcName  = `_load`;
    const dbgNsExt  = `${this._dbgNs}:${funcName}`;

    // Throw an Error indicating this capability has not been implemented.
    throw new SfdxFalconError	( `The ability to load this Model has not been implemented. `
                              + `Please override the _load() method in the ${this.constructor.name} `
                              + `class if you'd like to support the use of this feature.`
                              , `ImplementationError`
                              , `${dbgNsExt}`);
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      initialize
   * @return      {void}
   * @description Initializes member variables and structures. Calls the
   *              `_initialize()` method implemented by the derived class to
   *              perform implementation-specific initialization.
   * @private
   */
  //───────────────────────────────────────────────────────────────────────────┘
  private initialize():void {

    // Define the external debug namespace.
    const dbgNsExt = `${this._dbgNs}:initialize`;

    // Ensure that READY and STALE states are set to `false`.
    this._state.ready   = false;
    this._state.stale   = false;

    // Ask the derived class to initialize the member vars it cares about.
    try {
      this._initialize();
    }
    catch (initializationError) {
      throw new SfdxFalconError	( `Member variables for this model could not be initialized. ${initializationError.message}`
                                , `InitializationError`
                                , `${dbgNsExt}`
                                , initializationError);
    }
  }
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    determineDbgNsExt
 * @param       {SfdxFalconWorkerOptions} opts  Required. Options passed to the `SfdxFalconModel`
 *              constructor.
 * @param       {string}  derivedClassName  Required. Name of the class extending `SfdxFalconModel`.
 * @param       {string}  dbgNsAlt  Required. Alternative DbgNs to be used if the `opts` argument
 *              did not contain a valid `dbgNsExt` string member.
 * @returns     {string}  The correct External Debug Namespace based on the provided values.
 * @description Given an `SfdxFalconModelOptions` object, the name of the derived class, and an
 *              alternative debug namespace to use if the `SfdxFalconModelOptions` don't have the
 *              appropriate info, returns the correct External Debug Namespace string.
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
function determineDbgNsExt(opts:SfdxFalconModelOptions, derivedClassName:string, dbgNsAlt:string):string {

  // Define local debug namespace.
  const dbgNsLocal = `${dbgNs}:determineDbgNsExt`;

  // Validate arguments.
  TypeValidator.throwOnEmptyNullInvalidString(derivedClassName, `${dbgNsLocal}`,  `derivedClassName`);
  TypeValidator.throwOnEmptyNullInvalidString(dbgNsAlt,         `${dbgNsLocal}`,  `dbgNsAlt`);

  // Construct the appropriate External Debug Namespace.
  const dbgNsExt =  (TypeValidator.isNotEmptyNullInvalidObject(opts) && TypeValidator.isNotEmptyNullInvalidString(opts.dbgNsExt))
                    ? `${opts.dbgNsExt}:${derivedClassName}`
                    : dbgNsAlt;
  SfdxFalconDebug.str(`${dbgNsLocal}:dbgNsExt:`, dbgNsExt);
  return dbgNsExt;
}
