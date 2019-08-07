//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @file          modules/tm-tools-objects/tm-file-paths.ts
 * @copyright     Vivek M. Chawla - 2019
 * @author        Vivek M. Chawla <@VivekMChawla>
 * @summary       Utility class for generatig File Paths required by various TM-Tools commands.
 * @description   Utility class for generatig File Paths required by various TM-Tools commands.
 * @version       1.0.0
 * @license       MIT
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
// Import External Libraries & Modules
import * as path    from  'path';   // Node's path library.

// Import Internal Classes & Functions
import {SfdxFalconDebug}              from  '../sfdx-falcon-debug';   // Class. Specialized debug provider for SFDX-Falcon code.
import {SfdxFalconError}              from  '../sfdx-falcon-error';   // Class. Extends SfdxError to provide specialized error structures for SFDX-Falcon modules.

// Import TM-Tools Types
import {TMFileNames}                  from  '../tm-tools-types';   // ???
import {TM1AnalyzeFilePaths}          from  '../tm-tools-types';   // ???
import {TM1ContextFilePaths}          from  '../tm-tools-types';   // ???
import {TM1ExtractFilePaths}          from  '../tm-tools-types';   // ???
import {TM1TransformFilePaths}        from  '../tm-tools-types';   // ???
import {TM1CleanupFilePaths}          from  '../tm-tools-types';   // ???
import {TM2DeployFilePaths}           from  '../tm-tools-types';   // ???
import {TM2DataLoadFilePaths}         from  '../tm-tools-types';   // ???
import {TMToolsAllFilePaths}          from  '../tm-tools-types';   // ???

// File-Global Variables.
const tm1AnalysisReportFileName                   = 'tm1-analysis.json';
const tm1ExtractionReportFileName                 = 'tm1-extraction.json';
const tm1TransformationReportFileName             = 'tm1-transformation.json';
const tm1CleanupReportFileName                    = 'tm1-cleanup.json';
const tm2DeploymentReportFileName                 = 'tm2-deployment.json';
const tm2DataLoadReportFileName                   = 'tm2-dataload.json';

const accountShareCsv                             = 'AccountShare.csv';
const ataRuleCsv                                  = 'AccountTerritoryAssignmentRule.csv';
const ataRuleItemCsv                              = 'AccountTerritoryAssignmentRuleItem.csv';
const groupCsv                                    = 'Group.csv';
const territoryCsv                                = 'Territory.csv';
const territory2Csv                               = 'Territory2.csv';
const userTerritoryCsv                            = 'UserTerritory.csv';

const userTerritory2AssociationCsv                = 'UserTerritory2Association.csv';
const objectTerritory2AssociationCsv              = 'ObjectTerritory2Association.csv';
const tm1ToTm2DevnameMapCsv                       = 'TerritoryDevNameMap.csv';
const userTerritory2AssociationIntermediateCsv    = 'UserTerritory2Association.intermediate.csv';
const objectTerritory2AssociationIntermediateCsv  = 'ObjectTerritory2Association.intermediate.csv';

const tm1ExtractionDir                            = 'tm1-extraction';
const extractedDataDir                            = 'extracted-data';
const extractedMetadataDir                        = 'extracted-metadata';
const extractedMetadataPackageDir                 = 'unpackaged';

const transformedDataDir                          = 'transformed-data';
const transformedMetadataDir                      = 'transformed-metadata';
const tm1SharingRulesCleanupDir                   = 'tm1-sharing-rules-cleanup';
const tm2MainDeploymentDir                        = 'tm2-main-deployment';
const tm2SharingRulesDeploymentDir                = 'tm2-sharing-rules-deployment';
const intermediateFilesDir                        = 'intermediate-files';

// Set the File Local Debug Namespace
const dbgNs = 'MODULE:tm-file-paths:';
SfdxFalconDebug.msg(`${dbgNs}`, `Debugging initialized for ${dbgNs}`);


