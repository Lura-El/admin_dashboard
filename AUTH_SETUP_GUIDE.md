# SPA Authentication Flow Guide

This document describes how Laravel Sanctum session-based authentication is configured for the Vue 3 + Laravel SPA.

---

## Architecture Overview

The authentication system uses **Laravel Sanctum with session cookies**. The frontend is a Vue 3 SPA that communicates with a Laravel backend via HTTP requests. Authentication state is maintained through HTTP-only cookies.

```
Frontend (Vue 3)          HTTP Requests          Backend (Laravel)
  ├─ Login Page    ──────► POST /auth/login ────►  LoginController
  ├─ Auth Store    ◄───── Session Cookie ◄─────  (Sets SESSIONID)
  └─ Dashboard     ──────► GET /api/user ────►   Protected Route
                   ◄────── User Data ◄─────────  (auth:sanctum)
```

---

## Frontend Setup

### 1. Axios Configuration ([frontend/src/axios/api.js](frontend/src/axios/api.js))

```javascript
const api = axios.create({
  baseURL: 'http://localhost:8000',
  withCredentials: true,  // ✅ CRITICAL: Send cookies with every request
  headers: {
    "X-Requested-With": "XMLHttpRequest",
  },
})
```

**Key Points:**
- `baseURL` points to Laravel backend running on port 8000
- `withCredentials: true` ensures cookies are sent/received with requests
- Axios request interceptor extracts `XSRF-TOKEN` from cookies and adds it to headers
- Response interceptor redirects to login if session expires (401 response)

### 2. Auth Store ([frontend/src/stores/authStore.js](frontend/src/stores/authStore.js))

**State:**
- `user`: Stores authenticated user object
- `loading`: Boolean for login button disabled state
- `errors`: Validation errors from backend

**Getters:**
- `isAuthenticated`: Returns `true` if `user` exists (used by router guards)

**Actions:**

#### `login(credentials)` - 3 Step Process
```javascript
1. await api.get('/sanctum/csrf-cookie')  // Get CSRF token first
2. await api.post('/auth/login', credentials)  // Authenticate
3. const { data } = await api.get('/api/user')  // Fetch user
4. localStorage.setItem('user', JSON.stringify(data))  // Persist user
```

**Why 3 steps?**
- Step 1: Sanctum requires CSRF token before login
- Step 2: Laravel validates credentials and sets session cookie
- Step 3: Verify authenticated user data and populate store
- Step 4: Save to localStorage for persistence across page refreshes

#### `logout()` 
- Calls backend `POST /logout` (clears session cookie)
- Clears `user` from state and localStorage
- Redirects to login page

#### `fetchUser()`
- Called on app startup (App.vue onMounted)
- Attempts to fetch `/api/user` (protected route)
- If successful: Updates state and localStorage
- If 401 (session expired): Clears user and localStorage
- Allows automatic logout on session expiry

#### `restoreUser()`
- Called before `fetchUser()` on app startup
- Restores user from localStorage synchronously
- Prevents blank screen during server fetch

### 3. Router Guards ([frontend/src/router/index.js](frontend/src/router/index.js))

```javascript
router.beforeEach((to, from, next) => {
  const auth = useAuthStore()
  
  // Route requires auth but user not logged in → redirect to login
  if (to.meta?.requiresAuth && !auth.isAuthenticated) {
    return next({ name: 'login' })
  }
  
  // Route is guest-only (login) but user is logged in → redirect to dashboard
  if (to.meta?.guest && auth.isAuthenticated) {
    return next({ name: 'dashboard' })
  }
  
  next()
})
```

**Routes:**
- `/` (login) - `meta: { guest: true }` - only accessible if not logged in
- `/dashboard` - `meta: { requiresAuth: true }` - protected
- `/users` - `meta: { requiresAuth: true }` - protected
- `/reports` - `meta: { requiresAuth: true }` - protected

### 4. App Initialization ([frontend/src/App.vue](frontend/src/App.vue))

```javascript
onMounted(() => {
  auth.restoreUser()      // Instant: Restore from localStorage
  auth.fetchUser()        // Async: Validate session with server
})
```

**Flow on page load:**
1. Component mounts
2. Restore user from localStorage (instant, no blank screen)
3. Make API call to verify session is still valid
4. If valid: Keep user logged in, route guard allows access
5. If invalid (401): Clear localStorage, redirect to login

---

## Backend Setup

### 1. Database Configuration ([backend/.env](backend/.env))

```env
DB_CONNECTION=mysql
DB_HOST=db              # Docker service name (not localhost)
DB_PORT=3306
DB_DATABASE=admin
DB_USERNAME=laravel     # Non-root user created by MySQL
DB_PASSWORD=0098@my_gA
```

**Important:**
- `DB_HOST=db` uses Docker service name for inter-container communication
- Not `127.0.0.1` (localhost in containers refers to the container itself)

