# Territory Management Toolkit - A Plugin for the Salesforce CLI

A plugin for the Salesforce CLI that makes it easy to migrate from Territory Management (TM1) to Enterprise Territory Management (TM2) by creating a structured, multi-step environment to automate the extraction, transformation, and deployment/load of metadata and data from TM1 to TM2.

## Installation

Installing the TM-Tools Plugin is easy if you have already [installed the Salesforce CLI](https://developer.salesforce.com/tools/sfdxcli).  

**Open a terminal window (command prompt) and enter the following:**

```
$ sfdx plugins:install territory-management-toolkit
```

**Important Notes:**
1. The `sfdx plugins:install` command pulls the plugin source code directly from the [territory-management-toolkit package](https://www.npmjs.com/package/territory-management-toolkit), hosted by [NPM](www.npmjs.com)
2. The TM-Tools Plugin has not been digitially signed (yet), so you will need to acknowledge the warning to continue the installation


## Migrating from Territory Management (TM1) to Enterprise Territory Management (TM2)

Before following the steps in this section, it's recommended that you create a special directory on your local machine for this migration project.

**Navigate to the directory where you'd like to create your migration project and enter the following:**

```shell
mkdir MIGRATION_TEST
```

## Pre-Transition Steps (do these BEFORE contacting Salesforce to disable TM1 and enable TM2)

Make sure to follow steps 1-4 BEFORE you contact Salesforce to disable Territory Management (TM1) and enable Enterprise Territory Management (TM2).

### Step 1: Analyze

<!--Details TBA-->

```shell
sfdx tmtools:tm1:analyze -d MIGRATION_TEST
```

### Step 2: Extract

<!--Details TBA-->

```shell
sfdx tmtools:tm1:extract -s MIGRATION_TEST
```

### Step 3: Transform

<!--Details TBA-->

```shell
sfdx tmtools:tm1:transform -s MIGRATION_TEST
```

### Step 4: Clean

<!--Details TBA-->

```shell
sfdx tmtools:tm1:clean -s MIGRATION_TEST
```

## Post-Transition Steps (do these AFTER contacting Salesforce to disable TM1 and enable TM2)

Make sure to follow steps 5-7 AFTER you contact Salesforce to disable Territory Management (TM1) and enable Enterprise Territory Management (TM2).

### Step 5: Deploy

<!--Details TBA-->

```shell
sfdx tmtools:tm2:deploy -s MIGRATION_TEST
```

### Step 6: Load

<!--Details TBA-->

```shell
sfdx tmtools:tm2:load -s MIGRATION_TEST
```

Once this step is completed, you will need to activate your imported `Territory2` Model.

**Activate the Imported Territory2 Model**

Open Setup in the Territory Management Test org and do the following.

1. Type `terr` in the Setup menu's quick find box
2. Click on the **Territory Models** setup item
3. Click on the **Imported Territory** link to open the Territory Model Detail page
4. Click the **Activate** button
5. You'll be presented with an **Activate Territory Hierarchy** confirmation pop-up. Click the **Activate** button to start the process
6. Wait for the model to activate
    * Depending on the size of your Territory implementation, it may take a significant amount of time for your Territory Model to activate
    * Check the current status by refreshing the page in your browser
    * Once the activation is complete, the state will say **Active**
    * The org administrator should also get an email indicating that activation of this Territory Model is complete

### Step 7: Deploy Sharing Rules

<!--Details TBA-->

Please note that the `tmtools:tm2:deploysharing` command will not allow execution unless you have activated the `Territory2` Model as directed in the previous step.

```shell
sfdx tmtools:tm2:deploysharing -s MIGRATION_TEST
```

