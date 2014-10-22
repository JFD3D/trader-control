var Coinfloor = require('coinfloor');
var users = require('./users.json');
var utils = require('./coinfloorUtils.js');


var userConnections = Object();

console.log(users);

var user = users[0]; //user details should be given as input to node process

console.log("Setting up connection for user:" + user.coinfloorID);
userConnection = new Coinfloor(user.coinfloorID, user.password, user.api_key, onConnect);

function onConnect(){
  console.log("Connected for user: " + user.coinfloorID);
  userConnection.watchTicker(utils.getAssetCode("XBT"), utils.getAssetCode("GBP"), true, function(msg){console.log(msg)});
  userConnection.getBalances(function(msg){
      // console.log(msg)
      checkBalances(msg.balances)
    });
};

userConnection.addEventListener("TickerChanged", function(msg){
  userConnection.getBalances(function(msg){
      // console.log(msg)
      checkBalances(msg.balances)
    });
});

function checkBalances(balances){
  console.log(balances);

  var GBPbalance = getScaledBalanceForAsset("GBP", balances);
  var XBTbalance = getScaledBalanceForAsset("XBT", balances);

  //call stop loss check function here
  console.log("XBT: " + XBTbalance);
  console.log("GBP: " + GBPbalance);
}

function getScaledBalanceForAsset(assetString, balances){
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
