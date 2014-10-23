var mySQLWrapper = require('../lib/mySQLWrapper.js');
var credentials = require('../credentials/mySQLlogin.json');

module.exports = {
  getAllTraders: function(callback){
    var query = "SELECT borrower_id, user_name FROM borrower"
    var mySQL = new mySQLWrapper(credentials.mysql_host, credentials.user, credentials.password, credentials.database);
    mySQL.query(query, callback);
  },

  createTraderInDB: function(name, coinfloorID, coinfloorPassword, coinfloorAPIKey, callback){
      var query = "INSERT INTO `borrower` (`user_name`, `coinfloorID`, `coinfloorPassword`, `coinfloorAPIKey`, `maintenance_req`) VALUES ('" + name + "', '" + coinfloorID + "', '" + coinfloorPassword + "', '"+ coinfloorAPIKey +"', '0.2');";
      var mySQL = new mySQLWrapper(credentials.mysql_host, credentials.user, credentials.password, credentials.database);
      mySQL.query(query, function(results){
        console.log()
        callback(results.insertId);
      });
  },

  deleteTraderFromDB: function(traderID, callback){
    query = "DELETE FROM borrower WHERE borrower_id='" + traderID + "';";
    var mySQL = new mySQLWrapper(credentials.mysql_host, credentials.user, credentials.password, credentials.database);
    mySQL.query(query, callback);
  },

  getLoansForExchange: function(traderID, exchange, callback){
    query = "SELECT * FROM loan WHERE counterparty_id='" + traderID + "' AND exchange='"+ exchange +"';";
    var mySQL = new mySQLWrapper(credentials.mysql_host, credentials.user, credentials.password, credentials.database);
    mySQL.query(query, callback);
  },

  getAllLoans: function(traderID, callback){
    query = "SELECT * FROM loan WHERE counterparty_id='" + traderID + "';";
    var mySQL = new mySQLWrapper(credentials.mysql_host, credentials.user, credentials.password, credentials.database);
    mySQL.query(query, callback);
  },

  getMaintenanceReq: function(traderID, callback){
    query = "SELECT maintenance_req FROM borrower WHERE borrower_id='" + traderID + "';";
    var mySQL = new mySQLWrapper(credentials.mysql_host, credentials.user, credentials.password, credentials.database);
    mySQL.query(query, callback);
  },

  getCoinfloorCredentials: function(traderID, callback){
    query = "SELECT coinfloorID, coinfloorAPIKey, coinfloorPassword FROM borrower WHERE borrower_id='" + traderID + "';";
    var mySQL = new mySQLWrapper(credentials.mysql_host, credentials.user, credentials.password, credentials.database);
    mySQL.query(query, function(results){
      callback(results[0]);
    });
  },

  //TODO implement setters and getters for all values, including maintenance margin

}
