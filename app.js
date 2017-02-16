'use strict';


// 1) Try to accesss shirts4mike.com
// 2) Prarse body of website for shirt URLs
// 3) Promise that each shirt url will be retrieved and parsed into object
// 4) Add shirt object/information to array of objects
// 5) Write information to CSV file


//Dependancies
const cheerio = require('cheerio');
const request = require('request');
const moment = require('moment');
const fs = require('fs');
const http = require('http');
const csvWriter = require('csv-write-stream')
const os = require('os');



//URLs for the website shirts4mike.com
const rootURL = 'http://shirts4mike.com/'
const allShirtURL = 'http://shirts4mike.com/shirts.php';

//Create new date with proper format using "moment" npm package
const date = moment().format("YYYY-MM-DD");

//Add all shirt objects into this array--to later write to file
const infoToWrite = [];

try {
    fs.accessSync("./data");
    console.log("This file already exist.");

} catch (e) {
    console.log("Data folder doesn't exists");
    fs.mkdirSync("./data");

}

const writer = csvWriter();
const ErrorWriter = csvWriter();


writer.pipe(fs.createWriteStream('./data/' + date + '.csv'));


//Promise that access is possible to shirts4mike website. Resolve if successsful.
const getShirtURL = new Promise(function(resolve, reject) {

  //Checks to see if http://shirts4mike.com/shirts.php can be accessed
  request(allShirtURL, (error, response, body) => {
    if (!error) {
      resolve(body);
      console.log('Successfully connected to http://shirts4mike.com/shirts.php');
    } else {
      reject(error);
      console.log('Could NOT connected to http://shirts4mike.com/shirts.php');
    }
  })
});
//END of getShirtURL Promise


getShirtURL.then((body) => {
  const urlArray = [];

  const $ = cheerio.load(body);

  $('.products a').each(function(i, elem) {
    urlArray[i] = rootURL + $(this).attr('href');
  });

  urlArray.join(', ');
  return urlArray;
}).then((urlArray) => {

  const v = urlArray.map(scrapeShirtInformation)

  Promise.all(v).then(values => {
    console.log('ALL Promises have been resolved! The shirt object array is: ');
    console.log(infoToWrite);
    console.log(`There were ${infoToWrite.length} shirts scraped from shirts4mike.com`);

      for (let index = 0; index < infoToWrite.length; ++index) {
        writer.write(infoToWrite[index]);
      }
    writer.end();
   });

}).catch(error => {

  console.log('THERE WAS AN ERROR');

  const errorDate = moment().format('ddd MMM Do YYYY h:mm:ss a');
  const split = new Date().toString().split(" ");
  const timeZoneFormatted = split[split.length - 2] + " " + split[split.length - 1];

    fs.appendFile('./data/scrapper-error.log', `[${errorDate} ${timeZoneFormatted}] ${error} ${os.EOL}`, () => {
      console.log(`There was an error: ${error}`);

    });
});


// let fn = function scrapeShirtInformation(url){
//   return new Promise((resolve, reject) => {

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
            reject(console.log('FAIL!'));
            console.log(`An error was encountered: ${error.message}`);
        }
      });
    })
  }