//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @class       TmFilePaths
 * @summary     Utility class for generatig File Paths required by various TM-Tools commands.
 * @description Utility class for generatig File Paths required by various TM-Tools commands.
 * @public
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export default class TmFilePaths {

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      getTmFileNames
   * @returns     {TMFileNames} File names required by various TM commands.
   * @description ???
   * @public @static
   */
  //───────────────────────────────────────────────────────────────────────────┘
  public static getTmFileNames():TMFileNames {

    // Build the File Names.
    const tmFileNames:TMFileNames = {
      tm1AnalysisReportFileName:                    tm1AnalysisReportFileName,
      tm1ExtractionReportFileName:                  tm1ExtractionReportFileName,
      tm1TransformationReportFileName:              tm1TransformationReportFileName,
      tm1CleanupReportFileName:                     tm1CleanupReportFileName,
      tm2DeploymentReportFileName:                  tm2DeploymentReportFileName,
      tm2DataLoadReportFileName:                    tm2DataLoadReportFileName,
      accountShareCsv:                              accountShareCsv,
      ataRuleCsv:                                   ataRuleCsv,
      ataRuleItemCsv:                               ataRuleItemCsv,
      groupCsv:                                     groupCsv,
      territoryCsv:                                 territoryCsv,
      territory2Csv:                                territory2Csv,
      userTerritoryCsv:                             userTerritoryCsv,
      userTerritory2AssociationCsv:                 userTerritory2AssociationCsv,
      objectTerritory2AssociationCsv:               objectTerritory2AssociationCsv,
      tm1ToTm2DevnameMapCsv:                        tm1ToTm2DevnameMapCsv,
      userTerritory2AssociationIntermediateCsv:     userTerritory2AssociationIntermediateCsv,
      objectTerritory2AssociationIntermediateCsv:   objectTerritory2AssociationIntermediateCsv
    };

    // DEBUG and send back to caller.
    SfdxFalconDebug.obj(`${dbgNs}getFileNames:tmFileNames:`, tmFileNames);
    return tmFileNames;
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      getTm1ContextFilePaths
   * @param       {string}  baseDirectory Required.
   * @returns     {TM1ContextFilePaths} Paths required by TM1 Context.
   * @description ???
   * @public @static
   */
  //───────────────────────────────────────────────────────────────────────────┘
  public static getTm1ContextFilePaths(baseDirectory:string):TM1ContextFilePaths {

    // Validate incoming arguments.
    TmFilePaths.validateBaseDirectoryArgument.apply(null, arguments);

    // Build the File Paths.
    const tm1ContextFilePaths:TM1ContextFilePaths = {
      baseDirectory:    baseDirectory,
      accountShareCsv:  path.join(baseDirectory, tm1ExtractionDir, extractedDataDir, accountShareCsv),
      ataRuleCsv:       path.join(baseDirectory, tm1ExtractionDir, extractedDataDir, ataRuleCsv),
      ataRuleItemCsv:   path.join(baseDirectory, tm1ExtractionDir, extractedDataDir, ataRuleItemCsv),
      groupCsv:         path.join(baseDirectory, tm1ExtractionDir, extractedDataDir, groupCsv),
      territoryCsv:     path.join(baseDirectory, tm1ExtractionDir, extractedDataDir, territoryCsv),
      tm1MetadataDir:   path.join(baseDirectory, tm1ExtractionDir, extractedMetadataDir, extractedMetadataPackageDir),
      userTerritoryCsv: path.join(baseDirectory, tm1ExtractionDir, extractedDataDir, userTerritoryCsv)
    };

    // DEBUG and send back to caller.
    SfdxFalconDebug.obj(`${dbgNs}getTm1ContextFilePaths:tm1ContextFilePaths:`, tm1ContextFilePaths);
    return tm1ContextFilePaths;
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      getTm1AnalyzeFilePaths
   * @param       {string}  baseDirectory Required.
   * @returns     {TM1AnalyzeFilePaths} Paths required by TM1 Analyze.
   * @description ???
   * @public @static
   */
  //───────────────────────────────────────────────────────────────────────────┘
  public static getTm1AnalyzeFilePaths(baseDirectory:string):TM1AnalyzeFilePaths {

    // Validate incoming arguments.
    TmFilePaths.validateBaseDirectoryArgument.apply(null, arguments);

    // Build the File Paths.
    const tm1AnalyzeFilePaths:TM1AnalyzeFilePaths = {
      baseDirectory:          path.resolve(baseDirectory),
      tm1AnalysisReportPath:  path.join(baseDirectory, tm1AnalysisReportFileName),
      fileNames: {
        ...TmFilePaths.getTmFileNames()
      }
    };

    // DEBUG and send back to caller.
    SfdxFalconDebug.obj(`${dbgNs}getTm1AnalyzeFilePaths:tm1AnalyzeFilePaths:`, tm1AnalyzeFilePaths);
    return tm1AnalyzeFilePaths;
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      getTm1ExtractFilePaths
   * @param       {string}  baseDirectory Required.
   * @returns     {TM1ExtractFilePaths} Paths required by TM1 Extract.
   * @description ???
   * @public @static
   */
  //───────────────────────────────────────────────────────────────────────────┘
  public static getTm1ExtractFilePaths(baseDirectory:string):TM1ExtractFilePaths {

    // Validate incoming arguments.
    TmFilePaths.validateBaseDirectoryArgument.apply(null, arguments);

    // Build the File Paths.
    const tm1ExtractFilePaths:TM1ExtractFilePaths = {
      ...TmFilePaths.getTm1AnalyzeFilePaths(baseDirectory),
      tm1ExtractionReportPath:          path.join(baseDirectory, tm1ExtractionReportFileName),
      tm1ExtractionDir:                 path.join(baseDirectory, tm1ExtractionDir),
        extractedDataDir:               path.join(baseDirectory, tm1ExtractionDir, extractedDataDir),
          accountShareCsv:              path.join(baseDirectory, tm1ExtractionDir, extractedDataDir, accountShareCsv),
          ataRuleCsv:                   path.join(baseDirectory, tm1ExtractionDir, extractedDataDir, ataRuleCsv),
          ataRuleItemCsv:               path.join(baseDirectory, tm1ExtractionDir, extractedDataDir, ataRuleItemCsv),
          groupCsv:                     path.join(baseDirectory, tm1ExtractionDir, extractedDataDir, groupCsv),
          territoryCsv:                 path.join(baseDirectory, tm1ExtractionDir, extractedDataDir, territoryCsv),
          userTerritoryCsv:             path.join(baseDirectory, tm1ExtractionDir, extractedDataDir, userTerritoryCsv),
        extractedMetadataDir:           path.join(baseDirectory, tm1ExtractionDir, extractedMetadataDir),
          extractedMetadataPackageDir:  path.join(baseDirectory, tm1ExtractionDir, extractedMetadataDir, extractedMetadataPackageDir)
    };

    // DEBUG and send back to caller.
    SfdxFalconDebug.obj(`${dbgNs}getTm1ExtractFilePaths:tm1ExtractFilePaths:`, tm1ExtractFilePaths);
    return tm1ExtractFilePaths;
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      getTm1TransformFilePaths
   * @param       {string}  baseDirectory Required.
   * @returns     {TM1TransformFilePaths} Paths required by TM1 Transform.
   * @description ???
   * @public @static
   */
  //───────────────────────────────────────────────────────────────────────────┘
  public static getTm1TransformFilePaths(baseDirectory:string):TM1TransformFilePaths {

    // Validate incoming arguments.
    TmFilePaths.validateBaseDirectoryArgument.apply(null, arguments);

    // Build the File Paths.
    const tm1TransformFilePaths:TM1TransformFilePaths = {
      ...TmFilePaths.getTm1ExtractFilePaths(baseDirectory),
      tm1TransformationReportPath:                    path.join(baseDirectory, tm1TransformationReportFileName),
      transformedDataDir:                             path.join(baseDirectory, transformedDataDir),
        userTerritory2AssociationCsv:                 path.join(baseDirectory, transformedDataDir, userTerritory2AssociationCsv),
        objectTerritory2AssociationCsv:               path.join(baseDirectory, transformedDataDir, objectTerritory2AssociationCsv),
      transformedMetadataDir:                         path.join(baseDirectory, transformedMetadataDir),
        tm1SharingRulesCleanupDir:                    path.join(baseDirectory, transformedMetadataDir, tm1SharingRulesCleanupDir),
        tm2MainDeploymentDir:                         path.join(baseDirectory, transformedMetadataDir, tm2MainDeploymentDir),
        tm2SharingRulesDeploymentDir:                 path.join(baseDirectory, transformedMetadataDir, tm2SharingRulesDeploymentDir),
      intermediateFilesDir:                           path.join(baseDirectory, intermediateFilesDir),
        tm1ToTm2DevnameMapCsv:                        path.join(baseDirectory, intermediateFilesDir, tm1ToTm2DevnameMapCsv),
        userTerritory2AssociationIntermediateCsv:     path.join(baseDirectory, intermediateFilesDir, userTerritory2AssociationIntermediateCsv),
        objectTerritory2AssociationIntermediateCsv:   path.join(baseDirectory, intermediateFilesDir, objectTerritory2AssociationIntermediateCsv),
        territory2Csv:                                path.join(baseDirectory, intermediateFilesDir, territory2Csv)
      };

    // DEBUG and send back to caller.
    SfdxFalconDebug.obj(`${dbgNs}getTm1TransformFilePaths:tm1TransformFilePaths:`, tm1TransformFilePaths);
    return tm1TransformFilePaths;
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      getTm1CleanupFilePaths
   * @param       {string}  baseDirectory Required.
   * @returns     {TM1CleanupFilePaths} Paths required by TM1 Cleanup.
   * @description ???
   * @public @static
   */
  //───────────────────────────────────────────────────────────────────────────┘
  public static getTm1CleanupFilePaths(baseDirectory:string):TM1CleanupFilePaths {

    // Validate incoming arguments.
    TmFilePaths.validateBaseDirectoryArgument.apply(null, arguments);

    // Build the File Paths.
    const tm1CleanupFilePaths:TM1CleanupFilePaths = {
      ...TmFilePaths.getTm1TransformFilePaths(baseDirectory),
      tm1CleanupReportPath:  path.join(baseDirectory, tm1CleanupReportFileName)
    };

    // DEBUG and send back to caller.
    SfdxFalconDebug.obj(`${dbgNs}getTm1CleanupFilePaths:tm1CleanupFilePaths:`, tm1CleanupFilePaths);
    return tm1CleanupFilePaths;
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      getTm2DeployFilePaths
   * @param       {string}  baseDirectory Required.
   * @returns     {TM2DeployFilePaths} Paths required by TM2 Deploy.
   * @description ???
   * @public @static
   */
  //───────────────────────────────────────────────────────────────────────────┘
  public static getTm2DeployFilePaths(baseDirectory:string):TM2DeployFilePaths {

    // Validate incoming arguments.
    TmFilePaths.validateBaseDirectoryArgument.apply(null, arguments);

    // Build the File Paths.
    const tm2DeployFilePaths:TM2DeployFilePaths = {
      ...TmFilePaths.getTm1CleanupFilePaths(baseDirectory),
      tm2DeploymentReportPath:  path.join(baseDirectory, tm2DeploymentReportFileName)
    };

    // DEBUG and send back to caller.
    SfdxFalconDebug.obj(`${dbgNs}getTm2DeployFilePaths:tm2DeployFilePaths:`, tm2DeployFilePaths);
    return tm2DeployFilePaths;
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      getTm2DataLoadFilePaths
   * @param       {string}  baseDirectory Required.
   * @returns     {TM2DataLoadFilePaths} Paths required by TM2 DataLoad.
   * @description ???
   * @public @static
   */
  //───────────────────────────────────────────────────────────────────────────┘
  public static getTm2DataLoadFilePaths(baseDirectory:string):TM2DataLoadFilePaths {

    // Validate incoming arguments.
    TmFilePaths.validateBaseDirectoryArgument.apply(null, arguments);

    // Build the File Paths.
    const tm2DataLoadFilePaths:TM2DataLoadFilePaths = {
      ...TmFilePaths.getTm2DeployFilePaths(baseDirectory),
      tm2DataLoadReportPath:  path.join(baseDirectory, tm2DataLoadReportFileName)
    };

    // DEBUG and send back to caller.
    SfdxFalconDebug.obj(`${dbgNs}getTm2DataLoadFilePaths:tm2DataLoadFilePaths:`, tm2DataLoadFilePaths);
    return tm2DataLoadFilePaths;
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      getAllTmToolsFilePaths
   * @param       {string}  baseDirectory Required.
   * @returns     {TMToolsAllFilePaths} Paths required by TM2 DataLoad.
   * @description ???
   * @public @static
   */
  //───────────────────────────────────────────────────────────────────────────┘
  public static getAllTmToolsFilePaths(baseDirectory:string):TMToolsAllFilePaths {

    // Validate incoming arguments.
    TmFilePaths.validateBaseDirectoryArgument.apply(null, arguments);

    // Build the File Paths.
    const allTmToolsFilePaths:TMToolsAllFilePaths = {
      ...TmFilePaths.getTm2DataLoadFilePaths(baseDirectory)
    };

    // DEBUG and send back to caller.
    SfdxFalconDebug.obj(`${dbgNs}getAllTmToolsFilePaths:allTmToolsFilePaths:`, allTmToolsFilePaths);
    return allTmToolsFilePaths;
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      validateBaseDirectoryArgument
   * @returns     {void}
   * @description Ensures that a Base Directory argument was provided.
   * @public @static
   */
  //───────────────────────────────────────────────────────────────────────────┘
  private static validateBaseDirectoryArgument():void {

    // Debug incoming arguments
    SfdxFalconDebug.obj(`${dbgNs}validateBaseDirectoryArgument:arguments:`, arguments);

    // Validate "baseDirectory".
    if (typeof arguments[0] !== 'string' || arguments[0] === '') {
      throw new SfdxFalconError( `Expected baseDirectory to be a non-empty string but got type '${typeof arguments[0]}' instead.`
                               , `TypeError`
                               , `${dbgNs}validateBaseDirectoryArgument`);
    }
  }
}
