//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @file          modules/sfdx-falcon-util/csv.ts
 * @copyright     Vivek M. Chawla - 2019
 * @author        Vivek M. Chawla <@VivekMChawla>
 * @summary       CSV file helper utility library
 * @description   Exports functions that help work with CSV files.
 * @version       1.0.0
 * @license       MIT
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
// Import External Libraries & Modules
import  {JsonMap}         from  '@salesforce/ts-types'; // Any JSON-compatible object.
import  * as  csv2json    from  'csv-parser';           // Streaming CSV parser that aims for maximum speed as well as compatibility with the csv-spectrum CSV acid test suite.
import  * as  fse         from  'fs-extra';             // Module that adds a few extra file system methods that aren't included in the native fs module. It is a drop in replacement for fs.
import  * as  json2csv    from  'json2csv';             // Converts json into csv with column titles and proper line endings.
import  * as  path        from  'path';                 // Node's path library.

// Import Internal Modules
import {SfdxFalconDebug}  from  '../../modules/sfdx-falcon-debug';      // Class. Specialized debug provider for SFDX-Falcon code.
import {SfdxFalconError}  from  '../../modules/sfdx-falcon-error';      // Class. Specialized Error object. Wraps SfdxError.

/**
 * Interface. Represents the options that can/must be passed to the CsvFile constructor.
 */
export interface CsvFileOptions {
  csv2jsonOpts?:  Csv2JsonOptions;
  csvData?:       string;
  csvHeaders?:    string[];
  directory:      string;
  fileName:       string;
  json2csvOpts?:  Json2CsvOptions;
  jsonData?:      JsonMap[];
}

/**
 * Type. Represents the options that are available when converting CSV to JSON. See https://www.npmjs.com/package/csv-parser for documentation.
 */
export type Csv2JsonOptions = csv2json.Options;

/**
 * Type. Represents the options that are available when converting JSON to CSV. See https://www.npmjs.com/package/json2csv for documentation.
 */
export type Json2CsvOptions = import('json2csv/JSON2CSVBase').json2csv.Options<JsonMap>;

// Set the File Local Debug Namespace
const dbgNs = 'UTILITY:csv:';
SfdxFalconDebug.msg(`${dbgNs}`, `Debugging initialized for ${dbgNs}`);


