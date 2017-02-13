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
const shirtURL = 'http://shirts4mike.com/shirts.php';

//Create new date with proper format using "moment" npm package
const date = moment().format("YYYY-MM-DD");



const getShirtURL = new Promise(function(resolve, reject) {

  //Checks to see if http://shirts4mike.com/shirts.php can be accessed
  request(url, function (error, response, body) {
    if (!error) {
      resolve(body);
    } else {
      reject(error);
    }
  }
});
//END of getShirtURL Promise





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
