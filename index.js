#!/usr/bin/env node

const os = require("os");
const ip = os.networkInterfaces().en0[0].address;
const options = process.argv.slice(2);

if (options[0] === "-v") {
    console.log("v0.0.1");
} else {
    console.log(`your ip is: ${ip}`);
}