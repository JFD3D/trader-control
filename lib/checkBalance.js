var TraderUtils = require('../lib/traderDBUtils.js');
var async = require('async');
var emailSender = require("../lib/emailUtils.js");

var alertSender = 'alert@trademoremargin.com';
var alertPassword = 'Phestup6Ras3';

var email = new emailSender(alertSender, alertPassword, 'zoho');

// returns true if present value of account is more than loan + margin requirement
module.exports = {
  isAboveMaintenanceValue: function(loanAssetBalance, counterAssetBalance,  loanAsset, counterAsset, loanAssetAskPrice, UID, exchange, mysqlConn, callback){
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
        var totalLoans = results[0];
        var stopLossThreshold = results[1];
        var minimumPresentValue = that.getMinimumPresentValue(totalLoans, stopLossThreshold);
        console.log('Required account value for maintenance requirement = ' + minimumPresentValue);
        console.log('Actual account value = ' + presentValue);

        result = (presentValue >= minimumPresentValue);

        if(result){
          console.log("Stop Loss threshold check passed: value of account is above minimum requirement");
        } else {
          console.log("Stop Loss threshold check failed: value of account is below minimum requirement");
          TraderUtils.getContactEmail(UID, mysqlConn, function(address){
            email.sendStopLossClientMail(exchange, minimumPresentValue, presentValue, loanAsset, counterAsset, totalLoans, stopLossThreshold, address, UID);
          });
        }

        callback(result);
    });

  },

  isAboveUserNotificationThreshold: function(loanAssetBalance, counterAssetBalance, loanAsset, counterAsset, loanAssetAskPrice, UID, exchange, mysqlConn, callback){
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
            TraderUtils.getNotificationThreshold(UID, mysqlConn, function(result){
              callback(null, result);
            });
        }
    ],
    function(err, results){
        var totalLoans = results[0];
        var notificationThreshold = results[1];
        var minimumPresentValue = that.getMinimumPresentValue(totalLoans, notificationThreshold);
        console.log('Required account value for notification threshold = ' + minimumPresentValue);
        console.log('Actual account value = ' + presentValue);

        var result = (presentValue >= minimumPresentValue);

        if(result){
          console.log("Notification threshold check passed: value of account is above minimum requirement");
        } else {
          console.log("Notification threshold check failed: value of account is below minimum requirement");
          TraderUtils.getContactEmail(UID, mysqlConn, function(address){
            email.sendBalanceNotificationMail(exchange, minimumPresentValue, presentValue, loanAsset, counterAsset, totalLoans, notificationThreshold, address, UID);
          });
        }

        callback(result);
    });

  },

  getAccountPresentValue: function(loanAssetBalance, counterAssetBalance, loanAssetAskPrice){
    if(Number(loanAssetAskPrice) > 0){
      return Number(loanAssetBalance) + Number(counterAssetBalance)/Number(loanAssetAskPrice);
    } else {
      throw("Error: Ask price (denominator) is zero or null: " + loanAssetAskPrice);
      return 0;
    }
  },

  getMinimumPresentValue: function(loanBalance, maintenanceReq){
    return Number(loanBalance)*(1 + Number(maintenanceReq));
  }
}
