var assert = require('chai').assert;
var TraderUtils = require('../lib/traderDBUtils.js');
var users = require('../credentials/users.json');

var user = users[0];


// var testUserID = 0;
// var createUserCallback = function(results){}
// TraderUtils.createTraderInDB("test_user", user.coinfloorID, user.password, user.api_key, createUserCallback);
//
// function testCreateTrader(){
//   TraderUtils.createTraderInDB("test_user", user.coinfloorID, user.password, user.api_key, function(results){console.log(results);});
// }
//
// function testDeleteTrader(){
//   console.log(result);
//   console.log("external access:" + trader.UID);
//   TraderUtils.deleteTraderFromDB(24, function(results){console.log(results);});
// }
//
// function testGetLoansForExchange(){
//   TraderUtils.getLoansForExchange(2, "coinfloor", function(results){
//     console.log(results);
//   });
// }

describe('test get coinfloor credentials', function(){
  var res;
  before(function(done){
    TraderUtils.getCoinfloorCredentials(3, function(results){
      res = results;
      done();
    });
  });

  it('should return an object',function(){
    assert.isObject(res, "get credentials returned object");
  });

  it('should have the required properties', function(){
    assert.property(res, "coinfloorID", "has property coinfloorID");
    assert.property(res, "coinfloorAPIKey", "has property coinfloorAPIKey");
    assert.property(res, "coinfloorPassword", "has property coinfloorPassword");
  });

});
