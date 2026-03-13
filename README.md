# INDUCTA — Full Stack E-Commerce
### Node.js + Express · Firebase Firestore · Razorpay Payments

---

## What's Inside

```
inducta/
├── backend/
│   ├── server.js              ← Express app entry point
│   ├── config/
│   │   ├── firebase.js        ← Firebase Admin SDK init
│   │   └── razorpay.js        ← Razorpay SDK init
│   ├── middleware/
│   │   └── auth.js            ← JWT authentication middleware
│   ├── routes/
│   │   ├── auth.js            ← Register, Login, Profile
│   │   ├── products.js        ← Product listing + seeding
│   │   ├── payment.js         ← Razorpay order + verification
│   │   └── orders.js          ← Order history
│   ├── utils/
│   │   └── email.js           ← Order confirmation emails
│   ├── .env.example           ← Copy this to .env
│   └── package.json
└── frontend/
    └── index.html             ← Complete frontend (single file)
```

---

## Step 1 — Firebase Setup (10 minutes)

1. Go to **https://console.firebase.google.com**
2. Click **"Add Project"** → name it `inducta` → Continue
3. **Disable** Google Analytics (not needed) → Create Project
4. In the left sidebar → **Firestore Database** → Create Database
   - Choose **"Start in test mode"** (you'll lock it down later)
   - Select region: **asia-south1 (Mumbai)**
5. Go to **Project Settings** (gear icon) → **Service Accounts**
6. Click **"Generate New Private Key"** → Download the JSON file
7. Open the JSON file — you'll copy values from it into `.env`

---

## Step 2 — Razorpay Setup (5 minutes)

1. Go to **https://razorpay.com** → Sign Up (free)
2. Complete basic KYC (takes 1–2 days for live mode)
3. Go to **Settings → API Keys → Generate Test Key**
4. Copy the **Key ID** and **Key Secret**
5. For Webhooks (optional but recommended):
   - Settings → Webhooks → Add New Webhook
   - URL: `https://yourdomain.com/api/payment/webhook`
   - Select events: `payment.captured`, `payment.failed`

> **Test mode works instantly** — no KYC needed to test payments.
> Use card number `4111 1111 1111 1111`, any future date, any CVV.

---

## Step 3 — Backend Setup

```bash
cd inducta/backend

# Install dependencies
npm install

# Also install bcryptjs (needed for auth)
npm install bcryptjs

# Copy environment file
cp .env.example .env
```

Now open `.env` and fill in your values:

```env
PORT=5000
NODE_ENV=development
JWT_SECRET=make_this_a_long_random_string_at_least_64_chars

# From your Firebase service account JSON:
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id
FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com

# From Razorpay Dashboard:
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_secret_here

# Gmail (create an App Password at myaccount.google.com/apppasswords)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your@gmail.com
EMAIL_PASS=your_16_char_app_password
EMAIL_FROM=INDUCTA <noreply@inducta.in>

FRONTEND_URL=http://localhost:3000
```

---

## Step 4 — Seed Products into Firebase

Start the backend, then run this **once** to populate your products:

```bash
# Start the server
npm run dev

# In a new terminal, seed products:
curl -X POST http://localhost:5000/api/products/seed
```

You should see: `✅ 8 products seeded to Firestore.`

---

## Step 5 — Run the Frontend

Open `frontend/index.html` directly in your browser.
The frontend talks to `http://localhost:5000/api` by default.

> To change the backend URL, edit line 1 of the `<script>` in `index.html`:
> ```js
> const API = 'http://localhost:5000/api';
> ```

---

## Step 6 — Test the Full Flow

1. Open `frontend/index.html` in browser
2. Click **Sign In** → Create an account
3. Add products to cart
4. Checkout → fill delivery details
5. Select **"Pay Online via Razorpay"**
6. Use test card: `4111 1111 1111 1111` | Expiry: any future date | CVV: any 3 digits
7. Payment goes through → Order confirmed → Email sent ✅

---

## Deploying to Production

### Backend — Railway (easiest, free tier available)
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```
Set all your `.env` variables in Railway's dashboard under **Variables**.

### Frontend
Upload `frontend/index.html` to:
- **Netlify**: drag and drop the file at netlify.com
- **Vercel**: `vercel deploy`
- **GitHub Pages**: push to a repo and enable Pages

Update `const API = 'https://your-railway-url.railway.app/api'` in `index.html`.

### Go Live with Razorpay
1. Complete KYC on Razorpay dashboard
2. Switch from `rzp_test_` keys to `rzp_live_` keys in production `.env`

---

## API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Create account |
| POST | `/api/auth/login` | No | Sign in, get JWT |
| GET | `/api/auth/me` | ✅ Yes | Get profile |
| PUT | `/api/auth/me` | ✅ Yes | Update profile |
| POST | `/api/auth/me/addresses` | ✅ Yes | Add address |
| GET | `/api/products` | No | List products |
| GET | `/api/products/:id` | No | Single product |
| POST | `/api/products/seed` | No | Seed products (run once) |
| POST | `/api/payment/create-order` | ✅ Yes | Create Razorpay order |
| POST | `/api/payment/verify` | ✅ Yes | Verify payment |
| POST | `/api/payment/webhook` | No | Razorpay webhook |
| GET | `/api/orders` | ✅ Yes | Your order history |
| GET | `/api/orders/:id` | ✅ Yes | Single order |

---

## Security Features Already Built In

- ✅ Passwords hashed with **bcrypt** (12 rounds)
- ✅ JWT tokens expire in **7 days**
- ✅ Prices **re-verified server-side** (frontend can't fake prices)
- ✅ Razorpay signature **HMAC verification** (prevents payment tampering)
- ✅ **Rate limiting** on all routes (100 req/15min, 10 on auth)
- ✅ **Helmet.js** secure HTTP headers
- ✅ Users can only view **their own orders**
- ✅ Input validation on all endpoints via **express-validator**

---

## Need Help?

Common issues:

**"Cannot connect to backend"** — Make sure `npm run dev` is running and `const API` in `index.html` points to the right URL.

**Firebase permission denied** — Check your service account JSON values are correctly copied into `.env`. The `FIREBASE_PRIVATE_KEY` needs the `\n` characters preserved.

**Razorpay modal not opening** — Make sure you're using test keys (`rzp_test_`) and the Razorpay SDK script is loading (requires internet connection).

**Emails not sending** — Use a Gmail **App Password** (not your regular password). Enable 2FA on Gmail first, then generate at myaccount.google.com/apppasswords.
