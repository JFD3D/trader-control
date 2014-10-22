//this module should be agnostic to the exchange we are dealing with and the loan currency

var mySQL = require('./mySQLWrapper.js');

// returns true if present value of account is more than loan + margin requirement
module.exports = {
  isAboveMaintenanceValue: function(loanAssetBalance, counterAssetBalance, loanAssetAskPrice, UID, exchange){
    //calculate present value of account
    var presentValue = this.getAccountPresentValue(loanAssetBalance, counterAssetBalance, loanAssetAskPrice);

    //get total value of outstanding loans for user
    var loanBalance = this.getOutstandingLoanBalance(UID, exchange);

    //get maintenance requirement (expressed as fraction of loans)
    var maintenanceReq = this.getMaintenanceReq(UID);

    //calculate minimum required present value
    var minimumPresentValue = this.getMinimumPresentValue(loanBalance, maintenanceReq)

    return (presentValue >= minimumPresentValue);
  },

  getAccountPresentValue: function(loanAssetBalance, counterAssetBalance, loanAssetAskPrice){
    return loanAssetBalance + counterAssetBalance/loanAssetAskPrice;
  },

  //get outstanding loans for the given user and exchange
  getOutstandingLoanBalance: function(UID, exchange){
    return 2.1;
  },

  //get the maintenance requirement for given user, expressed as a fraction of total loans
  getMaintenanceReq: function(UID){
    return 0.2;
  },

  getMinimumPresentValue: function(loanBalance, maintenanceReq){
    return loanBalance*(1 + maintenanceReq);
  }

}
