"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.build = void 0;
const Directory_1 = require("./Directory");
const Utils_1 = require("./Utils");
const build = async (dir, url, virtualName) => {
    Utils_1.log(`started biiifing ${dir}`);
    // validate inputs
    const exists = await Utils_1.fileExists(dir);
    if (!exists) {
        throw new Error("Directory does not exist");
    }
    if (!url) {
        // if a url hasn't been passed, check if running on Netlify or Vercel and use the appropriate url
        if (process.env.NETLIFY) {
            url =
                process.env.PULL_REQUEST === "true"
                    ? process.env.DEPLOY_PRIME_URL
                    : process.env.URL;
        }
        else if (process.env.VERCEL) {
            url = `https://${process.env.VERCEL_URL}`;
        }
        else {
            throw new Error("You must pass a url parameter");
        }
    }
    const directory = new Directory_1.Directory(dir, url, virtualName);
    await directory.read();
    Utils_1.log(`finished biiifing ${dir}`);
};
exports.build = build;
//# sourceMappingURL=index.js.map