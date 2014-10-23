var mySQL = require('./mySQLWrapper.js');
var TraderUtils = require('../lib/traderDBUtils.js');

// returns true if present value of account is more than loan + margin requirement
module.exports = {
  isAboveMaintenanceValue: function(loanAssetBalance, counterAssetBalance, loanAssetAskPrice, UID, exchange, callback){
    var loanBalance = 0;
    var maintenanceReq = 0;
    //calculate present value of account
    var presentValue = this.getAccountPresentValue(loanAssetBalance, counterAssetBalance, loanAssetAskPrice);

    async.parallel([
        this.getOutstandingLoanBalance(UID, exchange, function(result){
          loanBalance = result;
        }),
        TraderUtils.getMaintenanceReq(UID, function(result){
          maintenanceReq = result;
        })
      ], function(){
          var minimumPresentValue = this.getMinimumPresentValue(loanBalance, maintenanceReq);
          var result = (presentValue >= minimumPresentValue);
          callback(result);
      });
  },

  getAccountPresentValue: function(loanAssetBalance, counterAssetBalance, loanAssetAskPrice){
    return loanAssetBalance + counterAssetBalance/loanAssetAskPrice;
  },

  //get outstanding loans for the given user and exchange
  getOutstandingLoanBalance: function(UID, exchange, callback){
    TraderUtils.getTotalValueOfLoansForExchange(UID, exchange, callback);
  },

  getMinimumPresentValue: function(loanBalance, maintenanceReq){
    return loanBalance*(1 + maintenanceReq);
  }
}
