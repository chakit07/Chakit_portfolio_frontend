# Portfolio REST API Documentation (v1)

Versioned API root: `/api/v1`  
Base URL: `http://localhost:5000/api/v1`

---

## 1. Public Endpoints (Unauthenticated)

### 1.1 Health Check
- **Endpoint**: `GET /api/v1/health`
- **Description**: Verifies service status, uptime, and MongoDB connectivity.
- **Response**:
```json
{
  "status": "ok",
  "timestamp": "2026-09-09T07:15:00.000Z",
  "uptime": 142.5,
  "database": "connected"
}
```

### 1.2 Get Public Portfolio
- **Endpoint**: `GET /api/v1/public/portfolio`
- **Description**: Returns all visible public content. Strictly excludes draft projects and hidden items.
- **Response**:
```json
{
  "success": true,
  "data": {
    "settings": { ... },
    "projectCategories": [ ... ],
    "projects": [
      {
        "_id": "67cfd...",
        "title": "CloudMesh Distributed Task Engine",
        "slug": "cloudmesh-distributed-task-engine",
        "summary": "...",
        "status": "published",
        "order": 1
      }
    ],
    "skills": [ ... ],
    "experience": [ ... ],
    "education": [ ... ],
    "certifications": [ ... ],
    "socialLinks": [ ... ]
  }
}
```

### 1.3 Get Public Project Detail
- **Endpoint**: `GET /api/v1/public/projects/:slug`
- **Description**: Returns full case study detail for a single published project. If project is in `draft` mode or non-existent, returns HTTP 404.
- **Response**:
```json
{
  "success": true,
  "data": {
    "title": "CloudMesh Distributed Task Engine",
    "slug": "cloudmesh-distributed-task-engine",
    "summary": "A resilient event-driven job orchestration engine...",
    "description": "...",
    "features": [ ... ],
    "challenges": [ ... ],
    "solutions": [ ... ],
    "techStack": ["Node.js", "Express", "MongoDB", "Redis"],
    "liveUrl": "https://demo.example.com",
    "repoUrl": "https://github.com/example/repo"
  }
}
```

### 1.4 Submit Contact Message
- **Endpoint**: `POST /api/v1/public/contact`
- **Rate Limit**: Max 5 submissions per 15 minutes per IP.
- **Request Body**:
```json
{
  "name": "Alex Carter",
  "email": "alex@company.com",
  "subject": "Full-Stack Role Inquiry",
  "message": "Hello, we loved your portfolio and would like to talk...",
  "_hp_field": "" 
}
```
*Note: `_hp_field` is an anti-spam honeypot. If filled with any value, submission is silently acknowledged without saving.*
- **Response (201 Created)**:
```json
{
  "success": true,
  "message": "Thank you! Your message has been sent successfully.",
  "data": {
    "id": "67cfd...",
    "createdAt": "2026-09-09T07:20:00.000Z"
  }
}
```

---

## 2. Authentication Endpoints

### 2.1 Admin Login
- **Endpoint**: `POST /api/v1/auth/login`
- **Rate Limit**: Max 10 attempts per 15 minutes per IP.
- **Request Body**:
```json
{
  "identifier": "admin",
  "password": "YourSecurePassword123!"
}
```
- **Response (200 OK)**:
Sets HttpOnly `sessionId` cookie and returns CSRF token:
```json
{
  "success": true,
  "message": "Logged in successfully.",
  "csrfToken": "4fa8172c...",
  "admin": {
    "id": "67cfe...",
    "username": "admin",
    "email": "admin@portfolio.local"
  }
}
```

### 2.2 Get Current Session
- **Endpoint**: `GET /api/v1/auth/me`
- **Headers/Cookies**: Requires `sessionId` cookie.
- **Response**:
```json
{
  "success": true,
  "admin": {
    "_id": "67cfe...",
    "username": "admin",
    "email": "admin@portfolio.local"
  },
  "csrfToken": "4fa8172c..."
}
```

