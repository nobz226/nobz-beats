# QA Plan — About & Connect Pages Feature

## 1. Feature Overview

**Project:** Nobz Beats — Single-page music catalogue and audio player
**Feature:** Replace placeholder "About" and "Connect" pages with full content pages
**Team:** Eduard Rotaru, Jess Wilson

### User Story

> **As a** fan visiting the Nobz Beats platform,
> **I can** view an About page with the artist's biography and discography stats, and a Connect page with social media links and a contact form powered by Formspree,
> **so that** I can learn about the artist, follow them on external platforms, and send them messages directly from the app.

---

## 2. Acceptance Criteria

### About Page (`/about`)

| ID | Criterion | Type |
|---|---|---|
| AC-01 | Page displays the artist biography text content | Functional |
| AC-02 | Page shows live discography statistics (track count, album count) pulled from the Convex database | Functional |
| AC-03 | Page matches the app's existing visual theme (dark background, `font-cal-sans` headings, `font-cutive` body, entrance fade animation) | UI |
| AC-04 | Page is responsive: stacks vertically on mobile (<= 1024px) with the same layout pattern as other pages | Responsive |
| AC-05 | Page scroll its content independently if it overflows (custom scrollbar) | Functional |
| AC-06 | Navigation via the ">About" link in the nav bar correctly routes to `/about` | Functional |
| AC-07 | The page entrance animation plays on first visit and on re-navigation | UI |

### Connect Page (`/connect`)

| ID | Criterion | Type |
|---|---|---|
| AC-08 | Page displays social media platform links (SoundCloud, Spotify, YouTube, Instagram, Twitter/X, Bandcamp) | Functional |
| AC-09 | Each link opens in a new tab (`target="_blank"`) with `rel="noopener noreferrer"` | Functional / Security |
| AC-10 | Page displays a contact form with Name, Email, and Message fields | Functional |
| AC-10a | Form validates that all required fields (name, email, message) are filled before submission | Functional |
| AC-10b | Email field validates that input is in a valid email format | Functional |
| AC-10c | Form submission sends data to the configured Formspree endpoint via POST | Functional |
| AC-10d | Form shows a loading/sending state while the submission is in progress | UI |
| AC-10e | Form displays a success message after Formspree accepts the submission | Functional |
| AC-10f | Form displays a clear error message if the Formspree submission fails (network error, endpoint down, etc.) | Functional |
| AC-10g | After successful submission, the form resets to its initial state | Functional |
| AC-11 | Page matches the app's existing visual theme | UI |
| AC-12 | Page is responsive on mobile | Responsive |
| AC-13 | Navigation via the ">Connect" link routes correctly to `/connect` | Functional |
| AC-14 | External links are accessible via keyboard navigation | Accessibility |
| AC-14a | Form fields have associated `<label>` elements for screen reader compatibility | Accessibility |
| AC-14b | Form submission success and error messages are announced to screen readers (ARIA live region) | Accessibility |

### General

| ID | Criterion | Type |
|---|---|---|
| AC-15 | Both pages render without JS errors in Chrome, Firefox, and Safari | Cross-browser |
| AC-16 | Page load times are under 2 seconds on a standard broadband connection | Performance |
| AC-17 | All text content is visible with sufficient contrast against the dark background | Accessibility |

---

## 3. Scope

### In Scope
- Building out the **About** component with artist bio + track/album stats from Convex
- Building out the **Connect** component with social links + Formspree contact form (name, email, message fields, validation, submission states)
- Updating `App.jsx` to pass track/album counts as props to `<About />`
- Responsive layout for both pages (mobile and desktop)
- Entrance animations consistent with existing pages
- External links opening in new tabs

### Out of Scope
- Custom backend for form submissions (Formspree handles this)
- CAPTCHA or spam protection (Formspree handles this)
- File attachments in the contact form
- Comment/disqus sections
- Multi-language / i18n support
- Analytics tracking
- SEO meta tags (single-page app, no SSR)

---

## 4. Test Environment

