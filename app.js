'use strict';

//Dependancies
const cheerio = require('cheerio');
const fastcsv = require('fast-csv');
const request = require('request');
const moment = require('moment');
const fs = require('fs');
const http = require('http');


//URLs for the website shirts4mike.com
const rootURL = 'http://shirts4mike.com/'
const allShirtURL = 'http://shirts4mike.com/shirts.php';

//Create new date with proper format using "moment" npm package
const date = moment().format("YYYY-MM-DD");

try {
    fs.accessSync("./data");
    console.log("This file already exist.");

} catch (e) {
    console.log("Data folder doesn't exists");
    fs.mkdirSync("./data");

}

let csvStream = fastcsv.createWriteStream({headers: true})
let writableStream = fs.createWriteStream('./data/' + date + '.csv');


csvStream.pipe(writableStream);



const getShirtURL = new Promise(function(resolve, reject) {

  //Checks to see if http://shirts4mike.com/shirts.php can be accessed
  request(allShirtURL, function (error, response, body) {
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

let urlArray = [];

let actions;

getShirtURL.then(function(body){
  const $ = cheerio.load(body);

  $('.products a').each(function(i, elem) {
    urlArray[i] = rootURL + $(this).attr('href');
  });

  urlArray.join(', ');
  console.log(urlArray);
  return urlArray;
}).then(function(urlArray){
  actions = urlArray.map(fn);
});


//Add all shirt objects into this object array--to then write to file
let infoToWrite = [];

let fn = function scrapeShirtInformation(url){
  return new Promise((resolve, reject) => {
      request(url, function (error, response, body) {
        if (!error) {

          const $ = cheerio.load(body);

          let price = $('.price').text();
          let title = $(".shirt-details h1").text().substr(price.length + 1);
          let relativeImageUrl = $(".shirt-picture img").attr("src");
          let imageUrl = rootURL + relativeImageUrl;
          console.log('Writing data for: ' + url);

          let shirtInfo = {};
          shirtInfo.price = price;
          shirtInfo.title = title;
          shirtInfo.relativeImageUrl = relativeImageUrl;
          shirtInfo.imageUrl = imageUrl;

          //push shirt info into infoToWrite array
          infoToWrite.push(shirtInfo);
          console.log(infoToWrite);
          resolve(shirtInfo);
        } else {
            reject(console.log('FAIL!'));
            console.log(`An error was encountered: ${error.message}`);
        }
      });


    })
  }



Promise.all(actions).then(console.log('YAY'));



//Promise.all(actions).then(console.log('DONE!'));


// A Basic Promise Example / https://davidwalsh.name/promises
//
// var p = new Promise(function(resolve, reject) {
//
// 	// Do an async task async task and then...
//
// 	if(/* good condition */) {
// 		resolve('Success!');
// 	}
// 	else {
// 		reject('Failure!');
// 	}
// });
//
// p.then(function() {
// 	/* do something with the result */
// }).catch(function() {
// 	/* error :( */
// })