### 2.3 Logout
- **Endpoint**: `POST /api/v1/auth/logout`
- **Description**: Destroys session in MongoDB and clears cookies.

### 2.4 Change Password
- **Endpoint**: `POST /api/v1/auth/change-password`
- **Protected**: Requires active session & `X-CSRF-Token` header.
- **Request Body**:
```json
{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewSecurePassword456!"
}
```
- **Description**: Verifies current password, sets new bcrypt hash, and invalidates all existing sessions.

---

## 3. Protected Dashboard & Content Endpoints
*(All mutation endpoints require valid session cookie and `X-CSRF-Token` header)*

### 3.1 Real Database Stats
- **Endpoint**: `GET /api/v1/dashboard/stats`
- **Response**:
```json
{
  "success": true,
  "data": {
    "counts": {
      "projects": { "total": 4, "published": 3, "draft": 1 },
      "skills": { "total": 18, "categories": 4 },
      "experience": 3,
      "education": 1,
      "certifications": 2,
      "messages": { "total": 5, "unread": 2 },
      "media": 8
    },
    "recent": {
      "messages": [ ... ],
      "projects": [ ... ]
    }
  }
}
```

### 3.2 Media Upload (Multer)
- **Endpoint**: `POST /api/v1/media/upload`
- **Form Data**: `file` (image or application/pdf, max 10MB)
- **Response (201 Created)**:
```json
{
  "success": true,
  "message": "File uploaded successfully.",
  "data": {
    "_id": "67cf...",
    "filename": "screenshot-1725867382-a9b1c2.webp",
    "originalName": "screenshot.webp",
    "url": "/uploads/screenshot-1725867382-a9b1c2.webp",
    "mimeType": "image/webp",
    "size": 348291
  }
}
```

### 3.3 Safe Media Deletion
- **Endpoint**: `DELETE /api/v1/media/:id`
- **Behavior**: Scans published projects, certifications, and settings.
  - If unused: deletes file from disk and removes MongoDB record.
  - If used: returns HTTP 400 with `usedIn` list detailing exact locations blocking deletion.

### 3.4 Visual Effects & Section Ordering
- **Endpoint**: `PATCH /api/v1/settings/visual-effects`
- **Request Body**:
```json
{
  "enabled": true,
  "preset": "laptop",
  "accentColor": "#6366f1",
  "intensity": 1.2,
  "particles": true,
  "cardTilt": true,
  "enableOnMobile": false
}
```
- **Endpoint**: `PATCH /api/v1/settings/sections`
- **Request Body**:
```json
{
  "sections": [
    { "id": "hero", "name": "Hero", "order": 1, "visible": true },
    { "id": "projects", "name": "Projects", "order": 2, "visible": true }
  ]
}
```

---

## 4. AI Services & Endpoints (`/api/v1/ai`)

All AI operations are powered by Google Gemini with live grounding context from MongoDB records, plus automatic heuristic fallbacks.

### 4.1 AI Status & Configuration Check
- **Endpoint**: `GET /api/v1/ai/status`
- **Description**: Returns the active AI provider, model, and whether an active Gemini API key is configured.
- **Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "provider": "Google Gemini",
    "model": "gemini-2.5-flash",
    "configured": true,
    "mode": "live_api"
  }
}
```

### 4.2 Portfolio AI Assistant Chatbot (Public)
- **Endpoint**: `POST /api/v1/ai/chat`
- **Rate Limit**: 30 requests per 10 minutes per IP
- **Description**: Grounded conversational assistant answering visitor and recruiter inquiries strictly based on real MongoDB portfolio records.
- **Request Body**:
```json
{
  "message": "What projects has Chakit built using Next.js and Three.js?",
  "history": [
    { "role": "user", "content": "Hello" },
    { "role": "assistant", "content": "Hi there! How can I help you today?" }
  ]
}
```
- **Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "reply": "Chakit developed this developer portfolio utilizing Next.js 14 App Router and Three.js...",
    "timestamp": "2026-09-09T10:40:00.000Z"
  }
}
```

