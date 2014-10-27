var Coinfloor = require('coinfloor');
var utils = require('./coinfloorUtils.js');
var checkBalance = require('../lib/checkBalance.js');
var TraderUtils = require('../lib/traderDBUtils.js');

var trademoreID = process.argv[2];

//default to test mode so cannot place trades
var testMode = 1;
if(process.argv[3] !== undefined){
  testMode = process.argv[3];
}

console.log('testmode: ' + testMode);

var latestAskPrice;

console.log("Setting up connection for user:" + trademoreID);
TraderUtils.getCoinfloorCredentials(trademoreID, function(credentials){
  userConnection = new Coinfloor(credentials.coinfloorID, credentials.coinfloorPassword, credentials.coinfloorAPIKey, onConnect);
  console.log('credentials');
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
    checkBalance.isAboveMaintenanceValue(XBTbalance, GBPbalance, latestAskPrice, trademoreID, "coinfloor", function(result){
      if(result){
        console.log("Value check passed: value of account is above minimum requirement");
      } else {
        console.log("Value check failed: value of account is below minimum requirement");
        executeStopLossTrade("XBT", "GBP", GBPbalance);
      }
    });

  }

  function executeStopLossTrade(loanAsset, counterAsset, counterTotal){
    var assetPair = loanAsset + ':' + counterAsset;

    if(testMode == 0){
      //execute market order to convert total counter asset balance to loan asset
      console.log("EXECUTING REAL STOP LOSS TRADE");
      userConnection.executeCounterMarketOrder(utils.getAssetCode(loanAsset), utils.getAssetCode(counterAsset), utils.scaleInputPrice(assetPair, counterTotal), function(result){
        var counterAmount = utils.scaleOutputQuantity(counterAsset, result.total);
        var baseAmount = utils.scaleOutputQuantity(loanAsset, result.quantity);
        console.log('STOP LOSS TRADE EXECUTED: sold ' + counterAmount + counterAsset + ' for ' + baseAmount + loanAsset);
      });
    } else {
      //execute simulated market order
      userConnection.estimateCounterMarketOrder(utils.getAssetCode(loanAsset), utils.getAssetCode(counterAsset), utils.scaleInputPrice(assetPair, counterTotal), function(result){
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
