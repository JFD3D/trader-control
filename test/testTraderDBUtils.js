var assert = require('chai').assert;
var async = require('async');
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

describe('test get maintenance margin', function(){
  var testUserID;

  before(function(done){
    TraderUtils.createTraderInDB("test_user", testCoinfloorID, testCoinfloorPassword, testCoinfloorAPIKey, function(result){
      testUserID = result;
      done();
    });
  });

  describe('test default maintenance margin', function(){
    var expected = 0.2;
    var actual;
    before(function(done){
      TraderUtils.getMaintenanceReq(testUserID, function(result){
        actual = result;
        TraderUtils.deleteTraderFromDB(testUserID, function(){});
        done();
      });
    });

    it('check default maintenance margin', function(){
      assert.equal(actual, expected, "maintenance margin correct");
    });

  });

});

describe('test get maintenance margin', function(){
  var testUserID;
  var expected = 0.3;

  before(function(done){
    TraderUtils.createTraderInDB("test_user", testCoinfloorID, testCoinfloorPassword, testCoinfloorAPIKey, function(result){
        testUserID = result;
        TraderUtils.setMaintenanceReq(testUserID, expected, function(result){
        done();
      });
    });
  });

  describe('test default maintenance margin', function(){
    var actual;
    before(function(done){
      TraderUtils.getMaintenanceReq(testUserID, function(result){
        actual = result;
        var user = testUserID;
        TraderUtils.deleteTraderFromDB(user, function(){});
        done();
      });
    });

    it('check default maintenance margin', function(){
      assert.equal(actual, expected, "maintenance margin correct");
    });

  });

});

describe('test loan functions', function(){
  var testUserID;

  before(function(done){
    TraderUtils.createTraderInDB("test_user", testCoinfloorID, testCoinfloorPassword, testCoinfloorAPIKey, function(result){
        testUserID = result;
        async.parallel([
            TraderUtils.addLoanForTrader(testUserID, 0.1, "coinfloor", new Date().getTime(), function(){;}),
            TraderUtils.addLoanForTrader(testUserID, 0.2, "coinfloor", new Date().getTime(), function(){;});
            TraderUtils.addLoanForTrader(testUserID, 0.4, "BTCChina", new Date().getTime(), function(){;});
          ], done());
    });
  });

  describe('test get all loans', function(){
    var actual;
    before(function(done){
      TraderUtils.getAllLoans()
    });

    it('check default maintenance margin', function(){
      assert.equal(actual, expected, "maintenance margin correct");
    });

  });

  describe('test get all loans for exchange', function(){
    var actual;
    before(function(done){
      TraderUtils.getLoansForExchange()
    });

    it('check default maintenance margin', function(){
      assert.equal(actual, expected, "maintenance margin correct");
    });

  });

  describe('test get all loans for exchange', function(){
    var actual;
    before(function(done){
      TraderUtils.getTotalValueOfLoansForExchange()
    });

    it('check default maintenance margin', function(){
      assert.equal(actual, expected, "maintenance margin correct");
    });

  });

});
