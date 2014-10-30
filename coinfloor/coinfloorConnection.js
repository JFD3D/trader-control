var Coinfloor = require('coinfloor');
var nodemailer = require('nodemailer');
var utils = require('./coinfloorUtils.js');
var checkBalance = require('../lib/checkBalance.js');
var TraderUtils = require('../lib/traderDBUtils.js');
var mySQLWrapper = require('../lib/mySQLWrapper.js');
var credentials = require('../credentials/mySQLlogin.json');

var mysql_host = "localhost";
var mysql_database = "bitcoinloans";

if(process.argv[2] !== undefined){
  var trademoreID = process.argv[2];
} else {
  console.log('ERROR: you did not provide a Trademore userID as an argument');
  process.exit(1);
}

//default to test mode so cannot place trades
var testMode = 1;
if(process.argv[3] !== undefined){
  testMode = process.argv[3];
}

var mySQLConnection = new mySQLWrapper(mysql_host, credentials.user, credentials.password, mysql_database);

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
TraderUtils.getCoinfloorCredentials(trademoreID, mySQLConnection, function(credentials){
  userConnection = new Coinfloor(credentials.coinfloorID, credentials.coinfloorPassword, credentials.coinfloorAPIKey, onConnect);
  function onConnect(){
    userConnection.watchTicker(utils.getAssetCode("XBT"), utils.getAssetCode("GBP"), true, function(ticker){
        updateAskPrice(getScaledAskPrice(ticker, "XBT:GBP"));
      });

    userConnection.getBalances(function(msg){
        stopLossCheck(msg.balances)
      });
  };

  userConnection.addEventListener("TickerChanged", function(ticker){
    updateAskPrice(getScaledAskPrice(ticker, "XBT:GBP"));

    userConnection.getBalances(function(msg){
        stopLossCheck(msg.balances)
      });
  });

  userConnection.addEventListener("BalanceChanged", function(tickerMsg){
    userConnection.getBalances(function(msg){
        stopLossCheck(msg.balances)
      });
  });

  function stopLossCheck(balances){
    console.log(balances);
    var GBPbalance = getScaledBalance("GBP", balances);
    var XBTbalance = getScaledBalance("XBT", balances);

    console.log('GBP balance = ' + GBPbalance);
    console.log('XBT balance = ' + XBTbalance);
    console.log('ask price = ' + latestAskPrice);
    checkBalance.isAboveMaintenanceValue(XBTbalance, GBPbalance, latestAskPrice, trademoreID, "coinfloor", mySQLConnection, function(result){
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
            sendAlertMail('WARNING: stop loss trade executed partially', 'Stop loss trade executed partially on Coinfloor for trader account id: ' + trademoreID);

          } else {
            console.log('STOP LOSS TRADE EXECUTED SUCCESSFULLY: sold ' + counterTotal + counterAsset );
            sendAlertMail('ALERT: stop loss trade executed successfully', 'Stop loss trade executed successfully on Coinfloor for trader account id: ' + trademoreID);
          }
        } else {
          console.log('WARNING: STOP LOSS TRADE ATTEMPTED TO EXECUTE AND FAILED!');
          sendAlertMail('WARNING: STOP LOSS TRADE ATTEMPTED TO EXECUTE AND FAILED!', 'Stop loss trade attempted to execute and failed on Coinfloor for trader account id: ' + trademoreID);
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

  function getScaledBalance(assetString, balances){
    var balanceObj = balances.filter(function getValue(element){
                                        return element.asset === utils.getAssetCode(assetString);
                                      });
    if(balanceObj[0] !== undefined){
      return utils.scaleOutputQuantity(assetString, balanceObj[0].balance);
    } else {
      console.log("Warning: no balance given for asset: " + assetString);
      return 0;
    }
  }

  function getScaledAskPrice(ticker, assetPair){
    var ask = ticker.ask;
    return utils.scaleOutputPrice(assetPair, ask);
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
