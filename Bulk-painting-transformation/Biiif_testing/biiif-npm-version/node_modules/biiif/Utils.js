"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.error = exports.warn = exports.log = exports.isURL = exports.hasManifestsYml = exports.fileExists = exports.readYml = exports.writeJson = exports.readJson = exports.getUrlParts = exports.normaliseFilePath = exports.mergePaths = exports.generateImageTiles = exports.getFileDimensions = exports.getLabel = exports.getThumbnail = exports.isDirectory = exports.isJsonFile = exports.getVirtualFilePath = exports.formatMetadata = exports.cloneJson = exports.timeout = exports.getFormatByType = exports.getTypeByFormat = exports.getFormatByExtensionAndType = exports.getFormatByExtension = exports.getTypeByExtension = exports.normaliseType = exports.compare = void 0;
const dist_commonjs_1 = require("@iiif/vocabulary/dist-commonjs/");
const path_1 = require("path");
const path_2 = require("path");
const glob_promise_1 = require("glob-promise");
const chalk_1 = __importDefault(require("chalk"));
const config_json_1 = __importDefault(require("./config.json"));
const ffprobe_1 = __importDefault(require("ffprobe"));
const ffprobe_static_1 = __importDefault(require("ffprobe-static"));
const fs_1 = __importDefault(require("fs"));
const is_url_1 = __importDefault(require("is-url"));
const jsonfile_1 = __importDefault(require("jsonfile"));
const label_json_1 = __importDefault(require("./boilerplate/label.json"));
const thumbnail_json_1 = __importDefault(require("./boilerplate/thumbnail.json"));
const url_join_1 = __importDefault(require("url-join"));
const js_yaml_1 = __importDefault(require("js-yaml"));
const sharp = require("sharp");
const _config = config_json_1.default;
const compare = (a, b) => {
    const collator = new Intl.Collator(undefined, {
        numeric: true,
        sensitivity: "base",
    });
    return collator.compare(a, b);
};
exports.compare = compare;
const normaliseType = (type) => {
    type = type.toLowerCase();
    if (type.indexOf(":") !== -1) {
        const split = type.split(":");
        return split[1];
    }
    return type;
};
exports.normaliseType = normaliseType;
const getTypeByExtension = (motivation, extension) => {
    motivation = exports.normaliseType(motivation);
    const m = _config.annotation.motivations[motivation];
    if (m) {
        if (m[extension] && m[extension].length) {
            return m[extension][0].type;
        }
    }
    return null;
};
exports.getTypeByExtension = getTypeByExtension;
const getFormatByExtension = (motivation, extension) => {
    motivation = exports.normaliseType(motivation);
    const m = _config.annotation.motivations[motivation];
    if (m) {
        if (m[extension] && m[extension].length) {
            return m[extension][0].format;
        }
    }
    return null;
};
exports.getFormatByExtension = getFormatByExtension;
const getFormatByExtensionAndType = (motivation, extension, type) => {
    motivation = exports.normaliseType(motivation);
    const m = _config.annotation.motivations[motivation];
    if (m) {
        if (m[extension] && m[extension].length) {
            const typeformats = m[extension];
            for (let i = 0; i < typeformats.length; i++) {
                const typeformat = typeformats[i];
                if (typeformat.type === type) {
                    return typeformat.format;
                }
            }
        }
    }
    return null;
};
exports.getFormatByExtensionAndType = getFormatByExtensionAndType;
const getTypeByFormat = (motivation, format) => {
    motivation = exports.normaliseType(motivation);
    const m = _config.annotation.motivations[motivation];
    if (m) {
        for (const extension in m) {
            const typeformats = m[extension];
            for (let i = 0; i < typeformats.length; i++) {
                const typeformat = typeformats[i];
                if (typeformat.format === format) {
                    return typeformat.type;
                }
            }
        }
    }
    return null;
};
exports.getTypeByFormat = getTypeByFormat;
const getFormatByType = (motivation, type) => {
    motivation = exports.normaliseType(motivation);
    const m = _config.annotation.motivations[motivation];
    // only able to categorically say there's a matching format
    // if there's a single extension with a single type
    if (m) {
        if (Object.keys(m).length === 1) {
            const typeformats = m[Object.keys(m)[0]];
            if (typeformats.length === 1) {
                return typeformats[0].format;
            }
        }
    }
    return null;
};
exports.getFormatByType = getFormatByType;
const timeout = (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};
exports.timeout = timeout;
const cloneJson = (json) => {
    return JSON.parse(JSON.stringify(json));
};
exports.cloneJson = cloneJson;
const formatMetadata = (metadata) => {
    const formattedMetadata = [];
    for (let key in metadata) {
        if (metadata.hasOwnProperty(key)) {
            const value = metadata[key];
            const item = {};
            item.label = exports.getLabel(key);
            item.value = exports.getLabel(value);
            formattedMetadata.push(item);
        }
    }
    return formattedMetadata;
};
exports.formatMetadata = formatMetadata;
// If filePath is:
// C://Users/edsilv/github/edsilv/biiif-workshop/collection/_abyssinian/thumb.jpeg
// and 'collection' has been replaced by the top-level virtual name 'virtualname'
// it should return:
// C://Users/edsilv/github/edsilv/biiif-workshop/virtualname/_abyssinian/thumb.jpeg
// virtual names are needed when using dat or ipfs ids as the root directory.
const getVirtualFilePath = (filePath, directory) => {
    // walk up directory parents building the realPath and virtualPath array as we go.
    // at the top level directory, use the real name for realPath and the virtual name for virtualPath.
    // reverse the arrays and join with a '/'.
    // replace the realPath section of filePath with virtualPath.
    let realPath = [path_2.basename(filePath)];
    let virtualPath = [path_2.basename(filePath)];
    while (directory) {
        const realName = path_2.basename(directory.directoryFilePath);
        const virtualName = directory.virtualName || realName;
        realPath.push(realName);
        virtualPath.push(virtualName);
        directory = directory.parentDirectory;
    }
    realPath = realPath.reverse();
    virtualPath = virtualPath.reverse();
    const realPathString = realPath.join("/");
    const virtualPathString = virtualPath.join("/");
    filePath = exports.normaliseFilePath(filePath);
    filePath = filePath.replace(realPathString, virtualPathString);
    return filePath;
};
exports.getVirtualFilePath = getVirtualFilePath;
const isJsonFile = (path) => {
    return path_1.extname(path) === ".json";
};
exports.isJsonFile = isJsonFile;
const isDirectory = (path) => {
    return fs_1.default.lstatSync(path).isDirectory();
};
exports.isDirectory = isDirectory;
const getThumbnail = async (json, directory, filePath) => {
    let fp = filePath || directory.directoryFilePath;
    fp = exports.normaliseFilePath(fp);
    const thumbnailPattern = fp + "/thumb.*";
    const thumbnails = await glob_promise_1.promise(thumbnailPattern);
    if (thumbnails.length) {
        // there's alrady a thumbnail in the directory, add it to the canvas
        exports.log(`found thumbnail for: ${fp}`);
        let thumbnail = thumbnails[0];
        const thumbnailJson = exports.cloneJson(thumbnail_json_1.default);
        const virtualFilePath = exports.getVirtualFilePath(thumbnail, directory);
        thumbnailJson[0].id = exports.mergePaths(directory.url, virtualFilePath);
        json.thumbnail = thumbnailJson;
    }
    else {
        // there isn't a thumbnail in the directory, so we'll need to generate it.
        // generate thumbnail
        if (json.items && json.items.length && json.items[0].items) {
            // find an annotation with a painting motivation of type image.
            const items = json.items[0].items;
            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                const body = item.body;
                if (body &&
                    item.motivation === exports.normaliseType(dist_commonjs_1.AnnotationMotivation.PAINTING)) {
                    // is it an image? (without an info.json)
                    if (body.type.toLowerCase() === dist_commonjs_1.ExternalResourceType.IMAGE &&
                        !exports.isJsonFile(body.id)) {
                        let imageName = body.id.substr(body.id.lastIndexOf("/"));
                        if (imageName.includes("#")) {
                            imageName = imageName.substr(0, imageName.lastIndexOf("#"));
                        }
                        const imagePath = exports.normaliseFilePath(path_2.join(fp, imageName));
                        let pathToThumb = exports.normaliseFilePath(path_2.join(path_1.dirname(imagePath), "thumb.jpg"));
                        // todo: this currently assumes that the image to generate a thumb from is within the directory,
                        // but it may be in an assets folder and painted by a custom annotation.
                        // see canvas-with-dimensions-manifest.js
                        if (await exports.fileExists(imagePath)) {
                            //const image: any = await Jimp.read(imagePath);
                            //const thumb: any = image.clone();
                            // write image buffer to disk for testing
                            // image.getBuffer(Jimp.AUTO, (err, buffer) => {
                            //     const arrBuffer = [...buffer];
                            //     const pathToBuffer: string = imagePath.substr(0, imagePath.lastIndexOf('/')) + '/buffer.txt';
                            //     fs.writeFile(pathToBuffer, arrBuffer);
                            // });
                            //thumb.cover(_config.thumbnails.width, _config.thumbnails.height);
                            //thumb.resize(_config.thumbnails.width, Jimp.AUTO);
                            //pathToThumb += image.getExtension();
                            // a thumbnail may already exist at this path (when generating from a flat collection of images)
                            const thumbExists = await exports.fileExists(pathToThumb);
                            if (!thumbExists) {
                                try {
                                    await sharp(imagePath, {
                                        limitInputPixels: true,
                                    })
                                        .resize({
                                        width: _config.thumbnails.width,
                                        height: _config.thumbnails.height,
                                        fit: sharp.fit.cover,
                                    })
                                        .toFormat("jpeg")
                                        .toFile(pathToThumb);
                                    // thumb.write(pathToThumb, () => {
                                    exports.log(`generated thumbnail for: ${fp}`);
                                }
                                catch (_a) {
                                    exports.warn(`unable to generate thumbnail for: ${fp}`);
                                }
                            }
                            else {
                                exports.log(`found thumbnail for: ${fp}`);
                            }
                        }
                        else {
                            // placeholder img path
                            pathToThumb += "jpg";
                        }
                        const thumbnailJson = exports.cloneJson(thumbnail_json_1.default);
                        // const virtualPath: string = getVirtualFilePath(
                        //   pathToThumb,
                        //   directory
                        // );
                        // const mergedPath: string = mergePaths(directory.url, virtualPath);
                        // thumbnailJson[0].id = mergedPath;
                        let path = getThumbnailUrl(directory);
                        thumbnailJson[0].id = path;
                        json.thumbnail = thumbnailJson;
                    }
                }
            }
        }
    }
};
exports.getThumbnail = getThumbnail;
const getThumbnailUrl = (directory) => {
    let path = "";
    while (directory) {
        // if the directory is a manifest and doesn't have a parent collection
        if (directory.isManifest &&
            (!directory.parentDirectory || !directory.parentDirectory.isCollection)) {
            break;
        }
        if (directory.isCollection && !directory.parentDirectory) {
            break;
        }
        const name = path_2.basename(directory.directoryFilePath);
        path = url_join_1.default(path, name);
        directory = directory.parentDirectory;
        // todo: keep going unless you reach a manifest directory with no collection directory parent
        // if (directory.parentDirectory && directory.parentDirectory.isManifest) {
        //   break;
        // } else {
        // }
    }
    return url_join_1.default(directory.url.href, path, "thumb.jpg");
};
const getLabel = (value) => {
    const labelJson = exports.cloneJson(label_json_1.default);
    labelJson["@none"].push(value);
    return labelJson;
};
exports.getLabel = getLabel;
const getFileDimensions = async (type, file, canvasJson, annotationJson) => {
    exports.log(`getting file dimensions for: ${file}`);
    if (!exports.isJsonFile(file)) {
        switch (type.toLowerCase()) {
            // if it's an image, get the width and height and add to the annotation body and canvas
            case dist_commonjs_1.ExternalResourceType.IMAGE:
                try {
                    const image = await sharp(file, {
                        limitInputPixels: true,
                    }).metadata();
                    const width = image.width;
                    const height = image.height;
                    canvasJson.width = Math.max(canvasJson.width || 0, width);
                    canvasJson.height = Math.max(canvasJson.height || 0, height);
                    annotationJson.body.width = width;
                    annotationJson.body.height = height;
                }
                catch (e) {
                    exports.warn(`getting file dimensions failed for: ${file}`);
                }
                break;
            // if it's a sound, get the duration and add to the canvas
            case dist_commonjs_1.ExternalResourceType.SOUND:
            case dist_commonjs_1.ExternalResourceType.VIDEO:
                try {
                    const info = await ffprobe_1.default(file, { path: ffprobe_static_1.default.path });
                    if (info && info.streams && info.streams.length) {
                        const duration = Number(info.streams[0].duration);
                        canvasJson.duration = duration;
                    }
                }
                catch (error) {
                    exports.warn(`ffprobe couldn't load ${file}`);
                }
                break;
        }
    }
};
exports.getFileDimensions = getFileDimensions;
const generateImageTiles = async (image, url, directoryName, directory, annotationJson) => {
    try {
        exports.log(`generating image tiles for: ${image}`);
        const id = url_join_1.default(url, directoryName, "+tiles");
        annotationJson.body.service = [
            {
                "@id": id,
                "@type": "ImageService2",
                profile: "http://iiif.io/api/image/2/level2.json",
            },
        ];
        await sharp(image, {
            limitInputPixels: true,
        })
            .tile({
            layout: "iiif",
            id: url_join_1.default(url, directoryName),
        })
            .toFile(path_2.join(directory, "+tiles"));
    }
    catch (_a) {
        exports.warn(`generating image tiles failed for: ${image}`);
    }
};
exports.generateImageTiles = generateImageTiles;
/*
      merge these two example paths:
      url:        http://test.com/collection/manifest
      filePath:   c:/user/documents/collection/manifest/_canvas/thumb.png

      into:       http://test.com/collection/manifest/_canvas/thumb.png
  */
