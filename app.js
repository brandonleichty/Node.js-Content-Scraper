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
    const csvStream = fastcsv.createWriteStream({headers: true})
    const writableStream = fs.createWriteStream('./data/' + date + '.csv');
}







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

getShirtURL.then(function(body){
  const $ = cheerio.load(body);
  const urlArray = [];

  $('.products a').each(function(i, elem) {
    urlArray[i] = rootURL + $(this).attr('href');
  });

  urlArray.join(', ');
  console.log(urlArray);
  return urlArray;
});



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
