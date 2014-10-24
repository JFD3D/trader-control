var assert = require('chai').assert;
var async = require('async');
var checkBalance = require('../lib/checkBalance.js');
var TraderUtils = require('../lib/traderDBUtils.js');

var valueDelta = 0.00000001; //acceptable error for numerical quantities (accurate to 1 satoshi)
var testUserID;

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

describe('test check balance async', function(){

  before(function(done){
    TraderUtils.createTraderInDB("test_user", '1000', 'password', 'apikeytest123', function(result){
      testUserID = result;
      //create some test loans for test user
      async.parallel([
          TraderUtils.addLoanForTrader(testUserID, 0.1, "coinfloor", "2014-10-22 16:30:38", function(){;}),
          TraderUtils.addLoanForTrader(testUserID, 0.23, "coinfloor", "2014-10-22 16:30:38", function(){;}),
          TraderUtils.addLoanForTrader(testUserID, 0.4, "BTCChina", "2014-10-22 16:30:38", function(){;})
        ], done());
    });
  });

  after(function(){
    // call delete functions
    async.series([
      TraderUtils.deleteAllLoans(testUserID, function(){;}),
      TraderUtils.deleteTraderFromDB(testUserID, function(){;})
    ], function(result){console.log(result);});
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
      checkBalance.isAboveMaintenanceValue(XBTBalance, GBPBalance, XBTAskPrice, testUserID, "coinfloor", function(result){
        actual = result;
        console.log(result);
        done();
      });
    })

    it('should return true', function(){
      assert.isTrue(actual, 'present value is above maintenance value');
    });
  });

  describe('lower than minimum value',function(){
    //total loans on coinfloor = 0.33XBT
    //therefore minimum value = 0.33*(1+0.2) = 0.396 (because of maintenance req)
    var XBTBalance = 0.25;
    var XBTAskPrice = 240.0;
    var GBPBalance = 0.14*XBTAskPrice;  //should equal 0.14 XBT, so total = 0.39 XBT (< total)

    var expected = true;
    var actual = false

    before(function(done){
      checkBalance.isAboveMaintenanceValue(XBTBalance, GBPBalance, XBTAskPrice, testUserID, "coinfloor", function(result){
        actual = result;
        console.log(result);
        done();
      });
    })

    it('should return false', function(){
      assert.isFalse(actual, 'present value is below maintenance value');
    });
  });

  describe('equal to minimum value',function(){
    //total loans on coinfloor = 0.33XBT
    //therefore minimum value = 0.33*(1+0.2) = 0.396 (because of maintenance req)
    var XBTBalance = 0.25;
    var XBTAskPrice = 240.0;
    var GBPBalance = 0.146*XBTAskPrice;  //should equal 0.15 XBT, so total = 0.396 XBT (== total)

    var expected = true;
    var actual = false

    before(function(done){
      checkBalance.isAboveMaintenanceValue(XBTBalance, GBPBalance, XBTAskPrice, testUserID, "coinfloor", function(result){
        actual = result;
        console.log(result);
        done();
      });
    })

    it('should return true', function(){
      assert.isTrue(actual, 'present value is equal maintenance value');
    });
  });

});
