# CrossdaleArts Website

Official static website for **CrossdaleArts** online art workshops.

This project is built with plain HTML, CSS, and JavaScript (no framework/build step). It includes:
- Brand landing page
- Course listing page
- Two course detail pages
- Two Razorpay payment pages (embedded via iframe)
- Responsive image gallery slider

## 1. Project Overview

CrossdaleArts presents artist information, workshop details, and enrollment flows:
- `index.html` is the main home/brand page.
- `pages/courses.html` routes users into course detail pages.
- Course pages include descriptions, assets, and enrollment CTAs.
- Payment pages embed Razorpay-hosted payment form pages.

The project is intentionally lightweight and can be hosted on any static server.

## 2. Tech Stack

- HTML5
- CSS3
- Vanilla JavaScript
- Google Fonts (`Funnel Display`)
- Razorpay hosted payment page embeds (`rzp.io`)

No Node.js dependencies, package manager, bundler, or backend runtime are required.

## 3. Repository Structure

```text
CrossdaleArts/
|-- index.html
|-- style.css
|-- script.js
|-- README.md
|-- images/
|   |-- art1.jpg
|   |-- art2.jpg
|   |-- art3.jpg
|   |-- art4.jpg
|   |-- art5.jpg
|   `-- aom.webp
|-- pages/
|   |-- courses.html
|   |-- the-art-of-meaning.html
|   |-- fundamental-of-arts.html
|   |-- the-art-of-meaning-payment.html
|   `-- fundamental-of-arts-payment.html
`-- DUMP/ (archive/legacy files, not needed for production)
```

## 4. Page-by-Page Details

### `index.html`
- Brand navbar and tagline
- Artist statement
- Enrollment buttons linking to course pages
- About section
- Art expertise list
- Interactive gallery section
- Exhibitions + recognition section
- Footer

### `pages/courses.html`
- Central entry page for workshop navigation.

### `pages/the-art-of-meaning.html`
- Course detail page for "The Art of Meaning"
- Enrollment button links to:
  - `/pages/the-art-of-meaning-payment.html`
- Course image and downloadable details links

### `pages/fundamental-of-arts.html`
- Course detail page for "Fundamentals of Art"
- Enrollment button links to:
  - `/pages/fundamental-of-arts-payment.html`
- Course image and overview link

### Payment Pages
- `pages/the-art-of-meaning-payment.html`
- `pages/fundamental-of-arts-payment.html`

Each payment page embeds a Razorpay hosted page in an iframe.

## 5. Styling (`style.css`)

### Global
- Typography defaults to `Funnel Display`.
- Link underline removed, inherited color.
- Global hover/active glow interactions for links and buttons.

### Layout Sections
- Navbar
- Artist statement
- Enrollment block
- About section
- Expertise list
- Gallery slider
- Exhibitions / Recognition
- Footer
- Course page layout and CTA alignment

### Button/Link Interactions
Current global interactions:
- `a:hover` / `a:focus-visible`: text glow
- `button:hover` / `button:focus-visible`: box glow + slight lift
- `a:active` / `button:active`: pressed effect

## 6. Gallery Logic (`script.js`)

`script.js` powers the homepage slider:
- Creates slide nodes from `galleryImages`
- Supports responsive visible slide count:
  - <= 600px: 1 slide
  - <= 900px: 2 slides
  - > 900px: 3 slides
- Handles previous/next navigation and disabled states
- Recalculates transform and bounds on resize

Important: `galleryImages` currently references `images/art6.jpg`, but this file is not present in the repository.

## 7. Content and Link Customization Guide

### Update Navbar Links
Edit relevant `<a href="...">` values in:
- `index.html`
- `pages/*.html`

### Update Course Content
Edit:
- `pages/the-art-of-meaning.html`
- `pages/fundamental-of-arts.html`

Typical fields:
- Course title
- Tagline
- Instructor/authority name
- Overview paragraphs
- Download document URLs
- Course image (`#course-image`)

### Update Enrollment Flow
Course page enrollment button:
- `href="/pages/...-payment.html"`

Payment page iframe source:
- `<iframe src="https://rzp.io/rzp/...">`

Change the `src` to each course's own Razorpay payment link.

### Update Gallery Images
1. Add image files into `/images`.
2. Update `galleryImages` in `script.js`:
   - `src` path
   - `alt` text

### Update Contact Channels
Links currently include:
- Instagram
- WhatsApp
- Email

Update these in each page navbar if needed.

## 8. Running Locally

Because this is a static site, you can run it directly or with a local server.

### Option A: Open Directly
- Open `index.html` in browser.

### Option B: Python Static Server
From project root:

```bash
python -m http.server 8000
```

Then open:
- `http://localhost:8000`

Using a local server is recommended so root-relative links (`/style.css`, `/pages/...`) resolve consistently.

### Feedback Storage in Static Hosting
- Feedback list is fetched from `data/feedbacks.json`.
- New feedback submitted from the website is stored in the visitor's browser (`localStorage`) because static hosting cannot write files from client-side JavaScript.
- To publish feedbacks for all users, manually add entries to `data/feedbacks.json`.

## 9. Deployment

Deploy to any static host:
- Netlify
- Vercel (static setup)
- GitHub Pages
- Cloudflare Pages
- Firebase Hosting

### Build Settings
- Build command: none
- Publish directory: project root (`.`)

Ensure root-relative paths are supported by your host configuration.

## 10. Known Issues / Cleanup Backlog

1. Character encoding artifacts appear in some text (mojibake like `â€”`, `â€œ`, `â€™`) and should be normalized to UTF-8 characters.
2. `script.js` references `images/art6.jpg` which is missing.
3. There are duplicate/legacy files under `DUMP/`; exclude from deployment if not required.
4. Some pages duplicate navbar/footer markup; consider shared includes in future if migrating to a templating approach.

## 11. Security and Payment Notes

- Razorpay processing is handled on Razorpay-hosted pages embedded via iframe.
- Do not hardcode private API keys in this repository.
- Payment amount/metadata should be controlled in Razorpay dashboard/payment link configuration.

## 12. Maintenance Checklist

Before publishing updates:
1. Verify all internal links (`index`, `courses`, `course details`, `payment pages`).
2. Verify Razorpay iframe links are correct per course.
3. Confirm all image paths exist.
4. Test responsive layout on mobile widths.
5. Validate hover/click states for accessibility and readability.
6. Confirm contact links (Instagram/WhatsApp/email) are current.

## 13. Ownership

Brand: **CrossdaleArts**  
Purpose: Online art education and enrollment.
