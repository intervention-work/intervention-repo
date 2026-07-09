# Hosting V2 on WordPress

The Next.js V2 site is built as a **static export** (HTML/CSS/JS) and embedded inside a WordPress page via an iframe. WordPress serves the files from `wp-content/uploads/v2/`.

## Artifact
- Zip: `intervention-v2-wordpress.zip` (project root, ~8.2 MB)
- Regenerate with: `npm run build` → re-zip the `out/` folder

## Build configuration (already applied)
- `next.config.ts` → `output: 'export'`, `trailingSlash: true`, `images.unoptimized: true`
- `src/app/page.tsx` → V2 is the root route
- V1/V2 switcher removed from nav

## Deployment steps

### 1. Install File Manager plugin
WP Admin → **Plugins → Add New** → search **"File Manager"** (by mndpsingh287) → Install → Activate.

### 2. Upload & extract the zip
- WP Admin → **WP File Manager**
- Navigate to `wp-content/uploads/`
- **New Folder** → name it `v2`
- Open `v2/` → **Upload** → select `intervention-v2-wordpress.zip`
- Right-click the zip → **Extract** → confirm
- Delete the zip

### 3. Verify it loads
Open: `https://YOURDOMAIN.com/wp-content/uploads/v2/index.html`
Should display V2.

### 4. Create the homepage that hosts V2
- WP Admin → **Pages → Add New** → Title: `Home`
- Top-right ⋮ menu → **Code editor**
- Paste:
  ```html
  <iframe src="/wp-content/uploads/v2/index.html"
          style="position:fixed;inset:0;width:100vw;height:100vh;border:0;z-index:99999"
          allow="autoplay; fullscreen"></iframe>
  ```
- **Publish**

### 5. Make it the front page
WP Admin → **Settings → Reading** → *Your homepage displays* = **A static page** → Homepage = **Home** → **Save Changes**.

### 6. Hide WP theme chrome
WP Admin → **Appearance → Customize → Additional CSS** → paste:
```css
body.home header, body.home footer,
body.home .site-header, body.home .site-footer,
body.home #wpadminbar { display: none !important; }
body.home { margin: 0 !important; padding: 0 !important; }
```
**Publish**.

### 7. Test
Visit `https://YOURDOMAIN.com/` in **incognito** → V2 should fill the screen.

## Updating after code changes
1. `npm run build`
2. `cd out && zip -qr ../intervention-v2-wordpress.zip . && cd ..`
3. In WP File Manager: delete contents of `wp-content/uploads/v2/`, re-upload zip, extract.

## Known caveats
- "Talk to us" form is UI-only — wire to Formspree or Contact Form 7.
- Autoplay sound may be blocked inside iframe by some browsers (user gesture required).
