'use strict';

// This project takes advantage of Promises in ES6.
// Promise.all() is used to wait until each shirtURL is scrapped and resolved.

// Process:
// 1) Try to accesss shirts4mike.com
// 2) Parse body of website--looking for t-shirt URLs
// 3) Promise that each shirt url will be retrieved pushed into an arry of objects
// 4) Write information from array to CSV file
// 5) Log errors to scrapper-error.log


//Dependancies
const csvWriter = require('csv-write-stream');
const request = require('request');
const cheerio = require('cheerio');
const moment = require('moment');
const fs = require('fs');
const os = require('os');



//URLs for the website shirts4mike.com
const rootURL = 'http://shirts4mike.com/'
const allShirtURL = 'http://shirts4mike.com/shirts.php';

//Create new date with proper format using "moment" package
const date = moment().format("YYYY-MM-DD");

//Add all shirt objects into this array--to later write to file
const infoToWrite = [];


//Try to access the folder 'data.' If the folder doesn'exist, create it.
try {
    fs.accessSync("./data");
    console.log("The data folder already exist.");

} catch (e) {
    console.log("Creating data folder...");
    fs.mkdirSync("./data");

}


const writer = csvWriter();
const ErrorWriter = csvWriter();

writer.pipe(fs.createWriteStream('./data/' + date + '.csv'));


//Promise that access is possible to shirts4mike website. Resolve if successsful.
const getShirtURL = new Promise(function(resolve, reject) {
    //Checks to see if http://shirts4mike.com/shirts.php can be accessed
    request(allShirtURL, (error, response, body) => {
        if (!error && response.statusCode == 200) {
            console.log(`Status Code: ${response.statusCode} - OK`);
            console.log(`Successfully connected to http://shirts4mike.com/shirts.php${os.EOL}`);
            resolve(body);
        } else {
            //console.log(`There’s been a (${response.statusCode}) error. Cannot connect to the to http://shirts4mike.com.`);
            reject(error);
        }
    })
});
//END of getShirtURL Promise


// Takes the body and targets each shirt URL--adding each scrapped URL to an array
const scrapeBody = function(body) {
    const urlArray = [];

    const $ = cheerio.load(body);

    $('.products a').each(function(i, elem) {
        urlArray[i] = rootURL + $(this).attr('href');
    });
    urlArray.join(', ');
    return urlArray;
}



const getAndWriteShirtInfo = (urlArray) => {

    const v = urlArray.map(scrapeShirtInformation)

    Promise.all(v).then(values => {
        console.log(`${os.EOL}ALL Promises have been resolved! The shirt object array is: ${os.EOL}`);
        console.log(infoToWrite);
        console.log(`${os.EOL}There were ${infoToWrite.length} shirts scraped from shirts4mike.com`);

        for (let index = 0; index < infoToWrite.length; ++index) {
            writer.write(infoToWrite[index]);
        }
        writer.end();
    });
}



const scrapeShirtInformation = (url) => {
    return new Promise((resolve, reject) => {
        request(url, (error, response, body) => {
            if (!error) {

                const $ = cheerio.load(body);

                let price = $('.price').text();
                let title = $(".shirt-details h1").text().substr(price.length + 1);
                let relativeImageUrl = $(".shirt-picture img").attr("src");
                let imageUrl = rootURL + relativeImageUrl;
                console.log('Retrieve data for: ' + url);

                let shirtInfo = {};
                shirtInfo.price = price;
                shirtInfo.title = title;
                shirtInfo.relativeImageUrl = relativeImageUrl;
                shirtInfo.imageUrl = imageUrl;

                //push shirt info into infoToWrite array
                infoToWrite.push(shirtInfo);

                resolve();
            } else {
                reject(error);
            }
        });
    })
}


const catchError = (error) => {

    const errorDate = moment().format('ddd MMM Do YYYY h:mm:ss a');
    const split = new Date().toString().split(" ");
    const timeZoneFormatted = split[split.length - 2] + " " + split[split.length - 1];

    //Append error to scrapper-error.log file. If the file doesn't exist it'll be created.
    fs.appendFile('./data/scrapper-error.log', `[${errorDate} ${timeZoneFormatted}] ${error} ${os.EOL}`, () => {
        console.error(`There was an error: ${error}`);

    });
}


getShirtURL
    .then(scrapeBody)
    .then(getAndWriteShirtInfo)
    .catch(catchError);
