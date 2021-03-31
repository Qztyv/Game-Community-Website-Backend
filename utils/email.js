const nodemailer = require('nodemailer');
const pug = require('pug');
const { htmlToText } = require('html-to-text');

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.name = user.name;
    this.url = url;
    this.from = `Nick Cowling <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      // production email like sendgrid
      return nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_PASSWORD
        }
      });
    }

    // transporter for development
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }

  async send(template, subject) {
    // render html from pug template
    const emailHTML = pug.renderFile(
      `${__dirname}/../views/email/${template}.pug`,
      {
        name: this.name,
        url: this.url,
        subject
      }
    );
    // define email option
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html: emailHTML,
      // some people prefer simple text over formatted html, and its also better
      // for email conversion rates
      text: htmlToText(emailHTML)
    };

    // create transport then send
    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to the best Game Community Website!');
  }

  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Forgot your password huh? (valid for 10 minutes only)'
    );
  }
};
