var assert = require('chai').assert;
var async = require('async');
var checkBalance = require('../lib/checkBalance.js');
var TraderUtils = require('../lib/traderDBUtils.js');
var testUtils = require('./testUtils.js');
var mySQLWrapper = require('../lib/mySQLWrapper.js');

var valueDelta = 0.00000001; //acceptable error for numerical quantities (accurate to 1 satoshi)

describe('test check balance non async functions',function(){

  it('test getAccountPresentValue()', function(){

    var XBTBalance = 0.05;
    var GBPBalance = 10;
    var XBTAskPrice = 240.0;
    var expected = 0.091666667;

    var actual = checkBalance.getAccountPresentValue(XBTBalance, GBPBalance, XBTAskPrice);

    assert.closeTo(actual, expected, valueDelta, 'account present value calculated is not equal to expected');
  });

  it('test getMinimumPresentValue()',function(){

    var loanBalance = 2.1;
    var maintenanceReq = 0.2;
    var expected = 2.52;

    var actual = checkBalance.getMinimumPresentValue(loanBalance, maintenanceReq);

    assert.closeTo(actual, expected, valueDelta, 'minimum present value calculated is not equal to expected');
  });

});

var testUserID;
var mySQLConnection = new mySQLWrapper('localhost', 'root', 'root', 'bitcoinloanstest');

describe('test check balance more', function(){

  before(function(done){
    TraderUtils.createTraderInDB("test_user", '1000', 'password', 'apikeytest123', mySQLConnection, function(result){
      testUserID = result;
      testUtils.createTestLoans(testUserID, mySQLConnection, function(result){;});
      done();
    });
  });

  describe('greater than minimum value',function(){
    //total loans on coinfloor = 0.33XBT
    //therefore minimum value = 0.33*(1+0.2) = 0.396 (because of maintenance req)
    var XBTBalance = 0.25;
    var XBTAskPrice = 240.0;
    var GBPBalance = 0.15*XBTAskPrice;  //should equal 0.15 XBT, so total = 0.40 XBT (> total)

    var expected = true;
    var actual = false

    before(function(done){
      checkBalance.isAboveMaintenanceValue(XBTBalance, GBPBalance, XBTAskPrice, testUserID, "coinfloor", mySQLConnection, function(result){
        actual = result;
        done();
      });
    })

    it('should return true', function(){
      assert.isDefined(actual, 'result is defined');
      assert.isTrue(actual, 'present value is above maintenance value');
    });
  });

});

describe('test check balance less', function(){

  describe('lower than minimum value',function(){
    //total loans on coinfloor = 0.33XBT
    //therefore minimum value = 0.33*(1+0.2) = 0.396 (because of maintenance req)
    var XBTBalance = 0.25;
    var XBTAskPrice = 240.0;
    var GBPBalance = 0.12*XBTAskPrice;  //should equal 0.12 XBT, so total = 0.37 XBT (< total)

    var expected = true;
    var actual;

    before(function(done){
      checkBalance.isAboveMaintenanceValue(XBTBalance, GBPBalance, XBTAskPrice, testUserID, "coinfloor", mySQLConnection, function(result){
        actual = result;
        done();
      });
    })

    it('should return false', function(){
      assert.isDefined(actual, 'result is defined');
      assert.isFalse(actual, 'present value is below maintenance value');
    });
  });

});

describe('test check balance equal', function(){

  describe('equal to minimum value',function(){
    //total loans on coinfloor = 0.33XBT
    //therefore minimum value = 0.33*(1+0.2) = 0.396 (because of maintenance req)
    var XBTBalance = 0.25;
    var XBTAskPrice = 240.0;
    var GBPBalance = 0.146*XBTAskPrice;  //should equal 0.15 XBT, so total = 0.396 XBT (== total)

    var expected = true;
    var actual = false

    before(function(done){
      checkBalance.isAboveMaintenanceValue(XBTBalance, GBPBalance, XBTAskPrice, testUserID, "coinfloor", mySQLConnection, function(result){
        actual = result;
        done();
      });
    })

    it('should return true', function(){
      assert.isDefined(actual, 'result is defined');
      assert.isTrue(actual, 'present value is equal maintenance value');
    });
  });

});

describe('clean up trader in DB', function(){
  var actual;

  before(function(done){
    testUtils.clearTraderFromDB(testUserID, mySQLConnection, function(result){
          actual = result.affectedRows;
          done();
        });
    });

    it('check it deleted the trader', function(){
      assert.equal(actual, 1, "deleted one row");
    });

});
