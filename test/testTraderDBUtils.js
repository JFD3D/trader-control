var assert = require('chai').assert;
var TraderUtils = require('../lib/traderDBUtils.js');

var testCoinfloorID = 1000;
var testCoinfloorPassword = "password";
var testCoinfloorAPIKey = "apikey162";
var testUserID;

describe('test create trader', function(){
  var testUserID;
  before(function(done){
    TraderUtils.createTraderInDB("test_user", testCoinfloorID, testCoinfloorPassword, testCoinfloorAPIKey, function(result){
      testUserID = result;
      TraderUtils.deleteTraderFromDB(result, function(){});
      done();
    });
  });

  it('should return an id',function(){
    assert.isNumber(testUserID, "is an id number");
    assert.operator(testUserID, '>', 0, 'non-zero id');
  });

});

describe('test get coinfloor credentials', function(){
  var testUserID;
  var res;

  before(function(done){
    TraderUtils.createTraderInDB("test_user", testCoinfloorID, testCoinfloorPassword, testCoinfloorAPIKey, function(result){
      testUserID = result;
      TraderUtils.getCoinfloorCredentials(testUserID, function(result){
        res = result;
        TraderUtils.deleteTraderFromDB(testUserID, function(){});
        done();
      });
    });
  });

  it('should return an object',function(){
    assert.isObject(res, "get credentials returned object");
  });

  it('should have the required properties', function(){
    assert.property(res, "coinfloorID", "has property coinfloorID");
    assert.property(res, "coinfloorPassword", "has property coinfloorPassword");
    assert.property(res, "coinfloorAPIKey", "has property coinfloorAPIKey");
  });

  it('properties should equal expected values', function(){
    assert.equal(res.coinfloorID, testCoinfloorID, "coinfloorID correct");
    assert.equal(res.coinfloorPassword, testCoinfloorPassword, "coinfloor password correct");
    assert.equal(res.coinfloorAPIKey, testCoinfloorAPIKey, "coinfloorAPIKey correct");
  });

});
