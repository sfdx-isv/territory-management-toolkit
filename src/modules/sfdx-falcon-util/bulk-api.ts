//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @file          modules/sfdx-falcon-util/bulk-api.ts
 * @copyright     Vivek M. Chawla / Salesforce - 2019
 * @author        Vivek M. Chawla <@VivekMChawla>
 * @summary       Utility Module. Exposes functionality available via the Salesforce Bulk API.
 * @description   Utility functions related to the Salesforce Bulk API. Leverages the JSForce
 *                utilities to make it easy for developers to use the Bulk API directly against any
 *                Salesforce Org that is connected to the local CLI environment.
 * @version       1.0.0
 * @license       MIT
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
// Import External Libraries, Modules, and Types
//import {Connection}               from  '@salesforce/core';     // Handles connections and requests to Salesforce Orgs.
//import {JsonCollection}           from  '@salesforce/ts-types'; // Any valid JSON collection value.
//import {JsonMap}                  from  '@salesforce/ts-types'; // Any JSON-compatible object.
import * as fs                    from  'fs-extra';             // Extended set of File System utils.

// Import Internal Libraries
import * as typeValidator         from  '../sfdx-falcon-validators/type-validator'; // Library of SFDX Helper functions specific to SFDX-Falcon.

// Import Internal Classes & Functions
import {SfdxFalconDebug}          from  '../sfdx-falcon-debug'; // Class. Provides custom "debugging" services (ie. debug-style info to console.log()).
import {SfdxFalconError}          from  '../sfdx-falcon-error'; // Class. Extends SfdxError to provide specialized error structures for SFDX-Falcon modules.
import {restApiRequest}           from  './jsforce';            // Function. Given a REST API Request Definition, makes a REST call using JSForce.

// Import Internal Types
import {AliasOrConnection}        from  '../sfdx-falcon-types'; // Type. Represents either an Org Alias or a JSForce Connection.
import {Bulk2OperationStatus}     from  '../sfdx-falcon-types'; // Interface. Represents the overall status of a Bulk API 2.0 operation.
import {Bulk2JobCreateRequest}    from  '../sfdx-falcon-types'; // Interface. Represents the request body required to create a Bulk API 2.0 job.
import {Bulk2JobCreateResponse}   from  '../sfdx-falcon-types'; // Interface. Represents the response body returned by Salesforce after attempting to create a Bulk API 2.0 job.
import {RestApiRequestDefinition} from  '../sfdx-falcon-types'; // IInterface. Represents information needed to make a REST API request via a JSForce connection.
import {Status}                   from  '../sfdx-falcon-types'; // Enum. Represents a generic set of commonly used Status values.

// Set the File Local Debug Namespace
const dbgNs = 'UTILITY:bulk-api:';
SfdxFalconDebug.msg(`${dbgNs}`, `Debugging initialized for ${dbgNs}`);


// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    bulk2Insert
 * @param       {AliasOrConnection} aliasOrConnection  Required. Either a string containing the
 *              Alias of the org being queried or an authenticated JSForce Connection object.
 * @param       {Bulk2JobCreateRequest}  bulk2JobCreateRequest  Required. Body of the Bulk2 REST request. See
 *              https://developer.salesforce.com/docs/atlas.en-us.api_bulk_v2.meta/api_bulk_v2/create_job.htm
 *              for documentation for how to create the proper payload.
 * @param       {string}  dataSourcePath Required. Path to the file containing data to be loaded.
 * @param       {string}  [apiVersion]  Optional. Overrides default of "most current" API version.
 * @returns     {Promise<Bulk2OperationStatus>}  Resolves with status of the Bulk2 Insert request.
 * @description Given an Alias or Connection, the path to a CSV data file, and a Bulk API v2 request
 *              body, creates a Bulk API v2 ingestion job and uploads the specified CSV file to
 *              Salesforce. Resolves with a Bulk2OperationStatus object containing the JSON response
 *              received from Salesforde when the Ingest Job was created as well as an indicator
 *              of the state of the CSV file upload.
 * @version     1.0.0
 * @public @async
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export async function bulk2Insert(aliasOrConnection:AliasOrConnection, bulk2JobCreateRequest:Bulk2JobCreateRequest, dataSourcePath:string, apiVersion:string=''):Promise<Bulk2OperationStatus> {

  // Define function-local debug namespace.
  const dbgNsLocal = `${dbgNs}bulk2Insert`;

  // Debug incoming arguments.
  SfdxFalconDebug.obj(`${dbgNsLocal}:arguments:`, arguments);

  // Validate incoming arguments.
  typeValidator.throwOnEmptyNullInvalidObject (bulk2JobCreateRequest, `${dbgNsLocal}`, `bulk2JobCreateRequest`);
  typeValidator.throwOnNullInvalidString      (dataSourcePath,        `${dbgNsLocal}`, `dataSourcePath`);
  typeValidator.throwOnNonReadablePath        (dataSourcePath,        `${dbgNsLocal}`, `dataSourcePath`);
  typeValidator.throwOnNullInvalidString      (apiVersion,            `${dbgNsLocal}`, `apiVersion`);

  // Get stats on the Data Source file.
  const fileStats = await fs.stat(dataSourcePath)
  .catch(fileStatsError => {
    throw new SfdxFalconError ( `Could not get stats for '${dataSourcePath}'`
                              , `FileStatsError`
                              , `${dbgNsLocal}`
                              , fileStatsError);
  });

  // Start defining the Bulk2 Operation Status object we'll end up returning.
  const bulk2OperationStatus = {
    dataSourcePath: dataSourcePath,
    dataSourceSize: fileStats.size,
    dataSourceUploadStatus: Status.NOT_STARTED
  } as Bulk2OperationStatus;

  // Make sure that the Operation is set to "insert"
  bulk2JobCreateRequest.operation = 'insert';

  // Create the Bulk2 ingest job.
  bulk2OperationStatus.initialJobStatus = await createBulk2Job(aliasOrConnection, bulk2JobCreateRequest)
  .catch(bulk2JobError => {
    SfdxFalconDebug.debugObject(`${dbgNsLocal}:bulk2JobError:`, bulk2JobError);
    throw new SfdxFalconError ( `Error attempting to perform a Bulk Insert. Bulk job could not be created. Data from '${dataSourcePath}' was not uploaded.`
                              , `Bulk2InsertError`
                              , `${dbgNsLocal}`
                              , bulk2JobError);
  });

  // Upload the CSV file to Salesforce.

  // Figure out if everything was successful.

  // Debug and return the Bulk2 Operation Status.
  SfdxFalconDebug.debugObject(`${dbgNsLocal}:bulk2OperationStatus:`, bulk2OperationStatus);
  return bulk2OperationStatus;
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    createBulk2Job
 * @param       {AliasOrConnection} aliasOrConnection  Required. Either a string containing the
 *              Alias of the org being queried or an authenticated JSForce Connection object.
 * @param       {Bulk2JobCreateRequest}  bulk2JobCreateRequest  Required. Body of the Bulk2 REST request. See
 *              https://developer.salesforce.com/docs/atlas.en-us.api_bulk_v2.meta/api_bulk_v2/create_job.htm
 *              for documentation for how to create the proper payload.
 * @param       {string}  [apiVersion]  Optional. Overrides default of "most current" API version.
 * @returns     {Promise<Bulk2JobCreateResponse>}  Resolves with the response from Salesforce to the
 *              Bulk2 job creation request.
 * @description Given an Alias or Connection and a Bulk API v2 request body, creates a Bulk API 2.0
 *              job.  Resolves with the JSON response received from Salesforce.
 * @version     1.0.0
 * @public @async
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export async function createBulk2Job(aliasOrConnection:AliasOrConnection, bulk2JobCreateRequest:Bulk2JobCreateRequest, apiVersion:string=''):Promise<Bulk2JobCreateResponse> {

  // Define function-local debug namespace.
  const dbgNsLocal = `${dbgNs}createBulk2Job`;

  // Debug incoming arguments.
  SfdxFalconDebug.obj(`${dbgNsLocal}:arguments:`, arguments);

  // Validate incoming arguments.
  typeValidator.throwOnEmptyNullInvalidObject (bulk2JobCreateRequest, `${dbgNsLocal}`, `bulk2JobCreateRequest`);
  typeValidator.throwOnNullInvalidString      (apiVersion,            `${dbgNsLocal}`, `apiVersion`);

  // Create a REST API Request object
  const restRequest:RestApiRequestDefinition = {
    aliasOrConnection: aliasOrConnection,
    request: {
      method: 'post',
      url:    apiVersion ? `/services/data/v${apiVersion}/jobs/ingest` : `/jobs/ingest`,
      body:   JSON.stringify(bulk2JobCreateRequest)
    }
  };
  SfdxFalconDebug.obj(`${dbgNsLocal}:restRequest:`, restRequest);

  // Execute the REST request. If the request fails, JSForce will throw an exception.
  const restResponse = await restApiRequest(restRequest)
  .catch(restRequestError => {
    SfdxFalconDebug.debugObject(`${dbgNsLocal}:restRequestError:`, restRequestError);
    throw new SfdxFalconError ( `Error creating Bulk2 job. ${restRequestError.message}`
                              , `Bulk2JobError`
                              , `${dbgNsLocal}`
                              , restRequestError);
  }) as Bulk2JobCreateResponse;

  // Debug and return the REST response.
  SfdxFalconDebug.debugObject(`${dbgNsLocal}:restResponse:`, restResponse);
  return restResponse;
}



