var assert = require('chai').assert;
var checkBalance = require('../lib/checkBalance.js');

var valueDelta = 0.00000001; //acceptable error for numerical quantities (accurate to 1 satoshi)


describe('test check balances',function(){

  it('calculated account present value should equal the expected value',function(){

    var loanAssetBalance = 0.05;
    var counterAssetBalance = 10;
    var askPrice = 240.0;
    var expected = 0.091666667;

    var actual = checkBalance.getAccountPresentValue(loanAssetBalance, counterAssetBalance, askPrice);
    console.log(expected);
    assert.closeTo(actual, expected, valueDelta, 'account present value calculated is not equal to expected');
  });
});
