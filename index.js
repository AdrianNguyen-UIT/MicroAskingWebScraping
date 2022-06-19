import fetch from "node-fetch";
import axios from 'axios';
import express from "express";
import http from "http";
import https from "https";
import { urlObjects, validUrl } from "./urls_config.js"
import * as cheerio from 'cheerio';
import chalk from "chalk";
import fs from "fs";

const MAX_DOCS_PER_SEND = 800;
const TRACER_LOG = chalk.yellow;
const INFO_LOG = chalk.greenBright;
const ERROR_LOG = chalk.red;
const URL_LOG = chalk.cyan;

const progress = 1248;
let documents = [];
const seenUrls = new Set();
let currentProgress = 0;

const updateProgress = () => {
    if (currentProgress == progress) saveDocs();
};

const crawl = async (url, obj) => {
    if (seenUrls.has(url)) return;
    seenUrls.add(url);

    currentProgress++;
    const currentPercent = currentProgress / progress * 100.0;
    console.log(INFO_LOG(`${currentPercent.toFixed(2)}%`) + TRACER_LOG(' : crawling...') + URL_LOG(`${url}`));
    updateProgress();

    const response = await fetch(url);
    if (response.status != 200) return;

    const html = await response.text();
    const $ = cheerio.load(html);
    documents = documents.concat(obj.getDocFunc($, url));
    const urls = new Set();
    $('a').each((i, el) => {
        let href = el.attribs.href;

        if (href === undefined) return;
        for (const ex of obj.excludes) {
            if (href.includes(ex)) return;
        }
        if (!href.match(validUrl)) return;
        if (!href.includes(obj.origin)) return;

        href = href.split("#")[0].replace(/\/$/g, '');
        urls.add(href);
    });

    urls.forEach(_url => crawl(_url, obj));
};

const app = express();
const server = http.createServer(app);

app.use("/", (req, res) => {
    res.send(documents).sendStatus(200);
});

app.use("/docs/get", (req, res) => {
    res.send(documents);
});

const sendPostRequest = async () => {
    const object = {
        question: "string",
        contexts: [
            {
                "content": "string",
                "domain": "string"
            }
        ]
    }

    try {
        const resp = await axios.post('https://localhost:7248/api.micro-asking.ask/test', object);
        console.log(resp.data);
    } catch (err) {
        // Handle Error Here
        console.error(err);
    }
};



const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log(TRACER_LOG('Server API listening at ') + URL_LOG(`http://localhost:${port}`));
    startCrawling();
});

const startCrawling = () => {
    urlObjects.forEach(urlObj => crawl(urlObj.url, urlObj));
    //crawl(urlObjects[1].url, urlObjects[1]);
}

const sendDoc = (subDocs) => {
    console.log(TRACER_LOG(`Posting ${subDocs.length} Docs to MircoAskingWebApi...`));
    axios
        .post('https://localhost:7248/api/save', subDocs)
        .then(response => {
            console.log(INFO_LOG("Finished!"));
            //server.close(() => { console.log(TRACER_LOG("Closing server!")); });
        })
        .catch(error => {
            console.log(ERROR_LOG(error.message));
            //server.close(() => { console.log(TRACER_LOG("Closing server!")); });
        });
}

const saveDocs = () => {
    console.log(TRACER_LOG(`Saving Documents locally`));
    fs.writeFile('CrawledData.json', JSON.stringify(documents), 'utf8', callback => { });

    while (documents.length > 0) {
        sendDoc(documents.splice(0, MAX_DOCS_PER_SEND));
    }
};

