# Authentication Features

## Overview

This application includes enhanced authentication features for controlling user access and registration.

## Features

### 1. Signup Control

The application supports temporarily disabling new user registrations through an environment variable.

**Environment Variable:**

```bash
DISABLE_SIGNUPS=true
```

**When enabled:**

- The `/register` page redirects to `/login`
- The register server action returns a "signup_disabled" status
- The login page hides the "Sign up" link
- Users attempting to register see an error message: "New user registrations are currently disabled!"

**Default behavior:**

- When `DISABLE_SIGNUPS` is not set or set to `false`, registrations work normally

### 2. Login-Only Access

The application has been configured to require authentication for all pages.

**Behavior:**

- All unauthenticated users are redirected to `/login`
- Guest sessions are no longer created automatically
- The site only works for logged-in users
- The `/api/auth/guest` endpoint now redirects to `/login`

**Protected Routes:**

- All routes except `/login` and `/register` require authentication
- Authenticated users are redirected away from `/login` and `/register` to the home page

## Implementation Details

### Files Modified

1. **`lib/constants.ts`** - Added `isSignupDisabled` flag
2. **`app/(auth)/actions.ts`** - Added signup disabled check in register action
3. **`app/(auth)/register/page.tsx`** - Added redirect logic and error handling
4. **`app/(auth)/login/page.tsx`** - Conditionally hide signup link
5. **`middleware.ts`** - Updated to redirect unauthenticated users to login
6. **`app/(chat)/page.tsx`** - Redirect to login instead of guest session
7. **`app/(chat)/chat/[id]/page.tsx`** - Redirect to login instead of guest session
8. **`app/(auth)/api/auth/guest/route.ts`** - Redirect to login instead of creating guest sessions

### Environment Configuration

Add to your `.env.local` or `.env` file:

```bash
# Signup Control
# Set to "true" to disable new user registrations
DISABLE_SIGNUPS=false
```

## Usage

### To Disable Signups Temporarily

1. Set the environment variable:

   ```bash
   DISABLE_SIGNUPS=true
   ```

2. Restart your application

3. Users will no longer be able to register new accounts

### To Re-enable Signups

1. Set the environment variable:

   ```bash
   DISABLE_SIGNUPS=false
   ```

   Or remove the variable entirely.

2. Restart your application

3. New user registrations will work normally

## Security Considerations

- The signup control is enforced both client-side (for UX) and server-side (for security)
- All authentication checks happen on the server to prevent bypassing
- The middleware ensures unauthenticated users cannot access protected content
- Guest sessions are completely disabled to ensure only registered users can use the application
