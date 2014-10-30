var async = require('async');
var TraderUtils = require('../lib/traderDBUtils.js');

module.exports = {

  //delete test trader and all loans
  clearTraderFromDB: function(traderID, mysqlConn, callback){
    TraderUtils.deleteAllLoans(traderID, mysqlConn, function(){;});
    TraderUtils.deleteTraderFromDB(traderID, mysqlConn, function(result){
      callback(result);
    });
  },

  createTestLoans: function(traderID, mysqlConn, callback){
     async.parallel([
         function(callback){
             TraderUtils.addLoanForTrader(traderID, 0.1, "coinfloor", "2014-10-22 16:30:38", mysqlConn, function(result){
               callback(null, result);
             });
         },
         function(callback){
             TraderUtils.addLoanForTrader(traderID,  0.23, "coinfloor", "2014-10-22 16:30:38", mysqlConn, function(result){
               callback(null, result);
             });
         },
         function(callback){
             TraderUtils.addLoanForTrader(traderID, 0.4, "BTCChina", "2014-10-22 16:30:38", mysqlConn, function(result){
               callback(null, result);
             });
         }
     ],
     function(err, results){
         callback();
     });
   }
 }
