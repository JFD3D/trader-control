module.exports = {
  getAllTraders: function(mysqlConn, callback){
    var query = "SELECT borrower_id, user_name FROM borrower"
    mysqlConn.query(query, callback);
  },

  createTraderInDB: function(name, coinfloorID, coinfloorPassword, coinfloorAPIKey, mysqlConn, callback){
    var query = "INSERT INTO `borrower` (`user_name`, `coinfloorID`, `coinfloorPassword`, `coinfloorAPIKey`, `maintenance_req`) VALUES ('" + name + "', '" + coinfloorID + "', '" + coinfloorPassword + "', '"+ coinfloorAPIKey +"', '0.2');";
    mysqlConn.query(query, function(results){
      callback(results.insertId);
    });
  },

  deleteTraderFromDB: function(traderID, mysqlConn, callback){
    var query = "DELETE FROM borrower WHERE borrower_id='" + traderID + "';";
    mysqlConn.query(query, callback);
  },

  getCoinfloorCredentials: function(traderID, mysqlConn, callback){
    var query = "SELECT coinfloorID, coinfloorAPIKey, coinfloorPassword FROM borrower WHERE borrower_id='" + traderID + "';";
    mysqlConn.query(query, function(results){
      callback(results[0]);
    });
  },

  getMaintenanceReq: function(traderID, mysqlConn, callback){
    var query = "SELECT maintenance_req FROM borrower WHERE borrower_id='" + traderID + "';";
    mysqlConn.query(query, function(result){
      var maintenanceReq = result[0].maintenance_req;
      callback(maintenanceReq);
    });
  },

  setMaintenanceReq: function(traderID, newValue, mysqlConn, callback){
    var query = "UPDATE borrower SET maintenance_req='" + newValue + "' WHERE borrower_id='" + traderID + "';";
    mysqlConn.query(query, callback);
  },

  getAllLoans: function(traderID, mysqlConn, callback){
    var query = "SELECT * FROM loan WHERE counterparty_id='" + traderID + "';";
    mysqlConn.query(query, callback);
  },

  getLoansForExchange: function(traderID, exchange, mysqlConn, callback){
    var query = "SELECT * FROM loan WHERE counterparty_id='" + traderID + "' AND exchange='"+ exchange +"';";
    mysqlConn.query(query, callback);
  },

  deleteAllLoans: function(traderID, mysqlConn, callback){
    var query = "DELETE FROM loan WHERE counterparty_id='" + traderID + "';";
    mysqlConn.query(query, callback);
  },

  getTotalValueOfLoansForExchange: function(traderID, exchange, mysqlConn, callback){
    var query = "SELECT SUM(principal) FROM loan WHERE counterparty_id='" + traderID + "' AND exchange='"+ exchange +"';";
    mysqlConn.query(query, function(result){
      var total = result[0]['SUM(principal)'];
      callback(total);
    });
  },

  addLoanForTrader: function(traderID, principal, exchange, maturityTime, mysqlConn, callback){
    var query = "INSERT INTO `loan` (`counterparty_id`, `principal`, `start_time`, `maturity_time`, `outstanding`, `exchange`) VALUES ('" + traderID + "', '" + principal + "', CURRENT_TIMESTAMP, '"+ maturityTime +"', '1','"+ exchange +"');";
    mysqlConn.query(query, function(results){
      console.log()
      callback(results.insertId);
    });
  },

}
