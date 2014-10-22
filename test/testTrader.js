var assert = require('chai').assert;
var Trader = require('../lib/trader.js');
var users = require('../credentials/users.json');

var user = users[0];

//setup - create test trader
var trader = new Trader("test_user", user.coinfloorID, user.password, user.api_key, function(result){
  console.log(result);
});

// describe('test check balance functions',function(){
//
//   it('test createUser()',function(){
//
//     assert.fail("", "", 'trader object not created');
//   });
//
//   //teardown - delete trader created in setup
//
// });
