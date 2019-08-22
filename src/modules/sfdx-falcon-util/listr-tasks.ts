//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @file          modules/sfdx-falcon-util/listr-tasks.ts
 * @copyright     Vivek M. Chawla - 2019
 * @author        Vivek M. Chawla <@VivekMChawla>
 * @summary       Exports several functions that create general-purpose Listr Task objects.
 * @description   Helps developers building setup or initialization tasks with Listr by exporting
 *                several functions that create a suite of commonly used Listr Task objects.  There
 *                are also aggregator functions that expose pre-built collections of certain Listr
 *                tasks.
 * @version       1.0.0
 * @license       MIT
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
// Import External Libraries & Modules
import chalk                    from  'chalk';                      // Helps write colored text to the console.
import * as fse                 from  'fs-extra';                   // File System utility library with extended functionality.
import {isEmpty}                from  'lodash';                     // Useful function for detecting empty objects.
import * as path                from  'path';                       // Helps resolve local paths at runtime.
import {Observable}             from  'rxjs';                       // Class. Used to communicate status with Listr.
const  listr                    = require('listr');                 // Provides asynchronous list with status of task completion.

// Import Internal Libraries
import * as sfdxHelper          from  '../sfdx-falcon-util/sfdx';                 // Library of SFDX Helper functions specific to SFDX-Falcon.
import * as yoHelper            from  '../sfdx-falcon-util/yeoman';               // Library of Yeoman Helper functions specific to SFDX-Falcon.
import * as typeValidator       from  '../sfdx-falcon-validators/type-validator'; // Library of SFDX Helper functions specific to SFDX-Falcon.
import * as gitHelper           from  './git';                                    // Library of Git Helper functions specific to SFDX-Falcon.
import * as zipHelper           from  './zip';                                    // Library of Zip Helper functions.

// Import Internal Classes & Functions
import {TmToolsDeploySharing}         from  '../../workers/tm-tools-deploysharing'; // Class. Provides TM2 metadata deployment services given the location of transformed TM1 config.
import {SfdxFalconDebug}              from  '../sfdx-falcon-debug';                 // Class. Specialized debug provider for SFDX-Falcon code.
import {SfdxFalconError}              from  '../sfdx-falcon-error';                 // Class. Extends SfdxError to provide specialized error structures for SFDX-Falcon modules.
import {FalconProgressNotifications}  from  '../sfdx-falcon-notifications';         // Class. Manages progress notifications inside Falcon.
import {SfdxFalconResult}             from  '../sfdx-falcon-result';                // Class. Implements a framework for creating results-driven, informational objects with a concept of heredity (child results) and the ability to "bubble up" both Errors (thrown exceptions) and application-defined "failures".
import {SfdxFalconResultType}         from  '../sfdx-falcon-result';                // Enum. Represents the different types of sources where Results might come from.
import {waitASecond}                  from  '../sfdx-falcon-util/async';            // Function. Simple helper that introduces a delay when called inside async functions using "await".
import {chooseListrRenderer}          from  '../sfdx-falcon-util/listr';            // Function. Returns either a custom Listr Renderer or a string designating the default "verbose" renderer. depending on whether or not the user specified any Debug Namespaces when the currently running command was initiated.
import {TmToolsClean}                 from  '../tm-tools-clean';                    // Class. Provides TM1 configuration cleanup services given the location of transformed TM1 config.
import {TmToolsDeploy}                from  '../tm-tools-deploy';                   // Class. Provides TM2 metadata deployment services given the location of transformed TM1 config.
import {TmToolsLoad}                  from  '../tm-tools-load';                     // Class. Provides FINAL TM2 metadata/data loading services given a successful TM2 Deploy.
import {Tm1Analysis}                  from  '../tm-tools-objects/tm1-analysis';     // Class. Models the analysis of a TM1 org.
import {Tm1Context}                   from  '../tm-tools-objects/tm1-context';      // Class. Models the entirety of an exported set of TM1 data, including helpful transforms.
import {TmToolsTransform}             from  '../tm-tools-transform';                // Class. Provides TM1 to TM2 transformation services given the location of source config.

// Import Falcon Types
import {Bulk2OperationStatus}         from  '../sfdx-falcon-types';   // Interface. Represents the overall status of a Bulk API 2.0 operation.
import {DeployResult}                 from  '../sfdx-falcon-types';   // Interface. Interface. Modeled on the MDAPI Object DeployResult. Returned by a call to force:mdapi:deploy.
import {ErrorOrResult}                from  '../sfdx-falcon-types';   // Type. Alias to a combination of Error or SfdxFalconResult.
import {GeneratorRequirements}        from  '../sfdx-falcon-types';   // Interface. Represents the initialization requirements for Yeoman Generators that implement SfdxFalconYeomanGenerator.
import {ListrContextFinalizeGit}      from  '../sfdx-falcon-types';   // Interface. Represents the Listr Context variables used by the "finalizeGit" task collection.
import {ListrContextPkgRetExCon}      from  '../sfdx-falcon-types';   // Interface. Represents the Listr Context variables used by the "Package Retrieve/Extract/Convert" task collection.
import {ListrExecutionOptions}        from  '../sfdx-falcon-types';   // Interface. Represents the set of "execution options" related to the use of Listr.
import {ListrObject}                  from  '../sfdx-falcon-types';   // Interface. Represents a "runnable" Listr object (ie. an object that has the run() method attached).
import {ListrSkipCommand}             from  '../sfdx-falcon-types';   // Type. A built-in function of the "this task" Listr Task object that gets passed into executable task code.
import {ListrTask}                    from  '../sfdx-falcon-types';   // Interface. Represents a Listr Task.
import {RawStandardOrgInfo}           from  '../sfdx-falcon-types';   // Interface. Represents the data returned by the sfdx force:org:list command.
import {RawScratchOrgInfo}            from  '../sfdx-falcon-types';   // Interface. Represents the "scratchOrgs" data returned by the sfdx force:org:list --all command.
import {StandardOrgInfoMap}           from  '../sfdx-falcon-types';   // Type. Alias for a Map with string keys holding StandardOrgInfo values.
import {ShellExecResult}              from  '../sfdx-falcon-types';   // Interface. Represents the result of a call to shell.execL().
import {Subscriber}                   from  '../sfdx-falcon-types';   // Type. Alias to an rxjs Subscriber<any> type.


// Import TM-Tools Types
import {SharingRulesCount}            from  '../tm-tools-types';      // Interface. Represents a collection of information that tracks the count of Criteria, Owner, and Territory-based Sharing Rules.
import {TM1AnalysisReport}            from  '../tm-tools-types';      // Interface. Represents the data that is generated by a TM1 Analysis Report.
import {TM1AnalyzeFilePaths}          from  '../tm-tools-types';      // Interface. Represents the complete suite of file paths required by the TM1 Analyze command.
import {TM1ContextValidation}         from  '../tm-tools-types';      // Interface. Represents the structure of the return value of the Tm1Context.validate() function.
import {TM1CleanFilePaths}            from  '../tm-tools-types';      // Interface. Represents the complete suite of file paths required by the tmtools:tm1:clean command.
import {TM1CleanupReport}             from  '../tm-tools-types';      // Interface. Represents the full report data generated by the tmtools:tm1:clean command.
import {TM1ExtractFilePaths}          from  '../tm-tools-types';      // Interface. Represents the complete suite of file paths required by the TM1 Extract command.
import {TM1ExtractionReport}          from  '../tm-tools-types';      // Interface. Represents the data that is generated by a TM1 Extraction Report.
import {TM1HardDependencies}          from  '../tm-tools-types';      // Interface. Represents a complete view of HARD TM1 dependencies in an org.
import {TM1OrgInfo}                   from  '../tm-tools-types';      // Interface. Represents basic org information for a TM1 org
import {TM1SoftDependencies}          from  '../tm-tools-types';      // Interface. Represents a complete view of SOFT TM1 dependencies in an org.
import {TM1TransformFilePaths}        from  '../tm-tools-types';      // Interface. Represents the complete suite of file paths required by the TM1 Transform command.
import {TM1TransformationReport}      from  '../tm-tools-types';      // Interface. Represents the data that is generated by a TM1 Transformation Report.
import {TM2LoadFilePaths}             from  '../tm-tools-types';      // Interface. Represents the complete suite of file paths required by the TM2 DataLoad command.
import {TM2DataLoadReport}            from  '../tm-tools-types';      // Interface. Represents the data that is generated by a TM2 DataLoad Report.
import {TM2DeployFilePaths}           from  '../tm-tools-types';      // Interface. Represents the complete suite of file paths required by the TM2 Deploy command.
import {TM2DeploymentReport}          from  '../tm-tools-types';      // Interface. Represents the data that is generated by a TM2 Deployment Report.
import {TM2SharingDeploymentReport}   from  '../tm-tools-types';      // Interface. Represents the full report data generated by the tmtools:tm2:deploysharing command.
import {TM2DeploySharingFilePaths}    from  '../tm-tools-types';      // Interface. Represents the complete suite of file paths required by the tmtools:tm2:deploysharing command.

// Set the File Local Debug Namespace
const dbgNs = 'UTILITY:listr-tasks:';
SfdxFalconDebug.msg(`${dbgNs}`, `Debugging initialized for ${dbgNs}`);


// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    addGitRemote
 * @param       {string}  targetDir Required. Location where the git command will be run
 * @param       {string}  gitRemoteUri  Required. URI of the Git Remote to be added as origin.
 * @returns     {ListrTask}  A Listr-compatible Task Object
 * @description Returns a Listr-compatible Task Object that adds the provided Git Remote as the
 *              origin remote.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function addGitRemote(targetDir:string, gitRemoteUri:string):ListrTask {

  // Make sure the calling scope has access to Shared Data.
  validateSharedData.call(this);

  // Build and return a Listr Task.
  return {
    title:  `Adding the Git Remote...`,
    enabled:() => (typeof targetDir === 'string' && targetDir !== '' && typeof gitRemoteUri === 'string' && gitRemoteUri !== ''),
    skip: (listrContext:ListrContextFinalizeGit) => {
      if (listrContext.gitInstalled !== true) {
        return true;
      }
      if (listrContext.gitRemoteIsValid !== true) {
        return 'Git Remote is Invalid';
      }
    },
    task:   (listrContext:ListrContextFinalizeGit, thisTask:ListrTask) => {
      return new Observable(observer => {

        // Initialize an OTR (Observable Task Result).
        const otr = initObservableTaskResult(`${dbgNs}addGitRemote`, listrContext, thisTask, observer, this.sharedData, this.generatorResult,
                    `Adding the Git Remote ${gitRemoteUri} to the local repository`);
        
        // Define the Task Logic to be executed.
        const asyncTask = async () => {
          const shellString = gitHelper.gitRemoteAddOrigin(targetDir, gitRemoteUri);
          SfdxFalconDebug.obj(`${dbgNs}addGitRemote:shellString:`, shellString, `shellString: `);
          return shellString;
        };

        // Execute the Task Logic.
        asyncTask()
          .then(async result => {
            await waitASecond(3);
            thisTask.title += 'Done!';
            listrContext.gitRemoteAdded = true;
            finalizeObservableTaskResult(otr);
          })
          .catch(async error => {
            await waitASecond(3);
            thisTask.title += 'Failed';
            listrContext.gitRemoteAdded = false;
            finalizeObservableTaskResult(otr, error);
          });
      });
    }
  } as ListrTask;
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    analyzeTm1Config
 * @param       {string}  aliasOrUsername Required. The alias or username associated with a
 *              TM1 org that the Salesforce CLI is currently connected to.
 * @param       {TM1AnalyzeFilePaths} tm1AnalyzeFilePaths Required. Contains all file paths required
 *              by the TM1 Analyze process.
 * @returns     {ListrObject}  A "runnable" Listr Object
 * @description Returns a "runnable" Listr Object that attempts to analyze the TM1 configuration in
 *              the org specified by the Alias or Username.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function analyzeTm1Config(aliasOrUsername:string, tm1AnalyzeFilePaths:TM1AnalyzeFilePaths):ListrObject {

  // Define function-local debug namespace and validate incoming arguments.
  const dbgNsLocal = `${dbgNs}generateTm1AnalysisReport`;
  SfdxFalconDebug.obj(`${dbgNsLocal}:arguments:`, arguments);

  // Validate incoming arguments.
  typeValidator.throwOnEmptyNullInvalidString(aliasOrUsername,      `${dbgNsLocal}`,  'aliasOrUsername');
  typeValidator.throwOnEmptyNullInvalidObject(tm1AnalyzeFilePaths,  `${dbgNsLocal}`,  'tm1AnalyzeFilePaths');

  // Make sure the calling scope has a valid context variable.
  validateSharedData.call(this);

  // Create a TM1Analysis Object
  const tm1Analysis = new Tm1Analysis(aliasOrUsername, tm1AnalyzeFilePaths, 1);

  // Put the TM1 Analysis object in shared data so the caller can use it later.
  this.sharedData['tm1Analysis'] = tm1Analysis;

  // Analyze Config
    // 1. Get Org Information (Org Name, Org ID, Org Type ie. Sandbox/Prod/Etc)
    // 2. Count Territories
    // 3. Count User/Territory Assignments
    // 4. Count ATA Rules
    // 5. Count ATA Rule Items
    // 6. Count "TerritoryManual" AccountShare Records
    // 7. Count relevant Criteria-based Sharing Rules
    // 8. Count relevant Owner-based Sharing Rules
    // 9. Count relevant Territory-based Sharing Rules
    // 10. Identify & Count Hard Dependencies
    // 11. Identify & Count Soft Dependencies
  // Write Results to Disk
    // Preparing TM1 Analysis
    // Writing Report to Local System

  // Build and return a Listr Task Object.
  return new listr(
    // TASK GROUP: TM1 Analysis Tasks
    [
      // ── ANALYSIS TASK 1 ──────────────────────────────────────────────────────────────────
      {
        title:  'Gather Org Information',
        task:   (listrContext:object, thisTask:ListrTask) => {
          return new Observable(observer => {

            // Initialize an OTR (Observable Task Result).
            const otr = initObservableTaskResult(`${dbgNs}analyzeTm1Config:AT1`, listrContext, thisTask, observer, this.sharedData, this.generatorResult,
                        `Querying org for Org ID, Company Name, and Org Type`);
    
            // Execute the Task Logic
            tm1Analysis.gatherOrgInformation()
            .then((successResult:TM1OrgInfo) => {
              SfdxFalconDebug.obj(`${dbgNs}analyzeTm1Config:AT1:successResult:`, successResult);
    
              // Save the UTILITY result to Shared Data and finalize the OTR as successful.
              this.sharedData['orgInformation'] = successResult;
              thisTask.title += chalk.blue(` (Username: ${successResult.username} | Org ID: ${successResult.orgId})`);
              finalizeObservableTaskResult(otr);
            })
            .catch((failureResult:Error) => {
              SfdxFalconDebug.obj(`${dbgNs}analyzeTm1Config:AT1:failureResult:`, failureResult);
    
              // We get here if no connections were found.
              finalizeObservableTaskResult(otr, failureResult);
            });
          });
        }
      },
      // ── ANALYSIS TASK 2 ──────────────────────────────────────────────────────────────────
      {
        title:  'Analyze Territories',
        task:   (listrContext:object, thisTask:ListrTask) => {
          return new Observable(observer => {
    
            // Initialize an OTR (Observable Task Result).
            const otr = initObservableTaskResult(`${dbgNs}analyzeTm1Config:AT2`, listrContext, thisTask, observer, this.sharedData, this.generatorResult,
                        `SELECT count() FROM Territory`);
    
            // Execute the Task Logic
            tm1Analysis.analyzeTerritories()
            .then((successResult:number) => {
              SfdxFalconDebug.str(`${dbgNs}analyzeTm1Config:AT2:successResult:`, `${successResult}`);
    
              // Save the UTILITY result to Shared Data and finalize the OTR as successful.
              this.sharedData['territoryRecordCount'] = successResult;
              thisTask.title += chalk.blue(` (${successResult} Territories Found)`);
              finalizeObservableTaskResult(otr);
            })
            .catch((failureResult:Error) => {
              SfdxFalconDebug.obj(`${dbgNs}analyzeTm1Config:AT2:failureResult:`, failureResult);
    
              // We get here if no connections were found.
              finalizeObservableTaskResult(otr, failureResult);
            });
          });
        }
      },
      // ── ANALYSIS TASK 3 ──────────────────────────────────────────────────────────────────
      {
        title:  'Analyze User/Territory Assignments',
        task:   (listrContext:object, thisTask:ListrTask) => {
          return new Observable(observer => {
    
            // Initialize an OTR (Observable Task Result).
            const otr = initObservableTaskResult(`${dbgNs}analyzeTm1Config:AT3`, listrContext, thisTask, observer, this.sharedData, this.generatorResult,
                        `SELECT count() FROM UserTerritory`);
    
            // Execute the Task Logic
            tm1Analysis.analyzeUserTerritoryAssignments()
            .then((successResult:number) => {
              SfdxFalconDebug.str(`${dbgNs}analyzeTm1Config:AT3:successResult:`, `${successResult}`);
    
              // Save the UTILITY result to Shared Data and finalize the OTR as successful.
              this.sharedData['userTerritoryRecordCount'] = successResult;
              thisTask.title += chalk.blue(` (${successResult} User/Territory Assignments Found)`);
              finalizeObservableTaskResult(otr);
            })
            .catch((failureResult:Error) => {
              SfdxFalconDebug.obj(`${dbgNs}analyzeTm1Config:AT3:failureResult:`, failureResult);
    
              // We get here if no connections were found.
              finalizeObservableTaskResult(otr, failureResult);
            });
          });
        }
      },
      // ── ANALYSIS TASK 4 ──────────────────────────────────────────────────────────────────
      {
        title:  'Analyze Territory Assignment Rules',
        task:   (listrContext:object, thisTask:ListrTask) => {
          return new Observable(observer => {
    
            // Initialize an OTR (Observable Task Result).
            const otr = initObservableTaskResult(`${dbgNs}analyzeTm1Config:AT4`, listrContext, thisTask, observer, this.sharedData, this.generatorResult,
                        `SELECT count() FROM AccountTerritoryAssignmentRule`);
    
            // Execute the Task Logic
            tm1Analysis.analyzeAtaRules()
            .then((successResult:number) => {
              SfdxFalconDebug.str(`${dbgNs}analyzeTm1Config:AT4:successResult:`, `${successResult}`);
    
              // Save the UTILITY result to Shared Data and finalize the OTR as successful.
              this.sharedData['ataRuleRecordCount'] = successResult;
              thisTask.title += chalk.blue(` (${successResult} Territory Assignment Rules Found)`);
              finalizeObservableTaskResult(otr);
            })
            .catch((failureResult:Error) => {
              SfdxFalconDebug.obj(`${dbgNs}analyzeTm1Config:AT4:failureResult:`, failureResult);
    
              // We get here if no connections were found.
              finalizeObservableTaskResult(otr, failureResult);
            });
          });
        }
      },
      // ── ANALYSIS TASK 5 ──────────────────────────────────────────────────────────────────
      {
        title:  'Analyze Territory Assignment Rule Items',
        task:   (listrContext:object, thisTask:ListrTask) => {
          return new Observable(observer => {
    
            // Initialize an OTR (Observable Task Result).
            const otr = initObservableTaskResult(`${dbgNs}analyzeTm1Config:AT5`, listrContext, thisTask, observer, this.sharedData, this.generatorResult,
                        `SELECT count() FROM AccountTerritoryAssignmentRuleItem`);
    
            // Execute the Task Logic
            tm1Analysis.analyzeAtaRuleItems()
            .then((successResult:number) => {
              SfdxFalconDebug.str(`${dbgNs}analyzeTm1Config:AT5:successResult:`, `${successResult}`);
    
              // Save the UTILITY result to Shared Data and finalize the OTR as successful.
              this.sharedData['ataRuleItemRecordCount'] = successResult;
              thisTask.title += chalk.blue(` (${successResult} Territory Assignment Rule Items Found)`);
              finalizeObservableTaskResult(otr);
            })
            .catch((failureResult:Error) => {
              SfdxFalconDebug.obj(`${dbgNs}analyzeTm1Config:AT5:failureResult:`, failureResult);
    
              // We get here if no connections were found.
              finalizeObservableTaskResult(otr, failureResult);
            });
          });
        }
      },
      // ── ANALYSIS TASK 6 ──────────────────────────────────────────────────────────────────
      {
        title:  'Analyze AccountShares',
        task:   (listrContext:object, thisTask:ListrTask) => {
          return new Observable(observer => {
    
            // Initialize an OTR (Observable Task Result).
            const otr = initObservableTaskResult(`${dbgNs}analyzeTm1Config:AT6`, listrContext, thisTask, observer, this.sharedData, this.generatorResult,
                        `SELECT count() FROM AccountShare WHERE RowCause='TerritoryManual'`);
    
            // Execute the Task Logic
            tm1Analysis.analyzeAccountShares()
            .then((successResult:number) => {
              SfdxFalconDebug.str(`${dbgNs}analyzeTm1Config:AT6:successResult:`, `${successResult}`);
    
              // Save the UTILITY result to Shared Data and finalize the OTR as successful.
              this.sharedData['accountShareRecordCount'] = successResult;
              thisTask.title += chalk.blue(` (${successResult} "TerritoryManual" AccountShares)`);
              finalizeObservableTaskResult(otr);
            })
            .catch((failureResult:Error) => {
              SfdxFalconDebug.obj(`${dbgNs}analyzeTm1Config:AT6:failureResult:`, failureResult);
    
              // We get here if no connections were found.
              finalizeObservableTaskResult(otr, failureResult);
            });
          });
        }
      },
      // ── ANALYSIS TASK 7 ──────────────────────────────────────────────────────────────────
      {
        title:  'Analyze Groups',
        task:   (listrContext:object, thisTask:ListrTask) => {
          return new Observable(observer => {
    
            // Initialize an OTR (Observable Task Result).
            const otr = initObservableTaskResult(`${dbgNs}analyzeTm1Config:AT7`, listrContext, thisTask, observer, this.sharedData, this.generatorResult,
                        `SELECT count() FROM Group WHERE Type='Territory' OR Type='TerritoryAndSubordinates'`);
    
            // Execute the Task Logic
            tm1Analysis.analyzeGroups()
            .then((successResult:number) => {
              SfdxFalconDebug.str(`${dbgNs}analyzeTm1Config:AT7:successResult:`, `${successResult}`);
    
              // Save the UTILITY result to Shared Data and finalize the OTR as successful.
              this.sharedData['groupRecordCount'] = successResult;
              thisTask.title += chalk.blue(` (${successResult} "Territory/TerritoryAndSubordinates" Groups)`);
              finalizeObservableTaskResult(otr);
            })
            .catch((failureResult:Error) => {
              SfdxFalconDebug.obj(`${dbgNs}analyzeTm1Config:AT7:failureResult:`, failureResult);
    
              // We get here if no connections were found.
              finalizeObservableTaskResult(otr, failureResult);
            });
          });
        }
      },
      // ── ANALYSIS TASK 8 ──────────────────────────────────────────────────────────────────
      {
        title:  'Analyze Account Sharing Rules',
        skip:   () => true, // TODO: To be implemented after MVP
        task:   (listrContext:object, thisTask:ListrTask) => {
          return new Observable(observer => {
    
            // Initialize an OTR (Observable Task Result).
            const otr = initObservableTaskResult(`${dbgNs}analyzeTm1Config:AT8`, listrContext, thisTask, observer, this.sharedData, this.generatorResult,
                        `TODO: Functionality Not Yet Implemented`);
    
            // Execute the Task Logic
            tm1Analysis.analyzeAccountSharingRules()
            .then((successResult:SharingRulesCount) => {
              SfdxFalconDebug.str(`${dbgNs}analyzeTm1Config:AT8:successResult:`, `${successResult}`);
    
              // Save the UTILITY result to Shared Data and finalize the OTR as successful.
              this.sharedData['accountSharingRulesCount'] = successResult;
              thisTask.title += chalk.blue(` (${successResult.sharingCriteriaRulesCount}/${successResult.sharingOwnerRulesCount}/${successResult.sharingTerritoryRulesCount} Criteria/Owner/Territory based rules referencing Territory/Territory & Subordinates groups)`);
              finalizeObservableTaskResult(otr);
            })
            .catch((failureResult:Error) => {
              SfdxFalconDebug.obj(`${dbgNs}analyzeTm1Config:AT8:failureResult:`, failureResult);
    
              // We get here if no connections were found.
              finalizeObservableTaskResult(otr, failureResult);
            });
          });
        }
      },
      // ── ANALYSIS TASK 9 ──────────────────────────────────────────────────────────────────
      {
        title:  'Analyze Lead Sharing Rules',
        skip:   () => true, // TODO: To be implemented after MVP
        task:   (listrContext:object, thisTask:ListrTask) => {
          return new Observable(observer => {
    
            // Initialize an OTR (Observable Task Result).
            const otr = initObservableTaskResult(`${dbgNs}analyzeTm1Config:AT9`, listrContext, thisTask, observer, this.sharedData, this.generatorResult,
                        `TODO: Functionality Not Yet Implemented`);
    
            // Execute the Task Logic
            tm1Analysis.analyzeLeadSharingRules()
            .then((successResult:SharingRulesCount) => {
              SfdxFalconDebug.str(`${dbgNs}analyzeTm1Config:AT9:successResult:`, `${successResult}`);
    
              // Save the UTILITY result to Shared Data and finalize the OTR as successful.
              this.sharedData['leadSharingRulesCount'] = successResult;
              thisTask.title += chalk.blue(` (${successResult.sharingCriteriaRulesCount}/${successResult.sharingOwnerRulesCount} Criteria/Owner based rules referencing Territory/Territory & Subordinates groups)`);
              finalizeObservableTaskResult(otr);
            })
            .catch((failureResult:Error) => {
              SfdxFalconDebug.obj(`${dbgNs}analyzeTm1Config:AT9:failureResult:`, failureResult);
    
              // We get here if no connections were found.
              finalizeObservableTaskResult(otr, failureResult);
            });
          });
        }
      },
      // ── ANALYSIS TASK 10 ─────────────────────────────────────────────────────────────────
      {
        title:  'Analyze Opportunity Sharing Rules',
        skip:   () => true, // TODO: To be implemented after MVP
        task:   (listrContext:object, thisTask:ListrTask) => {
          return new Observable(observer => {
    
            // Initialize an OTR (Observable Task Result).
            const otr = initObservableTaskResult(`${dbgNs}analyzeTm1Config:AT10`, listrContext, thisTask, observer, this.sharedData, this.generatorResult,
                        `TODO: Functionality Not Yet Implemented`);
    
            // Execute the Task Logic
            tm1Analysis.analyzeOpportunitySharingRules()
            .then((successResult:SharingRulesCount) => {
              SfdxFalconDebug.str(`${dbgNs}analyzeTm1Config:AT10:successResult:`, `${successResult}`);
    
              // Save the UTILITY result to Shared Data and finalize the OTR as successful.
              this.sharedData['opportunitySharingRulesCount'] = successResult;
              thisTask.title += chalk.blue(` (${successResult.sharingCriteriaRulesCount}/${successResult.sharingOwnerRulesCount} Criteria/Owner based rules referencing Territory/Territory & Subordinates groups)`);
              finalizeObservableTaskResult(otr);
            })
            .catch((failureResult:Error) => {
              SfdxFalconDebug.obj(`${dbgNs}analyzeTm1Config:AT10:failureResult:`, failureResult);
    
              // We get here if no connections were found.
              finalizeObservableTaskResult(otr, failureResult);
            });
          });
        }
      },
      // ── ANALYSIS TASK 11 ─────────────────────────────────────────────────────────────────
      {
        title:  'Analyze TM1 Hard Dependencies',
        skip:   () => true, // TODO: To be implemented after MVP
        task:   (listrContext:object, thisTask:ListrTask) => {
          return new Observable(observer => {
    
            // Initialize an OTR (Observable Task Result).
            const otr = initObservableTaskResult(`${dbgNs}analyzeTm1Config:AT11`, listrContext, thisTask, observer, this.sharedData, this.generatorResult,
                        `TODO: Functionality Not Yet Implemented`);
    
            // Execute the Task Logic
            tm1Analysis.analyzeHardTm1Dependencies()
            .then((successResult:TM1HardDependencies) => {
              SfdxFalconDebug.obj(`${dbgNs}analyzeTm1Config:AT11:successResult:`, successResult);
    
              // Save the UTILITY result to Shared Data and finalize the OTR as successful.
              this.sharedData['tm1HardDependencies'] = successResult;
              thisTask.title += chalk.blue(` (${successResult.hardTm1DependencyCount} HARD dependencies on TM1)`);
              finalizeObservableTaskResult(otr);
            })
            .catch((failureResult:Error) => {
              SfdxFalconDebug.obj(`${dbgNs}analyzeTm1Config:AT11:failureResult:`, failureResult);
    
              // We get here if no connections were found.
              finalizeObservableTaskResult(otr, failureResult);
            });
          });
        }
      },
      // ── ANALYSIS TASK 12 ─────────────────────────────────────────────────────────────────
      {
        title:  'Analyze TM1 Soft Dependencies',
        skip:   () => true, // TODO: To be implemented after MVP
        task:   (listrContext:object, thisTask:ListrTask) => {
          return new Observable(observer => {
    
            // Initialize an OTR (Observable Task Result).
            const otr = initObservableTaskResult(`${dbgNs}analyzeTm1Config:AT12`, listrContext, thisTask, observer, this.sharedData, this.generatorResult,
                        `TODO: Functionality Not Yet Implemented`);
    
            // Execute the Task Logic
            tm1Analysis.analyzeSoftTm1Dependencies()
            .then((successResult:TM1SoftDependencies) => {
              SfdxFalconDebug.obj(`${dbgNs}analyzeTm1Config:AT12:successResult:`, successResult);
    
              // Save the UTILITY result to Shared Data and finalize the OTR as successful.
              this.sharedData['tm1SoftDependencies'] = successResult;
              thisTask.title += chalk.blue(` (${successResult.softTm1DependencyCount} SOFT dependencies on TM1)`);
              finalizeObservableTaskResult(otr);
            })
            .catch((failureResult:Error) => {
              SfdxFalconDebug.obj(`${dbgNs}analyzeTm1Config:AT12:failureResult:`, failureResult);
    
              // We get here if no connections were found.
              finalizeObservableTaskResult(otr, failureResult);
            });
          });
        }
      }
    ],
    // TASK GROUP Options: TM1 Analysis Tasks
    {
      concurrent:   false,
      collapse:     false,
      exitOnError:  true,
      renderer:   chooseListrRenderer()
    }
  );
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    buildDevHubAliasList
 * @returns     {ListrTask}  A Listr-compatible Task Object
 * @description Returns a Listr-compatible Task Object that takes a list of identified Dev Hubs
 *              and uses it to create an Inquirer-compatible "choice list". This function must be
 *              executed using the call() method because it relies on the caller's "this" context
 *              to properly function.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function buildDevHubAliasList():ListrTask {

  // Make sure the calling scope has a valid context variable.
  validateSharedData.call(this);

  // Grab Generator Requirements out of Shared Data.
  const generatorRequirements = this.sharedData['generatorRequirements']  as GeneratorRequirements;
  SfdxFalconDebug.obj(`${dbgNs}buildDevHubAliasList:generatorRequirements:`, generatorRequirements);

  // Build and return a Listr Task.
  return {
    title:  'Building DevHub Alias List...',
    enabled:() => typeValidator.isNotNullInvalidObject(generatorRequirements)
                  && generatorRequirements.devHubOrgs === true,
    task:   (listrContext, thisTask) => {

      // Grab DevHub Org Infos out of Shared Data.
      const devHubOrgInfos = this.sharedData['devHubOrgInfos'] as sfdxHelper.StandardOrgInfo[];
      SfdxFalconDebug.obj(`${dbgNs}buildDevHubAliasList:devHubOrgInfos:`, devHubOrgInfos);

      // Build a list of Choices based on the DevHub org infos, followed by a separator and a "not specified" option.
      this.sharedData['devHubAliasChoices'] = yoHelper.buildOrgAliasChoices(devHubOrgInfos);
      this.sharedData['devHubAliasChoices'].push(new yoHelper.YeomanSeparator());
      this.sharedData['devHubAliasChoices'].push({name:'My DevHub Is Not Listed Above', value:'NOT_SPECIFIED', short:'Not Specified'});
      thisTask.title += 'Done!';
      return;
    }
  } as ListrTask;
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    buildEnvHubAliasList
 * @returns     {ListrTask}  A Listr-compatible Task Object
 * @description Returns a Listr-compatible Task Object that takes a list of identified Environment
 *              Hubs and uses it to create an Inquirer-compatible "choice list". This function must
 *              be executed using the call() method because it relies on the caller's "this" context
 *              to properly function.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function buildEnvHubAliasList():ListrTask {

  // Make sure the calling scope has a valid context variable.
  validateSharedData.call(this);

  // Grab Generator Requirements out of Shared Data.
  const generatorRequirements = this.sharedData['generatorRequirements']  as GeneratorRequirements;
  SfdxFalconDebug.obj(`${dbgNs}buildEnvHubAliasList:generatorRequirements:`, generatorRequirements);

  // Build and return a Listr Task.
  return {
    title:  'Building EnvHub Alias List...',
    enabled:() => typeValidator.isNotNullInvalidObject(generatorRequirements)
                  && generatorRequirements.envHubOrgs === true,
    task:   (listrContext, thisTask) => {

      // Grab EnvHub Org Infos out of Shared Data.
      const envHubOrgInfos = this.sharedData['envHubOrgInfos'] as sfdxHelper.StandardOrgInfo[];
      SfdxFalconDebug.obj(`${dbgNs}buildEnvHubAliasList:envHubOrgInfos:`, envHubOrgInfos);
      
      // Build a list of Choices based on the Env Hub org infos, followed by a separator and a "not specified" option.
      this.sharedData['envHubAliasChoices'] = yoHelper.buildOrgAliasChoices(envHubOrgInfos);
      this.sharedData['envHubAliasChoices'].push(new yoHelper.YeomanSeparator());
      this.sharedData['envHubAliasChoices'].push({name:'My Environment Hub Is Not Listed', value:'NOT_SPECIFIED', short:'Not Specified'});
      thisTask.title += 'Done!';
      return;
    }
  } as ListrTask;
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    buildPkgOrgAliasList
 * @returns     {ListrTask}  A Listr-compatible Task Object
 * @description Returns a Listr-compatible Task Object that takes a list of identified Packaging
 *              Orgs and uses it to create an Inquirer-compatible "choice list". This function must
 *              be executed using the call() method because it relies on the caller's "this" context
 *              to properly function.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function buildPkgOrgAliasList():ListrTask {

  // Make sure the calling scope has a valid context variable.
  validateSharedData.call(this);

  // Grab Generator Requirements out of Shared Data.
  const generatorRequirements = this.sharedData['generatorRequirements']  as GeneratorRequirements;
  SfdxFalconDebug.obj(`${dbgNs}buildPkgOrgAliasList:generatorRequirements:`, generatorRequirements);

  // Build and return a Listr Task.
  return {
    title:  'Building PkgOrg Alias List...',
    enabled:() => typeValidator.isNotNullInvalidObject(generatorRequirements)
                  && (generatorRequirements.managedPkgOrgs === true || generatorRequirements.unmanagedPkgOrgs === true),
    task:   (listrContext, thisTask) => {

      // Grab Package Org Infos out of Shared Data.
      const pkgOrgInfos = this.sharedData['pkgOrgInfos'] as sfdxHelper.StandardOrgInfo[];
      SfdxFalconDebug.obj(`${dbgNs}buildPkgOrgAliasList:pkgOrgInfos:`, pkgOrgInfos);

      // Build Choices based on ALL Packaging Org infos, followed by a separator and a "not specified" option.
      this.sharedData['pkgOrgAliasChoices'] = yoHelper.buildOrgAliasChoices(pkgOrgInfos);
      this.sharedData['pkgOrgAliasChoices'].push(new yoHelper.YeomanSeparator());
      this.sharedData['pkgOrgAliasChoices'].push({name:'My Packaging Org Is Not Listed', value:'NOT_SPECIFIED', short:'Not Specified'});

      // Build Choices based on MANAGED Packaging Org infos, followed by a separator and a "not specified" option.
      const managedPkgOrgInfos = new Array<sfdxHelper.StandardOrgInfo>();
      for (const orgInfo of pkgOrgInfos) {
        if (orgInfo.nsPrefix) {
          managedPkgOrgInfos.push(orgInfo);
        }
      }
      this.sharedData['managedPkgOrgAliasChoices'] = yoHelper.buildOrgAliasChoices(managedPkgOrgInfos);
      this.sharedData['managedPkgOrgAliasChoices'].push(new yoHelper.YeomanSeparator());
      this.sharedData['managedPkgOrgAliasChoices'].push({name:'My Packaging Org Is Not Listed', value:'NOT_SPECIFIED', short:'Not Specified'});

      // Build Choices based on UNMANAGED Packaging Org infos, followed by a separator and a "not specified" option.
      const unmanagedPkgOrgInfos = new Array<sfdxHelper.StandardOrgInfo>();
      for (const orgInfo of pkgOrgInfos) {
        if (! orgInfo.nsPrefix) {
          unmanagedPkgOrgInfos.push(orgInfo);
        }
      }
      this.sharedData['unmanagedPkgOrgAliasChoices'] = yoHelper.buildOrgAliasChoices(unmanagedPkgOrgInfos);
      this.sharedData['unmanagedPkgOrgAliasChoices'].push(new yoHelper.YeomanSeparator());
      this.sharedData['unmanagedPkgOrgAliasChoices'].push({name:'My Packaging Org Is Not Listed', value:'NOT_SPECIFIED', short:'Not Specified'});

      // All done!
      thisTask.title += 'Done!';
      return;
    }
  } as ListrTask;
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    buildScratchOrgAliasList
 * @returns     {ListrTask}  A Listr-compatible Task Object
 * @description Returns a Listr-compatible Task Object that takes the list of all connected scratch
 *              orgs and uses it to create an Inquirer-compatible "choice list". This function must
 *              be executed using the call() method because it relies on the caller's "this" context
 *              to properly function.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function buildScratchOrgAliasList():ListrTask {

  // Make sure the calling scope has a valid context variable.
  validateSharedData.call(this);

  // Grab Generator Requirements out of Shared Data.
  const generatorRequirements = this.sharedData['generatorRequirements']  as GeneratorRequirements;
  SfdxFalconDebug.obj(`${dbgNs}buildScratchOrgAliasList:generatorRequirements:`, generatorRequirements);

  // Build and return a Listr Task.
  return {
    title:  'Building Scratch Org Alias List...',
    enabled:() => typeValidator.isNotNullInvalidObject(generatorRequirements)
                  && generatorRequirements.scratchOrgs === true,
    task:   (listrContext, thisTask) => {

      // Grab Scratch Org Infos out of Shared Data.
      const scratchOrgInfos = Array.from(this.sharedData['scratchOrgInfoMap'].values() as sfdxHelper.ScratchOrgInfo[]);
      SfdxFalconDebug.obj(`${dbgNs}buildScratchOrgAliasList:scratchOrgInfos:`, scratchOrgInfos);
      
      // Build Choices based on ALL Scratch Org Infos, followed by a separator and a "not specified" option.
      this.sharedData['scratchOrgAliasChoices'] = yoHelper.buildOrgAliasChoices(scratchOrgInfos);
      this.sharedData['scratchOrgAliasChoices'].push(new yoHelper.YeomanSeparator());
      this.sharedData['scratchOrgAliasChoices'].push({name:'My Scratch Org Is Not Listed', value:'NOT_SPECIFIED', short:'Not Specified'});

      // All done!
      thisTask.title += 'Done!';
      return;
    }
  } as ListrTask;
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    buildStandardOrgAliasList
 * @returns     {ListrTask}  A Listr-compatible Task Object
 * @description Returns a Listr-compatible Task Object that takes the list of all Standard (ie.
 *              non-scratch) connected orgs and uses it to create an Inquirer-compatible "choice list".
 *              This function must be executed using the call() method because it relies on the
 *              caller's "this" context to properly function.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function buildStandardOrgAliasList():ListrTask {

  // Make sure the calling scope has a valid context variable.
  validateSharedData.call(this);

  // Grab Generator Requirements out of Shared Data.
  const generatorRequirements = this.sharedData['generatorRequirements']  as GeneratorRequirements;
  SfdxFalconDebug.obj(`${dbgNs}buildStandardOrgAliasList:generatorRequirements:`, generatorRequirements);

  // Build and return a Listr Task.
  return {
    title:  'Building Standard Org Alias List...',
    enabled:() => typeValidator.isNotNullInvalidObject(generatorRequirements)
                  && generatorRequirements.standardOrgs === true,
    task:   (listrContext, thisTask) => {

      // Grab Standard Org Infos out of Shared Data.
      const standardOrgInfos = Array.from(this.sharedData['standardOrgInfoMap'].values() as sfdxHelper.ScratchOrgInfo[]);
      SfdxFalconDebug.obj(`${dbgNs}buildStandardOrgAliasList:standardOrgInfos:`, standardOrgInfos);
      
      // Build Choices based on ALL Standard Org Infos, followed by a separator and a "not specified" option.
      this.sharedData['standardOrgAliasChoices'] = yoHelper.buildOrgAliasChoices(standardOrgInfos);
      this.sharedData['standardOrgAliasChoices'].push(new yoHelper.YeomanSeparator());
      this.sharedData['standardOrgAliasChoices'].push({name:'My Org Is Not Listed', value:'NOT_SPECIFIED', short:'Not Specified'});

      // All done!
      thisTask.title += 'Done!';
      return;
    }
  } as ListrTask;
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    cleanTm1Config
 * @param       {TM1AnalysisReport} tm1AnalysisReport Required. Report on target TM1 config.
 * @param       {TM1ExtractionReport} tm1ExtractionReport Required. Report on extracted TM1 config.
 * @param       {TM1TransformationReport} tm1TransformationReport Required. Report on transformed
 *              TM1 config.
 * @param       {TM1CleanFilePaths} tm1CleanFilePaths Required. All file paths needed to
 *              carry out the TM1 Transformation tasks.
 * @returns     {ListrObject}  A "runnable" Listr Object
 * @description Returns a "runnable" Listr Object that uses a fully-prepared instance of a
 *              TmToolsLoad object to attempt to deploy the final set of TM2 metadata, specifically
 *              the Sharing Rules.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function cleanTm1Config(tm1AnalysisReport:TM1AnalysisReport, tm1ExtractionReport:TM1ExtractionReport, tm1TransformationReport:TM1TransformationReport, tm1CleanFilePaths:TM1CleanFilePaths):ListrObject {

  // Define function-local debug namespace.
  const dbgNsLocal = `${dbgNs}cleanTm1Config`;
  
  // Validate incoming arguments.
  typeValidator.throwOnNullInvalidObject(tm1AnalysisReport,       `${dbgNsLocal}`, 'tm1AnalysisReport');
  typeValidator.throwOnNullInvalidObject(tm1ExtractionReport,     `${dbgNsLocal}`, 'tm1ExtractionReport');
  typeValidator.throwOnNullInvalidObject(tm1TransformationReport, `${dbgNsLocal}`, 'tm1TransformationReport');
  typeValidator.throwOnNullInvalidObject(tm1CleanFilePaths,       `${dbgNsLocal}`, 'tm1CleanFilePaths');

  // Make sure the calling scope has access to Shared Data.
  validateSharedData.call(this);

  // Make sure that Shared Data has a valid Object key for tmToolsClean.
  typeValidator.throwOnInvalidObject(this.sharedData['tmToolsClean'],  `${dbgNsLocal}`, 'this.sharedData.tmToolsClean');

  // Define a variable to hold the TM Tools Deployment Context.
  let tmToolsClean:TmToolsClean = null;

  // Build and return a Listr Task Object.
  return new listr(
    // TASK GROUP: TM1 Configuration Cleanup Tasks
    [
      // ── CLEANUP TASK 1: Prepare a TM1 Cleanup Object ───────────────────────────────────────────
      {
        title:  'Prepare a TM1 Cleanup context',
        task:   (listrContext:object, thisTask:ListrTask) => {
          return new Observable(observer => {
    
            // Initialize an OTR (Observable Task Result).
            const otr = initObservableTaskResult(`${dbgNsLocal}:CT1`, listrContext, thisTask, observer, this.sharedData, this.generatorResult,
                        `Inspecting transformed TM1 configuration in ${tm1CleanFilePaths.transformedMetadataDir}`);
    
            // Define the Task Logic to be executed.
            const asyncTask = async () => {
              tmToolsClean = await TmToolsClean.prepare(
                tm1AnalysisReport,
                tm1ExtractionReport,
                tm1TransformationReport,
                tm1CleanFilePaths
              );
              SfdxFalconDebug.obj(`${dbgNsLocal}:CT1:tmToolsClean:`, tmToolsClean);

              // Put the TM Tools Cleanup object in shared data so the caller can use it later.
              this.sharedData['tmToolsClean'] = tmToolsClean;
            };

            // Execute the Task Logic.
            asyncTask()
            .then(async result => {
              await waitASecond(3);
              finalizeObservableTaskResult(otr);
            })
            .catch(async error => {
              await waitASecond(3);
              finalizeObservableTaskResult(otr, error);
            });
          });
        }
      },
      // ── CLEANUP TASK 2: Remove all TM1 Sharing Rules ───────────────────────────────────────────
      {
        title:  'Remove all TM1 Sharing Rules',
        task:   (listrContext:object, thisTask:ListrTask) => {
          return new Observable(observer => {
    
            // Initialize an OTR (Observable Task Result).
            const otr = initObservableTaskResult(`${dbgNsLocal}:CT2`, listrContext, thisTask, observer, this.sharedData, this.generatorResult,
                        `Deploying destructive changes from ${tmToolsClean.filePaths.tm1SharingRulesCleanupDir}`);
    
            // Execute the Task Logic.
            tmToolsClean.destroySharingRules()
            .then((deploymentResult:DeployResult) => {
              SfdxFalconDebug.obj(`${dbgNsLocal}:CT2:deploymentResult:`, deploymentResult);
              finalizeObservableTaskResult(otr);
            })
            .catch((error:Error) => {
              SfdxFalconDebug.obj(`${dbgNsLocal}:CT2:error:`, error);
              finalizeObservableTaskResult(otr, error);
            });
          });
        }
      }
    ],
    // TASK GROUP OPTIONS: TM1 Configuration Cleanup Tasks
    {
      concurrent:   false,
      collapse:     false,
      exitOnError:  true,
      renderer:     chooseListrRenderer()
    }
  );
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    cloneGitRemote
 * @param       {string}  gitRemoteUri Required. ???
 * @param       {string}  targetDirectory Required. ???
 * @param       {string}  [gitCloneDirectory='']  Required. ???
 * @returns     {ListrObject}  A "runnable" Listr Object
 * @description Returns a "runnable" Listr Object that attempts to clone the Git Repository referred
 *              to by the provided Git Remote URI.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function cloneGitRemote(gitRemoteUri:string, targetDirectory:string, gitCloneDirectory:string=''):ListrObject {

  // Make sure the calling scope has access to Shared Data.
  validateSharedData.call(this);

  // Validate incoming arguments.
  validateGitCloneArguments.apply(null, arguments);

  // Build and return a Listr Task Object.
  return new listr(
    // TASK GROUP: Git Clone Tasks
    [{
      title:    `Cloning ${gitRemoteUri}...`,
      enabled:  () => (gitRemoteUri && targetDirectory),
      task:     (listrContext, thisTask:ListrTask) => {
        return new Observable(observer => {
          // Initialize an OTR (Observable Task Result).
          const otr = initObservableTaskResult(`${dbgNs}cloneGitRemote`, listrContext, thisTask, observer, this.sharedData, this.generatorResult,
                      `Cloning repository to ${path.join(targetDirectory, gitCloneDirectory)}`);

          // Define the Task Logic to be executed.
          const asyncTask = async () => {
            await waitASecond(5);
            SfdxFalconDebug.str(`${dbgNs}cloneGitRemote:gitRemoteUri:`,       gitRemoteUri,       `gitRemoteUri: `);
            SfdxFalconDebug.str(`${dbgNs}cloneGitRemote:targetDirectory:`,    targetDirectory,    `targetDirectory: `);
            SfdxFalconDebug.str(`${dbgNs}cloneGitRemote:gitCloneDirectory:`,  gitCloneDirectory,  `gitCloneDirectory: `);
            return gitHelper.gitClone(gitRemoteUri, targetDirectory, gitCloneDirectory);
            //return;
          };

          // Execute the Task Logic.
          asyncTask()
            .then(async (shellExecResult:ShellExecResult) => {
              await waitASecond(3);
              thisTask.title += 'Done!';
              listrContext.gitRemoteCloned = true;
              finalizeObservableTaskResult(otr);
            })
            .catch(async (shellExecError:ShellExecResult) => {
              await waitASecond(3);
              thisTask.title += 'Failed';
              listrContext.gitRemoteCloned = false;
              finalizeObservableTaskResult(otr,
                new SfdxFalconError( `Could not clone repository: ${shellExecError.message}`
                                   , `GitCloneFailure`
                                   , `${dbgNs}cloneGitRemote`
                                   , SfdxFalconError.wrap(shellExecError)));
            });
        });
      }
    }],
    // TASK GROUP OPTIONS: Git Clone Tasks
    {
      concurrent: false,
      collapse:   false,
      renderer:   chooseListrRenderer()
    }
  );
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    commitProjectFiles
 * @param       {string}  targetDir Required.
 * @param       {string}  commitMessage Required.
 * @returns     {ListrTask}  A Listr-compatible Task Object
 * @description Returns a Listr-compatible Task Object that commits whatever is in the Target
 *              Directory, using the commitMessage parameter for the Commit Message.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function commitProjectFiles(targetDir:string, commitMessage:string):ListrTask {

  // Make sure the calling scope has access to Shared Data.
  validateSharedData.call(this);

  // Build and return a Listr Task.
  return {
    title:  `Committing Files...`,
    enabled:() => (typeof targetDir === 'string' && targetDir !== ''),
    skip:   (listrContext:ListrContextFinalizeGit) => {
      if (listrContext.gitInstalled !== true) {
        return true;
      }
    },
    task:   (listrContext:ListrContextFinalizeGit, thisTask:ListrTask) => {
      return new Observable(observer => {

        // Initialize an OTR (Observable Task Result).
        const otr = initObservableTaskResult(`${dbgNs}commitProjectFiles`, listrContext, thisTask, observer, this.sharedData, this.generatorResult,
                    `Committing files with this message: '${commitMessage}'`);
        
        // Define the Task Logic to be executed.
        const asyncTask = async () => {
          const shellString = gitHelper.gitCommit(targetDir, commitMessage);
          SfdxFalconDebug.obj(`${dbgNs}commitProjectFiles:shellString:`, shellString, `shellString: `);
          return shellString;
        };

        // Execute the Task Logic.
        asyncTask()
          .then(async result => {
            await waitASecond(3);
            thisTask.title += 'Done!';
            listrContext.projectFilesCommitted = true;
            finalizeObservableTaskResult(otr);
          })
          .catch(async error => {
            await waitASecond(3);
            listrContext.projectFilesCommitted = false;
            SfdxFalconDebug.obj(`${dbgNs}commitProjectFiles:error:`, error, `error: `);
            (thisTask.skip as ListrSkipCommand)('Nothing to Commit');
            // NOTE: We are finalizing *without* passing the Error to force the observer to
            // end with complete() instead of error().
            finalizeObservableTaskResult(otr);
          });
      });
    }
  } as ListrTask;
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    convertMetadataSource
 * @param       {string}  mdapiSourceRootDir Required. Root directory that contains metadata that
 *              was retrieved using Metadata API.
 * @param       {string}  sfdxSourceOutputDir  Required. Directory to store the source files in
 *              after they’ve been converted to the source format. Must be an abosulte path.
 * @returns     {ListrTask}  A Listr-compatible Task Object
 * @description Returns a Listr-compatible Task Object that attempts to convert source that was
 *              retrieved via the Metadata API (MDAPI Source) into SFDX Source.
 * @private
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
function convertMetadataSource(mdapiSourceRootDir:string, sfdxSourceOutputDir:string):ListrTask {

  // Make sure the calling scope has access to Shared Data.
  validateSharedData.call(this);

  // Build and return an OTR (Observable Listr Task).
  return {
    title:  'Converting MDAPI Source...',
    task:   (listrContext, thisTask) => {
      return new Observable(observer => {

        // Initialize an OTR (Observable Task Result).
        const otr = initObservableTaskResult(`${dbgNs}convertMetadataSource`, listrContext, thisTask, observer, this.sharedData, this.generatorResult,
                    `Converting MDAPI source from ${mdapiSourceRootDir}`);

        // Execute the Task Logic
        sfdxHelper.mdapiConvert(mdapiSourceRootDir, sfdxSourceOutputDir)
        .then((successResult:SfdxFalconResult) => {
          SfdxFalconDebug.obj(`${dbgNs}convertMetadataSource:successResult:`, successResult, `successResult: `);
          thisTask.title += 'Done!';
          finalizeObservableTaskResult(otr);
        })
        .catch((failureResult:SfdxFalconResult|Error) => {
          SfdxFalconDebug.obj(`${dbgNs}convertMetadataSource:failureResult:`, failureResult, `failureResult: `);
          thisTask.title += 'Failed';
          finalizeObservableTaskResult(otr, failureResult);
        });
      });
    }
  } as ListrTask;
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    deployFinalTm2Metadata
 * @param       {TmToolsDeploySharing} tmToolsDeploySharing Required. Fully-prepared instance of a
 *              `TmToolsDeploySharing` object.
 * @returns     {ListrObject}  A "runnable" Listr Object
 * @description Returns a "runnable" Listr Object that uses a fully-prepared instance of a
 *              `TmToolsDeploySharing` object to attempt to deploy the final set of TM2 sharing
 *              rules metadata
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function deployFinalTm2Metadata(tmToolsDeploySharing:TmToolsDeploySharing):ListrObject {

  // Define function-local debug namespace and validate incoming arguments.
  const dbgNsLocal = `${dbgNs}deployFinalTm2Metadata`;
  SfdxFalconDebug.obj(`${dbgNsLocal}:arguments:`, arguments);
  
  // Validate incoming arguments.
  typeValidator.throwOnNullInvalidInstance(tmToolsDeploySharing, TmToolsDeploySharing, `${dbgNsLocal}`, 'tmToolsDeploySharing');

  // Make sure the calling scope has access to Shared Data.
  validateSharedData.call(this);

  // Build and return a Listr Task Object.
  return new listr(
    // TASK GROUP: Final Metadata Deployment Tasks
    [
      // ── FINAL METADATA DEPLOY TASK 1: Deploy TM2 Sharing Rules ───────────────────────────────
      {
        title:  'Deploy TM2 Sharing Rules Metadata',
        task:   (listrContext:object, thisTask:ListrTask) => {
          return new Observable(observer => {
    
            // Initialize an OTR (Observable Task Result).
            const otr = initObservableTaskResult(`${dbgNsLocal}:FMDT1`, listrContext, thisTask, observer, this.sharedData, this.generatorResult,
                        `Deploying metadata from ${tmToolsDeploySharing.filePaths.tm2SharingRulesDeploymentDir}`);
    
            // Execute the Task Logic.
            tmToolsDeploySharing.deploySharingRules()
            .then((deploymentResult:DeployResult) => {
              SfdxFalconDebug.obj(`${dbgNsLocal}:FMDT1:deploymentResult:`, deploymentResult);
              finalizeObservableTaskResult(otr);
            })
            .catch((error:Error) => {
              SfdxFalconDebug.obj(`${dbgNsLocal}:FMDT1:error:`, error);
              finalizeObservableTaskResult(otr, error);
            });
          });
        }
      }
    ],
    // TASK GROUP OPTIONS: TM2 Data Load Tasks
    {
      concurrent:   false,
      collapse:     false,
      exitOnError:  false,
      renderer:     chooseListrRenderer()
    }
  );
}
  
// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    deployTm2Metadata
 * @param       {TM1AnalysisReport} tm1AnalysisReport Required. Report on target TM1 config.
 * @param       {TM1ExtractionReport} tm1ExtractionReport Required. Report on extracted TM1 config.
 * @param       {TM1TransformationReport} tm1TransformationReport Required. Report on transformed
 *              TM1 config.
 * @param       {TM2DeployFilePaths} tm2DeployFilePaths Required. All file paths needed to
 *              carry out the TM1 Transformation tasks.
 * @returns     {ListrObject}  A "runnable" Listr Object
 * @description Returns a "runnable" Listr Object that attempts to transform the specified set of
 *              TM1 metadata and data, then writes the transformed files to the local filesystem at
 *              the specified locations.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function deployTm2Metadata(tm1AnalysisReport:TM1AnalysisReport, tm1ExtractionReport:TM1ExtractionReport, tm1TransformationReport:TM1TransformationReport, tm2DeployFilePaths:TM2DeployFilePaths):ListrObject {

  // Validate incoming arguments.
  typeValidator.throwOnNullInvalidObject(tm1AnalysisReport,       `${dbgNs}:deployTm2Metadata`, 'tm1AnalysisReport');
  typeValidator.throwOnNullInvalidObject(tm1ExtractionReport,     `${dbgNs}:deployTm2Metadata`, 'tm1ExtractionReport');
  typeValidator.throwOnNullInvalidObject(tm1TransformationReport, `${dbgNs}:deployTm2Metadata`, 'tm1TransformationReport');
  typeValidator.throwOnNullInvalidObject(tm2DeployFilePaths,      `${dbgNs}:deployTm2Metadata`, 'tm2DeployFilePaths');

  // Make sure the calling scope has access to Shared Data.
  validateSharedData.call(this);

  // Define a variable to hold the TM Tools Deployment Context.
  let tmToolsDeploy:TmToolsDeploy = null;

  // Build and return a Listr Task Object.
  return new listr(
    // TASK GROUP: TM2 Deployment Tasks
    [
      // ── DEPLOYMENT TASK 1: Prepare Environment for TM2 Metadata Deployment ─────────────────────
      {
        title:  'Prepare Environment for TM2 Metadata Deployment',
        task:   (listrContext:object, thisTask:ListrTask) => {
          return new Observable(observer => {
    
            // Initialize an OTR (Observable Task Result).
            const otr = initObservableTaskResult(`${dbgNs}deployTm2Metadata:DT1`, listrContext, thisTask, observer, this.sharedData, this.generatorResult,
                        `Examining TM2 data and metadata and preparing a Deployment Context`);
    
            // Define the Task Logic to be executed.
            const asyncTask = async () => {
              tmToolsDeploy = await TmToolsDeploy.prepare(
                tm1AnalysisReport,
                tm1ExtractionReport,
                tm1TransformationReport,
                tm2DeployFilePaths
              );
              SfdxFalconDebug.obj(`${dbgNs}deployTm2Metadata:DT1:tmToolsDeploy:`, tmToolsDeploy);

              // Put the TM Tools Deploy object in shared data so the caller can use it later.
              this.sharedData['tmToolsDeploy'] = tmToolsDeploy;
            };

            // Execute the Task Logic.
            asyncTask()
              .then(async result => {
                await waitASecond(3);
                finalizeObservableTaskResult(otr);
              })
              .catch(async error => {
                await waitASecond(3);
                finalizeObservableTaskResult(otr, error);
              });
          });
        }
      },
      // ── DEPLOYMENT TASK 2: Deploy the "main" TM2 metadata ──────────────────────────────────────
      {
        title:  'Deploy Main Group of TM2 Metadata',
        task:   (listrContext:object, thisTask:ListrTask) => {
          return new Observable(observer => {
    
            // Initialize an OTR (Observable Task Result).
            const otr = initObservableTaskResult(`${dbgNs}deployTm2Metadata:DT2`, listrContext, thisTask, observer, this.sharedData, this.generatorResult,
                        `Deploying the main group of TM2 metadata`);
    
            // Define the Task Logic to be executed.
            const asyncTask = async () => {
              await tmToolsDeploy.deployMainMetadata();
            };

            // Execute the Task Logic.
            asyncTask()
              .then(async result => {
                await waitASecond(3);
                finalizeObservableTaskResult(otr);
              })
              .catch(async error => {
                await waitASecond(3);
                finalizeObservableTaskResult(otr, error);
              });
          });
        }
      }
    ],
    // TASK GROUP OPTIONS: TM2 Deployment Tasks
    {
      concurrent:   false,
      collapse:     false,
      exitOnError:  true,
      renderer:     chooseListrRenderer()
    }
  );
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    extractMdapiSource
 * @param       {string}  zipFile Required. Path to a zip file produced by an MDAPI retrieve
 *              operation, like "sfdx force:mdapi:retrieve".
 * @param       {string}  zipExtractTarget  Required. Path of the directory where the MDAPI source
 *              in the Zip File will be extracted to.
 * @returns     {ListrTask}  A Listr-compatible Task Object
 * @description Returns a Listr-compatible Task Object that attempts to extract the MDAPI source
 *              from inside of a Zip File produced by an MDAPI retrieve operation.
 * @private
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
function extractMdapiSource(zipFile:string, zipExtractTarget:string):ListrTask {

  // Make sure the calling scope has access to Shared Data.
  validateSharedData.call(this);

  // Build and return an OTR (Observable Listr Task).
  return {
    title:  'Extract MDAPI Source',
    task:   (listrContext:ListrContextPkgRetExCon, thisTask:ListrTask) => {
      return new Observable(observer => {

        // Initialize an OTR (Observable Task Result).
        const otr = initObservableTaskResult(`${dbgNs}extractMdapiSource`, listrContext, thisTask, observer, this.sharedData, this.generatorResult,
                    `Extracting source into ${zipExtractTarget}`);

        // Execute the Task Logic
        zipHelper.extract(zipFile, zipExtractTarget)
        .then(() => {
          listrContext.sourceExtracted = true;
          finalizeObservableTaskResult(otr);
        })
        .catch(extractionError => {
          listrContext.sourceExtracted = false;
          finalizeObservableTaskResult(otr,
            new SfdxFalconError( `MDAPI source from ${zipFile} could not be extracted to ${zipExtractTarget}`
                               , `SourceExtractionError`
                               , `${dbgNs}extractZipFile`
                               , extractionError));
        });
      });
    }
  } as ListrTask;
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    fetchAndConvertManagedPackage
 * @param       {string}  aliasOrUsername Required. The alias or username associated with a
 *              packaging org that the Salesforce CLI is currently connected to.
 * @param       {string}  packageName Required. The name of the desired managed package.
 * @param       {string}  projectDir  Required. The root of the Project Directory
 * @param       {string}  packageDir  Required. Name of the default package directory, located
 *              inside of "projectDir/sfdx-source/"
 * @returns     {ListrObject}  A "runnable" Listr Object
 * @description Returns a "runnable" Listr Object that attempts to retrieve, extract, and convert
 *              the metadata for the specified package from the specified org. The converted
 *              metadata source will be saved to the Package Directory specified by the caller.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function fetchAndConvertManagedPackage(aliasOrUsername:string, packageName:string, projectDir:string, packageDir:string):ListrObject {

  // Validate incoming arguments.
  typeValidator.throwOnEmptyNullInvalidString(aliasOrUsername,  `${dbgNs}:fetchAndConvertManagedPackage`, 'aliasOrUsername');
  typeValidator.throwOnEmptyNullInvalidString(packageName,      `${dbgNs}:fetchAndConvertManagedPackage`, 'packageName');
  typeValidator.throwOnEmptyNullInvalidString(projectDir,       `${dbgNs}:fetchAndConvertManagedPackage`, 'projectDir');
  typeValidator.throwOnEmptyNullInvalidString(packageDir,       `${dbgNs}:fetchAndConvertManagedPackage`, 'packageDir');

  // Determine various directory locations.
  const retrieveTargetDir   = path.join(projectDir, 'temp');
  const zipFile             = path.join(projectDir, 'temp', 'unpackaged.zip');
  const zipExtractTarget    = path.join(projectDir, 'mdapi-source', 'original');
  const mdapiSourceRootDir  = path.join(projectDir, 'mdapi-source', 'original');
  const sfdxSourceOutputDir = path.join(projectDir, 'sfdx-source', packageDir);

  // Build and return a Listr Task Object.
  return new listr(
    // TASK GROUP: SFDX Config Tasks
    [
      packagedMetadataFetch.call(this, aliasOrUsername, [packageName], retrieveTargetDir),
      extractMdapiSource.call(this, zipFile, zipExtractTarget),
      convertMetadataSource.call(this, mdapiSourceRootDir, sfdxSourceOutputDir)
    ],
    // TASK GROUP OPTIONS: SFDX Config Tasks
    {
      concurrent: false,
      collapse:   false,
      renderer:   chooseListrRenderer()
    }
  );
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    extractTm1Config
 * @param       {TM1AnalysisReport} tm1AnalysisReport Required. TM1 analysis that will be the basis
 *              for the extraction.  It is assumed that the value provided for the aliasOrUsername
 *              argument will match what is in the TM1Analysis.username property.
 * @param       {TM1ExtractFilePaths} tm1ExtractFilePaths  Required. Contains all File Paths needed
 *              by the Extract command.
 * @returns     {ListrObject}  A "runnable" Listr Object
 * @description Returns a "runnable" Listr Object that attempts to retrieve and extract the
 *              unpackaged metadata and data representing TM1 configuration.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function extractTm1Config(tm1AnalysisReport:TM1AnalysisReport, tm1ExtractFilePaths:TM1ExtractFilePaths):ListrObject {

  // Validate incoming arguments.
  typeValidator.throwOnNullInvalidObject(tm1AnalysisReport,   `${dbgNs}:extractTm1Config`, 'tm1AnalysisReport');
  typeValidator.throwOnNullInvalidObject(tm1ExtractFilePaths, `${dbgNs}:extractTm1Config`, 'tm1ExtractFilePaths');

  // Set the path to the MDAPI Retrieval Zip file.
  const zipFile = path.join(tm1ExtractFilePaths.extractedMetadataDir, 'unpackaged.zip');

  // Grab the Username out of the Org Info in the TM1 Analysis.
  const aliasOrUsername = tm1AnalysisReport.orgInfo.username;

  // Get the TM1 Extract package manifest path.
  const manifestFilePath = require.resolve('../../../dist-files/tm1extract-manifest.xml');

  // Build and return a Listr Task Object.
  return new listr(
    // TASK GROUP: TM1 Config Extraction Tasks
    [
      metadataRetrieve.call(this, aliasOrUsername, manifestFilePath, tm1ExtractFilePaths.extractedMetadataDir),
      extractMdapiSource.call(this, zipFile, tm1ExtractFilePaths.extractedMetadataDir),
      {
        title:  `Execute SOQL Queries`,
        task:   () => fetchTm1Data.call(this, aliasOrUsername, tm1ExtractFilePaths)
      }
    ],
    // TASK GROUP OPTIONS: TM1 Config Extraction Tasks
    {
      concurrent:   false,
      collapse:     false,
      exitOnError:  true,
      renderer:     chooseListrRenderer()
    }
  );
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    finalizeGit
 * @param       {string}  targetDirectory Required. Directory that will be initialized with Git.
 * @param       {string}  [gitRemoteUri]  Optional. URI of the remote that should be associated
 *              with the repository that we're going to initialize.
 * @returns     {ListrObject}  A "runnable" Listr Object
 * @description Returns a "runnable" Listr Object that initializes Git in the Target Directory, then
 *              connects that repo to the remote specified by the Git Remote URI.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function finalizeGit(targetDir:string, gitRemoteUri:string='', gitCommitMsg:string='Initial Commit'):ListrObject {

  // Debug incoming arguments
  SfdxFalconDebug.obj(`${dbgNs}finalizeGit:arguments:`, arguments, `arguments: `);

  // Make sure the calling scope has a valid context variable.
  validateSharedData.call(this);

  // Make sure the caller provided a Target Directory.
  if (typeof targetDir !== 'string' || targetDir === '') {
    throw new SfdxFalconError( `Expected targetDir to be a non-empty string but got type '${typeof targetDir}' instead.`
                             , `TypeError`
                             , `${dbgNs}finalizeGit`);
  }

  // Build and return a Listr Object.
  return new listr(
    [
      // TASKS: Git Finalization Tasks
      gitRuntimeCheck.call(this),
      initializeGit.call(this, targetDir),
      stageProjectFiles.call(this, targetDir),
      commitProjectFiles.call(this, targetDir, gitCommitMsg),
      reValidateGitRemote.call(this, gitRemoteUri),
      addGitRemote.call(this, targetDir, gitRemoteUri)
    ],
    {
      // TASK OPTIONS: Git Finalization Tasks
      concurrent:   false,
      collapse:     false,
      exitOnError:  false,
      renderer:     chooseListrRenderer()
    }
  ) as ListrObject;
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    finalizeObservableTaskResult
 * @param       {SfdxFalconResult}  otr Required. An "Observable Task Result".
 * @param       {ErrorOrResult} [errorOrResult] Optional. Might be an Error or an SfdxFalconResult.
 * @returns     {void}
 * @description Given a LISTR Result, attempts to "finalize" it by performing a number of tasks.
 *              These include finishing any progress notifications, marking the result as succeeded
 *              (or errror if an SfdxFalconError is provided), attaching the result to its parent
 *              result, and then completing (or error-ing) the observer.
 * @private
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
function finalizeObservableTaskResult(otr:SfdxFalconResult, errorOrResult?:ErrorOrResult):void {

  // Define a special "observer throw".
  const observerThrow = (error:Error):void => {
    try {
      otr.detail['observer'].error(SfdxFalconError.wrap(error));
    }
    catch (noObserverError) {
      SfdxFalconDebug.debugObject('WARNING! OBSERVER MISSING:', error);
      throw SfdxFalconError.wrap(error);
    }
  };

  // Validate incoming arguments.
  if (typeof otr === 'undefined') {
    return observerThrow(new SfdxFalconError( `Expected otr to be an SfdxFalconResult but got 'undefined' instead.`
                                            , `TypeError`
                                            , `${dbgNs}finalizeObservableTaskResult`));
  }
  if ((otr instanceof SfdxFalconResult) !== true) {
    return observerThrow(new SfdxFalconError( `Expected otr to be an SfdxFalconResult but got '${(otr.constructor) ? otr.constructor.name : 'unknown'}' instead.`
                                            , `TypeError`
                                            , `${dbgNs}finalizeObservableTaskResult`));
  }
  if (typeof otr.detail !== 'object') {
    return observerThrow(new SfdxFalconError( `Expected otr.detail to be an object but got '${typeof otr.detail}' instead.`
                                            , `TypeError`
                                            , `${dbgNs}finalizeObservableTaskResult`));
  }
  if (typeof errorOrResult !== 'undefined' && ((errorOrResult instanceof Error) !== true) && ((errorOrResult instanceof SfdxFalconResult) !== true)) {
    return observerThrow(new SfdxFalconError( `Expected errorOrResult to be an instance of Error or SfdxFalconResult if provided but got '${(errorOrResult.constructor) ? errorOrResult.constructor.name : 'unknown'}' instead.`
                                            , `TypeError`
                                            , `${dbgNs}finalizeObservableTaskResult`));
  }

  // Extract key objects from the OTR Detail.
  const otrObserver           = otr.detail['observer']      || {} as Subscriber;
  const parentResult          = otr.detail['parentResult']  || {} as SfdxFalconResult;
  const progressNotification  = otr.detail['progressNotification'] as NodeJS.Timeout;

  // Finish any Progress Notifications attached to this OTR (Observable Task Result).
  FalconProgressNotifications.finish(progressNotification);

  // Set the final state of the OTR (success or error).
  if (typeof errorOrResult === 'undefined') {
    // Succeeded
    otr.success();
  }
  else {
    // Failed
    if (errorOrResult instanceof Error) {
      otr.error(errorOrResult);
    }
    if (errorOrResult instanceof SfdxFalconResult) {
      try {
        otr.addChild(errorOrResult);
      }
      catch {
        // No need to do anything here. We are just suppressing any
        // bubbled errors from the previous addChild() call.
      }
    }
  }

  // Add the OTR as a child of it's attached Parent Result (if present).
  if (parentResult instanceof SfdxFalconResult) {
    try {
      parentResult.addChild(otr);
    }
    catch (bubbledError) {
      // If we get here, it means the parent was set to Bubble Errors.
      // That means that bubbledError should be an SfdxFalconResult
      return observerThrow(SfdxFalconError.wrap(bubbledError.errObj));
    }
  }

  // Tell the Observable to "complete" or "error", depending on whether we got an Error object or not.
  if (typeof errorOrResult === 'undefined') {
    if (typeof otrObserver.complete === 'function') {
      return otrObserver.complete();
    }
  }
  else {
    // Is it an Error object?
    if (errorOrResult instanceof Error) {
      return observerThrow(SfdxFalconError.wrap(errorOrResult));
    }
    // Is it an SfdxFalconResult Object?
    if (errorOrResult instanceof SfdxFalconResult) {
      if (isEmpty(errorOrResult.errObj) !== true) {
        return observerThrow(SfdxFalconError.wrap(errorOrResult.errObj));
      }
      else {
        return observerThrow(new SfdxFalconError( `finalizeObservableTaskResult() received an Error Result that did not contain an Error Object.`
                                                , `MissingErrObj`
                                                , `${dbgNs}finalizeObservableTaskResult`
                                                , SfdxFalconError.wrap(errorOrResult)));
      }
    }
    // It's not an Error OR an SfdxFalconResult. It's something invalid.
    return observerThrow(new SfdxFalconError( `finalizeObservableTaskResult() received an invalid value for its errorOrResult parameter.`
                                            , `InvalidErrorOrResult`
                                            , `${dbgNs}finalizeObservableTaskResult`
                                            , SfdxFalconError.wrap(errorOrResult)));
  }
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    generateTm1AnalysisReport
 * @param       {Tm1Analysis} tm1Analysis Required. Fully-prepared instance of a Tm1Analysis object.
 * @returns     {ListrObject}  A "runnable" Listr Object
 * @description Returns a "runnable" Listr Object that uses a fully-prepared instance of a
 *              Tm1Analysis object to generate the tm1-analysis.json report and save it to disk.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function generateTm1AnalysisReport(tm1Analysis:Tm1Analysis):ListrObject {

  // Define function-local debug namespace and validate incoming arguments.
  const dbgNsLocal = `${dbgNs}generateTm1AnalysisReport`;
  SfdxFalconDebug.obj(`${dbgNsLocal}:arguments:`, arguments);

  // Validate incoming arguments.
  typeValidator.throwOnNullInvalidInstance(tm1Analysis, Tm1Analysis, `${dbgNsLocal}`, 'tm1Analysis');

  // Make sure the calling scope has access to Shared Data.
  validateSharedData.call(this);

  // Build and return a Listr Task Object.
  return new listr(
    // TASK GROUP: Report Generation Tasks
    [
      // ── REPORT GENERATION TASK 1: Generate TM1 Analyis Report ──────────────────────────────────
      {
        title:  'Generate TM1 Analysis Report',
        task:   (listrContext:object, thisTask:ListrTask) => {
          return new Observable(observer => {
    
            // Initialize an OTR (Observable Task Result).
            const otr = initObservableTaskResult(`${dbgNsLocal}:RGT1`, listrContext, thisTask, observer, this.sharedData, this.generatorResult,
                        `Saving TM1 Analysis Report to ${tm1Analysis.filePaths.tm1AnalysisReportPath}`);
    
            // Execute the Task Logic.
            tm1Analysis.saveReport()
            .then(async (tm1AnalysisReport:TM1AnalysisReport) => {
              SfdxFalconDebug.obj(`${dbgNsLocal}:RGT1:tm1AnalysisReport:`, tm1AnalysisReport);
              await waitASecond(3);
              thisTask.title += chalk.blue(` (${tm1Analysis.filePaths.tm1AnalysisReportPath})`);
              finalizeObservableTaskResult(otr);
            })
            .catch(async (error:Error) => {
              SfdxFalconDebug.obj(`${dbgNsLocal}:RGT1:error:`, error);
              await waitASecond(3);
              finalizeObservableTaskResult(otr, error);
            });
          });
        }
      }
    ],
    // TASK GROUP OPTIONS: Report Generation Tasks
    {
      concurrent:   false,
      collapse:     false,
      exitOnError:  true,
      renderer:     chooseListrRenderer()
    }
  );
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    generateTm1CleanupReport
 * @param       {TmToolsClean} tmToolsClean Required. Fully-prepared instance of a `TmToolsClean`
 *              object.
 * @returns     {ListrObject}  A "runnable" Listr Object
 * @description Returns a "runnable" Listr Object that uses a fully-prepared instance of a
 *              `TmToolsClean` object to generate the `tm1-cleanup.json` report and save
 *              it to disk.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function generateTm1CleanupReport(tmToolsClean:TmToolsClean):ListrObject {

  // Define function-local debug namespace and validate incoming arguments.
  const dbgNsLocal = `${dbgNs}generateTm1CleanupReport`;
  SfdxFalconDebug.obj(`${dbgNsLocal}:arguments:`, arguments);

  // Validate incoming arguments.
  typeValidator.throwOnNullInvalidInstance(tmToolsClean, TmToolsClean, `${dbgNsLocal}`, 'tmToolsClean');

  // Make sure the calling scope has access to Shared Data.
  validateSharedData.call(this);

  // Build and return a Listr Task Object.
  return new listr(
    // TASK GROUP: Report Generation Tasks
    [
      // ── REPORT GENERATION TASK 1: Generate TM1 Cleanup Report ──────────────────────────────────
      {
        title:  'Generate TM1 Cleanup Report',
        task:   (listrContext:object, thisTask:ListrTask) => {
          return new Observable(observer => {
    
            // Initialize an OTR (Observable Task Result).
            const otr = initObservableTaskResult(`${dbgNsLocal}:RGT1`, listrContext, thisTask, observer, this.sharedData, this.generatorResult,
                        `Saving TM1 Cleanup Report to ${tmToolsClean.filePaths.tm1CleanupReportPath}`);
    
            // Execute the Task Logic.
            tmToolsClean.saveReport()
            .then(async (tm1CleanupReport:TM1CleanupReport) => {
              SfdxFalconDebug.obj(`${dbgNsLocal}:RGT1:tm1CleanupReport:`, tm1CleanupReport);
              await waitASecond(3);
              thisTask.title += chalk.blue(` (${tmToolsClean.filePaths.tm1CleanupReportPath})`);
              finalizeObservableTaskResult(otr);
            })
            .catch(async (error:Error) => {
              SfdxFalconDebug.obj(`${dbgNsLocal}:RGT1:error:`, error);
              await waitASecond(3);
              finalizeObservableTaskResult(otr, error);
            });
          });
        }
      }
    ],
    // TASK GROUP OPTIONS: TM2 Data Load Tasks
    {
      concurrent:   false,
      collapse:     false,
      exitOnError:  true,
      renderer:     chooseListrRenderer()
    }
  );
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    generateTm1ExtractionReport
 * @param       {TM1AnalysisReport} tm1AnalysisReport Required.
 * @param       {TM1ContextValidation} tm1ContextValidation Required.
 * @param       {TM1ExtractFilePaths} tm1ExtractFilePaths Required.
 * @returns     {ListrObject}  A "runnable" Listr Object
 * @description Returns a "runnable" Listr Object that uses a TM1 Analysis Report, Context Validation
 *              and File Paths to generate the `tm2-extraction.json` report and save it to disk.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function generateTm1ExtractionReport(tm1AnalysisReport:TM1AnalysisReport, tm1ContextValidation:TM1ContextValidation, tm1ExtractFilePaths:TM1ExtractFilePaths):ListrObject {

  // Define function-local debug namespace and validate incoming arguments.
  const dbgNsLocal = `${dbgNs}generateTm1ExtractionReport`;
  SfdxFalconDebug.obj(`${dbgNsLocal}:arguments:`, arguments);

  // Validate incoming arguments.
  typeValidator.throwOnEmptyNullInvalidObject(tm1AnalysisReport,     `${dbgNsLocal}`, 'tm1AnalysisReport');
  typeValidator.throwOnEmptyNullInvalidObject(tm1ContextValidation,  `${dbgNsLocal}`, 'tm1ContextValidation');
  typeValidator.throwOnEmptyNullInvalidObject(tm1ExtractFilePaths,   `${dbgNsLocal}`, 'tm1ExtractFilePaths');

  // Make sure the calling scope has access to Shared Data.
  validateSharedData.call(this);

  // Build and return a Listr Task Object.
  return new listr(
    // TASK GROUP: Report Generation Tasks
    [
      // ── REPORT GENERATION TASK 1: Generate TM1 Extraction Report ───────────────────────────────
      {
        title:  'Generate TM1 Extraction Report',
        task:   (listrContext:object, thisTask:ListrTask) => {
          return new Observable(observer => {
    
            // Initialize an OTR (Observable Task Result).
            const otr = initObservableTaskResult(`${dbgNsLocal}:RGT1`, listrContext, thisTask, observer, this.sharedData, this.generatorResult,
                        `Saving TM1 Extraction Report to ${tm1ExtractFilePaths.tm1ExtractionReportPath}`);
    
            // Define the Task Logic to be executed.
            const asyncTask = async () => {

              // Introduce a small delay for dramatic effect.
              await waitASecond(3);

              const tm1ExtractionReport:TM1ExtractionReport = {
                orgInfo:                    tm1AnalysisReport.orgInfo,
                expectedTm1RecordCounts:    tm1AnalysisReport.tm1RecordCounts,
                actualTm1RecordCounts:      tm1ContextValidation.actualRecordCounts,
                expectedTm1MetadataCounts:  tm1AnalysisReport.tm1MetadataCounts,
                actualTm1MetadataCounts:    tm1ContextValidation.actualMetadataCounts
              };
              SfdxFalconDebug.obj(`${dbgNsLocal}:RGT1:tm1ExtractionReport:`, tm1ExtractionReport);

              // Write the TM1 Extraction Report to the local filesystem.
              await fse.ensureFile(tm1ExtractFilePaths.tm1ExtractionReportPath);
              await fse.writeJson(tm1ExtractFilePaths.tm1ExtractionReportPath, tm1ExtractionReport, {spaces: '\t'});
              return tm1ExtractionReport;
            };

            // Execute the Task Logic.
            asyncTask()
            .then(async (successResult:TM1ExtractionReport) => {
              SfdxFalconDebug.obj(`${dbgNsLocal}:RGT1:successResult:`, successResult);
              thisTask.title += chalk.blue(` (${tm1ExtractFilePaths.tm1ExtractionReportPath})`);
              finalizeObservableTaskResult(otr);
            })
            .catch(async (failureResult:Error) => {
              SfdxFalconDebug.obj(`${dbgNsLocal}:RGT1:failureResult:`, failureResult);
              thisTask.title += chalk.red(` (Failed)`);
              finalizeObservableTaskResult(otr, failureResult);
            });
          });
        }
      }
    ],
    // TASK GROUP OPTIONS: Report Generation Tasks
    {
      concurrent:   false,
      collapse:     false,
      exitOnError:  true,
      renderer:     chooseListrRenderer()
    }
  );
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    generateTm1TransformationReport
 * @param       {TmToolsTransform} tmToolsTransform Required. Fully-prepared instance of a
 *              `TmToolsTransform` object.
 * @returns     {ListrObject}  A "runnable" Listr Object
 * @description Returns a "runnable" Listr Object that uses a fully-prepared instance of a
 *              `TmToolsTransform` object to generate the tm1-transformation.json report and save
 *              it to disk.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function generateTm1TransformationReport(tmToolsTransform:TmToolsTransform):ListrObject {

  // Define function-local debug namespace and validate incoming arguments.
  const dbgNsLocal = `${dbgNs}generateTm1TransformationReport`;
  SfdxFalconDebug.obj(`${dbgNsLocal}:arguments:`, arguments);

  // Validate incoming arguments.
  typeValidator.throwOnNullInvalidInstance(tmToolsTransform, TmToolsTransform, `${dbgNsLocal}`, 'tmToolsTransform');

  // Make sure the calling scope has access to Shared Data.
  validateSharedData.call(this);

  // Build and return a Listr Task Object.
  return new listr(
    // TASK GROUP: Report Generation Tasks
    [
      // ── REPORT GENERATION TASK 1: Generate TM1 Transformation Report ────────────────────────────────
      {
        title:  'Generate TM1 Transformation Report',
        task:   (listrContext:object, thisTask:ListrTask) => {
          return new Observable(observer => {
    
            // Initialize an OTR (Observable Task Result).
            const otr = initObservableTaskResult(`${dbgNsLocal}:RGT1`, listrContext, thisTask, observer, this.sharedData, this.generatorResult,
                        `Saving TM1 Transformation Report to ${tmToolsTransform.filePaths.tm1TransformationReportPath}`);
    
            // Execute the Task Logic.
            tmToolsTransform.saveReport()
            .then(async (tm1TransformationReport:TM1TransformationReport) => {
              SfdxFalconDebug.obj(`${dbgNsLocal}:RGT1:tm1TransformationReport:`, tm1TransformationReport);
              await waitASecond(3);
              thisTask.title += chalk.blue(` (${tmToolsTransform.filePaths.tm1TransformationReportPath})`);
              finalizeObservableTaskResult(otr);
            })
            .catch(async (error:Error) => {
              SfdxFalconDebug.obj(`${dbgNsLocal}:RGT1:error:`, error);
              await waitASecond(3);
              finalizeObservableTaskResult(otr, error);
            });
          });
        }
      }
    ],
    // TASK GROUP OPTIONS: TM2 Data Load Tasks
    {
      concurrent:   false,
      collapse:     false,
      exitOnError:  true,
      renderer:     chooseListrRenderer()
    }
  );
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    generateTm2DataLoadReport
 * @param       {TmToolsLoad} tmToolsLoad Required. Fully-prepared instance of a TmToolsLoad object.
 * @returns     {ListrObject}  A "runnable" Listr Object
 * @description Returns a "runnable" Listr Object that uses a fully-prepared instance of a
 *              TmToolsLoad object generate the tm2-dataload.json report and save it to disk.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function generateTm2DataLoadReport(tmToolsLoad:TmToolsLoad):ListrObject {

  // Define function-local debug namespace and validate incoming arguments.
  const dbgNsLocal = `${dbgNs}generateTm2DataLoadReport`;
  SfdxFalconDebug.obj(`${dbgNsLocal}:arguments:`, arguments);

  // Validate incoming arguments.
  typeValidator.throwOnNullInvalidInstance(tmToolsLoad, TmToolsLoad, `${dbgNsLocal}`, 'tmToolsLoad');

  // Make sure the calling scope has access to Shared Data.
  validateSharedData.call(this);

  // Build and return a Listr Task Object.
  return new listr(
    // TASK GROUP: Report Generation Tasks
    [
      // ── REPORT GENERATION TASK 1: Generate TM2 Data Load Report ────────────────────────────────
      {
        title:  'Generate TM2 Data Load Report',
        task:   (listrContext:object, thisTask:ListrTask) => {
          return new Observable(observer => {
    
            // Initialize an OTR (Observable Task Result).
            const otr = initObservableTaskResult(`${dbgNsLocal}:RGT1`, listrContext, thisTask, observer, this.sharedData, this.generatorResult,
                        `Saving TM2 Data Load Report to ${tmToolsLoad.filePaths.tm2DataLoadReportPath}`);
    
            // Execute the Task Logic.
            tmToolsLoad.saveReport()
            .then(async (tm2DataLoadReport:TM2DataLoadReport) => {
              SfdxFalconDebug.obj(`${dbgNsLocal}:RGT1:tm2DataLoadReport:`, tm2DataLoadReport);
              await waitASecond(3);
              thisTask.title += chalk.blue(` (${tmToolsLoad.filePaths.tm2DataLoadReportPath})`);
              finalizeObservableTaskResult(otr);
            })
            .catch(async (error:Error) => {
              SfdxFalconDebug.obj(`${dbgNsLocal}:RGT1:error:`, error);
              await waitASecond(3);
              finalizeObservableTaskResult(otr, error);
            });
          });
        }
      }
    ],
    // TASK GROUP OPTIONS: TM2 Data Load Tasks
    {
      concurrent:   false,
      collapse:     false,
      exitOnError:  true,
      renderer:     chooseListrRenderer()
    }
  );
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    generateTm2DeploymentReport
 * @param       {TmToolsDeploy} tmToolsDeploy Required. Fully-prepared instance of a
 *              `TmToolsDeploy` object.
 * @returns     {ListrObject}  A "runnable" Listr Object
 * @description Returns a "runnable" Listr Object that uses a fully-prepared instance of a
 *              `TmToolsDeploy` object to generate the `tm2-deployment.json` report and save
 *              it to disk.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function generateTm2DeploymentReport(tmToolsDeploy:TmToolsDeploy):ListrObject {

  // Define function-local debug namespace and validate incoming arguments.
  const dbgNsLocal = `${dbgNs}generateTm2DeploymentReport`;
  SfdxFalconDebug.obj(`${dbgNsLocal}:arguments:`, arguments);

  // Validate incoming arguments.
  typeValidator.throwOnNullInvalidInstance(tmToolsDeploy, TmToolsDeploy, `${dbgNsLocal}`, 'tmToolsDeploy');

  // Make sure the calling scope has access to Shared Data.
  validateSharedData.call(this);

  // Build and return a Listr Task Object.
  return new listr(
    // TASK GROUP: Report Generation Tasks
    [
      // ── REPORT GENERATION TASK 1: Generate TM2 Deployment Report ───────────────────────────────
      {
        title:  'Generate TM2 Deployment Report',
        task:   (listrContext:object, thisTask:ListrTask) => {
          return new Observable(observer => {
    
            // Initialize an OTR (Observable Task Result).
            const otr = initObservableTaskResult(`${dbgNsLocal}:RGT1`, listrContext, thisTask, observer, this.sharedData, this.generatorResult,
                        `Saving TM2 Deployment Report to ${tmToolsDeploy.filePaths.tm2DeploymentReportPath}`);
    
            // Execute the Task Logic.
            tmToolsDeploy.saveReport()
            .then(async (tm2DeploymentReport:TM2DeploymentReport) => {
              SfdxFalconDebug.obj(`${dbgNsLocal}:RGT1:tm2DeploymentReport:`, tm2DeploymentReport);
              await waitASecond(3);
              thisTask.title += chalk.blue(` (${tmToolsDeploy.filePaths.tm2DeploymentReportPath})`);
              finalizeObservableTaskResult(otr);
            })
            .catch(async (error:Error) => {
              SfdxFalconDebug.obj(`${dbgNsLocal}:RGT1:error:`, error);
              await waitASecond(3);
              finalizeObservableTaskResult(otr, error);
            });
          });
        }
      }
    ],
    // TASK GROUP OPTIONS: TM2 Data Load Tasks
    {
      concurrent:   false,
      collapse:     false,
      exitOnError:  true,
      renderer:     chooseListrRenderer()
    }
  );
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    generateTm2SharingDeploymentReport
 * @param       {TmToolsDeploySharing} tmToolsDeploySharing Required. Fully-prepared instance of a
 *              TmToolsDeploySharing object.
 * @returns     {ListrObject}  A "runnable" Listr Object
 * @description Returns a "runnable" Listr Object that uses a fully-prepared instance of a
 *              `TmToolsDeploySharing` object generate the `tm2-sharingdeployment.json` report and
 *              save it to disk.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function generateTm2SharingDeploymentReport(tmToolsDeploySharing:TmToolsDeploySharing):ListrObject {

  // Define function-local debug namespace and validate incoming arguments.
  const dbgNsLocal = `${dbgNs}generateTm2SharingDeploymentReport`;
  SfdxFalconDebug.obj(`${dbgNsLocal}:arguments:`, arguments);

  // Validate incoming arguments.
  typeValidator.throwOnNullInvalidInstance(tmToolsDeploySharing, TmToolsDeploySharing, `${dbgNsLocal}`, 'tmToolsDeploySharing');

  // Make sure the calling scope has access to Shared Data.
  validateSharedData.call(this);

  // Build and return a Listr Task Object.
  return new listr(
    // TASK GROUP: Report Generation Tasks
    [
      // ── REPORT GENERATION TASK 1: Generate TM2 Sharing Deployment Report ───────────────────────
      {
        title:  'Generate TM2 Sharing Rules Deployment Report',
        task:   (listrContext:object, thisTask:ListrTask) => {
          return new Observable(observer => {
    
            // Initialize an OTR (Observable Task Result).
            const otr = initObservableTaskResult(`${dbgNsLocal}:RGT1`, listrContext, thisTask, observer, this.sharedData, this.generatorResult,
                        `Saving TM2 Sharing Rules Deployment Report to ${tmToolsDeploySharing.filePaths.tm2SharingDeploymentReportPath}`);
    
            // Execute the Task Logic.
            tmToolsDeploySharing.saveReport()
            .then(async (tm2SharingDeploymentReport:TM2SharingDeploymentReport) => {
              SfdxFalconDebug.obj(`${dbgNsLocal}:RGT1:tm2SharingDeploymentReport:`, tm2SharingDeploymentReport);
              await waitASecond(3);
              thisTask.title += chalk.blue(` (${tmToolsDeploySharing.filePaths.tm2SharingDeploymentReportPath})`);
              finalizeObservableTaskResult(otr);
            })
            .catch(async (error:Error) => {
              SfdxFalconDebug.obj(`${dbgNsLocal}:RGT1:error:`, error);
              await waitASecond(3);
              finalizeObservableTaskResult(otr, error);
            });
          });
        }
      }
    ],
    // TASK GROUP OPTIONS: TM2 Data Load Tasks
    {
      concurrent:   false,
      collapse:     false,
      exitOnError:  true,
      renderer:     chooseListrRenderer()
    }
  );
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    gitInitTasks
 * @returns     {ListrObject}  A "runnable" Listr Object
 * @description Returns a Listr-compatible Task Object that verifies the presence of the Git
 *              executable in the local environment and checks if a Git Remote is reachable, if
 *              one is provided.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function gitInitTasks(gitRemoteUri:string=''):ListrObject {

  // Debug incoming arguments.
  SfdxFalconDebug.obj(`${dbgNs}gitInitTasks:arguments:`, arguments);

  // Build and return a Listr Object.
  return new listr(
    [
      {
        // PARENT_TASK: (Git Validation/Initialization)
        title:  `Inspecting Environment`,
        task:   listrContext => {
          return new listr(
            [
              // SUBTASKS: Check for Git executable and for valid Git Remote URI.
              gitRuntimeCheck(),
              validateGitRemote(gitRemoteUri)
            ],
            {
              // SUBTASK OPTIONS: (Git Init Tasks)
              concurrent: false,
              renderer:   chooseListrRenderer()
            }
          );
        }
      }
    ],
    {
      // PARENT_TASK OPTIONS: (Git Validation/Initialization)
      concurrent: false,
      collapse:   false,
      renderer:   chooseListrRenderer()
    }
  );
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    gitRuntimeCheck
 * @param       {string}  dbgNs Required. Debug namespace. Ensures proper debug output.
 * @returns     {ListrTask}  A Listr-compatible Task Object
 * @description Returns a Listr-compatible Task Object that verifies the presence of the Git
 *              executable in the local environment.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function gitRuntimeCheck():ListrTask {
  return {
    title:  'Looking for Git...',
    task:   (listrContext:ListrContextFinalizeGit, thisTask:ListrTask) => {
      if (gitHelper.isGitInstalled() === true) {
        thisTask.title += 'Found!';
        listrContext.gitInstalled = true;
      }
      else {
        listrContext.gitInstalled = false;
        thisTask.title += 'Not Found!';
        throw new SfdxFalconError( 'Git must be installed in your local environment.'
                                 , 'GitNotFound'
                                 , `${dbgNs}gitRuntimeCheck`);
      }
    }
  } as ListrTask;
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    identifyDevHubs
 * @returns     {ListrTask}  A Listr-compatible Task Object
 * @description Returns a Listr-compatible Task Object that takes a list of raw SFDX Org Infos
 *              and searches them to identify any Dev Hubs.  This function must be invoked using
 *              the call() method because it relies on the caller's "this" context to function.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function identifyDevHubs():ListrTask {

  // Make sure the calling scope has access to Shared Data.
  validateSharedData.call(this);

  // Grab Generator Requirements out of Shared Data.
  const generatorRequirements = this.sharedData['generatorRequirements'] as GeneratorRequirements;
  SfdxFalconDebug.obj(`${dbgNs}identifyDevHubs:generatorRequirements:`, generatorRequirements);

  // Build and return a Listr Task.
  return {
    title:  'Identifying DevHub Orgs...',
    enabled:() => typeValidator.isNotNullInvalidObject(generatorRequirements)
                  && generatorRequirements.devHubOrgs === true,
    task:   (listrContext, thisTask) => {

      // Grab the Standard Org Info Map out of Shared Data.
      const standardOrgInfoMap = this.sharedData['standardOrgInfoMap'] as StandardOrgInfoMap;
      SfdxFalconDebug.obj(`${dbgNs}identifyDevHubs:standardOrgInfoMap:`, standardOrgInfoMap);
    
      // Search the SFDX Org Infos list for any DevHub orgs.
      const devHubOrgInfos = sfdxHelper.identifyDevHubOrgs(standardOrgInfoMap);
      SfdxFalconDebug.obj(`${dbgNs}identifyDevHubs:devHubOrgInfos:`, devHubOrgInfos);
 
      // Update the task title based on the number of DevHub Org Infos
      if (devHubOrgInfos.length < 1) {
        thisTask.title += 'No Dev Hubs Found';
      }
 
      // Save the DevHub Org Infos to Shared Data.
      this.sharedData['devHubOrgInfos'] = devHubOrgInfos;
 
      // Update the Task Title
      thisTask.title += 'Done!';
    }
  } as ListrTask;
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    identifyEnvHubs
 * @returns     {ListrTask}  A Listr-compatible Task Object
 * @description Returns a Listr-compatible Task Object that takes a list of raw SFDX Org Infos
 *              and searches them to identify any Environment Hubs.  This function must be invoked
 *              using the call() method because it relies on the caller's "this" context to function.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function identifyEnvHubs():ListrTask {

  // Make sure the calling scope has access to Shared Data.
  validateSharedData.call(this);

  // Grab Generator Requirements out of Shared Data.
  const generatorRequirements = this.sharedData['generatorRequirements']  as GeneratorRequirements;
  SfdxFalconDebug.obj(`${dbgNs}identifyEnvHubs:generatorRequirements:`, generatorRequirements);

  // Build and return a Listr Task.
  return {
    title:  'Identifying EnvHub Orgs...',
    enabled:() => typeValidator.isNotNullInvalidObject(generatorRequirements)
                  && generatorRequirements.envHubOrgs === true,
    task:   (listrContext, thisTask) => {

      // Grab the Standard Org Info Map out of Shared Data.
      const standardOrgInfoMap = this.sharedData['standardOrgInfoMap'] as StandardOrgInfoMap;
      SfdxFalconDebug.obj(`${dbgNs}identifyEnvHubs:standardOrgInfoMap:`, standardOrgInfoMap);
    
      // Search the SFDX Org Infos list for any Environment Hub orgs.
      return sfdxHelper.identifyEnvHubOrgs(standardOrgInfoMap)
        .then(envHubOrgInfos => {
          // DEBUG
          SfdxFalconDebug.obj(`${dbgNs}identifyEnvHubs:envHubOrgInfos:`, envHubOrgInfos);

          // Save the EnvHub Org Infos to Shared Data.
          this.sharedData['envHubOrgInfos'] = envHubOrgInfos;

          // Update the task title based on the number of EnvHub Org Infos
          if (envHubOrgInfos.length < 1) {
            thisTask.title += 'No Environment Hubs Found';
          }
          else {
            thisTask.title += 'Done!';
          }
        })
        .catch(error => {
          // We normally should NOT get here.
          SfdxFalconDebug.obj(`${dbgNs}identifyEnvHubs:error:`, error);
          thisTask.title += 'Unexpected error while identifying Environment Hub Orgs';
          throw error;
        });
    }
  } as ListrTask;
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    identifyPkgOrgs
 * @returns     {ListrTask}  A Listr-compatible Task Object
 * @description Returns a Listr-compatible Task Object that takes a list of raw SFDX Org Infos
 *              and searches them to identify any Packaging Orgs.  This function must be invoked
 *              using the call() method because it relies on the caller's "this" context to function.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function identifyPkgOrgs():ListrTask {

  // Make sure the calling scope has access to Shared Data.
  validateSharedData.call(this);

  // Grab Generator Requirements out of Shared Data.
  const generatorRequirements = this.sharedData['generatorRequirements'] as GeneratorRequirements;
  SfdxFalconDebug.obj(`${dbgNs}identifyPkgOrgs:generatorRequirements:`, generatorRequirements);

  // Build and return a Listr Task.
  return {
    title:  'Identifying Packaging Orgs...',
    enabled:() => typeValidator.isNotNullInvalidObject(generatorRequirements)
                  && (generatorRequirements.managedPkgOrgs === true || generatorRequirements.unmanagedPkgOrgs === true),
    task:   (listrContext, thisTask) => {

      // Grab the Standard Org Info Map out of Shared Data.
      const standardOrgInfoMap = this.sharedData['standardOrgInfoMap'] as StandardOrgInfoMap;
      SfdxFalconDebug.obj(`${dbgNs}identifyPkgOrgs:standardOrgInfoMap:`, standardOrgInfoMap);
    
      // Search the SFDX Org Infos list for any Packaging orgs.
      return sfdxHelper.identifyPkgOrgs(standardOrgInfoMap)
        .then(pkgOrgInfos => {
          // DEBUG
          SfdxFalconDebug.obj(`${dbgNs}identifyPkgOrgs:pkgOrgInfos:`, pkgOrgInfos);

          // Save the Package Org Infos to Shared Data.
          this.sharedData['pkgOrgInfos'] = pkgOrgInfos;

          // Update the task title based on the number of EnvHub Org Infos
          if (pkgOrgInfos.length < 1) {
            thisTask.title += 'No Packaging Orgs Found';
          }
          else {
            thisTask.title += 'Done!';
          }
        })
        .catch(error => {
          // We normally should NOT get here.
          SfdxFalconDebug.obj(`${dbgNs}identifyPkgOrgs:error:`, error);
          thisTask.title += 'Unexpected error while identifying Packaging Orgs';
          throw error;
        });
    }
  } as ListrTask;
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    initializeGit
 * @param       {string}  targetDir
 * @returns     {ListrTask}  A Listr-compatible Task Object
 * @description Returns a Listr-compatible Task Object that initializes Git in the target directory.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function initializeGit(targetDir:string):ListrTask {

  // Make sure the calling scope has access to Shared Data.
  validateSharedData.call(this);

  // Build and return a Listr Task.
  return {
    title:  `Initializing Git in Target Directory...`,
    enabled:() => (typeof targetDir === 'string' && targetDir !== ''),
    skip:   (listrContext:ListrContextFinalizeGit) => {
      if (listrContext.gitInstalled !== true) {
        return true;
      }
    },
    task:   (listrContext:ListrContextFinalizeGit, thisTask:ListrTask) => {
      return new Observable(observer => {

        // Initialize an OTR (Observable Task Result).
        const otr = initObservableTaskResult(`${dbgNs}:initializeGit`, listrContext, thisTask, observer, this.sharedData, this.generatorResult,
                    `Running git init in ${targetDir}`);
        
        // Define the Task Logic to be executed.
        const asyncTask = async () => {
          const shellString = gitHelper.gitInit(targetDir);
          SfdxFalconDebug.obj(`${dbgNs}initializeGit:shellString:`, shellString, `shellString: `);
          return shellString;
        };

        // Execute the Task Logic.
        asyncTask()
          .then(async result => {
            await waitASecond(3);
            thisTask.title += 'Done!';
            listrContext.gitInitialized = true;
            finalizeObservableTaskResult(otr);
          })
          .catch(async error => {
            await waitASecond(3);
            thisTask.title += 'Failed';
            listrContext.gitInitialized = false;
            finalizeObservableTaskResult(otr, error);
          });
      });
    }
  } as ListrTask;
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    initObservableTaskResult
 * @param       {string}  extDbgNs  Required.
 * @param       {object}  listrContext Required.
 * @param       {object}  listrTask Required.
 * @param       {object}  [observer]  Optional.
 * @param       {object}  [sharedData]  Optional.
 * @param       {string}  [message] Optional.
 * @param       {SfdxFalconResult}  [parentResult]  Optional.
 * @returns     {ListrExecutionOptions}
 * @description Returns a ListrExecutionOptions structure, populated with the values provided by the
 *              caller. Before returning, this function will perform DEBUG for the namespace that
 *              the caller provides.
 * @private
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
function initObservableTaskResult(extDbgNs:string, listrContext:object, listrTask:object, observer:Subscriber, sharedData:object, parentResult:SfdxFalconResult, message:string):SfdxFalconResult {

  // Create a Listr "Execution Options" data structure.
  const listrExecOpts:ListrExecutionOptions = {
    listrContext: listrContext,
    listrTask:    listrTask,
    observer:     observer,
    sharedData:   sharedData
  };
  SfdxFalconDebug.obj(`${extDbgNs}`, listrExecOpts, `listrExecOpts: `);

  // Initialize an SFDX-Falcon Result object.
  const observableTaskResult =
    new SfdxFalconResult(extDbgNs, SfdxFalconResultType.LISTR,
                        { startNow:       true,
                          bubbleError:    false,    // Let the parent Result handle errors (no bubbling)
                          bubbleFailure:  false});  // Let the parent Result handle failures (no bubbling)

  // Set the initial Task Detail message.
  if (typeof observer === 'object' && typeof observer.next === 'function' && typeof message === 'string') {
    observer.next(`[0s] ${message}`);
  }

  // Set up Progress Notifications.
  const progressNotification =
    FalconProgressNotifications.start(message, 1000, observableTaskResult, observer);

  // Initialize the Results Detail object for this LISTR observable task.
  const observableTaskResultDetail = {
    progressNotification: progressNotification,
    parentResult:         parentResult,
    listrExecOpts:        listrExecOpts,
    listrContext:         listrContext,
    listrTask:            listrTask,
    observer:             observer,
    sharedData:           sharedData,
    message:              message
  };

  // Attach the Results Detail object to the LISTR result.
  observableTaskResult.setDetail(observableTaskResultDetail);

  // Return the Observable Task Result to the caller.
  return observableTaskResult;
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    loadTm2Data
 * @param       {TmToolsLoad} tmToolsLoad Required. Fully-prepared instance of a TmToolsLoad object.
 * @returns     {ListrObject}  A "runnable" Listr Object
 * @description Returns a "runnable" Listr Object that uses a fully-prepared instance of a
 *              `TmToolsLoad` object to attempt to load  the TM2 config (UT2A and OT2A) data into
 *              an org with an ACTIVE or PLANNING `Territory2` Model.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function loadTm2Data(tmToolsLoad:TmToolsLoad):ListrObject {

  // Define function-local debug namespace and validate incoming arguments.
  const dbgNsLocal = `${dbgNs}loadTm2Data`;
  SfdxFalconDebug.obj(`${dbgNsLocal}:arguments:`, arguments);

  // Validate incoming arguments.
  typeValidator.throwOnNullInvalidInstance(tmToolsLoad, TmToolsLoad, `${dbgNsLocal}`, 'tmToolsLoad');

  // Make sure the calling scope has access to Shared Data.
  validateSharedData.call(this);

  // Build and return a Listr Task Object.
  return new listr(
    // TASK GROUP: TM2 Data Load Tasks
    [
      // ── DATA LOAD TASK 1: Load User/Territory2 Associations ────────────────────────────────────
      {
        title:  'Load User/Territory2 Association Data',
        task:   (listrContext:object, thisTask:ListrTask) => {
          return new Observable(observer => {
    
            // Initialize an OTR (Observable Task Result).
            const otr = initObservableTaskResult(`${dbgNsLocal}:DLT1`, listrContext, thisTask, observer, this.sharedData, this.generatorResult,
                        `Using Bulk API to load data from ${tmToolsLoad.filePaths.userTerritory2AssociationCsv}`);
    
            // Execute the Task Logic.
            tmToolsLoad.loadUserTerritory2Associations()
            .then((bulk2OperationStatus:Bulk2OperationStatus) => {
              SfdxFalconDebug.obj(`${dbgNsLocal}:DLT1:bulk2OperationStatus:`, bulk2OperationStatus);
              finalizeObservableTaskResult(otr);
            })
            .catch((error:Error) => {
              SfdxFalconDebug.obj(`${dbgNsLocal}:DLT1:error:`, error);
              finalizeObservableTaskResult(otr, error);
            });
          });
        }
      },
      // ── DATA LOAD TASK 2: Load Object/Territory2 Associations ──────────────────────────────────
      {
        title:  'Load Object/Territory2 Association Data',
        task:   (listrContext:object, thisTask:ListrTask) => {
          return new Observable(observer => {
    
            // Initialize an OTR (Observable Task Result).
            const otr = initObservableTaskResult(`${dbgNsLocal}:DLT2`, listrContext, thisTask, observer, this.sharedData, this.generatorResult,
                        `Using Bulk API to load data from ${tmToolsLoad.filePaths.objectTerritory2AssociationCsv}`);
    
            // Execute the Task Logic.
            tmToolsLoad.loadObjectTerritory2Associations()
            .then((bulk2OperationStatus:Bulk2OperationStatus) => {
              SfdxFalconDebug.obj(`${dbgNsLocal}:DLT2:bulk2OperationStatus:`, bulk2OperationStatus);
              finalizeObservableTaskResult(otr);
            })
            .catch((error:Error) => {
              SfdxFalconDebug.obj(`${dbgNsLocal}:DLT2:error:`, error);
              finalizeObservableTaskResult(otr, error);
            });
          });
        }
      }
    ],
    // TASK GROUP OPTIONS: TM2 Data Load Tasks
    {
      concurrent:   true,
      collapse:     false,
      exitOnError:  false,
      renderer:     chooseListrRenderer()
    }
  );
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    metadataRetrieve
 * @param       {string}  aliasOrUsername Required. The alias or username associated with a current
 *              Salesforce CLI connected org.
 * @param       {string}  manifestFilePath  Required. Complete path for the manifest file (ie.
 *              package.xml) that specifies the components to retrieve.
 * @param       {string}  retrieveTargetDir Required. The root of the directory structure where
 *              the retrieved .zip or metadata files are put.
 * @returns     {ListrTask}  A Listr-compatible Task Object
 * @description Returns a Listr-compatible Task Object that attempts to retrieve the metadata
 *              components specified by the Manifest File from the specified org. Metadata will be
 *              retrieved as a .zip file and saved to the local filesystem at the location specified
 *              by the caller.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function metadataRetrieve(aliasOrUsername:string, manifestFilePath:string, retrieveTargetDir:string):ListrTask {

  // Debug incoming arguments
  SfdxFalconDebug.obj(`${dbgNs}metadataRetrieve:arguments:`, arguments);

  // Validate incoming arguments.
  typeValidator.throwOnEmptyNullInvalidString(aliasOrUsername,    `${dbgNs}:metadataRetrieve`, 'aliasOrUsername');
  typeValidator.throwOnEmptyNullInvalidString(manifestFilePath,   `${dbgNs}:metadataRetrieve`, 'manifestFilePath');
  typeValidator.throwOnEmptyNullInvalidString(retrieveTargetDir,  `${dbgNs}:metadataRetrieve`, 'retrieveTargetDir');

  // Make sure the calling scope has access to Shared Data.
  validateSharedData.call(this);

  // Build and return an OTR (Observable Listr Task).
  return {
    title:  'Retrieve Metadata',
    task:   (listrContext:object, thisTask:ListrTask) => {
      return new Observable(observer => {

        // Initialize an OTR (Observable Task Result).
        const otr = initObservableTaskResult(`${dbgNs}metadataRetrieve`, listrContext, thisTask, observer, this.sharedData, this.generatorResult,
                    `Retrieving metadata from ${aliasOrUsername} (this might take a few minutes)`);

        // Execute the Task Logic
        sfdxHelper.retrieveMetadata(aliasOrUsername, manifestFilePath, retrieveTargetDir)
        .then((successResult:SfdxFalconResult) => {
          SfdxFalconDebug.obj(`${dbgNs}metadataRetrieve:successResult:`, successResult);

          // Save the UTILITY result to Shared Data and finalize the OTR as successful.
          this.sharedData.metadataRetrieveResult = successResult;
          finalizeObservableTaskResult(otr);
        })
        .catch((failureResult:SfdxFalconResult|Error) => {
          SfdxFalconDebug.obj(`${dbgNs}metadataRetrieve:failureResult:`, failureResult);

          // We get here if no connections were found.
          finalizeObservableTaskResult(otr, failureResult);
        });
      });
    }
  };
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    packagedMetadataFetch
 * @param       {string}  aliasOrUsername Required. The alias or username associated with a current
 *              Salesforce CLI connected org.
 * @param       {string[]}  packageNames  Required. String array containing the names of all
 *              packages that should be retrieved.
 * @param       {string}  retrieveTargetDir Required. The root of the directory structure where
 *              the retrieved .zip or metadata files are put.
 * @returns     {ListrTask}  A Listr-compatible Task Object
 * @description Returns a Listr-compatible Task Object that attempts to retrieve the metadata
 *              for the specified package from the specified org. The metadata will be saved to
 *              the local filesystem at the location specified by the caller.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function packagedMetadataFetch(aliasOrUsername:string, packageNames:string[], retrieveTargetDir:string):ListrTask {

  // Debug incoming arguments
  SfdxFalconDebug.obj(`${dbgNs}packagedMetadataFetch:arguments:`, arguments);

  // Validate incoming arguments.
  typeValidator.throwOnEmptyNullInvalidString (aliasOrUsername,   `${dbgNs}:packagedMetadataFetch`, 'aliasOrUsername');
  typeValidator.throwOnEmptyNullInvalidArray  (packageNames,      `${dbgNs}:packagedMetadataFetch`, 'packageNames');
  typeValidator.throwOnEmptyNullInvalidString (retrieveTargetDir, `${dbgNs}:packagedMetadataFetch`, 'retrieveTargetDir');

  // Make sure the calling scope has access to Shared Data.
  validateSharedData.call(this);

  // Build and return an OTR (Observable Listr Task).
  return {
    title:  'Fetching Metadata Packages...',
    task:   (listrContext:object, thisTask:ListrTask) => {
      return new Observable(observer => {

        // Initialize an OTR (Observable Task Result).
        const otr = initObservableTaskResult(`${dbgNs}packagedMetadataFetch`, listrContext, thisTask, observer, this.sharedData, this.generatorResult,
                    `Retrieving '${packageNames}' from ${aliasOrUsername} (this might take a few minutes)`);

        // Execute the Task Logic
        sfdxHelper.fetchMetadataPackages(aliasOrUsername, packageNames, retrieveTargetDir)
        .then((successResult:SfdxFalconResult) => {
          SfdxFalconDebug.obj(`${dbgNs}packagedMetadataFetch:successResult:`, successResult, `successResult: `);

          // Save the UTILITY result to Shared Data and update the task title.
          this.sharedData.pkgMetadataFetchResult = successResult;
          thisTask.title += 'Done!';
          finalizeObservableTaskResult(otr);
        })
        .catch((failureResult:SfdxFalconResult|Error) => {
          SfdxFalconDebug.obj(`${dbgNs}packagedMetadataFetch:failureResult:`, failureResult, `failureResult: `);

          // We get here if no connections were found.
          thisTask.title += 'Failed';
          finalizeObservableTaskResult(otr, failureResult);
        });
      });
    }
  };
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    reValidateGitRemote
 * @param       {string}  gitRemoteUri
 * @returns     {ListrTask}  A Listr-compatible Task Object
 * @description Returns a Listr-compatible Task Object that attempts to re-validate the presence of
 *              a Git Remote at the Git Remote URI provided.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function reValidateGitRemote(gitRemoteUri:string):ListrTask {

  // Make sure the calling scope has access to Shared Data.
  validateSharedData.call(this);

  // Build and return a Listr Task.
  return {
    title:  `Validating Access to the Git Remote...`,
    enabled:() => (typeof gitRemoteUri === 'string' && gitRemoteUri !== ''),
    skip:   (listrContext:ListrContextFinalizeGit) => {
      if (listrContext.gitInstalled !== true) {
        return true;
      }
    },
    task:   (listrContext:ListrContextFinalizeGit, thisTask:ListrTask) => {
      return new Observable(observer => {

        // Initialize an OTR (Observable Task Result).
        const otr = initObservableTaskResult(`${dbgNs}reValidateGitRemote`, listrContext, thisTask, observer, this.sharedData, this.generatorResult,
                    `Attempting to reach ${gitRemoteUri}`);
        
        // Execute the Task Logic
        gitHelper.checkGitRemoteStatus(gitRemoteUri, 3)
          .then((successResult:ShellExecResult) => {
            SfdxFalconDebug.obj(`${dbgNs}reValidateGitRemote:successResult:`, successResult, `successResult: `);
            listrContext.gitRemoteIsValid = true;
            thisTask.title += 'Done!';
            finalizeObservableTaskResult(otr);
          })
          .catch((errorResult:ShellExecResult) => {
            SfdxFalconDebug.obj(`${dbgNs}reValidateGitRemote:errorResult:`, errorResult, `errorResult: `);

            // Error code 2 (Git remote reachable but empty) is the ideal state.
            // Consider that a success result.
            if (errorResult.code === 2) {
              listrContext.gitRemoteIsValid = true;
              thisTask.title += 'Done!';
              finalizeObservableTaskResult(otr);
              return;
            }

            // Any non-zero error code other than 2 is a failure.
            listrContext.gitRemoteIsValid = false;
            thisTask.title += errorResult.message;
            finalizeObservableTaskResult(otr,
              new SfdxFalconError(`Git Remote is invalid. ${errorResult.message}. `
                                 , `GitRemoteError`
                                 , `${dbgNs}reValidateGitRemote`));
          });
      });
    }
  } as ListrTask;
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    runPostDeploymentTasks
 * @param       {TmToolsDeploy} tmToolsDeploy Required. A prepared TM Tools Deployment Context.
 * @returns     {ListrObject}  A "runnable" Listr Object
 * @description Returns a "runnable" Listr Object that uses a previously prepared TM Tools
 *              Deployment context to fetch the Record IDs of all Territory2 records in the target
 *              org. If successful, it then attempts to complete the transformation of any
 *              intermediate local data (like UserTerritory2Association.csv).
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function runPostDeploymentTasks(tmToolsDeploy:TmToolsDeploy):ListrObject {

  // Debug incoming arguments
  SfdxFalconDebug.obj(`${dbgNs}runPostDeploymentTasks:arguments:`, arguments);

  // Validate incoming arguments.
  typeValidator.throwOnNullInvalidInstance(tmToolsDeploy, TmToolsDeploy, `${dbgNs}:metadataRetrieve`, 'tmToolsDeploy');

  // Make sure the calling scope has access to Shared Data.
  validateSharedData.call(this);

  // Build and return a Listr Task Object.
  return new listr(
    // TASK GROUP: TM2 Post-Deployment Tasks
    [
      // ── POST-DEPLOYMENT TASK 1: Fetch Territory2 IDs ───────────────────────────────────────────
      {
        title:  'Query TM2 Org for Territory2 Record IDs',
        task:   (listrContext:object, thisTask:ListrTask) => {
          return new Observable(observer => {
    
            // Initialize an OTR (Observable Task Result).
            const otr = initObservableTaskResult(`${dbgNs}runPostDeploymentTasks:PDT1`, listrContext, thisTask, observer, this.sharedData, this.generatorResult,
                        `Retrieving Territory2 records`);
    
            // Define the Task Logic to be executed.
            const asyncTask = async () => {
              await tmToolsDeploy.fetchTerritory2Records();
              //SfdxFalconDebug.obj(`${dbgNs}runPostDeploymentTasks:PDT1:tm2Deploy:`, tm2Deploy);
            };

            // Execute the Task Logic.
            asyncTask()
              .then(async result => {
                await waitASecond(3);
                finalizeObservableTaskResult(otr);
              })
              .catch(async error => {
                await waitASecond(3);
                SfdxFalconDebug.obj(`${dbgNs}asyncTaskError:runPostDeploymentTasks:PDT1:`, error);
                finalizeObservableTaskResult(otr, error);
              });
          });
        }
      },
      // ── POST-DEPLOYMENT TASK 2: Update Territory DevName Mappings ──────────────────────────────
      {
        title:  'Update Territory DevName Mappings',
        task:   (listrContext:object, thisTask:ListrTask) => {
          return new Observable(observer => {
    
            // Initialize an OTR (Observable Task Result).
            const otr = initObservableTaskResult(`${dbgNs}runPostDeploymentTasks:PDT2`, listrContext, thisTask, observer, this.sharedData, this.generatorResult,
                        `Updating DeveloperName mappings in Territory2DevNameMap.csv`);
    
            // Define the Task Logic to be executed.
            const asyncTask = async () => {
              await tmToolsDeploy.updateTerritoryDevNameMap();
            };

            // Execute the Task Logic.
            asyncTask()
              .then(async result => {
                await waitASecond(3);
                finalizeObservableTaskResult(otr);
              })
              .catch(async error => {
                await waitASecond(3);
                SfdxFalconDebug.obj(`${dbgNs}asyncTaskError:runPostDeploymentTasks:PDT2:`, error);
                finalizeObservableTaskResult(otr, error);
              });
          });
        }
      },
      // ── POST-DEPLOYMENT TASK 3: Finalize Transformation of User/Territory2 Association Files ───
      {
        title:  'Finalize Transformation of User/Territory2 Association Files',
        task:   (listrContext:object, thisTask:ListrTask) => {
          return new Observable(observer => {
    
            // Initialize an OTR (Observable Task Result).
            const otr = initObservableTaskResult(`${dbgNs}runPostDeploymentTasks:PDT3`, listrContext, thisTask, observer, this.sharedData, this.generatorResult,
                        `Finalizing transformation of UserTerritory2Association.csv`);
    
            // Define the Task Logic to be executed.
            const asyncTask = async () => {
              await tmToolsDeploy.transformUserTerritory2Associations();
            };

            // Execute the Task Logic.
            asyncTask()
              .then(async result => {
                await waitASecond(3);
                finalizeObservableTaskResult(otr);
              })
              .catch(async error => {
                await waitASecond(3);
                SfdxFalconDebug.obj(`${dbgNs}asyncTaskError:runPostDeploymentTasks:PDT3:`, error);
                finalizeObservableTaskResult(otr, error);
              });
          });
        }
      },
      // ── POST-DEPLOYMENT TASK 4: Finalize Transformation of Object/Territory2 Association Files ─
      {
        title:  'Finalize Transformation of Object/Territory2 Association Files',
        task:   (listrContext:object, thisTask:ListrTask) => {
          return new Observable(observer => {
    
            // Initialize an OTR (Observable Task Result).
            const otr = initObservableTaskResult(`${dbgNs}runPostDeploymentTasks:PDT4`, listrContext, thisTask, observer, this.sharedData, this.generatorResult,
                        `Finalizing transformation of ObjectTerritory2Association.csv`);
    
            // Define the Task Logic to be executed.
            const asyncTask = async () => {
              await tmToolsDeploy.transformObjectTerritory2Associations();
            };

            // Execute the Task Logic.
            asyncTask()
              .then(async result => {
                await waitASecond(3);
                finalizeObservableTaskResult(otr);
              })
              .catch(async error => {
                await waitASecond(3);
                SfdxFalconDebug.obj(`${dbgNs}asyncTaskError:runPostDeploymentTasks:PDT4:`, error);
                finalizeObservableTaskResult(otr, error);
              });
          });
        }
      }
    ],
    // TASK GROUP OPTIONS: TM2 Post-Deployment Tasks
    {
      concurrent:   false,
      collapse:     false,
      exitOnError:  false,
      renderer:     chooseListrRenderer()
    }
  );
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    scanConnectedOrgs
 * @returns     {ListrTask}  A Listr-compatible Task Object
 * @description Returns a Listr-compatible Task Object that scans the Standard and Scratch orgs that
 *              are connected to (ie. authenticated to) the local SFDX environment. The raw lists of
 *              these orgs are added to Shared Data so they're available to subsequent Listr tasks.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function scanConnectedOrgs():ListrTask {

  // Make sure the calling scope has access to Shared Data.
  validateSharedData.call(this);

  // Grab Generator Requirements out of Shared Data.
  const generatorRequirements = this.sharedData['generatorRequirements']  as GeneratorRequirements;
  SfdxFalconDebug.obj(`${dbgNs}scanConnectedOrgs:generatorRequirements:`, generatorRequirements);

  // Build and return a Listr Task.
  return {
    title:  'Scanning Connected Orgs...',
    enabled:() => typeValidator.isNotNullInvalidObject(generatorRequirements)
                  && (generatorRequirements.standardOrgs        === true
                      || generatorRequirements.scratchOrgs      === true
                      || generatorRequirements.devHubOrgs       === true
                      || generatorRequirements.envHubOrgs       === true
                      || generatorRequirements.managedPkgOrgs   === true
                      || generatorRequirements.unmanagedPkgOrgs === true),
    task:   (listrContext, thisTask) => {
      return sfdxHelper.scanConnectedOrgs()
        .then(successResult => {
          // DEBUG
          SfdxFalconDebug.obj(`${dbgNs}scanConnectedOrgs:successResult:`, successResult, `successResult: `);

          // Extract a list of Standard (ie. non-scratch) orgs from the successResult.
          let rawStandardOrgList = [];
          if (successResult.detail && typeof successResult.detail === 'object') {
            if ((successResult.detail as sfdxHelper.SfdxUtilityResultDetail).stdOutParsed) {
              rawStandardOrgList = (successResult.detail as sfdxHelper.SfdxUtilityResultDetail).stdOutParsed['result']['nonScratchOrgs'];
            }
          }

          // Extract a list of Scratch (ie. non-scratch) orgs from the successResult.
          let rawScratchOrgList = [];
          if (successResult.detail && typeof successResult.detail === 'object') {
            if ((successResult.detail as sfdxHelper.SfdxUtilityResultDetail).stdOutParsed) {
              rawScratchOrgList = (successResult.detail as sfdxHelper.SfdxUtilityResultDetail).stdOutParsed['result']['scratchOrgs'];
            }
          }

          // Make sure that there is at least ONE connnected Standard or Scratch org
          if (typeValidator.isEmptyNullInvalidArray(rawStandardOrgList) && typeValidator.isEmptyNullInvalidArray(rawScratchOrgList)) {
            throw new SfdxFalconError( `No orgs have been authenticated to the Salesforce CLI. `
                                     + `Please run one of the force:auth commands to connect to an org to the CLI.`
                                     , `NoConnectedOrgs`
                                     , `${dbgNs}scanConnectedOrgs`);
          }

          // Put the raw Standard and Scratch Org Lists into Shared Data.
          this.sharedData['rawStandardOrgList'] = rawStandardOrgList;
          this.sharedData['rawScratchOrgList']  = rawScratchOrgList;

          // Build maps of Standard and Scratch org infos based on the raw lists.
          this.sharedData['standardOrgInfoMap'] = sfdxHelper.buildStandardOrgInfoMap(rawStandardOrgList as RawStandardOrgInfo[]);
          this.sharedData['scratchOrgInfoMap']  = sfdxHelper.buildScratchOrgInfoMap (rawScratchOrgList  as RawScratchOrgInfo[]);

          // Change the title of the task.
          thisTask.title += 'Done!';
        })
        .catch(failureResult => {

          // We get here if no connections were found.
          SfdxFalconDebug.obj(`${dbgNs}scanConnectedOrgs:failureResult:`, failureResult, `failureResult: `);
          thisTask.title += 'No Connections Found';
          throw failureResult;
        });
    }
  } as ListrTask;
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    sfdxInitTasks
 * @returns     {ListrObject}  A "runnable" Listr Object
 * @description Returns a Listr-compatible Task Object that contains a number of sub-tasks which
 *              inspect the connected orgs in the local SFDX environment and build Inquirer "choice
 *              lists" with them.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function sfdxInitTasks():ListrObject {

  // Make sure the calling scope has a valid context variable.
  validateSharedData.call(this);

  // Grab Generator Requirements out of Shared Data.
  const generatorRequirements = this.sharedData['generatorRequirements']  as GeneratorRequirements;
  SfdxFalconDebug.obj(`${dbgNs}sfdxInitTasks:generatorRequirements:`, generatorRequirements);

  // Build and return a Listr Object.
  return new listr(
    [
      {
        // PARENT_TASK: Local SFDX Configuration
        title: 'Inspecting Local SFDX Configuration',
        enabled:() => typeValidator.isNotNullInvalidObject(generatorRequirements)
                      && (generatorRequirements.standardOrgs        === true
                          || generatorRequirements.scratchOrgs      === true
                          || generatorRequirements.devHubOrgs       === true
                          || generatorRequirements.envHubOrgs       === true
                          || generatorRequirements.managedPkgOrgs   === true
                          || generatorRequirements.unmanagedPkgOrgs === true),
        task: listrContext => {
          return new listr(
            [
              scanConnectedOrgs.call(this),
              identifyDevHubs.call(this),
              identifyEnvHubs.call(this),
              identifyPkgOrgs.call(this),
              buildDevHubAliasList.call(this),
              buildEnvHubAliasList.call(this),
              buildPkgOrgAliasList.call(this),
              buildStandardOrgAliasList.call(this),
              buildScratchOrgAliasList.call(this)
            ],
            // SUBTASK OPTIONS: (SFDX Config Tasks)
            {
              concurrent: false,
              collapse:   false,
              renderer:   chooseListrRenderer()
            }
          );
        }
      }
    ],
    {
      // PARENT_TASK OPTIONS: (Git Validation/Initialization)
      concurrent: false,
      collapse:   false,
      renderer:   chooseListrRenderer()
    }
  );
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    stageProjectFiles
 * @param       {string}  targetDir
 * @returns     {ListrTask}  A Listr-compatible Task Object
 * @description Returns a Listr-compatible Task Object that stages (git -A) ALL files in the target
 *              directory.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function stageProjectFiles(targetDir:string):ListrTask {

  // Make sure the calling scope has access to Shared Data.
  validateSharedData.call(this);

  // Build and return a Listr Task.
  return {
    title:  `Staging Files...`,
    enabled:() => (typeof targetDir === 'string' && targetDir !== ''),
    skip:   (listrContext:ListrContextFinalizeGit) => {
      if (listrContext.gitInstalled !== true) {
        return true;
      }
    },
    task:   (listrContext:ListrContextFinalizeGit, thisTask:ListrTask) => {
      return new Observable(observer => {

        // Initialize an OTR (Observable Task Result).
        const otr = initObservableTaskResult(`${dbgNs}stageProjectFiles`, listrContext, thisTask, observer, this.sharedData, this.generatorResult,
                    `Staging all new and modified files (git -A) in ${targetDir}`);
        
        // Define the Task Logic to be executed.
        const asyncTask = async () => {
          const shellString = gitHelper.gitAdd(targetDir);
          SfdxFalconDebug.obj(`${dbgNs}stageProjectFiles:shellString:`, shellString, `shellString: `);
          return shellString;
        };

        // Execute the Task Logic.
        asyncTask()
          .then(async result => {
            await waitASecond(3);
            thisTask.title += 'Done!';
            listrContext.projectFilesStaged = true;
            finalizeObservableTaskResult(otr);
          })
          .catch(async error => {
            await waitASecond(3);
            thisTask.title += 'Failed';
            listrContext.projectFilesStaged = false;
            finalizeObservableTaskResult(otr, error);
          });
      });
    }
  } as ListrTask;
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    fetchTm1Data
 * @param       {string}  aliasOrUsername Required. The alias or username associated with a
 *              TM1 org that the Salesforce CLI is currently connected to.
 * @param       {TM1ExtractFilePaths} tm1ExtractFilePaths Required. Object containing all file paths
 *              relevant to the TM1 extraction process.
 * @returns     {ListrObject}  A "runnable" Listr Object
 * @description Returns a "runnable" Listr Object that runs multiple SOQL queries against the target
 *              org in order to retrieve all relevant data representing a TM1 configuration.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function fetchTm1Data(aliasOrUsername:string, tm1ExtractFilePaths:TM1ExtractFilePaths):ListrObject {

  // Define function-local debug namespace and validate incoming arguments.
  const dbgNsLocal = `${dbgNs}fetchTm1Data`;
  SfdxFalconDebug.obj(`${dbgNsLocal}:arguments:`, arguments);

  // Validate incoming arguments.
  typeValidator.throwOnEmptyNullInvalidString(aliasOrUsername,      `${dbgNsLocal}`,  'aliasOrUsername');
  typeValidator.throwOnEmptyNullInvalidObject(tm1ExtractFilePaths,  `${dbgNsLocal}`,  'tm1ExtractFilePaths');

  // Determine various directory locations.
  const territoryCsv      = tm1ExtractFilePaths.territoryCsv;
  const userTerritoryCsv  = tm1ExtractFilePaths.userTerritoryCsv;
  const accountShareCsv   = tm1ExtractFilePaths.accountShareCsv;
  const ataRuleCsv        = tm1ExtractFilePaths.ataRuleCsv;
  const ataRuleItemCsv    = tm1ExtractFilePaths.ataRuleItemCsv;
  const groupCsv          = tm1ExtractFilePaths.groupCsv;

  // Build the necessary SOQL queries.
  const territorySoql     = `SELECT Id,ParentTerritoryId,DeveloperName,Name,Description,AccountAccessLevel,CaseAccessLevel,ContactAccessLevel,OpportunityAccessLevel,RestrictOpportunityTransfer,ForecastUserId,MayForecastManagerShare,LastModifiedById,LastModifiedDate,SystemModstamp FROM Territory`;
  const userTerritorySoql = `SELECT Id,UserId,TerritoryId,IsActive FROM UserTerritory`;
  const accountShareSoql  = `SELECT Id,AccountId,UserOrGroupId,RowCause,AccountAccessLevel,CaseAccessLevel,ContactAccessLevel,OpportunityAccessLevel,IsDeleted,LastModifiedById,LastModifiedDate FROM AccountShare WHERE RowCause='TerritoryManual'`;
  const ataRuleSoql       = `SELECT Id,TerritoryId,Name,IsActive,IsInherited,BooleanFilter,CreatedById,CreatedDate,LastModifiedById,LastModifiedDate,SystemModstamp FROM AccountTerritoryAssignmentRule`;
  const ataRuleItemSoql   = `SELECT Id,RuleId,SortOrder,Field,Operation,Value,SystemModstamp FROM AccountTerritoryAssignmentRuleItem ORDER BY RuleId,SortOrder ASC`;
  const groupSoql         = `SELECT Id,DeveloperName,RelatedId,Type,CreatedById,CreatedDate,LastModifiedById,LastModifiedDate,SystemModstamp FROM Group WHERE Type='Territory' OR Type='TerritoryAndSubordinates' ORDER BY Type,DeveloperName ASC`;

  // Build and return a Listr Task Object.
  return new listr(
    // TASK GROUP: TM1 Data Fetch Tasks
    [
      // ── SOQL Query 1 ───────────────────────────────────────────────────────────────────────────
      {
        title:  'Retrieve Territory Data',
        task:   (listrContext:object, thisTask:ListrTask) => {
          return new Observable(observer => {
    
            // Initialize an OTR (Observable Task Result).
            const otr = initObservableTaskResult(`${dbgNsLocal}:Q1`, listrContext, thisTask, observer, this.sharedData, this.generatorResult,
                        `Retrieving Territory data from ${aliasOrUsername}`);
    
            // Execute the Task Logic
            sfdxHelper.executeSoqlQuery(
              aliasOrUsername,
              territorySoql,
              {
                resultFormat:   'csv',
                apiVersion:     '45.0',
                logLevel:       'warn',
                useToolingApi:  false,
                perfLog:        false,
                json:           false
              },
              territoryCsv
            )
            .then((successResult:SfdxFalconResult) => {
              SfdxFalconDebug.obj(`${dbgNsLocal}:Q1:successResult:`, successResult);
    
              // Save the UTILITY result to Shared Data and finalize the OTR as successful.
              this.sharedData.metadataRetrieveResult = successResult;
              finalizeObservableTaskResult(otr);
            })
            .catch((failureResult:SfdxFalconResult|Error) => {
              SfdxFalconDebug.obj(`${dbgNsLocal}:Q1:failureResult:`, failureResult);
    
              // We get here if no connections were found.
              finalizeObservableTaskResult(otr, failureResult);
            });
          });
        }
      },
      // ── SOQL Query 2 ───────────────────────────────────────────────────────────────────────────
      {
        title:  'Retrieve UserTerritory Data',
        task:   (listrContext:object, thisTask:ListrTask) => {
          return new Observable(observer => {
    
            // Initialize an OTR (Observable Task Result).
            const otr = initObservableTaskResult(`${dbgNsLocal}:Q2`, listrContext, thisTask, observer, this.sharedData, this.generatorResult,
                        `Retrieving UserTerritory data from ${aliasOrUsername}`);
    
            // Execute the Task Logic
            sfdxHelper.executeSoqlQuery(
              aliasOrUsername,
              userTerritorySoql,
              {
                resultFormat:   'csv',
                apiVersion:     '45.0',
                logLevel:       'warn',
                useToolingApi:  false,
                perfLog:        false,
                json:           false
              },
              userTerritoryCsv
            )
            .then((successResult:SfdxFalconResult) => {
              SfdxFalconDebug.obj(`${dbgNsLocal}:Q2:successResult:`, successResult);
    
              // Save the UTILITY result to Shared Data and finalize the OTR as successful.
              this.sharedData.metadataRetrieveResult = successResult;
              finalizeObservableTaskResult(otr);
            })
            .catch((failureResult:SfdxFalconResult|Error) => {
              SfdxFalconDebug.obj(`${dbgNsLocal}:Q2:failureResult:`, failureResult);
    
              // We get here if no connections were found.
              finalizeObservableTaskResult(otr, failureResult);
            });
          });
        }
      },
      // ── SOQL Query 3 ───────────────────────────────────────────────────────────────────────────
      {
        title:  'Retrieve AccountShare Data',
        task:   (listrContext:object, thisTask:ListrTask) => {
          return new Observable(observer => {
    
            // Initialize an OTR (Observable Task Result).
            const otr = initObservableTaskResult(`${dbgNsLocal}:Q3`, listrContext, thisTask, observer, this.sharedData, this.generatorResult,
                        `Retrieving AccountShare data from ${aliasOrUsername}`);
    
            // Execute the Task Logic
            sfdxHelper.executeSoqlQuery(
              aliasOrUsername,
              accountShareSoql,
              {
                resultFormat:   'csv',
                apiVersion:     '45.0',
                logLevel:       'warn',
                useToolingApi:  false,
                perfLog:        false,
                json:           false
              },
              accountShareCsv
            )
            .then((successResult:SfdxFalconResult) => {
              SfdxFalconDebug.obj(`${dbgNsLocal}:Q3:successResult:`, successResult);
    
              // Save the UTILITY result to Shared Data and finalize the OTR as successful.
              this.sharedData.metadataRetrieveResult = successResult;
              finalizeObservableTaskResult(otr);
            })
            .catch((failureResult:SfdxFalconResult|Error) => {
              SfdxFalconDebug.obj(`${dbgNsLocal}:Q3:failureResult:`, failureResult);
    
              // We get here if no connections were found.
              finalizeObservableTaskResult(otr, failureResult);
            });
          });
        }
      },
      // ── SOQL Query 4 ───────────────────────────────────────────────────────────────────────────
      {
        title:  'Retrieve AccountTerritoryAssignmentRule Data',
        task:   (listrContext:object, thisTask:ListrTask) => {
          return new Observable(observer => {
    
            // Initialize an OTR (Observable Task Result).
            const otr = initObservableTaskResult(`${dbgNsLocal}:Q4`, listrContext, thisTask, observer, this.sharedData, this.generatorResult,
                        `Retrieving AccountTerritoryAssignmentRule data from ${aliasOrUsername}`);
    
            // Execute the Task Logic
            sfdxHelper.executeSoqlQuery(
              aliasOrUsername,
              ataRuleSoql,
              {
                resultFormat:   'csv',
                apiVersion:     '45.0',
                logLevel:       'warn',
                useToolingApi:  false,
                perfLog:        false,
                json:           false
              },
              ataRuleCsv
            )
            .then((successResult:SfdxFalconResult) => {
              SfdxFalconDebug.obj(`${dbgNsLocal}:Q4:successResult:`, successResult);
    
              // Save the UTILITY result to Shared Data and finalize the OTR as successful.
              this.sharedData.metadataRetrieveResult = successResult;
              finalizeObservableTaskResult(otr);
            })
            .catch((failureResult:SfdxFalconResult|Error) => {
              SfdxFalconDebug.obj(`${dbgNsLocal}:Q4:failureResult:`, failureResult);
    
              // We get here if no connections were found.
              finalizeObservableTaskResult(otr, failureResult);
            });
          });
        }
      },
      // ── SOQL Query 5 ───────────────────────────────────────────────────────────────────────────
      {
        title:  'Retrieve AccountTerritoryAssignmentRuleItem Data',
        task:   (listrContext:object, thisTask:ListrTask) => {
          return new Observable(observer => {
    
            // Initialize an OTR (Observable Task Result).
            const otr = initObservableTaskResult(`${dbgNsLocal}:Q5`, listrContext, thisTask, observer, this.sharedData, this.generatorResult,
                        `Retrieving AccountTerritoryAssignmentRuleItem data from ${aliasOrUsername}`);
    
            // Execute the Task Logic
            sfdxHelper.executeSoqlQuery(
              aliasOrUsername,
              ataRuleItemSoql,
              {
                resultFormat:   'csv',
                apiVersion:     '45.0',
                logLevel:       'warn',
                useToolingApi:  false,
                perfLog:        false,
                json:           false
              },
              ataRuleItemCsv
            )
            .then((successResult:SfdxFalconResult) => {
              SfdxFalconDebug.obj(`${dbgNsLocal}:Q5:successResult:`, successResult);
    
              // Save the UTILITY result to Shared Data and finalize the OTR as successful.
              this.sharedData.metadataRetrieveResult = successResult;
              finalizeObservableTaskResult(otr);
            })
            .catch((failureResult:SfdxFalconResult|Error) => {
              SfdxFalconDebug.obj(`${dbgNsLocal}:Q5:failureResult:`, failureResult);
    
              // We get here if no connections were found.
              finalizeObservableTaskResult(otr, failureResult);
            });
          });
        }
      },
      // ── SOQL Query 6 ───────────────────────────────────────────────────────────────────────────
      {
        title:  'Retrieve Group Data',
        task:   (listrContext:object, thisTask:ListrTask) => {
          return new Observable(observer => {
    
            // Initialize an OTR (Observable Task Result).
            const otr = initObservableTaskResult(`${dbgNsLocal}:Q6`, listrContext, thisTask, observer, this.sharedData, this.generatorResult,
                        `Retrieving Group data from ${aliasOrUsername}`);
    
            // Execute the Task Logic
            sfdxHelper.executeSoqlQuery(
              aliasOrUsername,
              groupSoql,
              {
                resultFormat:   'csv',
                apiVersion:     '45.0',
                logLevel:       'warn',
                useToolingApi:  false,
                perfLog:        false,
                json:           false
              },
              groupCsv
            )
            .then((successResult:SfdxFalconResult) => {
              SfdxFalconDebug.obj(`${dbgNsLocal}:Q6:successResult:`, successResult);
    
              // Save the UTILITY result to Shared Data and finalize the OTR as successful.
              this.sharedData.metadataRetrieveResult = successResult;
              finalizeObservableTaskResult(otr);
            })
            .catch((failureResult:SfdxFalconResult|Error) => {
              SfdxFalconDebug.obj(`${dbgNsLocal}:Q6:failureResult:`, failureResult);
    
              // We get here if no connections were found.
              finalizeObservableTaskResult(otr, failureResult);
            });
          });
        }
      }
    ],
    // TASK GROUP OPTIONS: TM1 Data Fetch Tasks
    {
      concurrent: false,
      collapse:   false,
      renderer:   chooseListrRenderer()
    }
  );
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    transformTm1Config
 * @param       {TM1AnalysisReport} tm1AnalysisReport Required. Report on target TM1 config.
 * @param       {TM1ExtractionReport} tm1ExtractionReport Required. Report on extracted TM1 config.
 * @param       {TM1TransformFilePaths} TM1TransformFilePaths Required. All file paths needed to
 *              carry out the TM1 Transformation tasks.
 * @returns     {ListrObject}  A "runnable" Listr Object
 * @description Returns a "runnable" Listr Object that attempts to transform the specified set of
 *              TM1 metadata and data, then writes the transformed files to the local filesystem at
 *              the specified locations.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function transformTm1Config(tm1AnalysisReport:TM1AnalysisReport, tm1ExtractionReport:TM1ExtractionReport, tm1TransformFilePaths:TM1TransformFilePaths):ListrObject {

  // Define function-local debug namespace and validate incoming arguments.
  const dbgNsLocal = `${dbgNs}transformTm1Config`;
  SfdxFalconDebug.obj(`${dbgNsLocal}:arguments:`, arguments);

  // Validate incoming arguments.
  typeValidator.throwOnEmptyNullInvalidObject(tm1AnalysisReport,     `${dbgNsLocal}`, 'tm1AnalysisReport');
  typeValidator.throwOnEmptyNullInvalidObject(tm1ExtractionReport,   `${dbgNsLocal}`, 'tm1ExtractionReport');
  typeValidator.throwOnEmptyNullInvalidObject(tm1TransformFilePaths, `${dbgNsLocal}`, 'tm1TransformFilePaths');

  // Make sure that Shared Data has a valid Object key for tmToolsTransform.
  typeValidator.throwOnInvalidObject(this.sharedData['tmToolsTransform'],  `${dbgNsLocal}`, 'this.sharedData.tmToolsTransform');

  // Define a variable to hold the TM Tools Transformation Context.
  let tmToolsTransform:TmToolsTransform = null;

  // Build and return a Listr Task Object.
  return new listr(
    // TASK GROUP: TM1 Transformation Tasks
    [
      // ── TRANSFORM TASK 1: Prepare TM Tools Transformation Context ──────────────────────────────
      {
        title:  'Prepare Environment for TM1 to TM2 Transformation',
        task:   (listrContext:object, thisTask:ListrTask) => {
          return new Observable(observer => {
    
            // Initialize an OTR (Observable Task Result).
            const otr = initObservableTaskResult(`${dbgNsLocal}:TT1`, listrContext, thisTask, observer, this.sharedData, this.generatorResult,
                        `Examining TM1 data and metadata and preparing a Transformation Context`);
    
            // Define the Task Logic to be executed.
            const asyncTask = async () => {
              tmToolsTransform = await TmToolsTransform.prepare(
                tm1AnalysisReport,
                tm1ExtractionReport,
                tm1TransformFilePaths
              );
              this.sharedData['tmToolsTransform'] = tmToolsTransform;
              SfdxFalconDebug.obj(`${dbgNsLocal}:tmToolsTransform:`, tmToolsTransform);
            };

            // Execute the Task Logic.
            asyncTask()
              .then(async result => {
                await waitASecond(3);
                finalizeObservableTaskResult(otr);
              })
              .catch(async error => {
                await waitASecond(3);
                finalizeObservableTaskResult(otr, error);
              });
          });
        }
      },
      // ── TRANSFORM TASK 2: Transform TM1 Metadata to TM2 Metadata ───────────────────────────────
      {
        title:  'Transform TM1 Metadata to TM2 Metadata',
        task:   (listrContext:object, thisTask:ListrTask) => {
          return new Observable(observer => {
    
            // Initialize an OTR (Observable Task Result).
            const otr = initObservableTaskResult(`${dbgNsLocal}:TT2`, listrContext, thisTask, observer, this.sharedData, this.generatorResult,
                        `Transforming TM1 metadata to TM2 metadata`);
    
            // Define the Task Logic to be executed.
            const asyncTask = async () => {
              await tmToolsTransform.transformMetadata();
            };

            // Execute the Task Logic.
            asyncTask()
              .then(async result => {
                await waitASecond(3);
                finalizeObservableTaskResult(otr);
              })
              .catch(async error => {
                await waitASecond(3);
                finalizeObservableTaskResult(otr, error);
              });
          });
        }
      },
      // ── TRANSFORM TASK 3: Write Transformed TM2 Metadata to Disk ───────────────────────────────
      {
        title:  'Write Transformed TM2 Metadata to the Local Filesystem',
        task:   (listrContext:object, thisTask:ListrTask) => {
          return new Observable(observer => {
    
            // Initialize an OTR (Observable Task Result).
            const otr = initObservableTaskResult(`${dbgNsLocal}:TT3`, listrContext, thisTask, observer, this.sharedData, this.generatorResult,
                        `Writing transformed TM2 metadata to ${tm1TransformFilePaths.transformedMetadataDir}`);
    
            // Define the Task Logic to be executed.
            const asyncTask = async () => {
              await tmToolsTransform.writeMetadata();
            };

            // Execute the Task Logic.
            asyncTask()
              .then(async result => {
                await waitASecond(3);
                finalizeObservableTaskResult(otr);
              })
              .catch(async error => {
                await waitASecond(3);
                finalizeObservableTaskResult(otr, error);
              });
          });
        }
      },
      // ── TRANSFORM TASK 4: Write Intermediate Data to Disk ──────────────────────────────────────
      {
        title:  'Write Intermediate TM2 Data to the Local Filesystem',
        task:   (listrContext:object, thisTask:ListrTask) => {
          return new Observable(observer => {
    
            // Initialize an OTR (Observable Task Result).
            const otr = initObservableTaskResult(`${dbgNsLocal}:TT4`, listrContext, thisTask, observer, this.sharedData, this.generatorResult,
                        `Writing intermediate TM2 data to ${tm1TransformFilePaths.intermediateFilesDir}`);
    
            // Define the Task Logic to be executed.
            const asyncTask = async () => {
              await tmToolsTransform.writeIntermediateFiles();
            };

            // Execute the Task Logic.
            asyncTask()
              .then(async result => {
                await waitASecond(3);
                finalizeObservableTaskResult(otr);
              })
              .catch(async error => {
                await waitASecond(3);
                finalizeObservableTaskResult(otr, error);
              });
          });
        }
      }
    ],
    // TASK GROUP OPTIONS: TM1 Transformation Tasks
    {
      concurrent:   false,
      collapse:     false,
      exitOnError:  true,
      renderer:     chooseListrRenderer()
    }
  );
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    validateGitCloneArguments
 * @returns     {void}
 * @description Ensures that the arguments provided match an expected, ordered set.
 * @private
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
function validateGitCloneArguments():void {

  // Debug incoming arguments
  SfdxFalconDebug.obj(`${dbgNs}validateGitCloneArguments:arguments:`, arguments);

  // Validate "gitRemoteUri".
  if (typeof arguments[0] !== 'string' || arguments[0] === '') {
    throw new SfdxFalconError( `Expected gitRemoteUri to be a non-empty string but got type '${typeof arguments[0]}' instead.`
                             , `TypeError`
                             , `${dbgNs}validateGitCloneArguments`);
  }
  // Validate "targetDirectory".
  if (typeof arguments[1] !== 'string' || arguments[1] === '') {
    throw new SfdxFalconError( `Expected targetDirectory to be a non-empty string but got type '${typeof arguments[1]}' instead.`
                             , `TypeError`
                             , `${dbgNs}validateGitCloneArguments`);
  }
  // Validate "gitCloneDirectory".
  if (typeof arguments[2] !== 'string') {
    throw new SfdxFalconError( `Expected gitCloneDirectory to be a string but got type '${typeof arguments[2]}' instead.`
                             , `TypeError`
                             , `${dbgNs}validateGitCloneArguments`);
  }
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    validateGitRemote
 * @param       {string}  gitRemoteUri  Required. URI of the remote Git repository being validated.
 * @returns     {ListrTask}  A Listr-compatible Task Object
 * @description Returns a Listr-compatible Task Object that validates the presence of and access to
 *              the Git remote at the provided Git Remote URI.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function validateGitRemote(gitRemoteUri:string=''):ListrTask {

  // Debug incoming arguments
  SfdxFalconDebug.obj(`${dbgNs}validateGitRemote:arguments:`, arguments);

  // Validate incoming arguments.
  typeValidator.throwOnInvalidString(gitRemoteUri, `${dbgNs}validateGitRemote`, `gitRemoteUri`);

  // Build and return the Listr task.
  return {
    title:  'Validating Git Remote...',
    enabled: listrContext => (gitRemoteUri && listrContext.gitInstalled === true),
    task:   (listrContext, thisTask) => {
      return gitHelper.checkGitRemoteStatus(gitRemoteUri, 3)
        .then(result => {
          thisTask.title += 'Valid!';
          listrContext.wizardInitialized = true;
        })
        .catch(result => {
          thisTask.title += 'ERROR';
          if (result instanceof Error) {
            throw new SfdxFalconError( 'There was a problem with your Git Remote.'
                                     , 'InvalidGitRemote'
                                     , `${dbgNs}validateGitRemote`
                                     , result);
          }
          else {
            throw new SfdxFalconError( `There was a problem with your Git Remote: ${result.message}.`
                                     , 'InvalidGitRemote'
                                     , `${dbgNs}validateGitRemote`);
          }
        });
    }
  } as ListrTask;
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    validateSharedData
 * @returns     {void}
 * @description Ensures that the calling scope has the special "sharedData" object.
 * @private
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
function validateSharedData():void {
  if (typeof this.sharedData !== 'object') {
    throw new SfdxFalconError( `Expected this.sharedData to be an object available in the calling scope. Got type '${typeof this.sharedData}' instead. `
                             + `You must execute listr-tasks functions using the syntax: functionName.call(this). `
                             + `You must also ensure that the calling scope has defined an object named 'sharedData'.`
                             , `InvalidSharedData`
                             , `${dbgNs}validateSharedData`);
  }
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    validateTm1Extraction
 * @param       {TM1AnalysisReport} tm1AnalysisReport Required. The TM1 analysis report that was
 *              the basis for extraction.
 * @param       {TM1ExtractFilePaths} tm1ExtractFilePaths  Required. Contains all File Paths that
 *              are relevant to the Extract command.
 * @returns     {ListrObject}  A "runnable" Listr Object
 * @description Returns a "runnable" Listr Object that takes the TM1 analysis that was the basis for
 *              a previously successful TM1 extraction and compares the stats within that analysis
 *              to the actual set of extracted TM1 data and metadata in the user's local filesystem.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function validateTm1Extraction(tm1AnalysisReport:TM1AnalysisReport, tm1ExtractFilePaths:TM1ExtractFilePaths):ListrObject {

  // Define function-local debug namespace and debug incoming arguments.
  const dbgNsLocal = `${dbgNs}validateTm1Extraction`;
  SfdxFalconDebug.obj(`${dbgNsLocal}:arguments:`, arguments);

  // Validate incoming arguments.
  typeValidator.throwOnNullInvalidObject(tm1AnalysisReport,   `${dbgNsLocal}`, 'tm1AnalysisReport');
  typeValidator.throwOnNullInvalidObject(tm1ExtractFilePaths, `${dbgNsLocal}`, 'tm1ExtractFilePaths');

  // Make sure the calling scope has a valid context variable.
  validateSharedData.call(this);

  // Make sure that Shared Data has a valid Object key for tm1ContextValidation.
  typeValidator.throwOnInvalidObject(this.sharedData['tm1ContextValidation'],  `${dbgNsLocal}`, 'this.sharedData.tm1ContextValidation');

  // Create a variable to hold the results from Tm1Context.validate().
  let tm1ContextValidation:TM1ContextValidation = null;

  // Build and return a Listr Task Object.
  return new listr(
    // TASK GROUP: TM1 Data Fetch Tasks
    [
      // ── Validation Task 1 ──────────────────────────────────────────────────────────────────────
      {
        title:  'Inspecting Extracted Files',
        task:   (listrContext:object, thisTask:ListrTask) => {
          return new Observable(observer => {
    
            // Initialize an OTR (Observable Task Result).
            const otr = initObservableTaskResult(`${dbgNsLocal}:VT1`, listrContext, thisTask, observer, this.sharedData, this.generatorResult,
                        `Creating TM1 Context for validation`);
    
            // Execute the Task Logic
            Tm1Context.validate(tm1AnalysisReport, tm1ExtractFilePaths.baseDirectory)
            .then(async (successResult:TM1ContextValidation) => {
              tm1ContextValidation = successResult;
              this.sharedData['tm1ContextValidation'] = tm1ContextValidation;
              SfdxFalconDebug.obj(`${dbgNsLocal}:VT1:tm1ContextValidation.status:`, tm1ContextValidation.status);
              await waitASecond(3);
              finalizeObservableTaskResult(otr);
            })
            .catch(async (failureResult:Error) => {
              SfdxFalconDebug.obj(`${dbgNsLocal}:VT1:failureResult:`, failureResult);
              await waitASecond(3);
              finalizeObservableTaskResult(otr, failureResult);
            });
          });
        }
      },
      // ── Validation Task 2 ──────────────────────────────────────────────────────────────────────
      {
        title:  'Validate Extracted Territories',
        task:   (listrContext:object, thisTask:ListrTask) => {
          return new Observable(observer => {
    
            // Initialize an OTR (Observable Task Result).
            const otr = initObservableTaskResult(`${dbgNsLocal}:VT2`, listrContext, thisTask, observer, this.sharedData, this.generatorResult,
                        `Comparing expected Territory record count to extracted records`);

            // Check the Validation Status for this data set.
            if (tm1ContextValidation.status.territoryExtractionIsValid === true) {
              thisTask.title += chalk.green(` (Expected ${tm1AnalysisReport.tm1RecordCounts.territoryRecordCount} | Found ${tm1ContextValidation.records.extractedTerritoryRecords.length})`);
              finalizeObservableTaskResult(otr);
            }
            else {
              thisTask.title += chalk.red(` (Expected ${tm1AnalysisReport.tm1RecordCounts.territoryRecordCount} | Found ${tm1ContextValidation.records.extractedTerritoryRecords.length})`);
              finalizeObservableTaskResult(otr, new SfdxFalconError( `Invalid Territory Extraction (Expected ${tm1AnalysisReport.tm1RecordCounts.territoryRecordCount} Records | Found ${tm1ContextValidation.records.extractedTerritoryRecords.length} Records)`
                                                                   , `ExtractionValidationError`
                                                                   , `${dbgNsLocal}:VT2` ));
            }
          });
        }
      },
      // ── Validation Task 3 ──────────────────────────────────────────────────────────────────────
      {
        title:  'Validate Extracted Territory Assignment Rules',
        task:   (listrContext:object, thisTask:ListrTask) => {
          return new Observable(observer => {
    
            // Initialize an OTR (Observable Task Result).
            const otr = initObservableTaskResult(`${dbgNsLocal}:VT3`, listrContext, thisTask, observer, this.sharedData, this.generatorResult,
                        `Comparing expected AccountTerritoryAssignmentRule record count to extracted records`);

            // Check the Validation Status for this data set.
            if (tm1ContextValidation.status.ataRuleExtractionIsValid === true) {
              thisTask.title += chalk.green(` (Expected ${tm1AnalysisReport.tm1RecordCounts.ataRuleRecordCount} | Found ${tm1ContextValidation.records.extractedAtaRuleRecords.length})`);
              finalizeObservableTaskResult(otr);
            }
            else {
              thisTask.title += chalk.red(` (Expected ${tm1AnalysisReport.tm1RecordCounts.ataRuleRecordCount} | Found ${tm1ContextValidation.records.extractedAtaRuleRecords.length})`);
              finalizeObservableTaskResult(otr, new SfdxFalconError( `Invalid Territory Assignment Rule Extraction (Expected ${tm1AnalysisReport.tm1RecordCounts.ataRuleRecordCount} Records | Found ${tm1ContextValidation.records.extractedAtaRuleRecords.length} Records)`
                                                                   , `ExtractionValidationError`
                                                                   , `${dbgNsLocal}:VT3` ));
            }
          });
        }
      },
      // ── Validation Task 4 ──────────────────────────────────────────────────────────────────────
      {
        title:  'Validate Extracted Territory Assignment Rule Items',
        task:   (listrContext:object, thisTask:ListrTask) => {
          return new Observable(observer => {
    
            // Initialize an OTR (Observable Task Result).
            const otr = initObservableTaskResult(`${dbgNsLocal}:VT4`, listrContext, thisTask, observer, this.sharedData, this.generatorResult,
                        `Comparing expected AccountTerritoryAssignmentRuleItem record count to extracted records`);

            // Check the Validation Status for this data set.
            if (tm1ContextValidation.status.ataRuleItemExtractionIsValid === true) {
              thisTask.title += chalk.green(` (Expected ${tm1AnalysisReport.tm1RecordCounts.ataRuleItemRecordCount} | Found ${tm1ContextValidation.records.extractedAtaRuleItemRecords.length})`);
              finalizeObservableTaskResult(otr);
            }
            else {
              thisTask.title += chalk.red(` (Expected ${tm1AnalysisReport.tm1RecordCounts.ataRuleItemRecordCount} | Found ${tm1ContextValidation.records.extractedAtaRuleItemRecords.length})`);
              finalizeObservableTaskResult(otr, new SfdxFalconError( `Invalid Territory Assignment Rule Item Extraction (Expected ${tm1AnalysisReport.tm1RecordCounts.ataRuleItemRecordCount} Records | Found ${tm1ContextValidation.records.extractedAtaRuleItemRecords.length} Records)`
                                                                   , `ExtractionValidationError`
                                                                   , `${dbgNsLocal}:VT4` ));
            }
          });
        }
      },
      // ── Validation Task 5 ──────────────────────────────────────────────────────────────────────
      {
        title:  'Validate Extracted User/Territory Assignments',
        task:   (listrContext:object, thisTask:ListrTask) => {
          return new Observable(observer => {
    
            // Initialize an OTR (Observable Task Result).
            const otr = initObservableTaskResult(`${dbgNsLocal}:VT5`, listrContext, thisTask, observer, this.sharedData, this.generatorResult,
                        `Comparing expected UserTerritory record count to extracted records`);

            // Check the Validation Status for this data set.
            if (tm1ContextValidation.status.userTerritoryExtractionIsValid === true) {
              thisTask.title += chalk.green(` (Expected ${tm1AnalysisReport.tm1RecordCounts.userTerritoryRecordCount} | Found ${tm1ContextValidation.records.extractedUserTerritoryRecords.length})`);
              finalizeObservableTaskResult(otr);
            }
            else {
              thisTask.title += chalk.red(` (Expected ${tm1AnalysisReport.tm1RecordCounts.userTerritoryRecordCount} | Found ${tm1ContextValidation.records.extractedUserTerritoryRecords.length})`);
              finalizeObservableTaskResult(otr, new SfdxFalconError( `Invalid Territory Assignment Rule Item Extraction (Expected ${tm1AnalysisReport.tm1RecordCounts.userTerritoryRecordCount} Records | Found ${tm1ContextValidation.records.extractedUserTerritoryRecords.length} Records)`
                                                                   , `ExtractionValidationError`
                                                                   , `${dbgNsLocal}:VT5` ));
            }
          });
        }
      },
      // ── Validation Task 6 ──────────────────────────────────────────────────────────────────────
      {
        title:  'Validate Extracted AccountShares',
        task:   (listrContext:object, thisTask:ListrTask) => {
          return new Observable(observer => {
    
            // Initialize an OTR (Observable Task Result).
            const otr = initObservableTaskResult(`${dbgNsLocal}:VT6`, listrContext, thisTask, observer, this.sharedData, this.generatorResult,
                        `Comparing expected AccountShare record count to extracted records`);

            // Check the Validation Status for this data set.
            if (tm1ContextValidation.status.accountShareExtractionIsValid === true) {
              thisTask.title += chalk.green(` (Expected ${tm1AnalysisReport.tm1RecordCounts.accountShareRecordCount} | Found ${tm1ContextValidation.records.extractedAccountShareRecords.length})`);
              finalizeObservableTaskResult(otr);
            }
            else {
              thisTask.title += chalk.red(` (Expected ${tm1AnalysisReport.tm1RecordCounts.accountShareRecordCount} | Found ${tm1ContextValidation.records.extractedAccountShareRecords.length})`);
              finalizeObservableTaskResult(otr, new SfdxFalconError( `Invalid Territory Assignment Rule Item Extraction (Expected ${tm1AnalysisReport.tm1RecordCounts.accountShareRecordCount} Records | Found ${tm1ContextValidation.records.extractedAccountShareRecords.length} Records)`
                                                                   , `ExtractionValidationError`
                                                                   , `${dbgNsLocal}:VT6` ));
            }
          });
        }
      },
      // ── Validation Task 7 ──────────────────────────────────────────────────────────────────────
      {
        title:  'Validate Extracted Groups',
        task:   (listrContext:object, thisTask:ListrTask) => {
          return new Observable(observer => {
    
            // Initialize an OTR (Observable Task Result).
            const otr = initObservableTaskResult(`${dbgNsLocal}:VT7`, listrContext, thisTask, observer, this.sharedData, this.generatorResult,
                        `Comparing expected Group record count to extracted records`);

            // Check the Validation Status for this data set.
            if (tm1ContextValidation.status.groupExtractionIsValid === true) {
              thisTask.title += chalk.green(` (Expected ${tm1AnalysisReport.tm1RecordCounts.groupRecordCount} | Found ${tm1ContextValidation.records.extractedGroupRecords.length})`);
              finalizeObservableTaskResult(otr);
            }
            else {
              thisTask.title += chalk.red(` (Expected ${tm1AnalysisReport.tm1RecordCounts.groupRecordCount} | Found ${tm1ContextValidation.records.extractedGroupRecords.length})`);
              finalizeObservableTaskResult(otr, new SfdxFalconError( `Invalid Group Extraction (Expected ${tm1AnalysisReport.tm1RecordCounts.groupRecordCount} Records | Found ${tm1ContextValidation.records.extractedGroupRecords.length} Records)`
                                                                   , `ExtractionValidationError`
                                                                   , `${dbgNsLocal}:VT7` ));
            }
          });
        }
      }
    ],
    // TASK GROUP OPTIONS: TM1 Data Fetch Tasks
    {
      concurrent:   false,
      collapse:     false,
      exitOnError:  false,
      renderer:     chooseListrRenderer()
    }
  );
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    validateTm2Activation
 * @param       {TM1AnalysisReport} tm1AnalysisReport Required. Report on target TM1 config.
 * @param       {TM1ExtractionReport} tm1ExtractionReport Required. Report on extracted TM1 config.
 * @param       {TM1TransformationReport} tm1TransformationReport Required. Report on transformed
 *              TM1 config.
 * @param       {TM2DeploymentReport} tm2DeploymentReport Required. Report on deployed TM2 config.
 * @param       {TM2DeploySharingFilePaths} tm2DeploySharingFilePaths Required. All file paths
 *              needed to carry out the TM2 Sharing Rules Deployment tasks.
 * @returns     {ListrObject}  A "runnable" Listr Object
 * @description Returns a "runnable" Listr Object that attempts to validate that the target org
 *              has the epxected Territory2Model in an `Active` state.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function validateTm2Activation(tm1AnalysisReport:TM1AnalysisReport, tm1ExtractionReport:TM1ExtractionReport, tm1TransformationReport:TM1TransformationReport, tm2DeploymentReport:TM2DeploymentReport, tm2DeploySharingFilePaths:TM2DeploySharingFilePaths):ListrObject {

  // Define function-local debug namespace and validate incoming arguments.
  const dbgNsLocal = `${dbgNs}validateTm2Activation`;
  SfdxFalconDebug.obj(`${dbgNsLocal}:arguments:`, arguments);

  // Validate incoming arguments.
  typeValidator.throwOnNullInvalidObject(tm1AnalysisReport,         `${dbgNsLocal}`, 'tm1AnalysisReport');
  typeValidator.throwOnNullInvalidObject(tm1ExtractionReport,       `${dbgNsLocal}`, 'tm1ExtractionReport');
  typeValidator.throwOnNullInvalidObject(tm1TransformationReport,   `${dbgNsLocal}`, 'tm1TransformationReport');
  typeValidator.throwOnNullInvalidObject(tm2DeploymentReport,       `${dbgNsLocal}`, 'tm2DeploymentReport');
  typeValidator.throwOnNullInvalidObject(tm2DeploySharingFilePaths, `${dbgNsLocal}`, 'tm2DeploySharingFilePaths');

  // Make sure the calling scope has access to Shared Data.
  validateSharedData.call(this);

  // Make sure that Shared Data has a valid Object key for tmToolsDeploySharing.
  typeValidator.throwOnInvalidObject(this.sharedData['tmToolsDeploySharing'],  `${dbgNsLocal}`, 'this.sharedData.tmToolsDeploySharing');

  // Define a variable to hold a TM Tools Sharing Deployment object.
  let tmToolsDeploySharing:TmToolsDeploySharing = null;

  // Build and return a Listr Task Object.
  return new listr(
    // TASK GROUP: TM2 Activation Validation Tasks
    [
      // ── Validation TASK 1: Make sure the Territory2Model 'IMPORTED_TERRITORY' is active ────────
      {
        title:  `Validate that the migrated Territory2 model is active`,
        task:   (listrContext:object, thisTask:ListrTask) => {
          return new Observable(observer => {
    
            // Initialize an OTR (Observable Task Result).
            const otr = initObservableTaskResult(`${dbgNsLocal}:VT1`, listrContext, thisTask, observer, this.sharedData, this.generatorResult,
                        `Querying ${tm2DeploymentReport.orgInfo.username} for an active T2 Model named 'IMPORTED_TERRITORY'`);
    
            // Define the Task Logic to be executed.
            const asyncTask = async () => {
              tmToolsDeploySharing = await TmToolsDeploySharing.prepare(
                tm1AnalysisReport,
                tm1ExtractionReport,
                tm1TransformationReport,
                tm2DeploymentReport,
                tm2DeploySharingFilePaths
              );
              SfdxFalconDebug.obj(`${dbgNsLocal}:VT1:tmToolsDeploySharing:`, tmToolsDeploySharing);

              // Put the TM Tools Load object in shared data so the caller can use it later.
              this.sharedData['tmToolsDeploySharing'] = tmToolsDeploySharing;
            };

            // Execute the Task Logic.
            asyncTask()
              .then(async result => {
                await waitASecond(3);
                finalizeObservableTaskResult(otr);
              })
              .catch(async error => {
                await waitASecond(3);
                finalizeObservableTaskResult(otr, error);
              });
          });
        }
      }
    ],
    // TASK GROUP OPTIONS: TM2 Activation Validation Tasks
    {
      concurrent:   false,
      collapse:     false,
      exitOnError:  false,
      renderer:     chooseListrRenderer()
    }
  );
}

// ────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @function    validateTm2Availability
 * @param       {TM1AnalysisReport} tm1AnalysisReport Required. Report on target TM1 config.
 * @param       {TM1ExtractionReport} tm1ExtractionReport Required. Report on extracted TM1 config.
 * @param       {TM1TransformationReport} tm1TransformationReport Required. Report on transformed
 *              TM1 config.
 * @param       {TM2DeploymentReport} tm2DeploymentReport Required. Report on deployed TM2 config.
 * @param       {TM2LoadFilePaths} tm2LoadFilePaths Required. All file paths needed to carry out the
 *              TM2 Data Load tasks.
 * @returns     {ListrObject}  A "runnable" Listr Object
 * @description Returns a "runnable" Listr Object that attempts to validate that the target org
 *              has the epxected Territory2Model in either `Planning` or `Active` state.
 * @public
 */
// ────────────────────────────────────────────────────────────────────────────────────────────────┘
export function validateTm2Availability(tm1AnalysisReport:TM1AnalysisReport, tm1ExtractionReport:TM1ExtractionReport, tm1TransformationReport:TM1TransformationReport, tm2DeploymentReport:TM2DeploymentReport, tm2LoadFilePaths:TM2LoadFilePaths):ListrObject {

  // Define function-local debug namespace and validate incoming arguments.
  const dbgNsLocal = `${dbgNs}validateTm2Availability`;
  SfdxFalconDebug.obj(`${dbgNsLocal}:arguments:`, arguments);

  // Validate incoming arguments.
  typeValidator.throwOnNullInvalidObject(tm1AnalysisReport,         `${dbgNsLocal}`, 'tm1AnalysisReport');
  typeValidator.throwOnNullInvalidObject(tm1ExtractionReport,       `${dbgNsLocal}`, 'tm1ExtractionReport');
  typeValidator.throwOnNullInvalidObject(tm1TransformationReport,   `${dbgNsLocal}`, 'tm1TransformationReport');
  typeValidator.throwOnNullInvalidObject(tm2DeploymentReport,       `${dbgNsLocal}`, 'tm2DeploymentReport');
  typeValidator.throwOnNullInvalidObject(tm2LoadFilePaths,          `${dbgNsLocal}`, 'tm2LoadFilePaths');

  // Make sure the calling scope has access to Shared Data.
  validateSharedData.call(this);

  // Make sure that Shared Data has a valid Object key for tmToolsLoad.
  typeValidator.throwOnInvalidObject(this.sharedData['tmToolsLoad'],  `${dbgNsLocal}`, 'this.sharedData.tmToolsLoad');

  // Define a variable to hold a TM Tools Data Load object.
  let tmToolsLoad:TmToolsLoad = null;

  // Build and return a Listr Task Object.
  return new listr(
    // TASK GROUP: TM2 Availability Validation Tasks
    [
      // ── Validation TASK 1: Make sure the Territory2Model 'IMPORTED_TERRITORY' is available ─────
      {
        title:  `Validate that the migrated Territory2 model is available (Active/Planning)`,
        task:   (listrContext:object, thisTask:ListrTask) => {
          return new Observable(observer => {
    
            // Initialize an OTR (Observable Task Result).
            const otr = initObservableTaskResult(`${dbgNsLocal}:VT1`, listrContext, thisTask, observer, this.sharedData, this.generatorResult,
                        `Querying ${tm2DeploymentReport.orgInfo.username} for a T2 Model named 'IMPORTED_TERRITORY' in 'Active' or 'Planning' state`);
    
            // Define the Task Logic to be executed.
            const asyncTask = async () => {
              tmToolsLoad = await TmToolsLoad.prepare(
                tm1AnalysisReport,
                tm1ExtractionReport,
                tm1TransformationReport,
                tm2DeploymentReport,
                tm2LoadFilePaths
              );
              SfdxFalconDebug.obj(`${dbgNsLocal}:VT1:tmToolsLoad:`, tmToolsLoad);

              // Put the TM Tools Data Load object in shared data so the caller can use it later.
              this.sharedData['tmToolsLoad'] = tmToolsLoad;
            };

            // Execute the Task Logic.
            asyncTask()
              .then(async result => {
                await waitASecond(3);
                finalizeObservableTaskResult(otr);
              })
              .catch(async error => {
                await waitASecond(3);
                finalizeObservableTaskResult(otr, error);
              });
          });
        }
      }
    ],
    // TASK GROUP OPTIONS: TM2 Availability Validation Tasks
    {
      concurrent:   false,
      collapse:     false,
      exitOnError:  false,
      renderer:     chooseListrRenderer()
    }
  );
}
