#!/usr/bin/env node
const { exec } = require("child_process");
const path = require("path");
const fs = require("fs-extra");
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
const ora = require("ora");

function execPromise(command: string) {
    return new Promise(function (resolve, reject) {
        exec(command, (error: Error, stdout: string, stderr: string) => {
            if (error) {
                reject(error);
                return;
            }

            resolve(stdout.trim());
        });
    });
}

const sh = async (command: string, printOutput = false) => {
    try {
        await execPromise(command);
    } catch (err) {
        if (printOutput) {
            console.log(err);
        }
    }
};

const makeDirs = async (dirs: string[]) => {
    dirs.forEach(async (dir) => {
        fs.ensureDir(dir)
            .then(async () => {
                console.log(`Created directory ${dir} \n`);
                await fs.promises.mkdir(dir);
            })
            .catch((err: Error) => {
                console.log(`Directory ${dir} already exists, skipping... \n`);
            });
    });
};

async function cp(source: string, target: string) {
    const rd = fs.createReadStream(source);
    const wr = fs.createWriteStream(target);
    try {
        return await new Promise(function (resolve, reject) {
            rd.on("error", reject);
            wr.on("error", reject);
            wr.on("finish", resolve);
            rd.pipe(wr);
            console.log(`Copied ${source} \n`);
        });
    } catch (error) {
        rd.destroy();
        wr.end();
        throw error;
    }
}

const getFilePath = (filename: string) => path.join(filesPath, filename);

const editPackageName = async () => {
    const packageFile = path.join(projectPath, "package.json");
    const file = require(packageFile);
    file.name = projectName;

    fs.writeFile(packageFile, JSON.stringify(file), function writeJSON(
        err: Error
    ) {
        if (err) return console.log(err);
        console.log("writing to " + packageFile + "\n");
    });
};

const copyFiles = async () => {
    await cp(getFilePath("store.js"), path.join(appPath, "store.js"));
    await cp(
        getFilePath("Counter.js"),
        path.join(componentsCounterPath, "index.js")
    );
    await cp(
        getFilePath("Counter.module.css"),
        path.join(componentsCounterPath, "Counter.module.css")
    );
    await cp(
        getFilePath("counterSlice.js"),
        path.join(featuresCounterPath, "counterSlice.js")
    );
    await cp(getFilePath("_app.js"), path.join(projectPath, "/pages/_app.js"));
    await cp(
        getFilePath("index.js"),
        path.join(projectPath, "/pages/index.js")
    );

    await cp(
        getFilePath("package.json"),
        path.join(projectPath, "package.json")
    );
    console.log("Editing package.json \n");
    await editPackageName();
};

const spinner = ora("Creating new next app").start();
sh(`npx create-next-app ${projectName}`)
    .then(() => {
        spinner.text = `Created new nextjs app in ${projectPath}`;
        spinner.text = `Creating app structure`;
        makeDirs([
            srcPath,
            componentsPath,
            componentsCounterPath,
            featuresPath,
            featuresCounterPath,
            appPath,
        ]).then(() => {
            spinner.text = "Copying files...";
            copyFiles().then(() => {
                spinner.color = "green";
                spinner.text = "Running npm install...";
                process.chdir(projectPath);
                sh(`npm install`).then((err) => {
                    spinner.stop();
                });
            });
        });
    })
    .catch((err) => {
        console.log(`An error ocured ${err}`);
    });
