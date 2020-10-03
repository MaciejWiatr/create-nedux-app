#!/usr/bin/env node
var execSync = require("child_process").execSync;
var path = require("path");
var fs = require("fs");
var cliPath = process.cwd();
var projectName = process.argv[2];
var projectPath = path.join(process.cwd(), projectName);
var srcPath = path.join(projectPath, "/src/");
var featuresPath = path.join(srcPath, "/features");
var featuresCounterPath = path.join(srcPath, "/features/counter/");
var appPath = path.join(srcPath, "/app/");
var pagesPath = path.join(projectPath, "/pages/");
var reduxPagesPath = path.join(projectPath, "/pages/redux");
var filesPath = path.join(cliPath, "/files/");
var componentsPath = path.join(projectPath, "/components/");
var componentsCounterPath = path.join(projectPath, "/components/Counter/");
var sh = function (command, printOutput) {
    if (printOutput === void 0) { printOutput = false; }
    try {
        execSync(command);
    }
    catch (err) {
        if (printOutput) {
            console.log(err);
        }
    }
};
var makeDirs = function (dirs) {
    dirs.forEach(function (dir) {
        console.log(dir);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
    });
};
var cp = function (file, dest) {
    fs.copyFile(file, dest, function (err) {
        if (err)
            throw err;
        console.log(file + " was copied to " + dest);
    });
};
var getFilePath = function (filename) { return path.join(filesPath, filename); };
var editPackageName = function () {
    var packageFile = path.join(projectPath, "package.json");
    var file = require(packageFile);
    file.name = projectName;
    fs.writeFile(packageFile, JSON.stringify(file), function writeJSON(err) {
        if (err)
            return console.log(err);
        console.log(JSON.stringify(file));
        console.log("writing to " + packageFile);
    });
};
var copyFiles = function () {
    cp(getFilePath("store.js"), path.join(appPath, "store.js"));
    cp(getFilePath("Counter.js"), path.join(componentsCounterPath, "index.js"));
    cp(getFilePath("Counter.module.css"), path.join(componentsCounterPath, "Counter.module.css"));
    cp(getFilePath("counterSlice.js"), path.join(featuresCounterPath, "counterSlice.js"));
    // fs.unlinkSync(path.join(projectPath, "/pages/_app.js"));
    // fs.unlinkSync(path.join(projectPath, "package.json"));
    cp(getFilePath("_app.js"), path.join(projectPath, "/pages/_app.js"));
    cp(getFilePath("package.json"), path.join(projectPath, "package.json"));
    console.log("Editing package.json");
    editPackageName();
    cp(getFilePath("index.js"), path.join(projectPath, "/pages/index.js"));
};
console.log("Creating new next app...");
sh("npx create-next-app " + projectName);
console.log("Created new nextjs app in " + projectPath);
console.log("Creating app structure");
makeDirs([
    srcPath,
    componentsPath,
    componentsCounterPath,
    featuresPath,
    featuresCounterPath,
    appPath,
    reduxPagesPath,
]);
console.log("Created basic app structure");
console.log("Copying files...");
copyFiles();
console.log("Running npm install...");
process.chdir(projectPath);
sh("npm install");
