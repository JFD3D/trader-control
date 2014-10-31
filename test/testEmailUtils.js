var emailSender = require("../lib/emailUtils.js");

var alertSender = 'alert@trademoremargin.com';
var alertPassword = 'Phestup6Ras3';
var alertRecipient = 'team@trademoremargin.com';

var email = new emailSender(alertSender, alertPassword, 'zoho');

email.sendAlertMail("testing alert email function", "sent from test/testEmailUtils.js");

// email.sendBalanceNotificationMail('Your account has fallen below the threshold', 'Your current balance is...', "rorygreig@gmail.com");
