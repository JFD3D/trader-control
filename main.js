//this will spawn child processes for each user account on each exchange
var prompt = require('prompt');
var traderUtils = require('./lib/traderDBUtils.js');
var mySQLWrapper = require('./lib/mySQLWrapper.js');

var mysql_user;
var mysql_passwowrd;

prompt.start();
prompt.get(['username', 'password'], function (err, result) {
  mysql_user = result.username;
  mysql_password = result.password;

  console.log('  username: ' + result.username);
  console.log('  password: ' + result.password);

  var mySQLConnection = new mySQLWrapper('localhost', mysql_user, mysql_password, 'bitcoinloans');

  var traders = Array();

  var trademoreID = traderUtils.getAllTraders(mySQLConnection, function(result){
    traders = result;
    console.log(traders);
  });
});
