const fs = require('fs');

const MAX_SIZE = 1024 * 1024 * 1;

var glob = require("glob");

let pathGlob = process.env.PathGlob;
if (process.argv.length > 1) {
    pathGlob = process.argv[2];
}

const titleRegex = /.*?📝(.*?)$/gim;
const linkRegex = /(\(\[ab#\d+\]\(.*?)/gim;

if (!pathGlob) {
    return;
}

let count = 0;
glob(pathGlob, null, function (err, files) {
    if (err) {
        return console.log(err);
    }

    for (const file of files) {

        let newContent = null;

        fs.readFile(file, 'utf8', function (err, data) {

            let hasChange = false;
            let newContent = data.replace(titleRegex, (match, title, index) => {
                if (!linkRegex.test(title)) {
                    hasChange = true;
                    // Process link
                    console.log(`Found a line ${index} and ${title}`);
                    return "Foo: " + count++;
                }

                return match;
            });

            if (hasChange) {
                writeFile(file, newContent);
            }
        });

    }
});


function writeFile(file, newContent) {
    fs.writeFile(file + "2", newContent, (err) => {
        if (err) {
            throw err;
        }
        console.log('complete');
    });
}