### 2. Login Route ([backend/routes/web.php](backend/routes/web.php))

```php
Route::post('/auth/login', LoginController::class);
```

- Sanctum CSRF cookie endpoint is auto-registered at `GET /sanctum/csrf-cookie`
- Login endpoint accepts email + password

### 3. Login Controller ([backend/app/Http/Controllers/Auth/LoginController.php](backend/app/Http/Controllers/Auth/LoginController.php))

```php
public function __invoke(LoginRequest $request)
{
    if (!Auth::attempt($request->only('email', 'password'))) {
        throw ValidationException::withMessages([
            'email' => ['The credentials you entered are incorrect.']
        ]);
    }

    $request->session()->regenerate();  // Regenerate session ID for security

    return response()->json([
        'message' => 'Login successful',
        'user' => Auth::user()
    ]);
}
```

**Flow:**
1. Validate credentials with `Auth::attempt()`
2. If valid: Regenerate session ID and return user
3. If invalid: Throw validation exception (422 response)
4. Laravel automatically sets `LARAVEL_SESSION` cookie in response

### 4. Protected Routes ([backend/routes/api.php](backend/routes/api.php))

```php
Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
```

**Middleware:**
- `auth:sanctum` checks for valid session cookie
- Returns authenticated user or 401 Unauthorized
- Frontend intercepts 401 and redirects to login

---

## Session Management Flow

### Login Sequence

```
Frontend                          Backend
   |                                 |
   |--- GET /sanctum/csrf-cookie --->|
   |<----- XSRF-TOKEN cookie --------|
   |                                 |
   |--- POST /auth/login ----------->|
   |<----- LARAVEL_SESSION cookie ---|
   |<----- User JSON response -------|
   |                                 |
   | Save to localStorage            |
   | Route guard allows access       |
```

### Authenticated Request Sequence

```
Frontend                          Backend
   |                                 |
   | (Include LARAVEL_SESSION cookie)|
   |--- GET /api/user ------------->|
   |<----- auth:sanctum validates ---|
   |<----- User JSON response -------|
```

### Session Expiry

```
Frontend                          Backend
   |                                 |
   | (Session cookie expired/invalid)|
   |--- GET /api/user ------------->|
   |<----- 401 Unauthorized --------|
   |                                 |
   | Response interceptor catches 401|
   | Clear localStorage              |
   | Redirect to login               |
```

---

## Docker Setup ([docker-compose.yml](docker-compose.yml))

### Services

**PHP Container**
- Builds from [docker/php/Dockerfile](docker/php/Dockerfile)
- Includes `pdo_mysql` extension
- Mounts `backend/` directory
- Runs `php artisan serve` on port 8000

**MySQL Container**
- Image: `mysql:8.3`
- Credentials match `.env`
- Creates database `admin` and user `laravel`
- Shares network `appnet` with PHP container

**Node Container**
- Runs Vue dev server on port 5173
- Mounts `frontend/` directory
- Uses polling for file changes

**All services** on same Docker network `appnet` for internal communication

---

## Key Security Features

1. **CSRF Protection**
   - Sanctum CSRF cookie endpoint requires GET request first
   - Token extracted from cookie and sent in X-XSRF-TOKEN header

2. **HTTP-only Cookies**
   - Session cookie is HTTP-only (not accessible to JavaScript)
   - Prevents XSS attacks

3. **withCredentials**
   - Axios sends cookies with all requests
   - Allows browser to maintain session across requests

4. **Session Regeneration**
   - After login, session ID is regenerated
   - Prevents session fixation attacks

5. **Protected Routes**
   - Protected routes use `auth:sanctum` middleware
   - Requires valid session cookie to access

---

## Summary

| Layer | Component | Purpose |
|-------|-----------|---------|
| **Frontend** | Axios API | HTTP client with cookie support |
| **Frontend** | Auth Store | State management (user, errors) |
| **Frontend** | Router Guards | Protect routes based on auth status |
| **Frontend** | App.vue | Initialize auth on page load |
| **Backend** | Sanctum | Session-based auth framework |
| **Backend** | LoginController | Validate credentials, set cookie |
| **Backend** | Protected Routes | Require valid session to access |
| **Backend** | MySQL | Store user credentials |
| **Docker** | Services | Isolated containers on shared network |

---

## Troubleshooting Checklist

- ✅ `withCredentials: true` in axios config
- ✅ `DB_HOST=db` in `.env` (not localhost)
- ✅ Call `/sanctum/csrf-cookie` before login
- ✅ Persist user to localStorage on login
- ✅ Restore user from localStorage on app mount
- ✅ Verify session with `fetchUser()` on startup
- ✅ Router guards check `auth.isAuthenticated` getter
- ✅ Protected routes use `auth:sanctum` middleware
- ✅ Response interceptor handles 401 (expired session)
