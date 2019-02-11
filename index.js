const fs = require('fs');
const azdev = require('azure-devops-node-api');
const work = require('azure-devops-node-api/WorkItemTrackingApi');
const vssCoreContracts = require("azure-devops-node-api/interfaces/common/VSSInterfaces");
const glob = require("glob");
const argv = require('minimist')(process.argv.slice(2));

// Set a max size so we don't parse files that are too large
const MAX_SIZE = 1024 * 1024 * 5;

const isDebug = !!process.env.debugMode;

// TODO: Instead of just using a glob to scan we should check 
//const payload = process.env.GITHUB_EVENT_PATH ? require(process.env.GITHUB_EVENT_PATH) : {}
let pathGlob = process.env.PathGlob || "./readme.md";
if (argv.PathGlob) {
    pathGlob = argv.PathGlob;
}

let azDevUrl = "https://dev.azure.com/";
let azDevOrg = process.env.AZURE_BOARDS_ORGANIZATION;
if (argv.azDevOrg) {
    azDevOrg = argv.azDevOrg;
}

if (azDevOrg) {
    azDevUrl += `${azDevOrg}/`
}

let azDevProject = process.env.AZURE_BOARDS_PROJECT;
if (argv.azDevProject) {
    azDevProject = argv.azDevProject;
}

let azDevType = process.env.AZURE_BOARDS_TYPE || "User Story";
if (argv.azDevType) {
    azDevType = argv.azDevType;
}

let azDevTags = process.env.AZURE_BOARDS_TAGS || "GitHub;Markdown";
if (argv.azDevProject) {
    azDevTags = argv.azDevTags;
}

let azDevToken = process.env.AZURE_BOARDS_TOKEN;
if (argv.azDevToken) {
    azDevToken = argv.azDevToken;
}

const titleRegex = /.*?📝(.*?)$/gim;
const linkRegex = /.*(\(\[ab#\d+\]\(.*?)/gim;

if (!pathGlob) {
    return;
}

try {
    main();
}
catch (e) {
    throw e;
}

async function main() {
    let authHandler = azdev.getPersonalAccessTokenHandler(azDevToken);
    let connection = new azdev.WebApi(azDevUrl, authHandler);
    let witApi = await connection.getWorkItemTrackingApi();

    console.log(`NB: Processing ${pathGlob} to send to ${azDevUrl}`);

    glob(pathGlob, null, function (err, files) {
        if (err) {
            console.log(err);
            return;
        }

        for (const file of files) {
            
            console.log(`NB: Read file ${file}`);
            fs.readFile(file, 'utf8', async function (err, data) {
                
                console.log(`NB: Got contents of ${file}`);
                if (err) {
                    console.log(err);
                    return;
                }
                
                if (data.length > MAX_SIZE) {
                    console.log("File too large, bailing out!");
                    return;
                }

                let workItemsToCreate = {};
                let hasChange = false;

                let match;
                
                while (match = titleRegex.exec(data)) {
                    let title = match[1];
                    title = title.trim();
                    if (!linkRegex.test(title)) {

                        // TODO: Make this batch
                        try {
                            
                            console.log(`NB: Creating work item from ${file} with title ${title}`);
                            let result = await createWorkItem(witApi, azDevProject, azDevType, title, azDevTags);
                            workItemsToCreate[title] = result.id;

                        }
                        catch (e) {
                            console.log(e);
                        }
                    }
                }


                let newContent = data.replace(titleRegex, (match, title, index) => {
                    title = title.trim();
                    if (!linkRegex.test(title)) {
                        console.log(`Found a line ${index} and ${title}`);
                        hasChange = true;
                        // Process link
                        let wid = workItemsToCreate[title];
                        if (wid) {
                            console.log(`Using  WID ${wid}`);
                            return `${match} ([AB#${wid}](${azDevUrl}))`;
                        }
                    }

                    return match;
                });

                if (hasChange) {
                    writeFile(file, newContent);
                }
            });

        }
    });
}


function writeFile(file, newContent) {

    console.log(`NB: Writing contents of ${file}`);
    const newPath = isDebug ? file + "2" : file;
    fs.writeFile(newPath, newContent, (err) => {
        if (err) {
            console.log(err);
            return;
        }
        console.log('complete');
    });
}


function createWorkItem(witApi, project, wiType, title, tags, assignedTo, description, values) {
    var patchDoc = buildWorkItemPatchDoc(title, assignedTo, description, tags, values);
    return witApi.createWorkItem(null, patchDoc, project, wiType);
}

function buildWorkItemPatchDoc(title, assignedTo, description, tags, values) {
    var patchDoc = [];

    // Check the convienience helpers for wit values
    if (title) {
        patchDoc.push({
            op: vssCoreContracts.Operation.Add,
            path: "/fields/System.Title",
            value: title,
            from: null,
        });
    }

    if (assignedTo) {
        patchDoc.push({
            op: vssCoreContracts.Operation.Add,
            path: "/fields/System.AssignedTo",
            value: assignedTo,
            from: null,
        });
    }

    if (description) {
        patchDoc.push({
            op: vssCoreContracts.Operation.Add,
            path: "/fields/System.Description",
            value: description,
            from: null,
        });
    }


    if (tags) {
        patchDoc.push({
            op: vssCoreContracts.Operation.Add,
            path: "/fields/System.Tags",
            value: tags,
            from: null,
        });
    }


    // Set the field reference values
    if (values) {
        Object.keys(values).forEach(fieldReference => {
            patchDoc.push({
                op: vssCoreContracts.Operation.Add,
                path: "/fields/" + fieldReference,
                value: values[fieldReference],
                from: null,
            });
        });
    }

    return patchDoc;
}