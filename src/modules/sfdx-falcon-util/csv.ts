//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @file          modules/sfdx-falcon-util/csv.ts
 * @copyright     Vivek M. Chawla - 2019
 * @author        Vivek M. Chawla <@VivekMChawla>
 * @summary       Git helper utility library
 * @description   Exports functions that help work with CSV files.
 * @version       1.0.0
 * @license       MIT
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
// Import External Modules
import {JsonMap}          from  '@salesforce/ts-types';     // Why?
//import * as path          from  'path';     // Node's path library.
//import {ShellString}      from  'shelljs';  // Contains information regarding the output of a shell.exec() command.

// Import Internal Modules
import {SfdxFalconDebug}  from  '../../modules/sfdx-falcon-debug';      // Class. Specialized debug provider for SFDX-Falcon code.
import {SfdxFalconError}  from  '../../modules/sfdx-falcon-error';      // Class. Specialized Error object. Wraps SfdxError.
//import {waitASecond}      from  '../../modules/sfdx-falcon-util/async'; // Function. Allows for a simple "wait" to execute.

// Import Falcon Types
import {CsvParserOpts}    from  '../../modules/sfdx-falcon-types';      // Interface. Represents the set of options that can be provided to the parse() function implemented by "csv-parser".

// Requires
const csv = require('csv-parser');
const fs  = require('fs');

//const shell = require('shelljs'); // Cross-platform shell access - use for setting up Git repo.

// File Globals
// These RegEx Patterns can be inspected/tested at https://regex101.com/r/VuVsfJ/3
//const repoNameRegEx = /\/(\w|-)+\.git\/*$/;
//const gitUriRegEx   = /(^(git|ssh|http(s)?)|(git@[\w\.]+))(:(\/\/)?)([\w\.@\:\/\-~]+)(\.git)(\/)?$/;

// Set the File Local Debug Namespace
const dbgNs     = 'UTILITY:csv:';

//─────────────────────────────────────────────────────────────────────────────┐
// Set shelljs config to throw exceptions on fatal errors.  We have to do
// this so that git commands that return fatal errors can have their output
// suppresed while the generator is running.
//─────────────────────────────────────────────────────────────────────────────┘
//shell.config.fatal = true;



//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    parseFile
 * @param       {string}  csvFilePath Required. Path to a CSV file.
 * @param       {CsvParserOpts} [opts]  Optional. CSV file parsing options.
 * @returns     {JsonMap} JSON map of
 * @description Clones a Git repository located at gitRemoteUri to the local machine inside of the
 *              directory specified by targetDirectory.
 * @public @async
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export async function parseFile(csvFilePath:string, opts:CsvParserOpts={}):Promise<object[]> {

  // Debug incoming arguments
  SfdxFalconDebug.obj(`${dbgNs}parseFile:arguments:`, arguments, `arguments: `);

  // Results will be an array of JSON
  const results = [] as JsonMap[];

  // Wrap the file system stream read in a promise.
  return new Promise((resolve, reject) => {
    fs.createReadStream(csvFilePath)
    .on('error', (error:Error) => {
      reject(new SfdxFalconError( `Unable to read '${csvFilePath}'.  ${error.message}`
                                , `FileStreamError`
                                , `${dbgNs}parseFile`
                                , error));
    })
    .pipe(csv(opts))
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
