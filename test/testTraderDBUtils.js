var assert = require('chai').assert;
var async = require('async');
var TraderUtils = require('../lib/traderDBUtils.js');
var testUtils = require('./testUtils.js');
var mySQLWrapper = require('../lib/mySQLWrapper.js');

var mySQLConnection = new mySQLWrapper('localhost', 'root', 'root', 'bitcoinloanstest');

var testCoinfloorID = 1000;
var testCoinfloorPassword = "password";
var testCoinfloorAPIKey = "apikey162";
var testUserID;

describe('test trader DB Utils', function(){
  //set up trader object and loans in the DB before all tests
  before(function(done){
    TraderUtils.createTraderInDB("test_user", testCoinfloorID, testCoinfloorPassword, testCoinfloorAPIKey, mySQLConnection, function(result){
      testUserID = result;
      done();
    });
  });

  it('should return an id for the trader created',function(){
    assert.isNumber(testUserID, "is an id number");
    assert.operator(testUserID, '>', 0, 'non-zero id');
  });

});

describe('test get coinfloor credentials', function(){
  var res;
  before(function(done){
    TraderUtils.getCoinfloorCredentials(testUserID, mySQLConnection, function(result){
      res = result;
      done();
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
  var expected = 0.2;
  var actual;
  before(function(done){
    TraderUtils.getMaintenanceReq(testUserID, mySQLConnection, function(result){
      actual = result;
      done();
    });
  });

  it('check default maintenance margin', function(){
    assert.equal(actual, expected, "maintenance margin correct");
  });

});

describe('test set maintenance margin', function(){
  var expected = 0.3;
  var actual;

  before(function(done){
    TraderUtils.setMaintenanceReq(testUserID, expected, mySQLConnection, function(result){});
    TraderUtils.getMaintenanceReq(testUserID, mySQLConnection, function(result){
      actual = result;
      done();
    });
  });

  it('check default maintenance margin', function(){
    assert.equal(actual, expected, "maintenance margin correct");
  });

});

describe('test create loans', function(){
  var actual;

  before(function(done){
    testUtils.createTestLoans(testUserID, mySQLConnection, function(result){
        actual = result;
        console.log(result);
        done();
      });
  });

  it('check result is an array', function(){
    assert.isArray(actual, "result is an array");
    assert.lengthOf(actual, 3, "array is expected length");
  });

});

describe('test get all loans for user', function(){
  var actual;
  before(function(done){
    TraderUtils.getAllLoans(testUserID, mySQLConnection, function(result){
      actual = result;
      done();
    });
  });

  it('check result is an array', function(){
    assert.isArray(actual, "result is an array");
    assert.lengthOf(actual, 3, "array is expected length");
  });

});

describe('test get all loans for an exchange for user', function(){
  var actual;

  before(function(done){
    TraderUtils.getLoansForExchange(testUserID, "coinfloor", mySQLConnection, function(result){
      actual = result;
      done();
    });
  });

  it('check result is an array', function(){
    assert.isArray(actual, "result is an array");
    assert.lengthOf(actual, 2, "array is expected length");
  });

});

describe('test get total value of all loans', function(){
  var actual;
  var expected = 0.33;

  before(function(done){
    TraderUtils.getTotalValueOfLoansForExchange(testUserID, "coinfloor", mySQLConnection, function(result){
      actual = result;
      done();
    });
  });

  it('check result is an array', function(){
    assert.equal(actual, expected, "total result is same as expected value");
  });

});

describe('test delete all loans', function(){
  var actual;

  before(function(done){
    TraderUtils.deleteAllLoans(testUserID, mySQLConnection, function(result){
    TraderUtils.getAllLoans(testUserID, mySQLConnection, function(result){
        actual = result;
        done();
      });
    });
  });

  it('check result is an array', function(){
    assert.isArray(actual, "result is an array");
    assert.lengthOf(actual, 0, "array is expected length");
  });

});

describe('test delete trader', function(){
  var actual;

  before(function(done){
    TraderUtils.deleteTraderFromDB(testUserID, mySQLConnection, function(result){
        actual = result.affectedRows;
        done();
      });
  });

  it('check it deleted the trader', function(){
    assert.equal(actual, 1, "deleted one row");
  });

});
