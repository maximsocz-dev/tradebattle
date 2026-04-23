# 🏆 TradeBattle — Deployment Guide for Beginners

Welcome! This guide will get your TradeBattle website live on the internet in about 15 minutes.
No coding experience needed — just follow each step exactly.

---

## What you'll need (all free)
- A computer (Mac or Windows)
- Internet connection
- A GitHub account → sign up at https://github.com
- A Vercel account → sign up at https://vercel.com (use your GitHub to sign in)

---

## STEP 1 — Install Node.js

Node.js lets your computer run the app.

1. Go to https://nodejs.org
2. Click the big green **"LTS"** download button
3. Open the downloaded file and click through the installer (just keep clicking Next/Continue)
4. When it's done, restart your computer

**To check it worked:** Open Terminal (Mac) or Command Prompt (Windows) and type:
```
node --version
```
You should see something like `v20.x.x` — that means it worked! ✅

---

## STEP 2 — Install Git

Git lets you upload code to GitHub.

**Mac:** Git may already be installed. Type `git --version` in Terminal. If not, go to https://git-scm.com/download/mac

**Windows:** Download from https://git-scm.com/download/win — click through the installer with default settings.

---

## STEP 3 — Put this project on GitHub

1. Go to https://github.com and log in
2. Click the **"+"** button in the top right → **"New repository"**
3. Name it `tradebattle`
4. Leave everything else as default, click **"Create repository"**
5. GitHub will show you a page with setup instructions — **leave this tab open**

Now open Terminal (Mac) or Command Prompt (Windows):

```bash
# Navigate to where you downloaded/unzipped this project folder
# For example, if it's on your Desktop:
cd Desktop/tradebattle

# Set up git and push to GitHub
git init
git add .
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/tradebattle.git
git push -u origin main
```

⚠️ Replace `YOUR_USERNAME` with your actual GitHub username!

If asked for a password, use a GitHub Personal Access Token — create one at:
https://github.com/settings/tokens → Generate new token (classic) → check "repo" → copy the token and use it as the password.

---

## STEP 4 — Deploy to Vercel (get a live URL!)

1. Go to https://vercel.com and sign in with GitHub
2. Click **"Add New Project"**
3. You'll see your `tradebattle` repo — click **"Import"**
4. Vercel will auto-detect it's a React app
5. Click **"Deploy"** — don't change any settings

⏳ Wait about 1-2 minutes...

🎉 **You're live!** Vercel gives you a URL like:
`https://tradebattle-yourusername.vercel.app`

Share this URL with anyone in the world!

---

## STEP 5 (Optional) — Get a custom domain

Want `www.tradebattle.com` instead of the long Vercel URL?

1. Buy a domain at https://namecheap.com (~$10/year)
2. In Vercel → your project → Settings → Domains
3. Type your domain name and follow the instructions

---

## Making updates later

Whenever you change something in the code and want to update your website:

```bash
cd Desktop/tradebattle
git add .
git commit -m "update"
git push
```

Vercel automatically re-deploys within 1-2 minutes every time you push! ✨

---

## Need help?

- Vercel docs: https://vercel.com/docs
- Create React App docs: https://create-react-app.dev
- Node.js help: https://nodejs.org/en/docs

---

## Files in this project

```
tradebattle/
├── public/
│   └── index.html        ← The HTML shell (don't touch)
├── src/
│   ├── index.js          ← App entry point (don't touch)
│   └── App.js            ← THE GAME — all the code is here!
├── package.json          ← Project config
└── README.md             ← This file
```

The only file you'll ever need to edit is `src/App.js`.
