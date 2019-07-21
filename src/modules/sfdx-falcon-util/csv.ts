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
  directory:      string;
  fileName:       string;
  headers?:       string[];
  jsonData?:      JsonMap[];
  json2csvOpts?:  Json2CsvOptions;
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
      csv2jsonOpts: opts
    });
   
    // Attempt to parse the CSV file to JSON
    csvFile._jsonData = await parseFile(csvFile._filePath, csvFile._csv2jsonOpts);

    // Mark the CsvFile object as "prepared".
    csvFile._prepared = true;

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

    return csvFile;
  }

  // Private Members
  private   _csv2jsonOpts:  import('../sfdx-falcon-util/csv').Csv2JsonOptions;  // ???
  private   _csvData:       string;     // String containing a CSV representation of data.
  private   _directory:     string;     // Resolved path to the directory where the CSV File lives (eg. "/Users/vchawla/my-project/").
  private   _filePath:      string;     // Resolved path (directory+filename) to where the CSV File lives (eg. "/Users/vchawla/my-project/my-data.csv").
  private   _fileName:      string;     // Name of the CSV File (eg. "my-data.csv").
  private   _headers:       string[];   // ???
  private   _jsonData:      JsonMap[];  // ???
  private   _json2csvOpts:  import('../sfdx-falcon-util/csv').Json2CsvOptions;  // ???
  private   _prepared:      boolean;    // ???

  // Public Accessors
  public get csv2jsonOpts()   { return this.isPrepared() ? this._csv2jsonOpts : undefined; }
  public get csvData()        { return this.isPrepared() ? this._csvData      : undefined; }
  public get directory()      { return this.isPrepared() ? this._directory    : undefined; }
  public get filePath()       { return this.isPrepared() ? this._filePath     : undefined; }
  public get fileName()       { return this.isPrepared() ? this._fileName     : undefined; }
  public get headers()        { return this.isPrepared() ? this._headers      : undefined; }
  public get jsonData()       { return this.isPrepared() ? this._jsonData     : undefined; }
  public get json2csvOpts()   { return this.isPrepared() ? this._json2csvOpts : undefined; }
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
    SfdxFalconDebug.obj(`${dbgNs}constructor:arguments:`, arguments);

    // Initialize member variables based on the provided options.
    this._csv2jsonOpts    = opts.csv2jsonOpts   ||  {};
    this._directory       = opts.directory      ||  path.resolve('.');
    this._fileName        = opts.fileName       ||  'unknown.csv';
    this._headers         = opts.headers        ||  [];
    this._jsonData        = opts.jsonData       ||  [];
    this._json2csvOpts    = opts.json2csvOpts   ||  {};

    // Construct a complete File Path by joining the directory and file name.
    this._filePath = path.join(this._directory, this._fileName);

    // Initialize the CSV data as empty.
    this._csvData = '';

    // Validate the current state of this CSV File object.
    this.validateInitialization();

    // Initialize as NOT prepared. Child classes will need to determine when they are prepared.
    this._prepared = false;
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      save
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
  public async save(csvFilePath?:string):Promise<void> {

    // Make sure this instance is Prepared.
    this.isPrepared();

    // Make sure a Target Directory was provided.
    if (typeof targetDir !== 'string' || targetDir === '') {
      throw new SfdxFalconError ( `Expected targetDir to be a non-empty string but got '${typeof targetDir}' instead.`
                                , `TypeError`
                                , `${dbgNs}writeXml`);
    }

    // Build the XML that we're about to write.
    await this.buildXml();

    /*
    // Convert the built XML to a string.
    const xml = this.xmlRoot.end({
      pretty:           true,
      indent:           '    ',
      newline:          '\n',
      width:            0,
      allowEmpty:       false,
      spaceBeforeSlash: ''
    });

    // Build the absolute filepath to where this metadata XML should be written.
    const absoluteFilePath = path.join(this.filePath, this.fileName);

    // DEBUG
    SfdxFalconDebug.str(`${dbgNs}writeXml:absoluteFilePath:`, absoluteFilePath);
    SfdxFalconDebug.str(`${dbgNs}writeXml:xml:`, xml, `${absoluteFilePath}:\n`);

    // Write the XML to the local filesystem.
    fse.outputFile(absoluteFilePath, xml)
    .catch(fseError => {
      throw new SfdxFalconError ( `Could not write '${absoluteFilePath}' to the local filesystem. ${fseError.message}`
                                , `FileOutputError`
                                , `${dbgNs}writeXml`
                                , fseError);
    });
    //*/
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
   * @method      loadCsvFile
   * @return      {void}
   * @description Using the settings in this instance's member variables, loads
   *              and parses a CSV file into JSON.
   * @private @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  private async loadCsvFile():Promise<void> {



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

    /*
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
    //*/
  }
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
  if (Array.isArray(jsonData) !== true || jsonData === null) {
    throw new SfdxFalconError( `Expected jsonData to be a non-null array but got type '${typeof jsonData}' instead.`
                             , `TypeError`
                             , `${dbgNs}createFile`);
  }
  
  // Make sure the destination CSV File Path is writeable by trying to create an empty file there.
  await writeStringToFile(csvFilePath, '');
  
  // Parse the JSON Data into CSV Data.
  const csvData:string = await json2csv.parseAsync(jsonData, opts)
  .catch(json2csvError => {
    throw new SfdxFalconError ( `Could not parse JSON to CSV. ${json2csvError.message}`
                              , `Json2CsvParseError`
                              , `${dbgNs}createFile`
                              , json2csvError);
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
