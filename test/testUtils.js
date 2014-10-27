var async = require('async');
var TraderUtils = require('../lib/traderDBUtils.js');

module.exports = {

  //delete test trader and all loans
  clearTraderFromDB: function(traderID, callback){
    TraderUtils.deleteAllLoans(traderID, function(){
      TraderUtils.deleteTraderFromDB(traderID, function(){
        callback();
      });
    });
  },

  createTestLoans: function(traderID, callback){
     async.parallel([
         function(callback){
             TraderUtils.addLoanForTrader(traderID, 0.1, "coinfloor", "2014-10-22 16:30:38",  function(result){
               callback(null, result);
             });
         },
         function(callback){
             TraderUtils.addLoanForTrader(traderID,  0.23, "coinfloor", "2014-10-22 16:30:38", function(result){
               callback(null, result);
             });
         },
         function(callback){
             TraderUtils.addLoanForTrader(traderID, 0.4, "BTCChina", "2014-10-22 16:30:38", function(result){
               callback(null, result);
             });
         }
     ],
     function(err, results){
         callback();
     });
   }
 }
