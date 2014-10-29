var TraderUtils = require('../lib/traderDBUtils.js');
var async = require('async');

// returns true if present value of account is more than loan + margin requirement
module.exports = {
  isAboveMaintenanceValue: function(loanAssetBalance, counterAssetBalance, loanAssetAskPrice, UID, exchange, mysqlConn, callback){
    var loanBalance = 0;
    var maintenanceReq = 0;
    var that = this;

    var presentValue = this.getAccountPresentValue(loanAssetBalance, counterAssetBalance, loanAssetAskPrice);

    async.parallel([
        function(callback){
            TraderUtils.getTotalValueOfLoansForExchange(UID, exchange, mysqlConn, function(result){
              callback(null, result);
            });
        },
        function(callback){
            TraderUtils.getMaintenanceReq(UID, mysqlConn, function(result){
              callback(null, result);
            });
        }
    ],
    function(err, results){
        var minimumPresentValue = that.getMinimumPresentValue(results[0], results[1]);
        console.log('Required account value = ' + minimumPresentValue);
        console.log('Actual account value = ' + presentValue);

        callback(presentValue >= minimumPresentValue);
    });

  },

  getAccountPresentValue: function(loanAssetBalance, counterAssetBalance, loanAssetAskPrice){
    return loanAssetBalance + counterAssetBalance/loanAssetAskPrice;
  },

  getMinimumPresentValue: function(loanBalance, maintenanceReq){
    return loanBalance*(1 + maintenanceReq);
  }
}