//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @class       CsvFile
 * @description Class. Makes common operations with CSV files easier to implement.
 * @public
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export class CsvFile {

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      create
   * @param       {JsonMap[]} jsonData  Required. Array of JSON data used to
   *              build each CSV file row.
   * @param       {string}  csvFilePath Required. Complete path to the location
   *              that the caller would like to write the CSV file to.
   * @param       {Json2CsvOptions} opts  Required. CSV file creation options.
   * @return      {Promise<CsvFile>}
   * @description Given an array of JSON data and a path to location where the
   *              caller wants the CSV file to be created, parses the JSON data
   *              and creates a representation of a CSV file in memory. The
   *              resulting CsvFile object can then be used to write this CSV
   *              File to disk at the specified CSV File Path.
   * @public @static @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  public static async create(jsonData:JsonMap[], csvFilePath:string, opts:Json2CsvOptions):Promise<CsvFile> {

    // Create a CsvFile object.
    const csvFile = new CsvFile({
      directory:    path.dirname(csvFilePath),
      fileName:     path.basename(csvFilePath),
      jsonData:     jsonData,
      json2csvOpts: opts
    });

    // Attempt to build CSV data from the JSON data provided by the caller.
    await csvFile.build();
    
    // Mark the CsvFile object as "prepared".
    csvFile._prepared = true;

    // Pass the CsvFile object back to the caller.
    return csvFile;
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      load
   * @param       {string}  csvFilePath Required. Complete path to the CSV file
   *              that the caller wants to load and parse into JSON.
   * @param       {Csv2JsonOptions} [opts]  Optional. CSV file parser options.
   * @return      {Promise<CsvFile>}
   * @description Given the path to a CSV file, instantiates a CsvFile object
   *              then prepares it by parsing the contents the CSV file, making
   *              the data available as an array of JSON data.
   * @public @static @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  public static async load(csvFilePath:string, opts:Csv2JsonOptions):Promise<CsvFile> {

    // Create a CsvFile object.
    const csvFile = new CsvFile({
      directory:    path.dirname(csvFilePath),
      fileName:     path.basename(csvFilePath),
      csv2jsonOpts: opts
    });
   
    // Attempt to parse the CSV file to JSON
    csvFile._jsonData = await parseFile(csvFile._filePath, csvFile._csv2jsonOpts);

    // Mark the CsvFile object as "prepared".
    csvFile._prepared = true;

    // Pass the CsvFile object back to the caller.
    return csvFile;
  }

  // Private Members
  private   _csv2jsonOpts:  import('../sfdx-falcon-util/csv').Csv2JsonOptions;  // ???
  private   _csvData:       string;     // String containing a CSV representation of data.
  private   _csvHeaders:    string[];   // ???
  private   _directory:     string;     // Resolved path to the directory where the CSV File lives (eg. "/Users/vchawla/my-project/").
  private   _filePath:      string;     // Resolved path (directory+filename) to where the CSV File lives (eg. "/Users/vchawla/my-project/my-data.csv").
  private   _fileName:      string;     // Name of the CSV File (eg. "my-data.csv").
  private   _json2csvOpts:  import('../sfdx-falcon-util/csv').Json2CsvOptions;  // ???
  private   _jsonData:      JsonMap[];  // ???
  private   _prepared:      boolean;    // ???
  private   _released:      boolean;    // ???

  // Public Accessors
  public get csv2jsonOpts()   { return this.isPrepared() ? this._csv2jsonOpts : undefined; }
  public get csvData()        { return this.isPrepared() ? this._csvData      : undefined; }
  public get csvHeaders()     { return this.isPrepared() ? this._csvHeaders   : undefined; }
  public get directory()      { return this.isPrepared() ? this._directory    : undefined; }
  public get filePath()       { return this.isPrepared() ? this._filePath     : undefined; }
  public get fileName()       { return this.isPrepared() ? this._fileName     : undefined; }
  public get json2csvOpts()   { return this.isPrepared() ? this._json2csvOpts : undefined; }
  public get jsonData()       { return this.isPrepared() ? this._jsonData     : undefined; }
  public get prepared()       { return this._prepared; }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @constructs  CsvFile
   * @param       {CsvFileOptions} opts
   * @description Constructs a CsvFile object.
   * @private
   */
  //───────────────────────────────────────────────────────────────────────────┘
  private constructor(opts:CsvFileOptions) {

    // Debug incoming arguments.
    SfdxFalconDebug.obj(`${dbgNs}CsvFile:constructor:arguments:`, arguments);

    // Initialize member variables based on the provided options.
    this._csv2jsonOpts    = opts.csv2jsonOpts   ||  {};
    this._csvData         = opts.csvData        ||  '';
    this._csvHeaders      = opts.csvHeaders     ||  [];
    this._directory       = opts.directory      ||  path.resolve('.');
    this._fileName        = opts.fileName       ||  'unknown.csv';
    this._json2csvOpts    = opts.json2csvOpts   ||  {};
    this._jsonData        = opts.jsonData       ||  [];

    // Construct a complete File Path by joining the directory and file name.
    this._filePath = path.join(this._directory, this._fileName);

    // Validate the current state of this CSV File object.
    this.validateInitialization();

    // Initialize as NOT prepared. Factory methods must explicitly mark the instance as prepared.
    this._prepared  = false;

    // Initialize as NOT released. This should ONLY be marked as TRUE by the release() instance method.
    this._released  = false;
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      build
   * @return      {Promise<void>}
   * @description Using the array of JSON objects stored by the _jsonData member
   *              variable and the JSON-to-CSV options stored by _json2csvOpts,
   *              builds a CSV representation and stores the result in the
   *              _csvData member variable.
   * @public @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  public async build():Promise<void> {
    this._csvData = await buildCsvData(this._jsonData, this._json2csvOpts)
    .catch(buildCsvError => {
      throw new SfdxFalconError ( `Error occured while building CSV data.`
                                , `CsvBuildError`
                                , `${dbgNs}CsvFile:build`
                                , buildCsvError);
    });
    SfdxFalconDebug.str(`${dbgNs}CsvFile:build:_csvData:`, this._csvData);
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      release
   * @return      {void}
   * @description Sets all internal references to NULL in hopes that the garbage
   *              collector will reclaim memory that's no longer needed. This
   *              is most useful when dealing with very large data sets.
   * @public
   */
  //───────────────────────────────────────────────────────────────────────────┘
  public release():void {

    // Null out all member variables.
    this._csv2jsonOpts  = null;
    this._csvData       = null;
    this._csvHeaders    = null;
    this._directory     = null;
    this._filePath      = null;
    this._fileName      = null;
    this._jsonData      = null;
    this._json2csvOpts  = null;
    this._prepared      = null;

    // Mark this CsvFile object as RELEASED.
    this._released      = true;
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      save
   * @param       {boolean} [rebuildCsvData=false]  Optional. Allows the caller
   *              to specify that the CSV Data should be rebuilt before saving
   *              it to disk.
   * @param       {string}  [csvFilePath] Optional. Allows the caller to override
   *              the target file path where the CSV file will be written to.
   * @return      {Promise<void>}
   * @description Using the path stored by the _filePath member variable, or the
   *              optional CSV File Path argument (if provided), takes the
   *              previously-built contents in the _csvData member variable and
   *              writes it to the local filesystem.
   * @public @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  public async save(rebuildCsvData:boolean=false, csvFilePath:string=''):Promise<void> {

    // Debug incoming arguments
    SfdxFalconDebug.obj(`${dbgNs}CsvFile:save:arguments:`, arguments);

    // Make sure this instance is Prepared.
    this.isPrepared();

    // Sort out the incoming arguments in case the caller specified csvFilePath but not rebuildCsvData.
    if (typeof rebuildCsvData !== 'boolean') {
      csvFilePath     = rebuildCsvData;
      rebuildCsvData  = false;
    }
    if (typeof csvFilePath !== 'string') {
      csvFilePath = '';
    }

    // If the caller didn't specify a new CSV File Path, use the member variable.
    csvFilePath = csvFilePath || this._filePath;

    // Make sure that the csvFilePath is a non-empty string.
    if (typeof csvFilePath !== 'string' || csvFilePath === '') {
      throw new SfdxFalconError( `Expected csvFilePath to be a non-empty string but got type '${typeof csvFilePath}' instead.`
                               , `TypeError`
                               , `${dbgNs}CsvFile:save`);
    }

    // Make sure that we have a resolved path
    csvFilePath = path.resolve(csvFilePath);
    SfdxFalconDebug.str(`${dbgNs}CsvFile:save:csvFilePath:`, csvFilePath);

    // Make sure the destination CSV File Path is writeable by trying to create an empty file there.
    await writeStringToFile(csvFilePath, '')
    .catch(writeError => {
      throw new SfdxFalconError ( `CSV File save operation failed. The path '${csvFilePath}' is not writeable.`
                                , `CsvFileSaveError`
                                , `${dbgNs}CsvFile:save`
                                , writeError);
    });

    // Write the CSV File to the local filesystem.
    return writeStringToFile(this._csvData, csvFilePath)
    .catch(writeError => {
      throw new SfdxFalconError ( `CSV File save operation failed. Could not write '${csvFilePath}' to the local filesystem.`
                                , `CsvFileSaveError`
                                , `${dbgNs}CsvFile:save`
                                , writeError);
    });
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      isPrepared
   * @return      {boolean}
   * @description Returns true if an object instance is prepared. Throws an
   *              error otherwise.
   * @protected
   */
  //───────────────────────────────────────────────────────────────────────────┘
  private isPrepared():boolean {
    if (this._released === true) {
      throw new SfdxFalconError ( `Operations against CsvFile objects are not permitted once the instance has been released.`
                                , `ObjectReleased`
                                , `${dbgNs}CsvFile:isPrepared`);
    }
    if (this._prepared !== true) {
      throw new SfdxFalconError ( `Operations against CsvFile objects are not available until the instance is prepared`
                                , `ObjectNotPrepared`
                                , `${dbgNs}CsvFile:isPrepared`);
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

    // CSV-to-JSON Options must be a non-null object.
    if (typeof this._csv2jsonOpts !== 'object' || this._csv2jsonOpts === null) {
      throw new SfdxFalconError ( `Expected csv2jsonOpts to be a non-null object${typeof this._csv2jsonOpts !== 'object' ? ` but got '${typeof this._csv2jsonOpts}' instead.` : `.`}`
                                , `InitialzationError`
                                , `${dbgNs}CsvFile:validateInitialization`);
    }
    // CSV Data must be a non-null string.
    if (typeof this._csvData !== 'string' || this._csvData === null) {
      throw new SfdxFalconError ( `Expected csvData to be a non-null string${typeof this._csvData !== 'string' ? ` but got '${typeof this._csvData}' instead.` : `.`}`
                                , `InitialzationError`
                                , `${dbgNs}CsvFile:validateInitialization`);
    }
    // CSV Headers must be a non-null array.
    if (Array.isArray(this._csvHeaders) !== true || this._csvHeaders === null) {
      throw new SfdxFalconError ( `Expected csvHeaders to be a non-null array${Array.isArray(this._csvHeaders) !== true ? ` but got '${typeof this._csvHeaders}' instead.` : `.`}`
                                , `InitialzationError`
                                , `${dbgNs}CsvFile:validateInitialization`);
    }
    // Directory must be a non-empty, non-null string.
    if (typeof this._directory !== 'string' || this._directory === '' || this._directory === null) {
      throw new SfdxFalconError ( `Expected directory to be a non-empty, non-null string${typeof this._directory !== 'string' ? ` but got '${typeof this._directory}' instead.` : `.`}`
                                , `InitialzationError`
                                , `${dbgNs}CsvFile:validateInitialization`);
    }
    // File Name must be a non-empty, non-null string.
    if (typeof this._fileName !== 'string' || this._fileName === '' || this._fileName === null) {
      throw new SfdxFalconError ( `Expected fileName to be a non-empty, non-null string${typeof this._fileName !== 'string' ? ` but got '${typeof this._fileName}' instead.` : `.`}`
                                , `InitialzationError`
                                , `${dbgNs}CsvFile:validateInitialization`);
    }
    // File Path must be a non-empty, non-null string.
    if (typeof this._filePath !== 'string' || this._filePath === '' || this._filePath === null) {
      throw new SfdxFalconError ( `Expected filePath to be a non-empty, non-null string${typeof this._filePath !== 'string' ? ` but got '${typeof this._filePath}' instead.` : `.`}`
                                , `InitialzationError`
                                , `${dbgNs}CsvFile:validateInitialization`);
    }
    // JSON-to-CSV Options must be a non-null object.
    if (typeof this._json2csvOpts !== 'object' || this._json2csvOpts === null) {
      throw new SfdxFalconError ( `Expected json2csvOpts to be a non-null object${typeof this._json2csvOpts !== 'object' ? ` but got '${typeof this._json2csvOpts}' instead.` : `.`}`
                                , `InitialzationError`
                                , `${dbgNs}CsvFile:validateInitialization`);
    }
    // JSON Data must be a non-null array.
    if (Array.isArray(this._jsonData) !== true || this._jsonData === null) {
      throw new SfdxFalconError ( `Expected jsonData to be a non-null array${Array.isArray(this._jsonData) !== true ? ` but got '${typeof this._jsonData}' instead.` : `.`}`
                                , `InitialzationError`
                                , `${dbgNs}CsvFile:validateInitialization`);
    }
  }
}

//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    buildCsvData
 * @param       {JsonMap[]} jsonData  Required. Array of JSON data used to build the CSV data.
 * @param       {Json2CsvOptions} opts  Required. CSV data creation options.
 * @returns     {Promise<string>} The resulting CSV data.
 * @description Given an array of JSON data and the options required by the JSON-to-CSV process,
 *              parses the JSON data and creates a representation of that data in CSV format.
 * @public @async
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export async function buildCsvData(jsonData:JsonMap[], opts:Json2CsvOptions):Promise<string> {

  // Debug incoming arguments
  SfdxFalconDebug.obj(`${dbgNs}buildCsvData:arguments:`, arguments);

  // Validate incoming arguments
  validateJsonDataArgument(jsonData);
  
  // Parse the JSON Data into CSV Data.
  const csvData:string = await json2csv.parseAsync(jsonData, opts)
  .catch(json2csvError => {
    throw new SfdxFalconError ( `Could not parse JSON to CSV. ${json2csvError.message}`
                              , `Json2CsvParseError`
                              , `${dbgNs}buildCsvData`
                              , json2csvError);
  });

  // DEBUG
  SfdxFalconDebug.str(`${dbgNs}buildCsvData:csvData:`, csvData);

  // Send the CSV Data back to the caller.
  return csvData;
}

//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    createFile
 * @param       {JsonMap[]} jsonData  Required. Array of JSON data used to build each CSV file row.
 * @param       {string}  csvFilePath Required. Path to where the CSV file should be created.
 * @param       {Json2CsvOptions} opts  Required. CSV file creation options.
 * @returns     {Promise<string>} The contents of the resulting CSV file.
 * @description Given JSON data and a path to location where the caller wants the CSV file to be
 *              created, parses the JSON data and creates a representation of a CSV file in memory
 *              before writing it to disk at the specified location.
 * @public @async
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export async function createFile(jsonData:JsonMap[], csvFilePath:string, opts:Json2CsvOptions):Promise<string> {

  // Debug incoming arguments
  SfdxFalconDebug.obj(`${dbgNs}createFile:arguments:`, arguments);

  // Validate incoming arguments
  validateJsonDataArgument(jsonData);
  
  // Make sure the destination CSV File Path is writeable by trying to create an empty file there.
  await writeStringToFile(csvFilePath, '');
  
  // Parse the JSON Data into CSV Data.
  const csvData:string = await buildCsvData(jsonData, opts)
  .catch(buildCsvError => {
    throw new SfdxFalconError ( `Could not create the CSV file. There was an error while building the CSV data.`
                              , `CsvBuildError`
                              , `${dbgNs}createFile`
                              , buildCsvError);
  });

  // Write the CSV Data to disk.
  await writeStringToFile(csvFilePath, csvData);

  // Send the CSV Data back to the caller.
  return csvData;
}

//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    parseFile
 * @param       {string}  csvFilePath Required. Path to a CSV file.
 * @param       {Csv2JsonOptions} [opts]  Optional. Options for the CSV file parser.
 * @returns     {Promise<JsonMap[]>} Array of JSON Maps, one for each row of the CSV file.
 * @description Given the path to a valid CSV file, parses that file and returns an array of
 *              JSON Maps, one for each row of the CSV file.
 * @public @async
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export async function parseFile(csvFilePath:string, opts:Csv2JsonOptions={}):Promise<JsonMap[]> {

  // Debug incoming arguments
  SfdxFalconDebug.obj(`${dbgNs}parseFile:arguments:`, arguments);

  // Results will be an array of JSON Maps.
  const results = [] as JsonMap[];

  // Wrap the file system stream read in a promise.
  return new Promise((resolve, reject) => {
    fse.createReadStream(csvFilePath)
    .on('error', (error:Error) => {
      reject(new SfdxFalconError( `Unable to read '${csvFilePath}'.  ${error.message}`
                                , `FileStreamError`
                                , `${dbgNs}parseFile`
                                , error));
    })
    .pipe(csv2json(opts))
    .on('data', (data:JsonMap) => results.push(data))
    .on('end',  () => {
      SfdxFalconDebug.obj(`${dbgNs}parseFile:results:`, results, `results: `);
      resolve(results);
    })
    .on('error', (error:Error) => {
      reject(new SfdxFalconError( `Unable to parse '${csvFilePath}'.  ${error.message}`
                                , `CsvParsingError`
                                , `${dbgNs}parseFile`
                                , error));
    });
  });
}

//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    writeStringToFile
 * @param       {string}  fileContents  Required. The contents that will be written to disk.
 * @param       {string}  filePath Required. Path to where the file should be written to.
 * @returns     {Promise<void>}
 * @description Given a string containing the contents that should be written to disk and the full
 *              path to the location where the file should be written to, writes the file to disk.
 * @private @async
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
async function writeStringToFile(fileContents:string, filePath:string):Promise<void> {
  fse.outputFile(fileContents, filePath)
  .catch(fseError => {
    throw new SfdxFalconError ( `Could not write '${filePath}' to the local filesystem. ${fseError.message}`
                              , `FileOutputError`
                              , `${dbgNs}writeStringToFile`
                              , fseError);
  });
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    validateJsonDataArgument
 * @param       {unknown} jsonData  Required. Variable to validate. Should be a non-null array.
 * @returns     {void}
 * @description Ensures that the argument provided matches type/value expectations.
 * @private
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
function validateJsonDataArgument(jsonData:unknown):void {
  // Validate incoming arguments
  if (Array.isArray(jsonData) !== true || jsonData === null) {
    throw new SfdxFalconError( `Expected jsonData to be a non-null array but got ${jsonData !== null ? `type '${typeof jsonData}'` : `a null value`} instead.`
                             , `TypeError`
                             , `${dbgNs}validateJsonDataArgument`);
  }
}
