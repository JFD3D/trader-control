var mySQL = require('./mySQLWrapper.js');
var TraderUtils = require('../lib/traderDBUtils.js');
var async = require('async');

// returns true if present value of account is more than loan + margin requirement
module.exports = {
  isAboveMaintenanceValue: function(loanAssetBalance, counterAssetBalance, loanAssetAskPrice, UID, exchange, callback){
    var loanBalance = 0;
    var maintenanceReq = 0;
    var that = this;

    //calculate present value of account
    var presentValue = this.getAccountPresentValue(loanAssetBalance, counterAssetBalance, loanAssetAskPrice);

    async.parallel([
        function(callback){
            TraderUtils.getTotalValueOfLoansForExchange(UID, exchange, function(result){
              callback(null, result);
            })
        },
        function(callback){
            TraderUtils.getMaintenanceReq(UID, function(result){
              callback(null, result);
            })
        }
    ],
    function(err, results){
        var minimumPresentValue = that.getMinimumPresentValue(results[0], results[1]);
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
