var emailSender = require("../lib/emailUtils.js");

var alertSender = 'alert@trademoremargin.com';
var alertPassword = 'Phestup6Ras3';
var alertRecipient = 'team@trademoremargin.com';

var email = new emailSender(alertSender, alertPassword, 'zoho');

email.sendAlertMail("test email", "sent from test/testEmailUtils.js");
