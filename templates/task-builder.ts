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
 * @file          builders/task/soure-file-name.ts
 * @summary       Implements various Questions Builder classes.
 * @description   Implements various Questions Builder classes.
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
// Import External Libraries, Classes, & Functions
import  {SfdxFalconDebug}         from  '@sfdx-falcon/debug';     // Class. Provides custom "debugging" services (ie. debug-style info to console.log()).
import  {SfdxFalconError}         from  '@sfdx-falcon/error';     // Class. Extends SfdxError to provide specialized error structures for SFDX-Falcon modules.
import  {TypeValidator}           from  '@sfdx-falcon/validator'; // Library. Collection of type validation functions.
import  {SfdxFalconWorker}        from  '@sfdx-falcon/worker';    // Abstract Class. Used for building classes that implement task-specific functionality.
import  {TaskBuilder}             from  '@sfdx-falcon/builder';   // Abstract Class. Classes derived from TaskBuilder can be used to build a single ListrTask object.


// Import External Types
import  {JsonMap}                 from  '@sfdx-falcon/types';     // Interface. Any JSON-compatible object.
import  {SfdxFalconWorkerOptions} from  '@sfdx-falcon/worker';    // Interface. Represents options that can be passed to the SfdxFalconWorker constructor.

// Import Internal Libraries, Classes, & Functions

// Import Internal Types

// Set the File Local Debug Namespace
const dbgNs = 'BUILDER:task:source-file-name';
SfdxFalconDebug.msg(`${dbgNs}:`, `Debugging initialized for ${dbgNs}`);

//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 *  Interface. Specifies options for the `ClassName` constructor.
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export interface ClassNameOptions {
  optionOne: string;
}

//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @class       ClassName
 * @extends     InterviewQuestionsBuilder
 * @summary     Interview Questions Builder for choosing a single salesforce org.
 * @description Interview Questions Builder for choosing a single salesforce org.
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export class ChooseSingleOrg extends InterviewQuestionsBuilder {

  public promptIsScratchOrg:      string;
  public promptStandardOrgChoice: string;
  public promptScratchOrgChoice:  string;
  public standardOrgChoices:      InquirerChoices;
  public scratchOrgChoices:       InquirerChoices;

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @constructs  ChooseSingleOrg
   * @param       {ChooseSingleOrgOptions} opts  Required.
   */
  //───────────────────────────────────────────────────────────────────────────┘
  constructor(opts:ChooseSingleOrgOptions) {

    // Call the superclass constructor.
    super(opts);

    // Initialize debug for this method.
    const dbgNS = this.initializeDebug(dbgNs, `constructor`, arguments);

    // Validate incoming arguments.
    TypeValidator.throwOnEmptyNullInvalidArray(opts.standardOrgChoices,  `${dbgNS.ext}`,  `ChooseSingleOrgOptions.standardOrgChoices`);
    TypeValidator.throwOnEmptyNullInvalidArray(opts.scratchOrgChoices,   `${dbgNS.ext}`,  `ChooseSingleOrgOptions.scratchOrgChoices`);

    // Validate optional arguments.
    if (opts.msgStrings.promptIsScratchOrg)       TypeValidator.throwOnEmptyNullInvalidString(opts.msgStrings.promptIsScratchOrg,       `${dbgNS.ext}`,  `msgStrings.promptIsScratchOrg`);
    if (opts.msgStrings.promptScratchOrgChoice)   TypeValidator.throwOnEmptyNullInvalidString(opts.msgStrings.promptScratchOrgChoice,   `${dbgNS.ext}`,  `msgStrings.promptScratchOrgChoice`);
    if (opts.msgStrings.promptStandardOrgChoice)  TypeValidator.throwOnEmptyNullInvalidString(opts.msgStrings.promptStandardOrgChoice,  `${dbgNS.ext}`,  `msgStrings.promptStandardOrgChoice`);
    
    // Initialize member variables.
    this.scratchOrgChoices        = opts.scratchOrgChoices;
    this.standardOrgChoices       = opts.standardOrgChoices;
    this.promptIsScratchOrg       = opts.msgStrings.promptIsScratchOrg      ||  `Is the target a Scratch Org?`;
    this.promptScratchOrgChoice   = opts.msgStrings.promptScratchOrgChoice  ||  `Which scratch org would you like to work with?`;
    this.promptStandardOrgChoice  = opts.msgStrings.promptStandardOrgChoice ||  `Which org would you like to work with?`;
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      build
   * @returns     {Questions}
   * @description Builds the Interview Questions.
   */
  //───────────────────────────────────────────────────────────────────────────┘
  public build():Questions {
    return [
      {
        type:     'confirm',
        name:     'isScratchOrg',
        message:  this.promptIsScratchOrg,
        default:  ((TypeValidator.isNotNullInvalidBoolean(this.defaultAnswers.isScratchOrg)) ? this.defaultAnswers.isScratchOrg : false),
        when:     true
      },
      {
        type:     'list',
        name:     'targetOrgUsername',
        message:  this.promptStandardOrgChoice,
        choices:  this.standardOrgChoices,
        when:     answerHash => (answerHash.isScratchOrg === false && this.standardOrgChoices.length > 0)
      },
      {
        type:     'list',
        name:     'targetOrgUsername',
        message:  this.promptScratchOrgChoice,
        choices:  this.scratchOrgChoices,
        when:     answerHash => (answerHash.isScratchOrg === true && this.scratchOrgChoices.length > 0)
      }
    ];
  }
}