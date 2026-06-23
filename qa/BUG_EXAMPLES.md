# Bug Reports — About & Connect Pages

---

## Bug Report 1: Desktop content overflows without scroll on About & Connect pages

| Field | Value |
|---|---|
| **Bug ID** | BUG-01 |
| **Severity** | Medium |
| **Priority** | P1 |
| **Status** | Open |
| **Found By** | QA Lead |
| **Module** | About & Connect components |
| **Environment** | Desktop Chrome 120, macOS 14, 1920x1080 |
| **Build** | v1.0 (feature branch) |

### Description
On desktop viewports (>= 1024px), the content area in both About and Connect pages does not have `overflow-y-auto` enabled. When the content exceeds the available viewport height, excess content is clipped and inaccessible via scrolling. The mobile layout is unaffected because it applies `overflow-y-auto` via the `isMobile` conditional.

### Steps to Reproduce
1. Open the app on a desktop browser at 1920x1080
2. Navigate to `/about` (or `/connect`)
3. Observe the bottom of the content area when more content exists than the viewport can display

### Expected Result
The content area should scroll independently with the custom scrollbar styling (as seen on the AllTracks page), revealing all content.

### Actual Result
Content that extends below the viewport is hidden and cannot be scrolled to. No scrollbar appears.

### Root Cause
The desktop branch of the inner content `<div>` uses `overflow-x-hidden` but does not set `overflow-y-auto` or a `max-height`. The fixed-position parent constrains the visible area, but the inner div has no scroll mechanism.

### Suggested Fix
Add `overflow-y-auto max-h-[calc(100vh-22rem)]` to the desktop layout (matching the mobile `overflow-y-auto` behavior) and wrap content with `.custom-scrollbar` for consistent styling.

---

## Bug Report 2: Navigation bar does not highlight the currently active page

| Field | Value |
|---|---|
| **Bug ID** | BUG-02 |
| **Severity** | Low |
| **Priority** | P3 |
| **Status** | Open |
| **Found By** | Designer |
| **Module** | Nav component |
| **Environment** | All browsers, all viewports |
| **Build** | v1.0 (feature branch) |

### Description
The navigation bar has no visual indicator for the currently active page. When the user navigates to `/about`, the ">About" link appears identical to all other nav links. This is a pre-existing issue across all routes, but is exacerbated now that `/about` and `/connect` are real pages the user is expected to visit.

### Steps to Reproduce
1. Open the app and navigate to `/about`
2. Observe the ">About" link in the navigation bar
3. Compare it visually to ">Singles", ">Albums", etc.

### Expected Result
The active page's nav link should be visually distinct (e.g., brighter text, different background, or an underline indicator) to help the user understand their current location.

### Actual Result
All nav links look identical regardless of the current route. The user has no visual feedback for which page they are on.

### Root Cause
The `Nav` component does not read or compare the current route (`window.location.pathname`) when rendering link styles. All `navItemClass` values are identical.

### Suggested Fix
Read the current pathname in the Nav component (via `useState` + `popstate` listener) and conditionally apply a different class (e.g., `text-white font-bold` vs `text-white/60`) to the matching link.

---

## Bug Report 3: Contact form loses user input on failed Formspree submission

| Field | Value |
|---|---|
| **Bug ID** | BUG-03 |
| **Severity** | Medium |
| **Priority** | P1 |
| **Status** | Open |
| **Found By** | QA Lead |
| **Module** | Connect component — contact form |
| **Environment** | Chrome 120, macOS 14, Slow 3G throttled |
| **Build** | v1.0 (feature branch) |

### Description
When the Formspree submission fails (network error or endpoint unreachable), the form displays an error message but clears all user-entered field values. The user is forced to retype their name, email, and message before retrying. This creates a poor user experience, especially on slow or unstable connections.

### Steps to Reproduce
1. Open the app and navigate to `/connect`
2. Fill in Name: "Jane Doe", Email: "jane@example.com", Message: "Hello from the test"
3. Disconnect the network (DevTools > Network > Offline)
4. Click the Submit button
5. Wait for the error state to display
6. Observe the form fields after the error message appears

### Expected Result
After a failed submission, the error message should be shown but the form fields should retain their previously entered values so the user can retry without retyping.

### Actual Result
The form fields are cleared after the failure. The user sees an error message and empty fields, requiring them to re-enter all information.

### Root Cause
The form's state management resets the field values to empty strings in both the success and error handlers instead of preserving them on failure.

### Suggested Fix
In the form submission error handler, do not reset the field state. Only reset fields in the success handler. Alternatively, use a `submitting` boolean to disable inputs during submission without unmounting/remounting them, so their values are naturally preserved.
