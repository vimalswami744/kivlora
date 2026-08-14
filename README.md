# Kivlora prototype — README

What’s included
- Frontend: index.html, styles.css, app.js, products.json
- Server template: server.js (Node/Express) to create orders and receive webhooks
- Assets: put your logo at assets/logo.png and product images at assets/products/*.jpg

Quick local run (frontend only)
1. Put files in a folder, e.g., /kivlora/.
2. Place logo image at /kivlora/assets/logo.png.
3. Open index.html in browser (works as static site). For server calls to work, run the Node server below.

Node server (example)
1. Install Node 18+ and run:
   npm init -y
   npm i express axios body-parser
2. Put server.js at project root.
3. Set environment variables:
   - CASHFREE_MERCHANT_ID
   - CASHFREE_APP_ID
   - CASHFREE_SECRET
   - CASHFREE_ENV = prod   (or test)
   - RETURN_URL = https://yourdomain.com/payment-success
4. Start server:
   node server.js
5. Serve frontend from /public (or adjust fetch URLs). Open http://localhost:3000 in browser.

Cashfree setup (live)
- Make sure your Cashfree account is production-ready and KYC completed.
- Provide me these values (prefer secure channel):
  - CASHFREE_MERCHANT_ID
  - CASHFREE_APP_ID
  - CASHFREE_SECRET
  - Webhook URL (set this in Cashfree dashboard): https://YOURSERVER/api/webhook
  - Return/redirect URL: https://YOURDOMAIN/payment-success
- After keys are set in env vars, create-order endpoint will call Cashfree. Confirm the exact API endpoint and headers from Cashfree docs (the server template includes a generic call — update if Cashfree requires different fields).

Deployment
- Quick free frontend hosting: GitHub Pages (static only). But for Cashfree live you need a backend — deploy server to Heroku/Render/Vercel/PlanetScale/Render.
- Recommended: Deploy Node server to Render or Heroku (they support environment vars).
- If you want, I can create a GitHub repo and push these files, or generate a ZIP and send it to you.

Next steps for me (I will do once you reply)
- If you want me to push to GitHub: give repo name (owner/repo) or tell me to create repo under my workspace and I’ll provide files for you to copy.
- Send Cashfree live keys securely or tell me you’ll paste them here (not recommended in public chat).
- If you want me to deploy the server for you, give deployment choice (Render / Heroku / Vercel) and provide access details.

Security note
- Do NOT paste secret keys publicly if you don’t want them exposed. Use GitHub secrets or send them privately.
