var mySQL = require('../lib/mySQLWrapper.js');
var loginDetails = require('../credentials/mySQLlogin.json');

module.exports = {
  createTrader: function(name, coinfloorID, coinfloorPassword, coinfloorAPIKey){
    //create new trader row in mysql database
    //allow database to generate unique ID
    //maintenance margin defaults to 0.2, not supplied as input but can be set
    //add error handling to make sure trader does not already exist
  },

  deleteTrader: function(name){
    //delete the trader row in the database
  }

  //TODO implement setters and getters for all values, including maintenance margin
}
