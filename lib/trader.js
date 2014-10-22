var mySQLWrapper = require('../lib/mySQLWrapper.js');
var credentials = require('../credentials/mySQLlogin.json');

var trader = function(name, coinfloorID, coinfloorPassword, coinfloorAPIKey, callback){
    var query = "INSERT INTO `borrower` (`borrower_id`, `user_name`, `coinfloorID`, `coinfloorPassword`, `coinfloorAPIKey`, `maintenance_req`) VALUES ('" + name + "', '" + coinfloorID + "', '" + coinfloorPassword + "', '"+ coinfloorAPIKey +"', '0.2');";
    var mySQL = new mySQLWrapper(credentials);
    mySQL.query(query, function(result){
      callback(result));
}

trader.prototype.deleteTrader = function(callback){
  //drop the trader row in the database
}

//TODO implement setters and getters for all values, including maintenance margin

//TODO add function to return all loans, getAllLoans

module.exports = trader;
