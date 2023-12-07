import { fileURLToPath } from "url";
import { fork } from 'node:child_process';

log('Starting wrangler dev...');

let wranglerProcess;

const urlPromise = new Promise(async (resolve) => {
    wranglerProcess = fork(
        fileURLToPath(
            new URL("../bin/wrangler.js", await import.meta.resolve("wrangler"))
        ),
        ["dev", "--port=0"],
        { stdio: ["pipe", "pipe", "pipe", "ipc"] }
    ).on("message", (message) => {
        const parsedMessage = JSON.parse(message.toString());
        resolve(`http://${parsedMessage.ip}:${parsedMessage.port}`);
    });
});

const url = await urlPromise;

log(`Wrangler's URL is: ${url}`);

log(`Fetching from ${url}`);

const resp = await fetch(url).then(resp => resp.text());

log(`The response is: "${resp}"`);

wranglerProcess.kill("SIGTERM");

function log(str) {
    console.log(`\n - ${str}\n`);
}
