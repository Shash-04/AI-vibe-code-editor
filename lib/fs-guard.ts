import fs from "fs"

const origWriteFileSync = fs.writeFileSync
const origMkdirSync = fs.mkdirSync

fs.writeFileSync = function (path: any, ...args: any[]) {
    console.error("🚨 fs.writeFileSync called", {
        path,
        stack: new Error().stack,
    })
    return origWriteFileSync.call(fs, path, ...args)
}

fs.mkdirSync = function (path: any, ...args: any[]) {
    console.error("🚨 fs.mkdirSync called", {
        path,
        stack: new Error().stack,
    })
    return origMkdirSync.call(fs, path, ...args)
}
