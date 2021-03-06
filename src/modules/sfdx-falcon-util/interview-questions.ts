//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @file          modules/sfdx-falcon-util/inquirer-questions.ts
 * @copyright     Vivek M. Chawla - 2019
 * @author        Vivek M. Chawla <@VivekMChawla>
 * @summary       Exports several functions that create commonly used Inquirer Questions.
 * @description   Helps developers building Inquirer based interviews (including Yeoman) by exporting
 *                several functions that create a suite of commonly used Inquirer Question objects.
 *                there are also aggregator functions that expose pre-built collections of certain
 *                Inquirer Questions.
 * @version       1.0.0
 * @license       MIT
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
// Import External Libraries & Modules
import {AuthInfo}             from  '@salesforce/core';     // Handles persistence and fetching of user authentication information using JWT, OAuth, or refresh tokens.
import {fs}                   from  '@salesforce/core';     // File System utility from the Core SFDX library.
import {isEmpty}              from  'lodash';               // Useful function for detecting empty objects, collections, maps, and sets.
import * as path              from  'path';                 // Library. Helps resolve local paths at runtime.

// Import Internal Libraries
import * as typeValidator     from  '../sfdx-falcon-validators/type-validator';     // Library of type validation helper functions.
import * as yoValidate        from  '../sfdx-falcon-validators/yeoman-validator';   // Library of validation functions for Yeoman interview inputs, specific to SFDX-Falcon.

// Import Internal Classes and Functions
import {SfdxFalconDebug}      from  '../sfdx-falcon-debug';         // Specialized debug provider for SFDX-Falcon code.
import {SfdxFalconError}      from  '../sfdx-falcon-error';         // Class. Extends SfdxError to provide specialized error structures for SFDX-Falcon modules.
import {SfdxFalconInterview}  from  '../sfdx-falcon-interview';     // Class. Provides a standard way of building a multi-group Interview to collect user input.
import {filterLocalPath}      from  '../sfdx-falcon-util/yeoman';   // Function. Yeoman filter which takes a local Path value and resolves it using path.resolve().

// Import Falcon Types
import {Questions}            from  '../sfdx-falcon-types';   // Interface. Represents mulitple Inquirer Questions.
import {InquirerChoices}      from  '../sfdx-falcon-types';   // Interface. Represents a Yeoman/Inquirer choice object.

// Import TM-Tools Types