### 4.3 Recruiter Job Description Matcher (Public)
- **Endpoint**: `POST /api/v1/ai/match-job`
- **Rate Limit**: 30 requests per 10 minutes per IP
- **Description**: Evaluates candidate fit against arbitrary job descriptions or required skills.
- **Request Body**:
```json
{
  "jobDescription": "Looking for a Senior Full-Stack Engineer experienced with Next.js, Express, and MongoDB..."
}
```
- **Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "matchScore": 92,
    "summary": "Chakit demonstrates exceptionally strong alignment with this role...",
    "matchedSkills": ["Next.js", "Express", "MongoDB", "Tailwind CSS"],
    "missingOrGrowthSkills": ["Specialized cloud orchestration"],
    "recommendedProjects": [
      {
        "title": "CloudMesh Engine",
        "slug": "cloudmesh-engine",
        "reason": "Demonstrates mastery of scalable backends and distributed architectures."
      }
    ],
    "verdict": "Strong Match"
  }
}
```

### 4.4 Case Study Perspective Summarizer (Public)
- **Endpoint**: `POST /api/v1/ai/summarize-project`
- **Rate Limit**: 30 requests per 10 minutes per IP
- **Description**: Provides audience-tailored summaries for published project case studies.
- **Request Body**:
```json
{
  "slug": "cloudmesh-engine",
  "mode": "tldr" 
}
```
*Supported modes: `tldr` (Recruiter 30s summary), `technical` (Tech Lead architecture deep-dive), `simple` (Non-tech stakeholder analogy).*
- **Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "slug": "cloudmesh-engine",
    "title": "CloudMesh Engine",
    "mode": "tldr",
    "summary": "• Core Value: Resilient job orchestration...\n• Tech Applied: Node.js, Express, Redis..."
  }
}
```

### 4.5 AI Case Study Generator (Admin)
- **Endpoint**: `POST /api/v1/ai/generate-case-study`
- **Auth**: Session cookie required
- **CSRF**: `X-CSRF-Token` header required
- **Description**: Drafts full case study overview, challenges, solutions, and key features from a title and rough notes.
- **Request Body**:
```json
{
  "title": "Autonomous Cache Synchronizer",
  "roughNotes": "Distributed Redis cache invalidation layer",
  "techStack": "Node.js, Redis, Docker"
}
```
- **Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "summary": "Autonomous Cache Synchronizer is a resilient distributed caching layer...",
    "description": "...",
    "features": ["Sub-millisecond invalidation", "Fault-tolerant Redis cluster failover"],
    "challenges": ["Cache stampede during network partitions"],
    "solutions": ["Implemented probabilistic early expiration and distributed mutex locking"],
    "suggestedTechStack": ["Node.js", "Redis", "Docker", "Express"]
  }
}
```

### 4.6 Smart Email Reply Draft Generator (Admin)
- **Endpoint**: `POST /api/v1/ai/reply-draft`
- **Auth**: Session cookie required
- **CSRF**: `X-CSRF-Token` header required
- **Request Body**:
```json
{
  "messageId": "67cfd...",
  "tone": "professional"
}
```
*Supported tones: `professional`, `enthusiastic`, `brief`.*
- **Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "detectedIntent": "Recruitment / Hiring",
    "leadPriority": "High",
    "suggestedSubject": "Re: Senior Full-Stack Opportunity",
    "replyBody": "Hi Jane,\n\nThank you for reaching out..."
  }
}
```

### 4.7 Bio & Tagline Polish (Admin)
- **Endpoint**: `POST /api/v1/ai/polish-text`
- **Auth**: Session cookie required
- **CSRF**: `X-CSRF-Token` header required
- **Request Body**:
```json
{
  "text": "I make websites and backend systems.",
  "targetType": "bio",
  "tone": "modern"
}
```
- **Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "polishedText": "Full-Stack Engineer engineering resilient digital architectures, modern interactive web experiences, and scalable cloud systems.",
    "alternativeOptions": ["..."]
  }
}
```

