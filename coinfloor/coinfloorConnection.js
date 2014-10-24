var Coinfloor = require('coinfloor');
var users = require('../credentials/users.json');
var utils = require('./coinfloorUtils.js');
var checkBalance = require('../lib/checkBalance.js');

//TODO: user details should be given as input to this process
var user = users[0];

var latestAskPrice = 0;

console.log("Setting up connection for user:" + user.coinfloorID);
userConnection = new Coinfloor(user.coinfloorID, user.password, user.api_key, onConnect);

function onConnect(){
  console.log("Connected for user: " + user.coinfloorID);
  userConnection.watchTicker(utils.getAssetCode("XBT"), utils.getAssetCode("GBP"), true, function(ticker){
      latestAskPrice = getScaledAskPrice(ticker, "XBT:GBP");
    });

  userConnection.getBalances(function(msg){
      stopLossCheck(msg.balances)
    });
};

userConnection.addEventListener("TickerChanged", function(tickerMsg){
  latestAskPrice = getScaledAskPrice(tickerMsg, "XBT:GBP");

  userConnection.getBalances(function(msg){
      stopLossCheck(msg.balances)
    });
});

userConnection.addEventListener("BalanceChanged", function(tickerMsg){
  //TODO: update global variables with ticker values

  userConnection.getBalances(function(msg){
      stopLossCheck(msg.balances)
    });
});

function stopLossCheck(balances){
  console.log(balances);

  var GBPbalance = getScaledBalance("GBP", balances);
  var XBTbalance = getScaledBalance("XBT", balances);

  checkBalance.isAboveMaintenanceValue(XBTbalance, GBPbalance, 240.0, user.trademoreID, function(aboveMin){
    if(aboveMin){
      console.log("Value check successful: value of account is above maintenance requirement");
    } else {
      //execute stop loss trade
      stopLossTrade("XBT", "GBP", true);
    }
  });

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

function stopLossTrade(loanAsset, counterAsset, test){
  if(!test){
    //execute market order to convert total counter asset balance to loan asset
  } else {
    //execute simulated market order to do the same thing
  }
}
