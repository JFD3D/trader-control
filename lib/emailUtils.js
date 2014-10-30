var nodemailer = require('nodemailer');

function sendAlertMail(subject, message){
  var mailOptions = {
      from: alertSender,
      to: alertRecipient,
      subject: subject,
      text: message
  };

  // send mail with defined transport object
  transporter.sendMail(mailOptions, function(error, info){
      if(error){
          console.log(error);
      }else{
          console.log('Message sent: ' + info.response);
      }
  });
}
