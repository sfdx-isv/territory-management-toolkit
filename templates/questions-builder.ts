/**
 * **TEMPLATE NOTE: Follow these instructions to customize this template.**
 * 1. Do a case-sensitive, partial match replace of `ClassName` with the name of your class.
 * 2. Do a case-sensitive, partial match replace of `source-file-name` with the name of your source file.
 * 3. ???
 * 7. Implement whatever classes and methods are required.
 * 8. Delete all **TEMPLATE NOTE** comments.
 */

//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @author        Vivek M. Chawla <@VivekMChawla>
 * @copyright     2019, Vivek M. Chawla / Salesforce. All rights reserved.
 * @license       BSD-3-Clause For full license text, see the LICENSE file in the repo root or
 *                `https://opensource.org/licenses/BSD-3-Clause`
 * @file          builders/questions/soure-file-name.ts
 * @summary       Implements various Questions Builder classes.
 * @description   Implements various Questions Builder classes.
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
const dbgNs = 'BUILDER:questions:source-file-name';
SfdxFalconDebug.msg(`${dbgNs}:`, `Debugging initialized for ${dbgNs}`);