const mergePaths = (url, filePath) => {
    // split the url (minus origin) and filePath into arrays
    //                            ['collection', 'manifest']
    // ['c:', 'user', 'documents', 'collection', 'manifest', '_canvas', 'thumb.jpg']
    // walk backwards through the filePath array adding to the newPath array until the last item of the url array is found.
    // then while the next url item matches the next filePath item, add it to newPath.
    // the final path is the url origin plus a reversed newPath joined with a '/'
    let origin = url.origin;
    if (url.protocol === "dat:") {
        origin = "dat://";
    }
    const urlParts = exports.getUrlParts(url);
    filePath = exports.normaliseFilePath(filePath);
    const fileParts = filePath.split("/");
    let newPath = [];
    // if there's a single root folder and none of the file path matches
    if (urlParts.length === 1 && !fileParts.includes(urlParts[0])) {
        newPath.push(fileParts[fileParts.length - 1]);
        newPath.push(urlParts[0]);
    }
    else {
        for (let f = fileParts.length - 1; f >= 0; f--) {
            const filePart = fileParts[f];
            newPath.push(filePart);
            if (filePart === urlParts[urlParts.length - 1]) {
                if (urlParts.length > 1) {
                    for (let u = urlParts.length - 2; u >= 0; u--) {
                        f--;
                        if (fileParts[f] === urlParts[u]) {
                            newPath.push(fileParts[f]);
                        }
                        else {
                            newPath.push(urlParts[u]);
                        }
                    }
                }
                break;
            }
        }
    }
    let id = url_join_1.default(origin, ...newPath.reverse());
    return id;
};
exports.mergePaths = mergePaths;
const normaliseFilePath = (filePath) => {
    return filePath.replace(/\\/g, "/").replace(/\/\//g, "/");
};
exports.normaliseFilePath = normaliseFilePath;
const getUrlParts = (url) => {
    let origin = url.origin;
    let urlParts;
    let href = url.href;
    if (href.endsWith("/")) {
        href = href.slice(0, -1);
    }
    if (url.protocol === "dat:") {
        origin = "dat://";
        urlParts = href.replace(origin, "").split("/");
    }
    else {
        urlParts = href.replace(origin + "/", "").split("/");
    }
    return urlParts;
};
exports.getUrlParts = getUrlParts;
const readJson = (path) => {
    return new Promise((resolve, reject) => {
        jsonfile_1.default.readFile(path, (err, json) => {
            if (err)
                reject(err);
            else
                resolve(json);
        });
    });
};
exports.readJson = readJson;
const writeJson = (path, json) => {
    return new Promise((resolve, reject) => {
        fs_1.default.writeFile(path, json, (err) => {
            if (err)
                reject(err);
            else
                resolve();
        });
    });
};
exports.writeJson = writeJson;
const readYml = (path) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = js_yaml_1.default.load(fs_1.default.readFileSync(path, "utf8"));
            resolve(doc);
        }
        catch (e) {
            reject(e);
        }
    });
};
exports.readYml = readYml;
const fileExists = (path) => {
    return new Promise((resolve, reject) => {
        const exists = fs_1.default.existsSync(path);
        resolve(exists);
    });
};
exports.fileExists = fileExists;
const hasManifestsYml = (path) => {
    return new Promise((resolve, reject) => {
        const manifestsPath = path_2.join(path, "manifests.yml");
        exports.fileExists(manifestsPath).then((exists) => {
            resolve(exists);
        });
    });
};
exports.hasManifestsYml = hasManifestsYml;
const isURL = (path) => {
    return is_url_1.default(path);
};
exports.isURL = isURL;
const log = (message) => {
    console.log(chalk_1.default.green(message));
};
exports.log = log;
const warn = (message) => {
    console.warn(chalk_1.default.yellow(message));
};
exports.warn = warn;
const error = (message) => {
    console.warn(chalk_1.default.red(message));
};
exports.error = error;
//# sourceMappingURL=Utils.js.map