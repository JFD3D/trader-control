var Coinfloor = require('coinfloor');
var users = require('../credentials/users.json');
var utils = require('./coinfloorUtils.js');
var checkBalance = require('../lib/checkBalance.js');

var latestTicker = Object();

var user = users[0]; //user details should be given as input to node process

console.log("Setting up connection for user:" + user.coinfloorID);
userConnection = new Coinfloor(user.coinfloorID, user.password, user.api_key, onConnect);

function onConnect(){
  console.log("Connected for user: " + user.coinfloorID);
  userConnection.watchTicker(utils.getAssetCode("XBT"), utils.getAssetCode("GBP"), true, function(msg){
      console.log(msg);
      //TODO: store ticker values in global variables
      //latestTicker = msg.ticker;
    });
  userConnection.getBalances(function(balanceMsg){
      // console.log(msg)
      stopLossCheck(balanceMsg.balances)
    });
};

userConnection.addEventListener("TickerChanged", function(tickerMsg){
  //TODO: update global variables with ticker values
  userConnection.getBalances(function(msg){
      // console.log(msg)
      stopLossCheck(msg.balances)
    });
});

//TODO: add an event listener for balance changed event - perform same checks

function stopLossCheck(balances){
  console.log(balances);

  var GBPbalance = getScaledBalance("GBP", balances);
  var XBTbalance = getScaledBalance("XBT", balances);

  //call check balance function here
  if(checkBalance.isAboveMaintenanceValue(XBTbalance, GBPbalance, ,user.trademoreID)){
    console.log("Value check successful: value of account is above maintenance requirement");
  } else {
    //execute stop loss trade
    stopLossTrade("XBT", "GBP", true);
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

function stopLossTrade(loanAsset, counterAsset, test){
  if(!test){
    //execute market order to convert total counter asset balance to loan asset
  } else {
    //execute simulated market order to do the same thing
  }

}
