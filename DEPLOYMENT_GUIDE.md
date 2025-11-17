# 🚀 Deployment Guide - Supabase Integration

This guide covers deploying your app with Supabase to various platforms.

---

## 📋 **Pre-Deployment Checklist**

- [x] Supabase project created
- [x] Database tables created (run `supabase-schema.sql`)
- [x] Environment variables configured locally
- [ ] Environment variables set in deployment platform
- [ ] Build tested locally (`npm run build`)
- [ ] Deployment platform configured

---

## 🔑 **Required Environment Variables**

You **must** set these in your deployment platform:

```
NEXT_PUBLIC_SUPABASE_URL=https://hsdldrvsanmviuawdckp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

**⚠️ Important:** These are public variables (safe to expose in client-side code)

---

## 🌐 **Vercel Deployment (Recommended for Next.js)**

### Step 1: Install Vercel CLI (Optional)
```bash
npm i -g vercel
```

### Step 2: Deploy via Vercel Dashboard

1. **Go to:** https://vercel.com
2. **Import your Git repository:**
   - Connect GitHub/GitLab/Bitbucket
   - Select your repository
   - Click "Import"

3. **Configure Project:**
   - Framework Preset: **Next.js** (auto-detected)
   - Root Directory: `./` (default)
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)

4. **Add Environment Variables:**
   - Go to **Settings** → **Environment Variables**
   - Add:
     - `NEXT_PUBLIC_SUPABASE_URL` = `https://hsdldrvsanmviuawdckp.supabase.co`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `your_anon_key_here`
   - Select **Production**, **Preview**, and **Development**
   - Click **Save**

5. **Deploy:**
   - Click **Deploy**
   - Wait for build to complete
   - Your app will be live at `https://your-app.vercel.app`

### Step 3: Deploy via CLI (Alternative)

```bash
# Login to Vercel
vercel login

# Deploy
vercel

# Set environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY

# Deploy to production
vercel --prod
```

### Step 4: Verify Deployment

1. Visit your deployed URL
2. Test the Supabase connection:
   - Go to: `https://your-app.vercel.app/api/test-supabase`
   - Should return: `{"success": true, "tables": "ready"}`

---

## 🟢 **Netlify Deployment**

### Step 1: Deploy via Netlify Dashboard

1. **Go to:** https://app.netlify.com
2. **Add new site** → **Import an existing project**
3. **Connect to Git:**
   - Select your Git provider
   - Choose your repository

4. **Build Settings:**
   - Build command: `npm run build`
   - Publish directory: `.next`
   - **⚠️ Note:** For Next.js, you may need a `netlify.toml` file (see below)

5. **Environment Variables:**
   - Go to **Site settings** → **Environment variables**
   - Add:
     - `NEXT_PUBLIC_SUPABASE_URL` = `https://hsdldrvsanmviuawdckp.supabase.co`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `your_anon_key_here`

6. **Deploy:**
   - Click **Deploy site**
   - Wait for build

### Step 2: Create netlify.toml (Optional)

Create `netlify.toml` in project root:

```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

---

## 🐳 **Docker Deployment**

### Step 1: Create Dockerfile

```dockerfile
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT 3000
CMD ["node", "server.js"]
```

### Step 2: Update next.config.mjs

Add to `next.config.mjs`:
```javascript
output: 'standalone',
```

### Step 3: Build and Run

```bash
# Build
docker build -t engineer-finder .

# Run with environment variables
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=https://hsdldrvsanmviuawdckp.supabase.co \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key \
  engineer-finder
```

---

## ☁️ **Other Platforms**

### Railway
1. Connect GitHub repository
2. Add environment variables in dashboard
3. Deploy automatically on push

### Render
1. Create new Web Service
2. Connect repository
3. Set environment variables
4. Build command: `npm run build`
5. Start command: `npm start`

### AWS Amplify
1. Connect repository
2. Build settings: `npm run build`
3. Add environment variables in console
4. Deploy

---

## ✅ **Post-Deployment Verification**

### 1. Test Supabase Connection
```bash
curl https://your-app-domain.com/api/test-supabase
```

Expected:
```json
{
  "success": true,
  "message": "Supabase connected successfully!",
  "connection": "working",
  "tables": "ready"
}
```

### 2. Test Authentication
- Visit login page
- Create test user in Supabase Dashboard
- Try logging in

### 3. Test Job Creation
- Login with test user
- Create a job
- Verify it appears in Supabase Dashboard

---

## 🔒 **Security Checklist**

- [x] Environment variables set in deployment platform (not in code)
- [x] `.env.local` in `.gitignore` (already done)
- [x] Only `NEXT_PUBLIC_*` variables exposed (safe for client)
- [ ] Supabase RLS policies enabled (already done)
- [ ] CORS configured in Supabase (if needed)

---

## 🐛 **Troubleshooting**

### Build Fails
- Check environment variables are set
- Verify `npm run build` works locally
- Check build logs for errors

### Supabase Connection Fails
- Verify environment variables in deployment platform
- Check Supabase project is active
- Test connection endpoint: `/api/test-supabase`

### Authentication Not Working
- Verify users exist in Supabase Dashboard
- Check Supabase auth settings
- Verify RLS policies are correct

---

## 📝 **Quick Reference**

### Environment Variables
```bash
NEXT_PUBLIC_SUPABASE_URL=https://hsdldrvsanmviuawdckp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

### Build Commands
```bash
npm run build  # Build for production
npm start      # Start production server
```

### Test Commands
```bash
npm run dev              # Development server
curl /api/test-supabase # Test Supabase connection
```

---

## 🎯 **Next Steps After Deployment**

1. ✅ Set up custom domain (optional)
2. ✅ Configure Supabase CORS (if needed)
3. ✅ Set up monitoring/analytics
4. ✅ Create production test users
5. ✅ Test all features in production

---

**🚀 Your app is ready to deploy!**

