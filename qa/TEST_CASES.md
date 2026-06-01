# Test Cases — About & Connect Pages

---

## Test Case 1: Happy Path — Full Feature Walkthrough

> **Type:** Happy Path
> **Priority:** P0
> **Assigned To:** QA Lead
> **Preconditions:** Convex backend has at least 3 tracks and 2 albums loaded. App is running on `npm run dev`. Formspree endpoint is configured and reachable.

### Steps

| Step | Action | Expected Result |
|---|---|---|
| 1 | Open the app in Chrome at `http://localhost:5173` | Page loads at `/latest` with no console errors |
| 2 | Click the ">About" link in the navigation bar | URL changes to `/about`. Page fades in with the standard entrance animation |
| 3 | Observe the page content | Artist biography text is displayed with `font-cutive`. Heading reads "About" in `font-cal-sans` |
| 4 | Observe the stats cards | Two cards appear showing the track count (e.g., "3") and album count (e.g., "2") with labels "Tracks" and "Albums" |
| 5 | Click the ">Connect" link in the navigation bar | URL changes to `/connect`. Page fades in with the entrance animation |
| 6 | Observe the social media platform links | Three platform links are visible: SoundCloud, YouTube, Bandcamp. Each shows an icon and platform name |
| 7 | Click the "SoundCloud" link | A new browser tab opens at the SoundCloud URL |
| 8 | Locate the contact form on the Connect page | Three fields are visible: Name, Email, Message, plus a Submit button |
| 9 | Fill in Name: "Jane Doe", Email: "jane@example.com", Message: "Love your tracks!" | All fields accept input without errors |
| 10 | Click the Submit button | Button changes to a sending/loading state (disabled, spinner or dimmed text). No double-clicks possible |
| 11 | Wait for the submission to complete | A success message appears (e.g., "Message sent successfully!"). Form fields reset to empty |
| 12 | Click the ">Latest" link in the navigation bar | Returns to `/latest`. All original content, player, and playlist function as before |

### Expected Outcome
Both pages render correctly with all content visible. Social links open in new tabs. Form submits successfully with proper loading and success states. Navigation is seamless. No console errors.

---

## Test Case 2: Sad Path — Convex Backend Unavailable

> **Type:** Sad Path
> **Priority:** P1
> **Assigned To:** QA Lead
> **Preconditions:** App is running. Formspree endpoint is configured but unreachable (simulate by disconnecting network or using an invalid Formspree form ID).

### Steps

| Step | Action | Expected Result |
|---|---|---|
| 1 | Open the app in Chrome and navigate to `/connect` | Connect page renders with social links and contact form |
| 2 | Fill in valid data: Name "Test User", Email "test@test.com", Message "Hello" | Fields accept input |
| 3 | Disconnect the network (DevTools > Network > Offline) | — |
| 4 | Click Submit | Button changes to sending/loading state |
| 5 | Wait for the request to fail | A clear error message appears inside the form (e.g., "Failed to send message. Please try again."). Button re-enables. Form fields retain their entered values (so the user doesn't have to retype everything) |
| 6 | Reconnect the network and click Submit again | This time the submission succeeds. Success message appears and form resets |

### Expected Outcome
The form gracefully handles network failure without losing user input. The error message is visible and descriptive. The user can retry and succeed once the network is restored.

---

## Test Case 3: Edge Case — Empty Catalogue (No Tracks, No Albums)

> **Type:** Edge Case
> **Priority:** P2
> **Assigned To:** QA Lead
> **Preconditions:** Convex backend has zero tracks and zero albums (empty database). App is running. Formspree endpoint is reachable.

### Steps

| Step | Action | Expected Result |
|---|---|---|
| 1 | Open the app in Chrome at `http://localhost:5173` | Page loads at `/latest` showing empty state |
| 2 | Navigate to `/about` | About page renders with stats cards showing **0** for both Tracks and Albums. Bio text renders normally |
| 3 | Verify the stats cards | Both cards display "0" in `font-cal-sans` — no broken layout, no missing text, no division-by-zero issues |
| 4 | Navigate to `/connect` | Connect page renders all social links and the contact form |
| 5 | Leave all form fields empty and click Submit | Form does not submit. HTML5 validation messages appear for required fields (or custom validation errors are shown) |
| 6 | Fill Name "A", Email "not-an-email", Message "Test" and click Submit | Form rejects the invalid email format. Validation message indicates "Please enter a valid email address" |
| 7 | Fill Name with 500+ character string, valid email, Message "Test" and click Submit | Form submits successfully or shows a character-limit error in the Name field (depending on implementation). No XSS or layout breakage |
| 8 | Submit a valid form, then immediately try to submit again | Success message is displayed. The form is reset. A second submission creates a new Formspree entry (no duplicate prevention beyond the reset) |

### Expected Outcome
Empty-catalogue edge case is handled gracefully. Form validation catches empty and invalid inputs. Long text does not break layout. The form is usable in every data state.

---

## Test Matrix Summary

| Test Case | Type | Browser | Data State | Key Focus |
|---|---|---|---|---|---|
| TC-01: Happy Path | Functional | Chrome, Firefox, Safari | Tracks ≥ 3, Albums ≥ 2 | Full feature walkthrough, form submission |
| TC-02: Form Submission Failure | Resilience | Chrome | Normal | Network failure during form submit |
| TC-03: Edge Cases | Validation / Edge Case | Chrome | Empty catalogue | Form validation, empty fields, XSS attempt |