// Set the File Local Debug Namespace
const dbgNs = 'UTILITY:inquirer-questions:';
SfdxFalconDebug.msg(`${dbgNs}`, `Debugging initialized for ${dbgNs}`);

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    chooseTm1Org
 * @param       {string[]}  [promptText]  Optional. Array of strings used as text for each prompt.
 * @param       {InquirerChoices} [standardOrgChoices]  Optional. Array of Target Org choices.
 * @param       {InquirerChoices} [scratchOrgChoices] Optional. Array of Scratch Org choices.
 * @returns     {Question}  A single Inquirer Question.
 * @description Prompts the user to select a target org from the list provided by targetOrgChoices.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function chooseTm1Org(promptText:string[]=[], standardOrgChoices:InquirerChoices=[], scratchOrgChoices:InquirerChoices=[]):Questions {

  // Debug arguments.
  SfdxFalconDebug.obj(`${dbgNs}chooseTm1Org:arguments:`, arguments);

  // If the caller didn't supply an array of promptText, initialize it as an empty array.
  if (Array.isArray(promptText) !== true) {
    promptText = [];
  }

  // If the caller didn't supply Standard Org Choices, try to grab them from Shared Data.
  if (isEmpty(standardOrgChoices)) {
    SfdxFalconInterview.validateInterviewScope(this);
    standardOrgChoices = this.sharedData['standardOrgAliasChoices'] || [];
  }

  // If the caller didn't supply Scratch Org Choices, try to grab them from Shared Data.
  if (isEmpty(scratchOrgChoices)) {
    SfdxFalconInterview.validateInterviewScope(this);
    scratchOrgChoices = this.sharedData['scratchOrgAliasChoices'] || [];
  }

  // By now both standardOrgChoices and scratchOrgChoices should be valid Arrays.
  typeValidator.throwOnNullInvalidArray(standardOrgChoices, `${dbgNs}chooseTm1Org`, `standardOrgChoices`);
  typeValidator.throwOnNullInvalidArray(scratchOrgChoices,  `${dbgNs}chooseTm1Org`, `scratchOrgChoices`);

  // DEBUG
  SfdxFalconDebug.obj(`${dbgNs}chooseTm1Org:standardOrgChoices:`, standardOrgChoices);
  SfdxFalconDebug.obj(`${dbgNs}chooseTm1Org:scratchOrgChoices:`,  scratchOrgChoices);

  // Build and return the Questions.
  return [
    {
      type:     'confirm',
      name:     'isScratchOrg',
      message:  promptText[0] || 'Is the target a Scratch Org?',
      default:  ((this.defaultAnswers && typeValidator.isNotNullInvalidBoolean(this.defaultAnswers.isScratchOrg)) ? this.defaultAnswers.isScratchOrg : false),
      when:     true
    },
    {
      type:     'list',
      name:     'targetOrgUsername',
      message:  promptText[1] || 'From which org do you want to extract TM1 configuration?',
      choices:  standardOrgChoices,
      when:     answerHash => (answerHash.isScratchOrg === false && standardOrgChoices.length > 0)
    },
    {
      type:     'list',
      name:     'targetOrgUsername',
      message:  promptText[2] || 'From which scratch org do you want to extract TM1 configuration?',
      choices:  scratchOrgChoices,
      when:     answerHash => (answerHash.isScratchOrg === true && scratchOrgChoices.length > 0)
    }
  ];
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    confirmProceedRestart
 * @returns     {Questions} A group of Inquirer Questions.
 * @description Asks the user to confirm that they want to proceed with an operation based on the
 *              values that they have previously provided during an Interview.  If they say "no",
 *              they will be asked if they want to restart.  If they choose not to restart, they
 *              are effectively aborting the operation.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function confirmProceedRestart():Questions {

  // Make sure the calling scope has the variables we expect.
  SfdxFalconInterview.validateInterviewScope(this);

  // Initialize a "Confirmation Question" string.
  let confirmationQuestion  = 'Would you like to proceed based on the above settings?';

  // See if the parent scope has defined a Confirmation Question.
  if (typeof this.context.confirmationQuestion === 'string') {
    confirmationQuestion  = this.context.confirmationQuestion;
    SfdxFalconDebug.msg(`${dbgNs}confirmProceedRestartAbort:`, `Parent Confirmation Question Found. `);
  }

  // See if the grandparent scope has defined a Confirmation Question.
  if (this.context.context && typeof this.context.context.confirmationQuestion === 'string') {
    confirmationQuestion  = this.context.context.confirmationQuestion;
    SfdxFalconDebug.msg(`${dbgNs}confirmProceedRestartAbort:`, `Grandparent Confirmation Question Found. `);
  }

  // Debug
  SfdxFalconDebug.str(`${dbgNs}confirmProceedRestartAbort:`, confirmationQuestion, `confirmationQuestion: `);

  // Build and return the Questions.
  return [
    {
      type:     'confirm',
      name:     'proceed',
      message:  confirmationQuestion,
      default:  false,
      when:     true
    },
    {
      type:     'confirm',
      name:     'restart',
      message:  'Would you like to start again and enter new values?',
      default:  true,
      when:     answerHash => ! answerHash.proceed
    }
  ];
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    confirmNoTm1TargetOrg
 * @returns     {Questions}  An array of Inquirer Question objects.
 * @description Warns the user that a Developer Hub must be selected if they want to continue.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function confirmNoTm1TargetOrg():Questions {

  // Make sure the calling scope has the variables we expect.
  SfdxFalconInterview.validateInterviewScope(this);

  // Build and return the Questions.
  return [
    {
      type:     'confirm',
      name:     'restart',
      message:  'Selecting a TM1 source org is required. Would you like to see the choices again?',
      default:  true,
      when:     this.userAnswers.targetOrgUsername === 'NOT_SPECIFIED'
    }
  ];
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    provideReportDirectory
 * @param       {string}  reportFileName  Required. Filename of the report being looked for.
 * @param       {string[]}  [promptText]  Optional. Array of strings used as text for each prompt.
 * @returns     {Questions}  An array of Inquirer Question objects.
 * @description Asks the user to provide a fully qualified path to a directory that contains
 *              the report file (eg. tm1-analysis.json) specified by the reportName argument.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function provideReportDirectory(reportFileName:string='', promptText:string[]=[]):Questions {

  // Make sure the calling scope has the variables we expect.
  SfdxFalconInterview.validateInterviewScope(this);

  // Required File must be a non-empty, non-null string.
  if (typeof reportFileName !== 'string' || reportFileName === '' || reportFileName === null) {
    throw new SfdxFalconError ( `Expected reportFileName to be a non-empty, non-null string${typeof reportFileName !== 'string' ? ` but got '${typeof reportFileName}' instead.` : `.`}`
                              , `TypeError`
                              , `${dbgNs}provideReportDirectory`);
  }

  // Build and return the Question.
  return [
    {
      type:     'input',
      name:     'baseDirectory',
      message:  promptText[0] || `Path to the directory containing ${reportFileName}?`,
      default:  ( typeof this.userAnswers.baseDirectory !== 'undefined' )
                ? this.userAnswers.baseDirectory      // Current Value
                : this.defaultAnswers.baseDirectory,  // Default Value
      filter:   filterLocalPath,                      // Returns a Resolved path
      when:     true,                                 // Always show this question
      validate: async userInput => {

        // Try to read the required file inside the folder specified by the user.
        const reportFilePath  = path.join(userInput, reportFileName);
        const reportJson    = await fs.readJsonMap(reportFilePath, true)
        .catch(readJsonMapError => {
          SfdxFalconDebug.obj(`${dbgNs}provideReportDirectory:readJsonMapError:`, readJsonMapError);
          return;
        });

        // Make sure the file was there AND that it contains the basic keys needed by our TM-Tools operations.
        let foundValidReport = true;
        if (typeof reportJson !== 'object' || typeof reportJson.orgInfo !== 'object' || typeof reportJson.orgInfo['username'] !== 'string' || typeof reportJson.orgInfo['orgId'] !== 'string') {
          foundValidReport = false;
        }
        else {
          SfdxFalconDebug.obj(`${dbgNs}provideReportDirectory:reportJson.orgInfo:`, reportJson.orgInfo);

          // Get the Auth Info for the associated Username.
          const authInfo  = await AuthInfo.create({username: reportJson.orgInfo['username']})
          .catch(authInfoError => {
            SfdxFalconDebug.obj(`${dbgNs}provideReportDirectory:authInfoError:`, authInfoError);
            return;
          }) as AuthInfo;

          // Make sure that AuthInfo can be found for the specified username.
          if (typeof authInfo === 'undefined') {
            foundValidReport = false;
          }
          else {

            // Make sure that the AuthInfo's AuthFields has the same Org ID as in the TM1 Analysis JSON.
            SfdxFalconDebug.obj(`${dbgNs}provideReportDirectory:authInfo.AuthFields:`, authInfo.getFields());
            if (authInfo.getFields().orgId !== reportJson.orgInfo['orgId']) {
              foundValidReport = false;
            }
          }
        }

        // Test whether a Valid Report was found. If not, return an error message.
        if (foundValidReport !== true) {
          return `Directory does not contain a valid ${reportFileName} file`;
        }
        else {
          
          // Path to a valid report was provided. Save it to Shared Data and allow the user to proceed.
          this.sharedData['reportJson']  = reportJson;
          return true;
        }
      }
    }
  ];
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    provideTargetDirectory
 * @param       {string[]}  [promptText]  Optional. Array of strings used as text for each prompt.
 * @returns     {Questions}  An array of Inquirer Question objects.
 * @description Asks the user to provide a target directory for a project being cloned or created.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function provideTargetDirectory(promptText:string[]=[]):Questions {

  // Make sure the calling scope has the variables we expect.
  SfdxFalconInterview.validateInterviewScope(this);

  // Build and return the Question.
  return [
    {
      type:     'input',
      name:     'targetDirectory',
      message:  promptText[0] || 'What is the target directory for this project?',
      default:  ( typeof this.userAnswers.targetDirectory !== 'undefined' )
                ? this.userAnswers.targetDirectory        // Current Value
                : this.defaultAnswers.targetDirectory,    // Default Value
      validate: yoValidate.targetPath,                    // Check targetPath for illegal chars
      filter:   filterLocalPath,                          // Returns a Resolved path
      when:     true
    }
  ];
}
