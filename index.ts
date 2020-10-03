#!/usr/bin/env node
const execSync = require("child_process").execSync;
const path = require("path");
const fs = require("fs");
const cliPath = process.cwd();
const projectName = process.argv[2];
const projectPath = path.join(process.cwd(), projectName);
const srcPath = path.join(projectPath, "/src/");
const featuresPath = path.join(srcPath, "/features");
const featuresCounterPath = path.join(srcPath, "/features/counter/");
const appPath = path.join(srcPath, "/app/");
const pagesPath = path.join(projectPath, "/pages/");
const reduxPagesPath = path.join(projectPath, "/pages/redux");
const filesPath = path.join(cliPath, "/files/");
const componentsPath = path.join(projectPath, "/components/");
const componentsCounterPath = path.join(projectPath, "/components/Counter/");

const sh = (command: string, printOutput = false) => {
    try {
        execSync(command);
    } catch (err) {
        if (printOutput) {
            console.log(err);
        }
    }
};

const makeDirs = (dirs: string[]) => {
    dirs.forEach((dir) => {
        console.log(dir);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
    });
};

const cp = (file: string, dest: string) => {
    fs.copyFile(file, dest, (err: Error) => {
        if (err) throw err;
        console.log(`${file} was copied to ${dest}`);
    });
};

const getFilePath = (filename: string) => path.join(filesPath, filename);

const editPackageName = () => {
    const packageFile = path.join(projectPath, "package.json");
    const file = require(packageFile);
    file.name = projectName;

    fs.writeFile(packageFile, JSON.stringify(file), function writeJSON(
        err: Error
    ) {
        if (err) return console.log(err);
        console.log(JSON.stringify(file));
        console.log("writing to " + packageFile);
    });
};

const copyFiles = () => {
    cp(getFilePath("store.js"), path.join(appPath, "store.js"));
    cp(getFilePath("Counter.js"), path.join(componentsCounterPath, "index.js"));
    cp(
        getFilePath("Counter.module.css"),
        path.join(componentsCounterPath, "Counter.module.css")
    );
    cp(
        getFilePath("counterSlice.js"),
        path.join(featuresCounterPath, "counterSlice.js")
    );
    // fs.unlinkSync(path.join(projectPath, "/pages/_app.js"));
    // fs.unlinkSync(path.join(projectPath, "package.json"));
    cp(getFilePath("_app.js"), path.join(projectPath, "/pages/_app.js"));
    cp(getFilePath("package.json"), path.join(projectPath, "package.json"));
    console.log("Editing package.json");
    editPackageName();
    cp(getFilePath("index.js"), path.join(projectPath, "/pages/index.js"));
};

console.log("Creating new next app...");
sh(`npx create-next-app ${projectName}`);
console.log(`Created new nextjs app in ${projectPath}`);
console.log(`Creating app structure`);
makeDirs([
    srcPath,
    componentsPath,
    componentsCounterPath,
    featuresPath,
    featuresCounterPath,
    appPath,
    reduxPagesPath,
]);
console.log(`Created basic app structure`);
console.log("Copying files...");
copyFiles();
console.log("Running npm install...");
process.chdir(projectPath);
sh(`npm install`);
