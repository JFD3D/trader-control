var nodemailer = require('nodemailer');

var emailSender = function(sender, password, service) {
    this.transporter = setupTransporter(sender, password, service);
    this.sendAlertMail = sendAlertMail;
    this.sender = sender;
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

module.exports = emailSender;
