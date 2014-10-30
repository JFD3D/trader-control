//this will spawn child processes for each user account on each exchange
var prompt = require('prompt');
var childProcess = require('child_process');
var traderUtils = require('./lib/traderDBUtils.js');
var mySQLWrapper = require('./lib/mySQLWrapper.js');

var mysql_database = 'bitcoinloanstest';
var mysql_user;
var mysql_passwowrd;
var testMode = 1; //in test mode if true - cannot place trades

var schema = {
    properties: {
      username: {
        required: true
      },
      password: {
        hidden: true
      }
    }
  };

prompt.start();
prompt.get(schema, function (err, result) {
  mysql_user = result.username;
  mysql_password = result.password;

  var mySQLConnection = new mySQLWrapper('localhost', mysql_user, mysql_password, mysql_database);

  var trademoreID = traderUtils.getAllTraders(mySQLConnection, function(result){
    result.forEach(function(trader){
      launchStopLoss(mysql_database, mysql_user, mysql_password, trader.borrower_id, "coinfloor", testMode);
      // launchStopLoss(mysql_database, mysql_user, mysql_password, trader.borrower_id, "btcchina", testMode);
    });
  });
});

function launchStopLoss(mysql_database, mysql_user, mysql_password, traderID, exchange, testMode){
  var date = new Date();
  var command = "";

  if(exchange.indexOf("coinfloor") != -1){
    console.log("running stop loss for user " + traderID + " on Coinfloor")
    var command = "node coinfloor/coinfloorConnection.js ";
  } else if(exchange.indexOf("btcchina") != -1) {
    console.log("running stop loss for user " + traderID + " on BTCChina")
    var command = "node btcchina/btcchinaConnection.js ";
  } else {
    throw("no exchange selected for stop loss process");
  }

  command += mysql_database + " ";
  command += mysql_user + " ";
  command += mysql_password + " ";
  command += traderID + " ";
  command += testMode + " ";
  command += ">> ~/Documents/logs/coinfloor" + date.getTime() + ".log";

  console.log("Executing command: " + command);

  var process = childProcess.exec(command, function (error, stdout, stderr) {
     if (error) {
         console.log(error.stack);
         console.log('Error code: '+error.code);
         console.log('Signal received: '+error.signal);
       }
       console.log('Child Process STDOUT: '+stdout);
       console.log('Child Process STDERR: '+stderr);
   });

   process.on('exit', function (code) {
     console.log('Child process exited with exit code '+code);
   });
}
