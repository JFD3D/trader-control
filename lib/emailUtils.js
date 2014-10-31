var nodemailer = require('nodemailer');

var emailSender = function(sender, password, service) {
    this.transporter = setupTransporter(sender, password, service);
    this.sendAlertMail = sendAlertMail;
    this.sender = sender;
    this.sendBalanceNotificationMail = sendBalanceNotificationMail;
    this.lastMailSentTime = 0;
    this.mailFrequency = 14400000; //4 hours in milliseconds
}

function setupTransporter(sender, password, service){
  // create reusable transporter object using SMTP transport
  return nodemailer.createTransport({
      service: service,
      auth: {
          user: sender,
          pass: password
      }
  });
}

function sendAlertMail(subject, message){
  var mailOptions = {
      from: this.sender,
      to: "team@trademoremargin.com",
      subject: subject,
      text: message
  };

  // send mail with defined transport object
  this.transporter.sendMail(mailOptions, function(error, info){
      if(error){
          console.log(error);
      }else{
          console.log('Message sent: ' + info.response);
      }
  });
}

function sendBalanceNotificationMail(exchange, minimumPresentValue, presentValue, loanAsset, counterAsset, totalLoans, notificationThreshold, recipient, trademoreID){
  var date = new Date;
  var maintenancePercentage = 100*(1 + notificationThreshold);
  presentValue = Number(presentValue);
  minimumPresentValue = Number(minimumPresentValue);
  var minimumDeposit = Math.max(0, (minimumPresentValue - presentValue));

  var subject = "TRADEMORE WARNING, PLEASE DEPOSIT TO YOUR ACCOUNT: the value of your account on " + exchange + " has fallen below the maintenance margin level.\n";

  var message = "<html><body>"
  message += "<div>The current combined value of your " + loanAsset + " balance and your " + counterAsset + " balance has fallen below the required amount.</div><br></br>";
  message += "<div>Total value of outstanding loans on " + exchange + " = " + totalLoans + loanAsset + "</div><br></br>";
  message += "<div>Required maintenance value = total_loans * " + maintenancePercentage + "% = " + minimumPresentValue.toFixed(8) + loanAsset + "</div><br></br>";
  message += "<div>Actual total combined value of your account = " + presentValue.toFixed(8) + loanAsset + "</div><br></br>";
  message += "<div>Your account number = " + trademoreID + "</div><br></br>";
  message += "<div><b>Please deposit at least " + minimumDeposit.toFixed(8) + loanAsset +" to your account to increase the value above the maintenance requirement.</b></div><br></br>";
  message += "</body></html>";

  //throttle frequency of emails
  if(date.getTime() > this.lastMailSentTime + this.mailFrequency){
    console.log("Sending balance notification email to " + recipient + " for user: " + trademoreID);

    var mailOptions = {
        from: this.sender,
        to: recipient,
        subject: subject,
        html: message
    };

    // send mail with defined transport object
    this.transporter.sendMail(mailOptions, function(error, info){
        if(error){
            console.log(error);
        }else{
            console.log('Message sent: ' + info.response);
        }
    });

    this.lastMailSentTime = date.getTime();

  } else {
    console.log("Suppressed client balance notification email");
  }
}

module.exports = emailSender;
