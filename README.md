# 🇮🇳 Government Scheme Notifier

A responsive web app to browse and track Indian government welfare scheme deadlines with custom alarms.

**Live Demo:** `https://YOUR-USERNAME.github.io/govt-scheme-notifier/login.html`

**Login:** `admin` / `1234`

---

## 📁 Project Structure

```
govt-scheme-notifier/
├── index.html          ← Home (slider + sector cards)
├── login.html          ← Login page
├── agriculture.html
├── education.html
├── employment.html
├── health.html
├── housing.html
├── women.html
├── .nojekyll           ← Required for GitHub Pages
│
├── css/
│   └── styles.css
│
└── js/
    ├── auth.js          ← Login / logout / session
    ├── notifications.js ← Deadline badges & banner
    ├── alarms.js        ← Custom alarm system
    ├── search.js        ← Real-time search
    └── slider.js        ← Home carousel
```

---

## 🚀 Deploy to GitHub Pages

### Step 1 — Create a GitHub repo
1. Go to [github.com](https://github.com) → **New repository**
2. Name it `govt-scheme-notifier`
3. Set to **Public** → click **Create repository**

### Step 2 — Upload files
1. Click **uploading an existing file**
2. Drag the **entire folder contents** (all files including `.nojekyll`)
3. Click **Commit changes**

### Step 3 — Enable GitHub Pages
1. Go to **Settings** → **Pages**
2. Source: **Deploy from a branch**
3. Branch: **main** / folder: **/ (root)**
4. Click **Save**

### Step 4 — Open your site
```
https://YOUR-USERNAME.github.io/govt-scheme-notifier/login.html
```

> ⚠️ The `.nojekyll` file in the root is critical — without it, GitHub Pages will block your `js/` and `css/` folders.

---

## ✅ Features

- 🔐 Login system (localStorage)
- 🎠 Auto-advancing image carousel
- ⏰ Custom deadline alarms with sound
- 🔍 Real-time scheme search
- 📛 Urgency badges (critical / warning / safe / expired)
- 📱 Fully responsive (mobile → desktop)
- 🔔 Browser push notifications