| Environment | Details |
|---|---|
| **Browser** | Chrome 120+, Firefox 120+, Safari 17+ |
| **Devices** | Desktop (1920x1080), Tablet (768x1024), Mobile (375x667) |
| **OS** | macOS 14+, iOS 17+, Android 14+ |
| **Backend** | Convex (development deployment) |
| **Third-party** | Formspree (live endpoint `https://formspree.io/f/YOUR_FORM_ID`) |
| **Frontend** | Vite dev server (`npm run dev`) |
| **Network** | Broadband (50 Mbps), Slow 3G (throttled) |

---

## 5. Test Strategy

| Type | Approach | Owner |
|---|---|---|
| **Functional Testing** | Manual verification of all acceptance criteria | QA Lead |
| **UI / Visual Testing** | Visual comparison against existing page patterns (Singles, Latest) | Designer |
| **Responsive Testing** | Test at 3 breakpoints: desktop (1920px), tablet (768px), mobile (375px) | QA Lead |
| **Form Submission Testing** | Fill + submit, slow network, invalid data, CORS errors | QA Lead |
| **Accessibility Testing** | Keyboard navigation, screen reader (VoiceOver), contrast ratios, form label association | Developer |
| **Cross-browser Testing** | Chrome, Firefox, Safari — smoke test all ACs | QA Lead |
| **Regression Testing** | Verify existing pages (Latest, Singles, Albums) still work after changes | All |

---

## 6. Risks & Mitigations

| Risk | Likelihood | Mitigation |
|---|---|---|
| Convex query failure causes stats to show 0 | Medium | Default prop values (`trackCount = 0`, `albumCount = 0`) prevent NaN |
| Social link URLs change after deployment | Low | Use constant config object — update one place |
| Mobile layout breaks due to CSS variable conflicts | Low | Follow exact pattern from existing components (Singles, Latest) |
| Navigation animation not replaying on revisit | Low | Use `key` prop or check animation reset behavior |
| Formspree endpoint is unreachable or CORS-blocked | Medium | Show a user-friendly error message inside the form; log the failure to console |
| User submits the form multiple times (double-click) | Medium | Disable the submit button and show a sending state immediately on first click |

---

## 7. Entry & Exit Criteria

### Entry Criteria
- Feature branch created from `main`
- About and Connect components implemented and passing code review
- App.jsx updated to pass data props
- Dev server builds without errors

### Exit Criteria
- All 3 test cases (Happy, Sad, Edge) pass
- All acceptance criteria verified
- 3 bug reports documented with severity and reproduction steps
- No P0 or P1 bugs open
- Formspree submission works end-to-end (tested against live endpoint)

---

## 8. Development & Testing Schedule (5 Days)

**Hours:** 10:00 – 19:00 each day (1h lunch break at 13:00–14:00)
**Team:** Eduard Rotaru (Developer), Jess Wilson (Designer), QA Lead

### Day 1 — Monday: Foundation & About Page

| Time | Activity | Owner | Deliverable |
|---|---|---|---|
| 10:00–10:30 | Sprint kickoff: review ACs, wireframes, Convex data shape | All | Shared understanding, task breakdown |
| 10:30–12:00 | Scaffold About component; draft bio content + stats cards markup | Developer | `About.jsx` with static structure |
| 12:00–13:00 | Wire stats cards to Convex (track/album counts via props from `App.jsx`) | Developer | Live stats rendering |
| 14:00–15:30 | Apply theme styles: dark surfaces, `font-cal-sans` / `font-cutive`, entrance animation | Designer | Themed About page |
| 15:30–16:30 | Responsive layout — desktop and mobile breakpoints | Developer | Responsive About page |
| 16:30–18:00 | Accessibility pass: labels, ARIA, keyboard nav, contrast | Developer | Screen-reader ready |
| 18:00–19:00 | Self-review, squash bugs, push branch | Developer | PR-ready branch |

### Day 2 — Tuesday: Connect Page

