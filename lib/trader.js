var mySQL = require('../lib/mySQLWrapper.js');
var loginDetails = require('../credentials/mySQLlogin.json');

trader.prototype.createTrader = function(name, coinfloorID, coinfloorPassword, coinfloorAPIKey, callback){
    //mysql query to list all interest payments from loan
    var query = "INSERT * FROM interest_payment WHERE loan_id='" + this.id + "';";
    var mySQL = new mySQLWrapper(credentials);
    mySQL.query(query, callback);
}

trader.prototype.deleteTrader = function(callback){
  //delete the trader row in the database
}

//TODO implement setters and getters for all values, including maintenance margin

//TODO add function to return all loans

module.exports = trader;
