// Node/Express server template for Cashfree integration (LIVE).
// IMPORTANT: This is a template. You MUST set env vars and confirm Cashfree API endpoints per their docs.
// Env vars: CASHFREE_MERCHANT_ID, CASHFREE_APP_ID, CASHFREE_SECRET, CASHFREE_ENV (prod OR test), RETURN_URL
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const crypto = require('crypto');
const app = express();
app.use(bodyParser.json());
const PORT = process.env.PORT || 3000;

const CASHFREE_MERCHANT_ID = process.env.CASHFREE_MERCHANT_ID || 'YOUR_MERCHANT_ID';
const CASHFREE_APP_ID = process.env.CASHFREE_APP_ID || 'YOUR_APP_ID';
const CASHFREE_SECRET = process.env.CASHFREE_SECRET || 'YOUR_SECRET';
const CASHFREE_ENV = process.env.CASHFREE_ENV || 'test'; // 'prod' for live
const RETURN_URL = process.env.RETURN_URL || 'https://yourdomain.com/payment-success';

function cashfreeBase(){
  // Update endpoints if Cashfree changes API. Confirm with Cashfree docs.
  return CASHFREE_ENV === 'prod' ? 'https://api.cashfree.com' : 'https://sandbox.cashfree.com';
}

// Create an order / payment link at Cashfree and return checkout_url
async function createCashfreeOrder(order){
  // Example uses Cashfree's "create order" endpoint. Confirm exact body & headers from Cashfree docs.
  const base = cashfreeBase();
  const url = base + '/pg/orders'; // verify with current docs

  // Build payload (example fields; adapt to docs)
  const payload = {
    order_id: order.orderId,
    order_amount: order.amount.toString(),
    order_currency: order.currency || 'INR',
    customer_details: {
      customer_id: order.orderId,
      customer_email: order.customer.email || '',
      customer_phone: order.customer.phone || '',
      customer_name: order.customer.name || ''
    },
    return_url: RETURN_URL
  };

  // Some Cashfree APIs expect headers like 'x-client-id' / 'x-client-secret'
  const headers = {
    'Content-Type':'application/json',
    'x-client-id': CASHFREE_APP_ID,
    'x-client-secret': CASHFREE_SECRET
  };

  // NOTE: If Cashfree requires a different auth method (signature, token), change this call accordingly.
  try{
    const resp = await axios.post(url, payload, {headers});
    // Inspect resp.data and return the checkout link/url as per Cashfree response shape.
    // Example: resp.data.payment_link or resp.data.data.payment_link
    if(resp.data && (resp.data.payment_link || (resp.data.data && resp.data.data.payment_link))){
      return {
        success:true,
        checkout_url: resp.data.payment_link || resp.data.data.payment_link,
        raw: resp.data
      };
    } else {
      return {success:false, message:'Unexpected response', raw:resp.data};
    }
  }catch(err){
    console.error('Cashfree create order error', err.response ? err.response.data : err.message);
    return {success:false, message: err.message, raw: err.response ? err.response.data : null};
  }
}

app.post('/api/create-order', async (req, res) => {
  const order = req.body;
  if(!order || !order.orderId || !order.amount) return res.status(400).json({message:'Invalid order'});
  // TODO: persist order to DB here (recommended)
  const result = await createCashfreeOrder(order);
  if(result.success){
    return res.json({checkout_url: result.checkout_url});
  } else {
    return res.status(500).json({message: result.message, raw: result.raw});
  }
});

// Webhook endpoint (Cashfree will POST payment status here)
app.post('/api/webhook', (req,res)=>{
  // Cashfree may send a signature header — verify it using your secret.
  // Example verification (adapt to Cashfree's webhook docs):
  const signature = req.headers['x-webhook-signature'] || req.headers['x-cf-signature'];
  const body = JSON.stringify(req.body || {});
  // Compute HMAC
  const expected = crypto.createHmac('sha256', CASHFREE_SECRET).update(body).digest('hex');
  if(signature && signature !== expected){
    console.warn('Webhook signature mismatch');
    return res.status(400).send('invalid signature');
  }
  // Process the webhook: update order status, send email, etc.
  console.log('Webhook received:', req.body);
  res.send('OK');
});

app.use(express.static('public'));

app.listen(PORT, ()=> console.log(`Server running on ${PORT}`));
