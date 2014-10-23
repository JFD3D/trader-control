var mySQLWrapper = require('../lib/mySQLWrapper.js');
var credentials = require('../credentials/mySQLlogin.json');

var trader = function(name, coinfloorID, coinfloorPassword, coinfloorAPIKey, callback){
    var thisTrader = this;
    this.UID = 0;
    var query = "INSERT INTO `borrower` (`user_name`, `coinfloorID`, `coinfloorPassword`, `coinfloorAPIKey`, `maintenance_req`) VALUES ('" + name + "', '" + coinfloorID + "', '" + coinfloorPassword + "', '"+ coinfloorAPIKey +"', '0.2');";
    var mySQL = new mySQLWrapper(credentials.mysql_host, credentials.user, credentials.password, credentials.database);

    //mySQL.query(query, callback);
    mySQL.query(query, function(results){
      thisTrader.UID = results.insertId;
      callback(results);
    });
}

trader.prototype.deleteTrader = function(callback){
  //drop the trader row in the database
}

//TODO implement setters and getters for all values, including maintenance margin

//TODO add function to return all loans: getAllLoans()

module.exports = trader;
