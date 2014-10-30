var BTCChina = require('btcchina');
var socket = require('socket.io-client')('https://websocket.btcchina.com/');
var nodemailer = require('nodemailer');
var checkBalance = require('../lib/checkBalance.js');
var TraderUtils = require('../lib/traderDBUtils.js');
var mySQLWrapper = require('../lib/mySQLWrapper.js');

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
var alertRecipient = 'team@trademoremargin.com'; //'team@trademoremargin.com';

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

  //create btcchina connection with socket.io and add event listener to ticker (do not need to authenticate)
  // socket.emit('subscribe', ['marketdata_cnybtc']);
  // socket.on('connect', function(){
  //     console.log("Connected to BTCChina websocket API.");
  //     socket.on('ticker', onTicker);
  // });
  //
  // function onTicker(result){
  //   console.log("Latest ask price: " + result.ticker.sell);
  //   //update ticker
  //   updateAskPrice(result.ticker.sell);
  //
  //   //check balance for user with btchina modules
  // }


  function stopLossCheck(balances){
    console.log(balances);
    var GBPbalance = getScaledBalance("GBP", balances);
    var XBTbalance = getScaledBalance("XBT", balances);

    console.log('GBP balance = ' + GBPbalance);
    console.log('XBT balance = ' + XBTbalance);
    console.log('ask price = ' + latestAskPrice);
    checkBalance.isAboveMaintenanceValue(XBTbalance, GBPbalance, latestAskPrice, trademoreID, "btcchina", mySQLConnection, function(result){
      if(result){
        console.log("Value check passed: value of account is above minimum requirement");
      } else {
        console.log("Value check failed: value of account is below minimum requirement");
        executeStopLossTrade("XBT", "GBP", GBPbalance);
      }
    });

  }

  function executeStopLossTrade(loanAsset, counterAsset, counterTotal){
    if(testMode == 0){
      //execute market order to convert total counter asset balance to loan asset
      console.log("EXECUTING REAL STOP LOSS TRADE");
      userConnection.executeCounterMarketOrder(utils.getAssetCode(loanAsset), utils.getAssetCode(counterAsset), utils.scaleInputQuantity(counterAsset, counterTotal), function(result){
        if(result.error_code == 0){
          //if trade executes partially the remaining field in the result will be non zero
          if(result.remaining > 0){
            var remaining = utils.scaleOutputQuantity(counterAsset, result.remaining);
            var totalSold = counterTotal - remaining;
            console.log('STOP LOSS TRADE EXECUTED PARTIALLY: sold ' + totalSold + counterAsset );
            console.log('Remaining to be liquidated: ' + remaining + counterAsset );
            sendAlertMail('WARNING: stop loss trade executed partially', 'Stop loss trade executed partially on BTCChina for trader account id: ' + trademoreID);

          } else {
            console.log('STOP LOSS TRADE EXECUTED SUCCESSFULLY: sold ' + counterTotal + counterAsset );
            sendAlertMail('ALERT: stop loss trade executed successfully', 'Stop loss trade executed successfully on BTCChina for trader account id: ' + trademoreID);
          }
        } else {
          console.log('WARNING: STOP LOSS TRADE ATTEMPTED TO EXECUTE AND FAILED!');
          sendAlertMail('WARNING: STOP LOSS TRADE ATTEMPTED TO EXECUTE AND FAILED!', 'Stop loss trade attempted to execute and failed on BTCChina for trader account id: ' + trademoreID);
        }
      });
    } else {
      //execute simulated market order
      userConnection.estimateCounterMarketOrder(utils.getAssetCode(loanAsset), utils.getAssetCode(counterAsset), utils.scaleInputQuantity(counterAsset, counterTotal), function(result){
        var counterAmount = utils.scaleOutputQuantity(counterAsset, result.total);
        var baseAmount = utils.scaleOutputQuantity(loanAsset, result.quantity);
        console.log('Estimated stop loss trade: would have sold ' + counterAmount + counterAsset + ' for ' + baseAmount + loanAsset);
      });
    }
  }

  function updateAskPrice(newAskPrice){
    if(newAskPrice > 0){
      latestAskPrice = newAskPrice;
    }
  }

});

function sendAlertMail(subject, message){
  var mailOptions = {
      from: alertSender,
      to: alertRecipient,
      subject: subject,
      text: message
  };

  // send mail with defined transport object
  transporter.sendMail(mailOptions, function(error, info){
      if(error){
          console.log(error);
      }else{
          console.log('Message sent: ' + info.response);
      }
  });
}
