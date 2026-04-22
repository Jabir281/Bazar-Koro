import sgMail from '@sendgrid/mail';
import { env } from './env.js';

sgMail.setApiKey(env.sendgridApiKey);

async function testSendGrid() {
  try {
    console.log('Testing SendGrid configuration...');
    console.log('API Key (first 10 chars):', env.sendgridApiKey.substring(0, 10) + '...');
    console.log('From Email:', env.fromEmail);

    // Test single email
    const singleMsg = {
      to: 'test@example.com',
      from: env.fromEmail,
      subject: 'SendGrid Single Test',
      text: 'This is a test email from Bazar Koro',
      html: '<strong>This is a test email from Bazar Koro</strong>',
    };

    console.log('Sending single test email...');
    const singleResult = await sgMail.send(singleMsg);
    console.log('✅ Single email test successful!');
    console.log('Response:', singleResult);

    // Test multiple emails (like newsletter does)
    const multipleMsg = {
      to: ['sadit.arshad@gmail.com', 'sadit.arshad.sakib@g.bracu.ac.bd'],
      from: env.fromEmail,
      subject: 'SendGrid Multiple Test',
      text: 'This is a test email from Bazar Koro',
      html: '<strong>This is a test email from Bazar Koro</strong>',
    };

    console.log('Sending multiple test emails...');
    const multipleResult = await sgMail.sendMultiple(multipleMsg);
    console.log('✅ Multiple email test successful!');
    console.log('Response:', multipleResult);

  } catch (error: any) {
    console.error('❌ SendGrid test failed:');
    console.error('Error message:', error.message);
    if (error.response) {
      console.error('SendGrid response:', error.response.body);
    }
  }
}

testSendGrid();