| Time | Activity | Owner | Deliverable |
|---|---|---|---|
| 10:00–11:00 | Review Day 1 feedback; merge About branch to feature branch | Developer | Clean baseline |
| 11:00–12:30 | Scaffold Connect component; social links grid + icon mapping | Developer | `Connect.jsx` with social links |
| 12:30–13:00 | Wire social link URLs from config constant; `target="_blank"` + `rel` attributes | Developer | Links open in new tabs |
| 14:00–16:00 | Build Formspree contact form: Name, Email, Message fields, validation, submit handler | Developer | Functional form |
| 16:00–17:00 | Form UX states: idle, sending, success, error, field retention | Developer | Full form lifecycle |
| 17:00–18:00 | Apply theme styles, responsive layout, entrance animation | Designer | Themed Connect page |
| 18:00–19:00 | Update `App.jsx` to pass `trackCount` / `albumCount` to About | Developer | `App.jsx` updated |

### Day 3 — Wednesday: Integration, Polish & Nav

| Time | Activity | Owner | Deliverable |
|---|---|---|---|
| 10:00–11:00 | Fix active nav-link highlighting (BUG-02) | Developer | Nav highlights current route |
| 11:00–12:30 | Fix desktop overflow scrolling on both pages (BUG-01) | Developer | Scrollable content at all breakpoints |
| 12:30–13:00 | Fix form field retention on failure (BUG-03) | Developer | Fields preserved on error |
| 14:00–15:30 | Cross-browser visual polish (Chrome, Firefox, Safari) | Designer | Consistent rendering |
| 15:30–17:00 | Accessibility deep-dive: VoiceOver flow, focus order, error announcements | Designer | ARIA live regions on form |
| 17:00–18:00 | Add `custom-scrollbar` class to desktop content areas | Developer | Consistent scrollbar style |
| 18:00–19:00 | Code review preparation; inline docs for new components | Developer | Review-ready code |

### Day 4 — Thursday: Testing & Bug Fixing

| Time | Activity | Owner | Deliverable |
|---|---|---|---|
| 10:00–11:00 | Test discovery walkthrough — review TC-01, TC-02, TC-03 | All | Test run plan |
| 11:00–13:00 | **TC-01 Happy Path** execution: full feature walkthrough (all 12 steps) | QA Lead | Pass/fail log |
| 14:00–15:30 | **TC-02 Sad Path** execution: Convex unavailable, network failure, Formspree down | QA Lead | Pass/fail log |
| 15:30–17:00 | **TC-03 Edge Cases** execution: empty catalogue, form validation, long text | QA Lead | Pass/fail log |
| 17:00–18:00 | Bug triage and assignment of any P0/P1 failures | All | Bug tracker updated |
| 18:00–19:00 | Fix high-severity bugs found during testing | Developer | Patches merged |

### Day 5 — Friday: Regression, Release & Handover

| Time | Activity | Owner | Deliverable |
|---|---|---|---|
| 10:00–11:00 | Regression test of unaffected pages (Latest, Singles, Albums, Player, Playlist) | QA Lead | Regression pass |
| 11:00–12:30 | Re-test fixed bugs (BUG-01, BUG-02, BUG-03) | QA Lead | Verified fixes |
| 12:30–13:00 | AC-15 cross-browser smoke test (Chrome, Firefox, Safari) | QA Lead | Cross-browser pass |
| 14:00–15:00 | Performance check: page load times < 2s (AC-16) | Developer | Performance pass |
| 15:00–16:00 | Final review against all acceptance criteria | All | Exit criteria met |
| 16:00–17:00 | Merge feature branch → `main`; deploy to Vercel preview | Developer | Preview deployment |
| 17:00–18:00 | Smoke test on Vercel preview URL | All | Production-equivalent green |
| 18:00–19:00 | Release sign-off; update QA docs with results | All | Release complete |

### Schedule Notes

- **Stand-ups (10:00–10:15):** Quick daily sync on blockers and priorities.
- **Lunch (13:00–14:00):** Mandatory disconnect — no commits or deployments.
- **Bug response SLA:** P0 within 2 hours, P1 within 4 hours, P2/P3 within next day.
- If Day 4 testing reveals P0 bugs, Day 5 morning is reallocated to fixing them; regression shifts to afternoon.
- The Formspree endpoint must be configured and verified by end of Day 1 for form testing on Day 4.
