// Simple storefront logic. Place products.json in same folder.
const SHIPPING = 99;
let products = [];
let cart = {};

document.getElementById('year').textContent = new Date().getFullYear();

async function loadProducts(){
  const res = await fetch('products.json');
  products = await res.json();
  renderProducts();
  renderCart();
}

function renderProducts(){
  const el = document.getElementById('products');
  el.innerHTML = '';
  products.forEach(p=>{
    const div = document.createElement('div');
    div.className = 'product';
    div.innerHTML = `
      <img src="${p.image}" alt="${p.title}" />
      <h4>${p.title}</h4>
      <p class="price">₹${p.price}</p>
      <p class="muted">${p.short}</p>
      <div style="margin-top:auto;display:flex;gap:8px">
        <button class="btn" onclick="addToCart('${p.sku}')">Add to cart</button>
      </div>
    `;
    el.appendChild(div);
  });
}

function addToCart(sku){
  const p = products.find(x=>x.sku===sku);
  if(!p) return;
  cart[sku] = cart[sku] ? cart[sku]+1 : 1;
  renderCart();
}

function renderCart(){
  const el = document.getElementById('cartItems');
  el.innerHTML = '';
  let subtotal = 0;
  Object.keys(cart).forEach(sku=>{
    const qty = cart[sku];
    const p = products.find(x=>x.sku===sku);
    const lineTotal = p.price * qty;
    subtotal += lineTotal;
    const row = document.createElement('div');
    row.className = 'cart-item';
    row.innerHTML = `<div>${p.title} x ${qty}</div><div>₹${lineTotal}</div>`;
    el.appendChild(row);
  });
  const total = subtotal ? subtotal + SHIPPING : 0;
  document.getElementById('total').textContent = `₹${total}`;
  document.getElementById('shipping').textContent = subtotal ? `₹${SHIPPING}` : '₹0';
}

document.getElementById('checkoutBtn').addEventListener('click', async ()=>{
  // Basic guard
  if(Object.keys(cart).length===0){ alert('Cart is empty'); return; }
  // Build order payload
  const items = Object.keys(cart).map(sku=>{
    const p = products.find(x=>x.sku===sku);
    return {sku, title:p.title, qty:cart[sku], price:p.price};
  });
  const order = {
    orderId: 'KIVORD-' + Date.now(),
    items,
    amount: items.reduce((s,i)=>s + i.price*i.qty, 0) + SHIPPING,
    currency: 'INR',
    shipping: {method:'Flat', cost:SHIPPING},
    customer: {name:'Guest', email:'guest@example.com', phone:''}
  };

  // Call server to create cashfree order / payment link
  try {
    const res = await fetch('/api/create-order', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify(order)
    });
    const data = await res.json();
    if(data.checkout_url){
      window.location.href = data.checkout_url;
    } else {
      alert('Payment error: ' + (data.message || 'No checkout URL returned'));
      console.error(data);
    }
  } catch(err){
    console.error(err);
    alert('Network error calling server. See console.');
  }
});

document.getElementById('contactForm').addEventListener('submit', async (e)=>{
  e.preventDefault();
  alert('Thank you — we will contact you shortly.');
  e.target.reset();
});

loadProducts();
