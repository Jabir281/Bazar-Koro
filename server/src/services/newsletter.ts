import sgMail from '@sendgrid/mail';
import mongoose from 'mongoose';
import Product from '../models/Product.js';
import { User } from '../models/User.js';
import { env } from '../env.js';

sgMail.setApiKey(env.sendgridApiKey);

interface NewsletterData {
  neighborhood: string;
  products: {
    name: string;
    description: string;
    price: number;
    imageUrl: string;
  }[];
}

export async function sendWeeklyNewsletter() {
  try {
    // Get all sponsored products from the last week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const sponsoredProducts = await Product.find({
      sponsored: true,
      createdAt: { $gte: oneWeekAgo }
    }).populate('storeId', 'name').limit(10); // Top 10, assuming by recency

    if (sponsoredProducts.length === 0) {
      console.log('No sponsored products this week');
      return;
    }

    // Get all buyers with neighborhoods
    const buyers = await User.find({
      roles: 'buyer',
      neighborhood: { $exists: true, $ne: null }
    });

    // Group buyers by neighborhood
    const neighborhoodGroups: { [key: string]: string[] } = {};
    buyers.forEach(buyer => {
      if (buyer.neighborhood) {
        if (!neighborhoodGroups[buyer.neighborhood]) {
          neighborhoodGroups[buyer.neighborhood] = [];
        }
        neighborhoodGroups[buyer.neighborhood].push(buyer.email);
      }
    });

    // For each neighborhood, send newsletter
    for (const [neighborhood, emails] of Object.entries(neighborhoodGroups)) {
      const products = sponsoredProducts.map(p => ({
        name: p.name,
        description: p.description,
        price: p.price,
        imageUrl: p.imageUrl,
      }));

      const html = generateNewsletterHTML(neighborhood, products);

      const msg = {
        to: emails,
        from: env.fromEmail,
        subject: `Weekly Sponsored Deals in ${neighborhood}`,
        html: html,
      };

      await sgMail.sendMultiple(msg);
      console.log(`Sent newsletter to ${emails.length} buyers in ${neighborhood}`);
    }
  } catch (error) {
    console.error('Error sending newsletter:', error);
  }
}

export async function sendTestNewsletter(emails: string[], neighborhood: string) {
  try {
    // Get all sponsored products (not limited to last week for testing)
    const sponsoredProducts = await Product.find({
      sponsored: true
    }).populate('storeId', 'name').limit(5); // Limit to 5 for testing

    if (sponsoredProducts.length === 0) {
      console.log('No sponsored products found');
      return;
    }

    const products = sponsoredProducts.map(p => ({
      name: p.name,
      description: p.description,
      price: p.price,
      imageUrl: p.imageUrl,
    }));

    const html = generateNewsletterHTML(neighborhood, products);

    const msg = {
      to: emails,
      from: env.fromEmail,
      subject: `TEST: Weekly Sponsored Deals in ${neighborhood}`,
      html: html,
    };

    console.log('Sending test newsletter with config:', {
      from: env.fromEmail,
      to: emails,
      subject: msg.subject,
      productCount: products.length
    });

    const result = await sgMail.sendMultiple(msg);
    console.log('SendGrid response:', result);
    console.log(`✅ Sent TEST newsletter to ${emails.length} email(s) in ${neighborhood}`);
  } catch (error: any) {
    console.error('❌ Error sending test newsletter:', error);
    console.error('SendGrid error details:', error.response?.body || error.message);
    throw error;
  }
}

function generateNewsletterHTML(neighborhood: string, products: NewsletterData['products']): string {
  const productList = products.map(p => `
    <div style="border: 1px solid #ddd; padding: 10px; margin: 10px 0;">
      <img src="${p.imageUrl}" alt="${p.name}" style="max-width: 200px;">
      <h3>${p.name}</h3>
      <p>${p.description}</p>
      <p><strong>Price: ৳${p.price}</strong></p>
    </div>
  `).join('');

  return `
    <html>
      <body>
        <h1>Weekly Sponsored Deals in ${neighborhood}</h1>
        <p>Check out the top sponsored products this week!</p>
        ${productList}
        <p>Happy shopping!</p>
        <p>Bazar Koro Team</p>
      </body>
    </html>
  `;
}