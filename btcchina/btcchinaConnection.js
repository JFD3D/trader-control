var BTCChina = require('btcchina');
var socket = require('socket.io-client')('https://websocket.btcchina.com/');
var nodemailer = require('nodemailer');
var checkBalance = require('../lib/checkBalance.js');
var TraderUtils = require('../lib/traderDBUtils.js');
var mySQLWrapper = require('../lib/mySQLWrapper.js');
var emailSender = require("../lib/emailUtils.js");

var loanAsset = "BTC";
var counterAsset = "CNY";

var mysql_host = "localhost";
var mysql_database = process.argv[2];
var mysql_user = process.argv[3];
var mysql_password = process.argv[4];

if(process.argv[5] !== undefined){
  var trademoreID = process.argv[5];
} else {
  console.log('ERROR: you did not provide a Trademore userID as an argument');
  process.exit(1);
}

//default to test mode so cannot place trades
var testMode = 1;
if(process.argv[6] !== undefined){
  testMode = process.argv[6];
}

var mySQLConnection = new mySQLWrapper(mysql_host, mysql_user, mysql_password, mysql_database);

console.log('testmode: ' + testMode);

var latestAskPrice;

var alertSender = 'alert@trademoremargin.com';
var alertPassword = 'Phestup6Ras3';

var email = new emailSender(alertSender, alertPassword, 'zoho');

// create reusable transporter object using SMTP transport
var transporter = nodemailer.createTransport({
    service: 'Zoho',
    auth: {
        user: alertSender,
        pass: alertPassword
    }
});

console.log("Setting up connection for user: " + trademoreID);
TraderUtils.getBTChinaCredentials(trademoreID, mySQLConnection, function(credentials){
  console.log(credentials);
  btcchinaConn = new BTCChina(credentials.btcchinaKey, credentials.btcchinaSecret);

  // create btcchina connection with socket.io and add event listener to ticker (do not need to authenticate)
  socket.emit('subscribe', ['marketdata_cnybtc']);
  socket.on('connect', function(){
      console.log("Connected to BTCChina websocket API.");
      socket.on('ticker', onTicker);
  });

  function onTicker(result){
    //update ticker
    updateAskPrice(result.ticker.sell);

    //check balance for trader
    btcchinaConn.getAccountInfo(function(err, response){
      // console.log(response.result.balance);
      var BTCBalance = response.result.balance.btc.amount;
      var CNYBalance = response.result.balance.cny.amount;

      //perform stop loss check
      stopLossCheck(BTCBalance, CNYBalance);
    });
  }

  function stopLossCheck(BTCBalance, CNYBalance){
    console.log('CNY balance = ' + CNYBalance);
    console.log('BTC balance = ' + BTCBalance);
    console.log('ask price = ' + latestAskPrice);

    //send an email to notify the user if their account value has fallen below a certain level
    checkBalance.isAboveUserNotificationThreshold(BTCBalance, CNYBalance, loanAsset, counterAsset, latestAskPrice, trademoreID, "btcchina", mySQLConnection, function(result){;});

    checkBalance.isAboveMaintenanceValue(BTCBalance, CNYBalance, latestAskPrice, trademoreID, "btcchina", mySQLConnection, function(result){
      if(result){
        console.log("Value check passed: value of account is above minimum requirement");
      } else {
        console.log("Value check failed: value of account is below minimum requirement");
      executeStopLossTrade("BTC", "CNY", CNYBalance);
      }
    });

  }

  function executeStopLossTrade(loanAsset, counterAsset, counterAmount){
    //calculated amount of base currency to buy based on latest ask price and counterTotal
    var baseAmount = counterAmount/latestAskPrice;

    if(testMode == 0){
      //execute market order to convert total counter asset balance to loan asset
      console.log("EXECUTING REAL STOP LOSS TRADE");
      btcchinaConn.buyOrder2(null, baseAmount, function(err, response){
        console.log(response);
        //TODO: handle response and errors
        email.sendAlertMail('ALERT: stop loss trade executed successfully', 'Stop loss trade executed successfully on Coinfloor for trader account id: ' + trademoreID);
      });

    } else {
      console.log('Executing stop loss trade in test mode: would have sold ' + counterAmount + counterAsset + ' for ' + baseAmount + loanAsset);
    }
  }

  function updateAskPrice(newAskPrice){
    if(newAskPrice > 0){
      latestAskPrice = newAskPrice;
    }
  }

});
