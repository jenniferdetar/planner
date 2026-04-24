# Investigation: Removing Login Requirement

## Bug Summary
The user requested to "Remove Login" from the application. Currently, the application uses MongoDB Realm for authentication, and users are redirected to `login.html` if they are not authenticated.

## Root Cause Analysis
1.  **Auth Enforcement**: `shared.js` contains a `requireAuth()` function that redirects users to `login.html` if `mongoApp.currentUser` is null.
2.  **Global Check**: Every page that includes `shared.js` runs a global authentication check on load.
3.  **Redundant Login Page**: `login.html` is a dedicated page for manual authentication, which is no longer desired.

## Affected Components
- `shared.js`: Contains `requireAuth()`, `getMongoClient()`, and the global auth check.
- `login.html`: The manual login page (to be removed).
- `index.html`, `planner.html`, `csea.html`, and other HTML files: These include `shared.js` and rely on its auth logic.

## Proposed Solution
1.  **Auto-Login in `shared.js`**: Modify `requireAuth()` to automatically perform login using the hardcoded `MONGO_USER` and `MONGO_PASS` credentials already present in `shared.js`.
2.  **Remove Redirects**: Eliminate all redirections to `login.html` in `shared.js`.
3.  **Cleanup `shared.js`**:
    *   Simplify `requireAuth()` to just ensure a client is available.
    *   Remove `checkIsLoginPage()` and related logic.
    *   Remove `logout()` functionality entirely as requested.
4.  **Delete `login.html`**: Completely remove the file from the repository.
5.  **Remove Logout UI**: Search for and remove any logout links or buttons in HTML files.

## Questions for the User
- Is it acceptable to use the hardcoded "jennifermsamples_db_user" for all users of the application? (User: Yes)
- Should the "Logout" functionality be removed entirely, or just redirected to the home page? (User: Removed)

## Implementation Notes
1.  **Modified `shared.js`**:
    *   Removed `checkIsLoginPage()` and `logout()` functions.
    *   Updated `requireAuth()` to perform auto-login via `getMongoClient()` if no current user exists, instead of redirecting to `login.html`.
    *   Simplified the global auth check to always call `requireAuth()` without checking the current page.
    *   Removed the "Logout" link from the dynamically injected dashboard header.
2.  **Deleted `login.html`**: The manual login page has been removed from the repository.
3.  **Cleaned up UI**: Verified that no other hardcoded "Logout" buttons or links exist in the HTML files.
