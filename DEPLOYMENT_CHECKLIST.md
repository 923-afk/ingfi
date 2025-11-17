# ✅ Deployment Checklist

Use this checklist before deploying your app with Supabase integration.

---

## 🔧 **Pre-Deployment**

### Code & Build
- [x] All code committed to Git
- [x] `npm run build` succeeds locally
- [x] No TypeScript errors
- [x] No linting errors
- [x] Supabase integration tested locally

### Database
- [x] Supabase project created
- [x] Database schema run (`supabase-schema.sql`)
- [x] All tables created successfully
- [x] RLS policies enabled
- [x] Test connection works (`/api/test-supabase`)

### Environment Variables
- [ ] `NEXT_PUBLIC_SUPABASE_URL` ready
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` ready
- [ ] Variables documented

---

## 🚀 **Deployment Platform Setup**

### Vercel (Recommended)
- [ ] Account created / logged in
- [ ] Repository connected
- [ ] Environment variables added:
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Build settings verified
- [ ] Deployed successfully

### Netlify
- [ ] Account created / logged in
- [ ] Repository connected
- [ ] Environment variables added
- [ ] `netlify.toml` configured
- [ ] Deployed successfully

### Docker
- [ ] Dockerfile created
- [ ] `.dockerignore` configured
- [ ] Environment variables set in deployment
- [ ] Image built successfully
- [ ] Container running

---

## ✅ **Post-Deployment Verification**

### Connection Test
- [ ] Visit: `https://your-app.com/api/test-supabase`
- [ ] Returns: `{"success": true, "tables": "ready"}`

### Authentication Test
- [ ] Login page loads
- [ ] Can create test user (or user exists)
- [ ] Can log in successfully
- [ ] Session persists

### Functionality Test
- [ ] Can create a job
- [ ] Job appears in Supabase Dashboard
- [ ] Can view jobs list
- [ ] Can assign professional to job
- [ ] Timeline updates correctly
- [ ] Data persists after refresh

### Security Check
- [ ] Environment variables not exposed in code
- [ ] `.env.local` in `.gitignore`
- [ ] RLS policies working
- [ ] Only authenticated users can access data

---

## 🔍 **Monitoring**

- [ ] Error tracking set up (optional)
- [ ] Analytics configured (optional)
- [ ] Logs accessible
- [ ] Supabase dashboard accessible

---

## 📝 **Quick Deploy Commands**

### Vercel
```bash
vercel --prod
```

### Netlify
```bash
netlify deploy --prod
```

### Docker
```bash
docker build -t engineer-finder .
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=... \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=... \
  engineer-finder
```

---

## 🆘 **If Something Goes Wrong**

1. **Check build logs** in deployment platform
2. **Verify environment variables** are set correctly
3. **Test Supabase connection** via `/api/test-supabase`
4. **Check Supabase Dashboard** - is project active?
5. **Review error messages** in browser console
6. **Check Supabase logs** in dashboard

---

**✅ Ready to deploy when all items are checked!**

