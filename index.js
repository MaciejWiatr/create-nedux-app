#!/usr/bin/env node
const execSync = require('child_process').execSync;
const path = require("path")
const project_name = process.argv[2]
const project_path = path.join(process.cwd(),project_name)

const sh = (command, printOutput=false) => {
    try{
        execSync(command)
    }catch(err){
        if(printOutput){
            console.log(err)
        }
    }
}

console.log("Creating new next app...")
sh(`npx create-next-app ${project_name}`)
console.log(`Created new nextjs app in ${project_path}`)
