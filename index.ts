#!/usr/bin/env node

import { exit } from "process";
const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");
const ora = require("ora");
const figlet = require("figlet");

const projectName = process.argv[2];

if (!projectName || projectName === ".") {
    console.log("\x1b[31m", "You have to specify project's name!");
    exit(69);
}

const cliPath = process.cwd();
const projectPath = path.join(process.cwd(), projectName);
const srcPath = path.join(projectPath, "/src/");
const featuresPath = path.join(srcPath, "/features");
const featuresCounterPath = path.join(srcPath, "/features/counter/");
const appPath = path.join(srcPath, "/app/");
const pagesPath = path.join(projectPath, "/pages/");
const reduxPagesPath = path.join(projectPath, "/pages/redux");
const filesPath = path.join(__dirname, "/files/");
const componentsPath = path.join(projectPath, "/components/");
const componentsCounterPath = path.join(projectPath, "/components/Counter/");

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
            console.log("\x1b[31m", err);
        }
    }
};

const makeDirs = async (dirs: string[]) => {
    dirs.forEach(async (dir) => {
        try {
            await fs.promises.mkdir(dir, { recursive: true });
            console.log("created dir " + dir);
        } catch (err) {
            console.log(
                "\x1b[33m",
                `Dir ${dir} was already existing, skipping`
            );
        }
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
            console.log("\x1b[32m", `Copied ${source} \n`);
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
        console.log(
            "\x1b[36m",
            "Saving new package.json to " + packageFile + "\n"
        );
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

const summary = `
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n
Your app was successfully created in ${projectPath}\n
You can start using your app by typing these commands:

cd ${projectName}\n
npm run dev\n
--or--\n
yarn dev

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n`;

const spinner = ora("Creating new next app\n").start();
sh(`npx create-next-app ${projectName}`).then(async () => {
    spinner.text = `Creating app structure`;
    await makeDirs([
        srcPath,
        componentsPath,
        featuresPath,
        appPath,
        componentsCounterPath,
        featuresCounterPath,
    ]).then(() => {
        spinner.text = "Copying files...";
        copyFiles()
            .then(() => {
                spinner.color = "green";
                spinner.text = "Running npm install...";
                process.chdir(projectPath);
                sh(`npm install`)
                    .then(() => {
                        spinner.stop();
                        console.clear();
                        figlet("Hurray!!", function (err: Error, data: any) {
                            if (err) {
                                console.log("Something went wrong...");
                                console.dir(err);
                                return;
                            }
                            console.log(data);
                            console.log(summary);
                        });
                    })
                    .catch((err) => {
                        console.log(
                            "\x1b[31m",
                            `An error has ocurred when using npm install:\n ${err}`
                        );
                        exit(1);
                    });
            })
            .catch((err) => {
                console.log(
                    "\x1b[31m",
                    `An error has ocurred when copying files:\n ${err}`
                );
                exit(1);
            });
    });
});
