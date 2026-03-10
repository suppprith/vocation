# Vocation — Backend API Specification

> Comprehensive reference for implementing the Vocation backend.  
> Covers every data model, API endpoint, business rule, and integration guideline derived from the existing Next.js 16 frontend.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Data Models & Database Schema](#2-data-models--database-schema)
3. [Authentication & Authorization](#3-authentication--authorization)
4. [API Endpoints](#4-api-endpoints)
   - 4.1 [Auth](#41-auth)
   - 4.2 [Onboarding & Resume](#42-onboarding--resume)
   - 4.3 [User Profile](#43-user-profile)
   - 4.4 [Jobs (Job Seeker)](#44-jobs-job-seeker)
   - 4.5 [Applications (Job Seeker)](#45-applications-job-seeker)
   - 4.6 [Dashboard](#46-dashboard)
   - 4.7 [Employer — Company Profile](#47-employer--company-profile)
   - 4.8 [Employer — Job Postings](#48-employer--job-postings)
5. [Enum & Constant Definitions](#5-enum--constant-definitions)
6. [AI / ML Matching Engine](#6-ai--ml-matching-engine)
7. [Resume Parsing Service](#7-resume-parsing-service)
8. [Error Handling](#8-error-handling)
9. [Pagination Convention](#9-pagination-convention)
10. [Security Guidelines](#10-security-guidelines)
11. [Suggested Tech Stack](#11-suggested-tech-stack)

---

## 1. Architecture Overview

Vocation is a **dual-role** career platform for **job seekers** and **employers**.

| Concern      | Current (Frontend-Only)               | Target (With Backend)        |
| ------------ | ------------------------------------- | ---------------------------- |
| State        | Zustand + `localStorage`              | REST API + DB                |
| Auth         | Fake client-side login                | JWT / session-based auth     |
| Jobs         | `MOCK_JOBS` array (12 hardcoded jobs) | Database + search index      |
| Matching     | Static `matchScore` per job           | AI engine using user profile |
| Resume       | Faked file parsing                    | Server-side PDF/DOC parser   |
| File storage | None                                  | Cloud object store (S3 / R2) |

### User Roles

The frontend currently allows the **same** authenticated user to access both job-seeker and employer views. The backend should support at least these two roles:

| Role         | Capabilities                                            |
| ------------ | ------------------------------------------------------- |
| `job_seeker` | Onboard, build profile, search jobs, track applications |
| `employer`   | Create company profile, post/manage job listings        |

A user may hold **both roles** simultaneously (the current UI assumes this).

---

## 2. Data Models & Database Schema

### 2.1 `User`

| Field                | Type      | Constraints              | Notes                                                  |
| -------------------- | --------- | ------------------------ | ------------------------------------------------------ |
| `id`                 | UUID      | PK                       | Auto-generated                                         |
| `name`               | string    | NOT NULL                 | Full display name                                      |
| `email`              | string    | UNIQUE, NOT NULL         | Used for login                                         |
| `passwordHash`       | string    | NOT NULL                 | bcrypt / argon2 hash (never returned in API responses) |
| `avatar`             | string?   | nullable                 | URL to avatar image                                    |
| `onboardingComplete` | boolean   | default `false`          | Gates access to dashboard                              |
| `roles`              | enum[]    | default `["job_seeker"]` | `job_seeker`, `employer`, or both                      |
| `createdAt`          | timestamp | auto                     |                                                        |
| `updatedAt`          | timestamp | auto                     |                                                        |

### 2.2 `ResumeData`

Extracted/manual resume information. One-to-one with `User`.

| Field           | Type      | Constraints       | Notes                                 |
| --------------- | --------- | ----------------- | ------------------------------------- |
| `id`            | UUID      | PK                |                                       |
| `userId`        | UUID      | FK → User, UNIQUE |                                       |
| `skills`        | string[]  |                   | Array of skill tags                   |
| `rawText`       | text?     |                   | Full raw resume text (for re-parsing) |
| `resumeFileUrl` | string?   |                   | URL to stored resume file             |
| `updatedAt`     | timestamp | auto              |                                       |

### 2.3 `EducationEntry`

| Field          | Type   | Constraints     | Notes                   |
| -------------- | ------ | --------------- | ----------------------- |
| `id`           | UUID   | PK              |                         |
| `resumeDataId` | UUID   | FK → ResumeData |                         |
| `institution`  | string | NOT NULL        | e.g. "MIT"              |
| `degree`       | string | NOT NULL        | e.g. "B.S."             |
| `field`        | string | NOT NULL        | e.g. "Computer Science" |
| `year`         | string | NOT NULL        | e.g. "2024"             |

### 2.4 `ExperienceEntry`

| Field          | Type   | Constraints     | Notes          |
| -------------- | ------ | --------------- | -------------- |
| `id`           | UUID   | PK              |                |
| `resumeDataId` | UUID   | FK → ResumeData |                |
| `company`      | string | NOT NULL        |                |
| `role`         | string | NOT NULL        |                |
| `duration`     | string | NOT NULL        | e.g. "2 years" |
| `description`  | text   | NOT NULL        |                |

### 2.5 `HolisticProfile`

Work-style preferences and passions. One-to-one with `User`.

| Field           | Type     | Constraints       | Notes                                  |
| --------------- | -------- | ----------------- | -------------------------------------- |
| `id`            | UUID     | PK                |                                        |
| `userId`        | UUID     | FK → User, UNIQUE |                                        |
| `collaboration` | integer  | 1–5               | 1 = independent, 5 = collaborative     |
| `structure`     | integer  | 1–5               | 1 = creative freedom, 5 = structured   |
| `riskTolerance` | integer  | 1–5               | 1 = stability, 5 = risk-taking         |
| `passions`      | string[] |                   | Subset of `PASSIONS` constant (see §5) |

### 2.6 `CareerPreferences`

One-to-one with `User`.

| Field                 | Type     | Constraints       | Notes                                               |
| --------------------- | -------- | ----------------- | --------------------------------------------------- |
| `id`                  | UUID     | PK                |                                                     |
| `userId`              | UUID     | FK → User, UNIQUE |                                                     |
| `targetRoles`         | string[] |                   | Free-text role names                                |
| `preferredIndustries` | string[] |                   | Subset of `INDUSTRIES` constant                     |
| `workArrangement`     | enum[]   |                   | `remote`, `hybrid`, `onsite`                        |
| `employmentType`      | enum[]   |                   | `full-time`, `contract`, `internship`, `part-time`  |
| `companySize`         | enum[]   |                   | `startup`, `small`, `medium`, `large`, `enterprise` |
| `salaryMin`           | integer? | >= 0              | Annual salary floor                                 |
| `salaryMax`           | integer? | >= salaryMin      | Annual salary ceiling                               |
| `willingToRelocate`   | boolean  | default `false`   |                                                     |
| `availableToStart`    | string   |                   | Free text (e.g. "Immediately", "March 2026")        |

### 2.7 `PortfolioLinks`

One-to-one with `User`.

| Field       | Type    | Constraints       | Notes                   |
| ----------- | ------- | ----------------- | ----------------------- |
| `id`        | UUID    | PK                |                         |
| `userId`    | UUID    | FK → User, UNIQUE |                         |
| `linkedin`  | string? | URL               |                         |
| `github`    | string? | URL               |                         |
| `portfolio` | string? | URL               |                         |
| `design`    | string? | URL               | Dribbble, Behance, etc. |
| `blog`      | string? | URL               |                         |
| `other`     | string? | URL               |                         |

### 2.8 `Job`

The canonical job listing visible to job seekers. Created from employer `JobPosting` records (or ingested externally).

| Field             | Type       | Constraints     | Notes                                                       |
| ----------------- | ---------- | --------------- | ----------------------------------------------------------- |
| `id`              | UUID       | PK              |                                                             |
| `title`           | string     | NOT NULL        |                                                             |
| `company`         | string     | NOT NULL        | Company display name                                        |
| `companyLogo`     | string?    |                 | URL                                                         |
| `description`     | text       | NOT NULL        |                                                             |
| `location`        | string     | NOT NULL        | e.g. "San Francisco, CA" or "Remote"                        |
| `latitude`        | float?     |                 | For map view                                                |
| `longitude`       | float?     |                 | For map view                                                |
| `workArrangement` | enum       | NOT NULL        | `remote` \| `hybrid` \| `onsite`                            |
| `employmentType`  | enum       | NOT NULL        | `full-time` \| `contract` \| `internship` \| `part-time`    |
| `companySize`     | enum       | NOT NULL        | `startup` \| `small` \| `medium` \| `large` \| `enterprise` |
| `industry`        | string     | NOT NULL        |                                                             |
| `skills`          | string[]   |                 | Required/desired skills                                     |
| `salaryRange`     | string?    |                 | Display-friendly, e.g. "$180k – $250k"                      |
| `salaryMin`       | integer?   |                 | For filtering (annual, pre-tax)                             |
| `salaryMax`       | integer?   |                 | For filtering                                               |
| `applyUrl`        | string     | NOT NULL        | External application link                                   |
| `postedDate`      | date       | NOT NULL        |                                                             |
| `expiresAt`       | timestamp? |                 | Auto-close after this date                                  |
| `employerUserId`  | UUID?      | FK → User       | Null if externally ingested                                 |
| `jobPostingId`    | UUID?      | FK → JobPosting | Link back to employer's posting                             |
| `isActive`        | boolean    | default `true`  |                                                             |

> **Note:** `matchScore` and `matchReason` are **computed per-user at query time** by the matching engine (see §6). They are NOT stored on the `Job` record.

### 2.9 `Application`

Tracks a job seeker's interaction with a job.

| Field         | Type       | Constraints  | Notes                                                           |
| ------------- | ---------- | ------------ | --------------------------------------------------------------- |
| `id`          | UUID       | PK           |                                                                 |
| `userId`      | UUID       | FK → User    |                                                                 |
| `jobId`       | UUID       | FK → Job     |                                                                 |
| `status`      | enum       | NOT NULL     | `saved` \| `applied` \| `interviewing` \| `offer` \| `rejected` |
| `notes`       | text       | default `""` | User's private notes                                            |
| `appliedDate` | timestamp? |              | Set when status becomes `applied`                               |
| `createdAt`   | timestamp  | auto         |                                                                 |
| `updatedAt`   | timestamp  | auto         |                                                                 |

**Unique constraint:** `(userId, jobId)` — a user can only have one application record per job.

### 2.10 `CompanyProfile`

Employer's company information. One-to-one with `User` (employer role).

| Field         | Type      | Constraints       | Notes                                                       |
| ------------- | --------- | ----------------- | ----------------------------------------------------------- |
| `id`          | UUID      | PK                |                                                             |
| `userId`      | UUID      | FK → User, UNIQUE |                                                             |
| `name`        | string    | NOT NULL          |                                                             |
| `website`     | string?   | URL               |                                                             |
| `industry`    | string    |                   | From `INDUSTRIES` constant                                  |
| `size`        | enum      |                   | `startup` \| `small` \| `medium` \| `large` \| `enterprise` |
| `location`    | string    |                   |                                                             |
| `description` | text      |                   |                                                             |
| `culture`     | text?     |                   |                                                             |
| `benefits`    | string[]  |                   | e.g. ["401k", "Remote Work", "Unlimited PTO"]               |
| `techStack`   | string[]  |                   | e.g. ["React", "Go", "PostgreSQL"]                          |
| `foundedYear` | string?   |                   |                                                             |
| `linkedinUrl` | string?   | URL               |                                                             |
| `createdAt`   | timestamp | auto              |                                                             |
| `updatedAt`   | timestamp | auto              |                                                             |

### 2.11 `JobPosting`

Employer's draft/active posting. When published (`status: "active"`), a corresponding `Job` record is created/updated for job seekers to discover.

| Field              | Type      | Constraints     | Notes                                                    |
| ------------------ | --------- | --------------- | -------------------------------------------------------- |
| `id`               | UUID      | PK              |                                                          |
| `userId`           | UUID      | FK → User       | The employer who created it                              |
| `title`            | string    | NOT NULL        |                                                          |
| `department`       | string?   |                 |                                                          |
| `location`         | string    | NOT NULL        |                                                          |
| `workArrangement`  | enum      | NOT NULL        | `remote` \| `hybrid` \| `onsite`                         |
| `employmentType`   | enum      | NOT NULL        | `full-time` \| `contract` \| `internship` \| `part-time` |
| `salaryMin`        | string?   |                 | Stored as string in frontend; consider integer           |
| `salaryMax`        | string?   |                 |                                                          |
| `currency`         | string    | default `"USD"` | `USD` \| `EUR` \| `GBP` \| `INR` \| `CAD`                |
| `summary`          | text      | NOT NULL        |                                                          |
| `responsibilities` | string[]  |                 |                                                          |
| `requirements`     | string[]  |                 |                                                          |
| `niceToHave`       | string[]  |                 |                                                          |
| `skills`           | string[]  |                 |                                                          |
| `experienceLevel`  | enum      | NOT NULL        | `entry` \| `mid` \| `senior` \| `lead` \| `executive`    |
| `applicationUrl`   | string?   |                 |                                                          |
| `applicationEmail` | string?   |                 |                                                          |
| `status`           | enum      | NOT NULL        | `draft` \| `active` \| `paused` \| `closed`              |
| `createdAt`        | timestamp | auto            |                                                          |
| `updatedAt`        | timestamp | auto            |                                                          |

### Entity-Relationship Diagram (Text)

```
User 1──1 ResumeData 1──* EducationEntry
                      1──* ExperienceEntry
User 1──1 HolisticProfile
User 1──1 CareerPreferences
User 1──1 PortfolioLinks
User 1──* Application *──1 Job
User 1──1 CompanyProfile
User 1──* JobPosting
JobPosting 1──0..1 Job
```

---

## 3. Authentication & Authorization

### 3.1 Auth Flow

1. **Signup** → creates `User` with `onboardingComplete: false` → returns auth token
2. **Login** → validates credentials → returns auth token
3. **Onboarding** → multi-step profile setup → marks `onboardingComplete: true`
4. **Session validation** → `GET /api/auth/me` with token → returns user or 401

### 3.2 Token Strategy

Use **JWT** (recommended) or **HTTP-only session cookies**.

**JWT payload:**

```json
{
  "sub": "<userId>",
  "email": "<email>",
  "roles": ["job_seeker", "employer"],
  "iat": 1709553600,
  "exp": 1710158400
}
```

**Token lifecycle:**

- Access token: 15 min – 1 hour
- Refresh token: 7 – 30 days (stored as HTTP-only cookie)

### 3.3 Authorization Rules

| Resource                   | Required Role | Notes                     |
| -------------------------- | ------------- | ------------------------- |
| `GET /api/profile/*`       | `job_seeker`  | Own profile only          |
| `PUT /api/profile/*`       | `job_seeker`  | Own profile only          |
| `GET /api/jobs/*`          | `job_seeker`  |                           |
| `* /api/applications/*`    | `job_seeker`  | Own applications only     |
| `* /api/employer/*`        | `employer`    | Own company/postings only |
| `GET /api/dashboard/stats` | `job_seeker`  |                           |
| `POST /api/resume/upload`  | `job_seeker`  |                           |

### 3.4 Password Requirements

From the frontend validation:

- **Minimum 6 characters**

Recommended additions for production:

- At least 8 characters
- Strength scoring (zxcvbn or similar)

---

## 4. API Endpoints

> **Base URL:** `/api`  
> **Content-Type:** `application/json` (unless specified otherwise)  
> **Auth header:** `Authorization: Bearer <token>`

---

### 4.1 Auth

#### `POST /api/auth/signup`

Create a new user account.

**Request body:**

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "securePass123"
}
```

**Validation:**

- `name`: required, non-empty string
- `email`: required, valid email format, must be unique
- `password`: required, minimum 6 characters

**Response `201 Created`:**

```json
{
  "user": {
    "id": "uuid",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "avatar": null,
    "onboardingComplete": false,
    "roles": ["job_seeker"]
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Errors:**

- `400` — Validation failed
- `409` — Email already registered

---

#### `POST /api/auth/login`

Authenticate an existing user.

**Request body:**

```json
{
  "email": "jane@example.com",
  "password": "securePass123"
}
```

**Response `200 OK`:**

```json
{
  "user": {
    "id": "uuid",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "avatar": null,
    "onboardingComplete": true,
    "roles": ["job_seeker", "employer"]
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Frontend redirect logic:**

- If `onboardingComplete === true` → redirect to `/dashboard`
- If `onboardingComplete === false` → redirect to `/onboarding`

**Errors:**

- `401` — Invalid email or password

---

#### `POST /api/auth/logout`

Invalidate the current session / refresh token.

**Request:** Auth header required. No body.

**Response `200 OK`:**

```json
{ "success": true }
```

---

#### `GET /api/auth/me`

Validate session and return current user.

**Response `200 OK`:**

```json
{
  "user": {
    "id": "uuid",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "avatar": null,
    "onboardingComplete": true,
    "roles": ["job_seeker"]
  }
}
```

**Errors:**

- `401` — Token missing, expired, or invalid

---

### 4.2 Onboarding & Resume

#### `POST /api/resume/upload`

Upload a resume file for server-side parsing.

**Request:** `Content-Type: multipart/form-data`

| Field  | Type | Required | Notes                                     |
| ------ | ---- | -------- | ----------------------------------------- |
| `file` | File | Yes      | Accepted: `.pdf`, `.doc`, `.docx`, `.txt` |

**Response `200 OK`:**

```json
{
  "skills": ["React", "TypeScript", "Node.js"],
  "education": [
    {
      "institution": "MIT",
      "degree": "B.S.",
      "field": "Computer Science",
      "year": "2024"
    }
  ],
  "experience": [
    {
      "company": "Acme Inc.",
      "role": "Software Engineer",
      "duration": "2 years",
      "description": "Built full-stack web applications..."
    }
  ],
  "rawText": "Full extracted resume text..."
}
```

**Notes:**

- The response is returned for the user to **review and edit** before saving
- The file should be stored in cloud storage; return the URL for later retrieval
- See §7 for parsing implementation guidance

**Errors:**

- `400` — No file / unsupported format
- `413` — File too large (recommend 10MB limit)
- `422` — Parsing failed

---

#### `POST /api/onboarding/complete`

Mark the user's onboarding as finished. Call this **after** all profile sections have been saved.

**Request:** Auth header required. No body.

**Response `200 OK`:**

```json
{
  "user": {
    "id": "uuid",
    "onboardingComplete": true
  }
}
```

**Side effect:** Sets `user.onboardingComplete = true` in the database.

---

### 4.3 User Profile

#### `GET /api/profile`

Retrieve the full profile for the authenticated user.

**Response `200 OK`:**

```json
{
  "resumeData": {
    "skills": ["React", "TypeScript"],
    "education": [...],
    "experience": [...],
    "resumeFileUrl": "https://storage.example.com/resumes/abc123.pdf"
  },
  "holisticProfile": {
    "workStyle": {
      "collaboration": 4,
      "structure": 3,
      "riskTolerance": 2
    },
    "passions": ["Technology", "Gaming", "Design"]
  },
  "careerPreferences": {
    "targetRoles": ["Frontend Engineer", "Product Designer"],
    "preferredIndustries": ["Technology", "SaaS"],
    "workArrangement": ["remote", "hybrid"],
    "employmentType": ["full-time"],
    "companySize": ["startup", "medium"],
    "salaryMin": 150000,
    "salaryMax": 250000,
    "willingToRelocate": false,
    "availableToStart": "Immediately"
  },
  "portfolioLinks": {
    "linkedin": "https://linkedin.com/in/janedoe",
    "github": "https://github.com/janedoe",
    "portfolio": "https://janedoe.dev",
    "design": null,
    "blog": null
  }
}
```

Returns `null` for any section not yet completed.

---

#### `PUT /api/profile/resume`

Create or update resume data (skills, education, experience).

**Request body:**

```json
{
  "skills": ["React", "TypeScript", "Node.js", "CSS"],
  "education": [
    {
      "institution": "MIT",
      "degree": "B.S.",
      "field": "Computer Science",
      "year": "2024"
    }
  ],
  "experience": [
    {
      "company": "Acme Inc.",
      "role": "Software Engineer",
      "duration": "2 years",
      "description": "Built full-stack web applications."
    }
  ]
}
```

**Validation:**

- `skills`: array of non-empty strings
- `education[].institution`, `.degree`, `.field`, `.year`: all required strings
- `experience[].company`, `.role`, `.duration`, `.description`: all required strings

**Response `200 OK`:**

```json
{ "success": true }
```

---

#### `PUT /api/profile/work-style`

Save work-style preferences and passions.

**Request body:**

```json
{
  "workStyle": {
    "collaboration": 4,
    "structure": 3,
    "riskTolerance": 2
  },
  "passions": ["Technology", "Gaming", "Design"]
}
```

**Validation:**

- `collaboration`, `structure`, `riskTolerance`: integer, 1–5
- `passions`: array of strings, each must be a value from the `PASSIONS` constant (see §5)

**Response `200 OK`:**

```json
{ "success": true }
```

---

#### `PUT /api/profile/career-preferences`

Save target roles, preferred industries, and other career preferences.

**Request body:**

```json
{
  "targetRoles": ["Frontend Engineer", "Product Designer"],
  "preferredIndustries": ["Technology", "SaaS"],
  "workArrangement": ["remote", "hybrid"],
  "employmentType": ["full-time"],
  "companySize": ["startup", "medium"],
  "salaryMin": 150000,
  "salaryMax": 250000,
  "willingToRelocate": false,
  "availableToStart": "Immediately"
}
```

**Validation:**

- `workArrangement[]`: each must be `remote` | `hybrid` | `onsite`
- `employmentType[]`: each must be `full-time` | `contract` | `internship` | `part-time`
- `companySize[]`: each must be `startup` | `small` | `medium` | `large` | `enterprise`
- `salaryMax` ≥ `salaryMin` (if both provided)
- `preferredIndustries[]`: each should be from `INDUSTRIES` constant

**Response `200 OK`:**

```json
{ "success": true }
```

---

#### `PUT /api/profile/portfolio-links`

Save portfolio and social links.

**Request body:**

```json
{
  "linkedin": "https://linkedin.com/in/janedoe",
  "github": "https://github.com/janedoe",
  "portfolio": "https://janedoe.dev",
  "design": null,
  "blog": null
}
```

**Validation:**

- All fields optional
- If provided, must be valid URLs (https preferred)

**Response `200 OK`:**

```json
{ "success": true }
```

---

### 4.4 Jobs (Job Seeker)

#### `GET /api/jobs`

Search and filter all active job listings. Powers the **Job Feed** page.

**Query parameters:**

| Param             | Type    | Default | Notes                                                                                      |
| ----------------- | ------- | ------- | ------------------------------------------------------------------------------------------ |
| `search`          | string  | `""`    | Searches across `title`, `company`, `description`, `skills[]` (case-insensitive substring) |
| `industry`        | string  | `""`    | Exact match filter from `INDUSTRIES`                                                       |
| `workArrangement` | string  | `""`    | `remote` \| `hybrid` \| `onsite`                                                           |
| `companySize`     | string  | `""`    | `startup` \| `small` \| `medium` \| `large` \| `enterprise`                                |
| `employmentType`  | string  | `""`    | `full-time` \| `contract` \| `internship` \| `part-time`                                   |
| `page`            | integer | `1`     | Pagination (see §9)                                                                        |
| `limit`           | integer | `20`    | Items per page                                                                             |

**Filter logic:** All filters combine with **AND**. Empty/omitted filters are ignored.

**Response `200 OK`:**

```json
{
  "jobs": [
    {
      "id": "uuid",
      "title": "Senior Frontend Engineer",
      "company": "Vercel",
      "companyLogo": null,
      "description": "We're looking for...",
      "location": "San Francisco, CA",
      "coordinates": { "lat": 37.7749, "lng": -122.4194 },
      "workArrangement": "remote",
      "employmentType": "full-time",
      "companySize": "medium",
      "industry": "Technology",
      "skills": ["React", "TypeScript", "Next.js"],
      "salaryRange": "$180k – $250k",
      "applyUrl": "https://vercel.com/careers/...",
      "matchScore": 95,
      "matchReason": "Strong overlap with your React and TypeScript skills.",
      "postedDate": "2026-03-01"
    }
  ],
  "total": 142,
  "page": 1,
  "limit": 20,
  "totalPages": 8
}
```

**Important:** `matchScore` and `matchReason` must be **computed per-user** using the matching engine. If the user has no profile data, omit or default `matchScore` to `0`.

---

#### `GET /api/jobs/recommended`

Get the user's top N matched jobs for the **Dashboard** home screen.

**Query parameters:**

| Param   | Type    | Default | Notes                     |
| ------- | ------- | ------- | ------------------------- |
| `limit` | integer | `4`     | Number of recommendations |

**Response `200 OK`:**

```json
{
  "jobs": [
    {
      "id": "uuid",
      "title": "Senior Frontend Engineer",
      "company": "Vercel",
      "matchScore": 95,
      "matchReason": "...",
      "...": "..."
    }
  ]
}
```

**Logic:** Return the top `limit` jobs sorted by `matchScore` descending (computed against the authenticated user's profile).

---

#### `GET /api/jobs/matches`

Get all matched jobs sorted by match score. Powers the **Matches** page.

**Query parameters:**

| Param   | Type    | Default | Notes |
| ------- | ------- | ------- | ----- |
| `page`  | integer | `1`     |       |
| `limit` | integer | `20`    |       |

**Response `200 OK`:**

```json
{
  "jobs": [
    {
      "id": "uuid",
      "title": "...",
      "matchScore": 95,
      "matchReason": "Strong overlap with your React and TypeScript skills...",
      "...": "full Job fields"
    }
  ],
  "total": 142,
  "page": 1,
  "limit": 20,
  "totalPages": 8
}
```

**Logic:** All active jobs, sorted by `matchScore` descending. Each job includes the user-specific `matchScore` (0–100) and `matchReason` (natural language explanation).

---

#### `GET /api/jobs/map`

Get jobs that have geographic coordinates for the **Map** view.

**Query parameters:**

| Param    | Type   | Default | Notes                                                        |
| -------- | ------ | ------- | ------------------------------------------------------------ |
| `bounds` | string | —       | Optional: `"swLat,swLng,neLat,neLng"` for viewport filtering |

**Response `200 OK`:**

```json
{
  "jobs": [
    {
      "id": "uuid",
      "title": "Game Systems Designer",
      "company": "Riot Games",
      "location": "Los Angeles, CA",
      "coordinates": { "lat": 34.0522, "lng": -118.2437 },
      "workArrangement": "hybrid",
      "salaryRange": "$130k – $190k",
      "skills": ["Game Design", "Systems Thinking", "Prototyping"],
      "matchScore": 88,
      "...": "full Job fields"
    }
  ]
}
```

**Logic:** Only return jobs where `coordinates IS NOT NULL`. The frontend uses `workArrangement` for marker color coding:

- `onsite` → green marker
- `hybrid` → yellow marker
- `remote` → (not shown on map; has no coordinates)

---

#### `GET /api/jobs/:id`

Get a single job by ID for the detail modal.

**Response `200 OK`:**

```json
{
  "job": {
    "id": "uuid",
    "title": "Senior Frontend Engineer",
    "company": "Vercel",
    "matchScore": 95,
    "matchReason": "...",
    "...": "full Job fields"
  }
}
```

**Errors:**

- `404` — Job not found

---

### 4.5 Applications (Job Seeker)

#### `GET /api/applications`

Get all applications for the authenticated user. Powers the **Tracker** kanban board.

**Response `200 OK`:**

```json
{
  "applications": [
    {
      "id": "uuid",
      "job": {
        "id": "uuid",
        "title": "Senior Frontend Engineer",
        "company": "Vercel",
        "location": "San Francisco, CA",
        "salaryRange": "$180k – $250k",
        "workArrangement": "remote",
        "industry": "Technology",
        "...": "full Job fields"
      },
      "status": "applied",
      "notes": "Had a great intro call",
      "appliedDate": "2026-03-01T10:30:00Z",
      "createdAt": "2026-02-28T08:00:00Z",
      "updatedAt": "2026-03-01T10:30:00Z"
    }
  ]
}
```

**Frontend grouping:** The frontend groups applications by status into kanban columns:

- `saved` → `applied` → `interviewing` → `offer` → `rejected`

---

#### `POST /api/applications`

Save or apply to a job. Creates a new application record.

**Request body:**

```json
{
  "jobId": "uuid",
  "status": "saved"
}
```

**Validation:**

- `jobId`: must reference an existing, active job
- `status`: must be `saved` or `applied`
- Duplicate check: if user already has an application for this `jobId`, return `409`

**Side effects:**

- If `status === "applied"`, set `appliedDate` to current timestamp

**Response `201 Created`:**

```json
{
  "application": {
    "id": "uuid",
    "job": { "...": "full Job object" },
    "status": "saved",
    "notes": "",
    "appliedDate": null,
    "createdAt": "2026-03-04T...",
    "updatedAt": "2026-03-04T..."
  }
}
```

**Errors:**

- `404` — Job not found
- `409` — Application already exists for this job

---

#### `PATCH /api/applications/:id/status`

Update an application's status (drag & drop in the tracker).

**Request body:**

```json
{
  "status": "interviewing"
}
```

**Validation:**

- `status`: must be one of `saved`, `applied`, `interviewing`, `offer`, `rejected`
- Application must belong to the authenticated user

**Side effects:**

- If new status is `applied` and `appliedDate` is null, set `appliedDate` to current timestamp
- Always update `updatedAt`

**Response `200 OK`:**

```json
{
  "application": {
    "id": "uuid",
    "status": "interviewing",
    "updatedAt": "2026-03-04T..."
  }
}
```

**Errors:**

- `403` — Not the owner
- `404` — Application not found

---

#### `PATCH /api/applications/:id/notes`

Update an application's notes.

**Request body:**

```json
{
  "notes": "Phone screen went well. Follow up next Tuesday."
}
```

**Validation:**

- `notes`: string (can be empty)
- Application must belong to the authenticated user

**Response `200 OK`:**

```json
{
  "application": {
    "id": "uuid",
    "notes": "Phone screen went well. Follow up next Tuesday.",
    "updatedAt": "2026-03-04T..."
  }
}
```

---

#### `DELETE /api/applications/:id`

Remove an application from the tracker.

**Response `200 OK`:**

```json
{ "success": true }
```

**Errors:**

- `403` — Not the owner
- `404` — Application not found

---

### 4.6 Dashboard

#### `GET /api/dashboard/stats`

Get aggregated stats for the job seeker's dashboard home screen.

**Response `200 OK`:**

```json
{
  "savedCount": 5,
  "appliedCount": 3,
  "interviewingCount": 1,
  "skillCount": 12
}
```

**Logic:**

- `savedCount`: count of applications with `status === "saved"`
- `appliedCount`: count of applications with `status === "applied"`
- `interviewingCount`: count of applications with `status === "interviewing"`
- `skillCount`: length of `resumeData.skills[]`

---

### 4.7 Employer — Company Profile

#### `GET /api/employer/company`

Get the authenticated employer's company profile.

**Response `200 OK`:**

```json
{
  "companyProfile": {
    "name": "Acme Corp",
    "website": "https://acme.com",
    "industry": "Technology",
    "size": "medium",
    "location": "San Francisco, CA",
    "description": "We build tools for developers.",
    "culture": "Fast-paced, collaborative environment.",
    "benefits": ["401k", "Unlimited PTO", "Health Insurance"],
    "techStack": ["React", "Go", "PostgreSQL", "Kubernetes"],
    "foundedYear": "2019",
    "linkedinUrl": "https://linkedin.com/company/acme"
  }
}
```

Returns `null` if no company profile exists yet.

---

#### `PUT /api/employer/company`

Create or fully replace the company profile. This is an **upsert** operation.

**Request body:**

```json
{
  "name": "Acme Corp",
  "website": "https://acme.com",
  "industry": "Technology",
  "size": "medium",
  "location": "San Francisco, CA",
  "description": "We build tools for developers.",
  "culture": "Fast-paced, collaborative environment.",
  "benefits": ["401k", "Unlimited PTO"],
  "techStack": ["React", "Go", "PostgreSQL"],
  "foundedYear": "2019",
  "linkedinUrl": "https://linkedin.com/company/acme"
}
```

**Validation:**

- `name`: required, non-empty string
- `industry`: should be from `INDUSTRIES` constant
- `size`: must be `startup` | `small` | `medium` | `large` | `enterprise`
- URLs should be valid if provided

**Response `200 OK`:**

```json
{
  "companyProfile": { "...": "saved profile" }
}
```

**Side effect:** If creating for the first time, add `employer` to the user's `roles` array.

---

### 4.8 Employer — Job Postings

#### `GET /api/employer/jobs`

List all job postings created by the authenticated employer.

**Query parameters:**

| Param    | Type   | Default | Notes                                                |
| -------- | ------ | ------- | ---------------------------------------------------- |
| `status` | string | `"all"` | `all` \| `active` \| `draft` \| `paused` \| `closed` |

**Response `200 OK`:**

```json
{
  "jobPostings": [
    {
      "id": "uuid",
      "title": "Senior Backend Engineer",
      "department": "Engineering",
      "location": "Remote",
      "workArrangement": "remote",
      "employmentType": "full-time",
      "salaryMin": "150000",
      "salaryMax": "220000",
      "currency": "USD",
      "summary": "We're looking for...",
      "responsibilities": ["Design APIs", "Write Go services"],
      "requirements": ["5+ years experience", "Go proficiency"],
      "niceToHave": ["Kubernetes", "gRPC"],
      "skills": ["Go", "PostgreSQL", "AWS"],
      "experienceLevel": "senior",
      "applicationUrl": "https://acme.com/apply",
      "applicationEmail": null,
      "status": "active",
      "createdAt": "2026-02-20T...",
      "updatedAt": "2026-03-01T..."
    }
  ],
  "counts": {
    "all": 5,
    "active": 2,
    "draft": 1,
    "paused": 1,
    "closed": 1
  }
}
```

---

#### `POST /api/employer/jobs`

Create a new job posting.

**Request body:**

```json
{
  "title": "Senior Backend Engineer",
  "department": "Engineering",
  "location": "Remote",
  "workArrangement": "remote",
  "employmentType": "full-time",
  "salaryMin": "150000",
  "salaryMax": "220000",
  "currency": "USD",
  "summary": "We're looking for a senior backend engineer...",
  "responsibilities": ["Design and build APIs", "Write Go microservices"],
  "requirements": ["5+ years backend experience", "Go proficiency"],
  "niceToHave": ["Kubernetes experience", "gRPC"],
  "skills": ["Go", "PostgreSQL", "AWS"],
  "experienceLevel": "senior",
  "applicationUrl": "https://acme.com/careers/apply",
  "applicationEmail": null,
  "status": "active"
}
```

**Validation:**

- `title`: required
- `summary`: required
- `location`: required
- `status`: must be `draft` or `active` (only these two on creation)
- `workArrangement`: required, valid enum value
- `employmentType`: required, valid enum value
- `experienceLevel`: required, valid enum value

**Side effects:**

- If `status === "active"`, also create/update a corresponding `Job` record visible to job seekers
- `createdAt` and `updatedAt` are set automatically

**Response `201 Created`:**

```json
{
  "jobPosting": { "...": "full posting with generated id and timestamps" }
}
```

---

#### `PATCH /api/employer/jobs/:id/status`

Change the status of a job posting.

**Request body:**

```json
{
  "status": "paused"
}
```

**Valid transitions:**

| From     | Allowed To         | Notes                                    |
| -------- | ------------------ | ---------------------------------------- |
| `draft`  | `active`           | Publishes the job (creates `Job` record) |
| `active` | `paused`, `closed` |                                          |
| `paused` | `active`, `closed` | Resuming re-activates the `Job` record   |
| `closed` | `active`           | Reopening re-activates the `Job` record  |

**Side effects:**

- `draft → active`: Create a corresponding `Job` record for job seekers
- `active → paused/closed`: Set `Job.isActive = false` (hidden from search)
- `paused/closed → active`: Set `Job.isActive = true` (visible again)

**Response `200 OK`:**

```json
{
  "jobPosting": {
    "id": "uuid",
    "status": "paused",
    "updatedAt": "2026-03-04T..."
  }
}
```

**Errors:**

- `400` — Invalid status transition
- `403` — Not the owner
- `404` — Job posting not found

---

#### `DELETE /api/employer/jobs/:id`

Permanently delete a job posting and its associated `Job` record.

**Response `200 OK`:**

```json
{ "success": true }
```

**Side effects:**

- Delete the corresponding `Job` record
- Delete any `Application` records referencing this job (or soft-delete)
- Consider: should applications be preserved with a "job removed" status?

**Errors:**

- `403` — Not the owner
- `404` — Job posting not found

---

## 5. Enum & Constant Definitions

These values are used across the frontend for dropdowns, filters, and validation. The backend must accept and enforce these exact values.

### Work Arrangement

```
"remote" | "hybrid" | "onsite"
```

### Employment Type

```
"full-time" | "contract" | "internship" | "part-time"
```

### Company Size

| Value        | Label              |
| ------------ | ------------------ |
| `startup`    | Startup (1–50)     |
| `small`      | Small (51–200)     |
| `medium`     | Medium (201–1000)  |
| `large`      | Large (1001–5000)  |
| `enterprise` | Enterprise (5000+) |

### Application Status

```
"saved" | "applied" | "interviewing" | "offer" | "rejected"
```

### Job Posting Status

```
"draft" | "active" | "paused" | "closed"
```

### Experience Level

```
"entry" | "mid" | "senior" | "lead" | "executive"
```

### Currency

```
"USD" | "EUR" | "GBP" | "INR" | "CAD"
```

### PASSIONS (20 values)

```
"Gaming", "Writing", "Hiking", "Design", "Technology",
"Education", "Music", "Sports", "Photography", "Cooking",
"Travel", "Art", "Science", "Finance", "Health & Wellness",
"Social Impact", "Film & Media", "Robotics", "Environment", "Fashion"
```

### INDUSTRIES (15 values)

```
"Technology", "Healthcare", "Finance", "Education", "Entertainment",
"E-commerce", "Manufacturing", "Consulting", "Media", "Gaming",
"Cybersecurity", "AI & Machine Learning", "Climate Tech", "SaaS", "Fintech"
```

---

## 6. AI / ML Matching Engine

The matching engine computes a personalized `matchScore` (0–100) and `matchReason` (string) for every job relative to a user's profile.

### Input Signals

| Signal Source        | Fields Used                                                    | Weight (Suggested) |
| -------------------- | -------------------------------------------------------------- | ------------------ |
| Resume skills        | `resumeData.skills[]` vs `job.skills[]`                        | 30%                |
| Career preferences   | `careerPreferences.targetRoles[]` vs `job.title`               | 15%                |
| Industry match       | `careerPreferences.preferredIndustries[]` vs `job.industry`    | 10%                |
| Work arrangement     | `careerPreferences.workArrangement[]` vs `job.workArrangement` | 10%                |
| Employment type      | `careerPreferences.employmentType[]` vs `job.employmentType`   | 5%                 |
| Company size         | `careerPreferences.companySize[]` vs `job.companySize`         | 5%                 |
| Salary fit           | `careerPreferences.salaryMin/Max` vs `job.salaryMin/Max`       | 10%                |
| Holistic passions    | `holisticProfile.passions[]` vs `job.industry`                 | 10%                |
| Work style alignment | `holisticProfile.workStyle` (soft signal)                      | 5%                 |

### Scoring Algorithm (Suggested)

```
matchScore = (
    skillOverlapScore * 0.30 +
    roleRelevanceScore * 0.15 +
    industryMatchScore * 0.10 +
    arrangementMatchScore * 0.10 +
    employmentTypeScore * 0.05 +
    companySizeScore * 0.05 +
    salaryFitScore * 0.10 +
    passionAlignmentScore * 0.10 +
    workStyleScore * 0.05
) * 100
```

Each sub-score is a value from 0.0 to 1.0.

### Match Reason Generation

Generate a **1–2 sentence** natural-language explanation. Highlight the **top 2–3 strongest alignment factors**:

> "Strong overlap with your React and TypeScript skills. Remote role matches your work arrangement preference."

**Options for implementation:**

1. **Rule-based templates** — fastest, deterministic
2. **LLM-based** — call an LLM API with the input signals to generate the `matchReason` string
3. **Hybrid** — score with rules, explain with LLM

### Performance Considerations

- Pre-compute scores on a schedule (e.g., when user profile changes or new jobs are added)
- Cache scores per `(userId, jobId)` pair
- Invalidate cache when user profile or job details change
- For the `/api/jobs` feed endpoint, compute scores on-the-fly or use cached values

---

## 7. Resume Parsing Service

### Accepted Formats

- `.pdf` (most common)
- `.doc` / `.docx` (Microsoft Word)
- `.txt` (plain text)

### Expected Output

The parser should extract and return structured data:

```json
{
  "skills": ["React", "TypeScript", "Python"],
  "education": [
    { "institution": "...", "degree": "...", "field": "...", "year": "..." }
  ],
  "experience": [
    { "company": "...", "role": "...", "duration": "...", "description": "..." }
  ],
  "rawText": "The full text extracted from the document"
}
```

### Implementation Options

| Approach                                           | Pros                                    | Cons                            |
| -------------------------------------------------- | --------------------------------------- | ------------------------------- |
| **LLM-based extraction** (GPT-4, Claude)           | Highest accuracy, handles messy formats | Cost per parse, latency         |
| **Open-source NLP** (resume-parser, pyresparser)   | Free, on-prem                           | Less accurate on varied formats |
| **Third-party API** (Affinda, Sovren, HireAbility) | Turnkey, high quality                   | Cost, vendor lock-in            |
| **Hybrid** — PDF-to-text + LLM structuring         | Good balance                            | Two-step pipeline               |

### File Storage

- Store the original file in object storage (S3, GCS, Cloudflare R2)
- Store the URL in `resumeData.resumeFileUrl`
- Set reasonable max file size: **10 MB**

---

## 8. Error Handling

### Standard Error Response Format

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable error message",
    "details": [{ "field": "email", "message": "Email is already registered" }]
  }
}
```

### HTTP Status Codes

| Code  | Usage                                                   |
| ----- | ------------------------------------------------------- |
| `200` | Success (GET, PUT, PATCH, DELETE)                       |
| `201` | Created (POST that creates a resource)                  |
| `400` | Validation error / bad request                          |
| `401` | Unauthenticated (missing/invalid token)                 |
| `403` | Forbidden (valid token but insufficient permissions)    |
| `404` | Resource not found                                      |
| `409` | Conflict (e.g., duplicate email, duplicate application) |
| `413` | Payload too large (file upload)                         |
| `422` | Unprocessable entity (e.g., resume parsing failure)     |
| `429` | Rate limited                                            |
| `500` | Internal server error                                   |

### Error Codes

| Code                        | Description                            |
| --------------------------- | -------------------------------------- |
| `AUTH_REQUIRED`             | No valid authentication token          |
| `INVALID_CREDENTIALS`       | Wrong email or password                |
| `EMAIL_EXISTS`              | Account with this email already exists |
| `VALIDATION_ERROR`          | Request body failed validation         |
| `NOT_FOUND`                 | Requested resource doesn't exist       |
| `FORBIDDEN`                 | User doesn't own this resource         |
| `DUPLICATE_APPLICATION`     | Already applied/saved this job         |
| `INVALID_STATUS_TRANSITION` | Job posting status change not allowed  |
| `FILE_TOO_LARGE`            | Uploaded file exceeds size limit       |
| `UNSUPPORTED_FILE_TYPE`     | File format not accepted               |
| `PARSE_FAILED`              | Resume parsing failed                  |
| `RATE_LIMITED`              | Too many requests                      |

---

## 9. Pagination Convention

All list endpoints that may return large datasets should support cursor-based or offset pagination.

### Offset Pagination (Simpler)

**Request query params:**

```
?page=1&limit=20
```

**Response fields:**

```json
{
  "data": [...],
  "total": 142,
  "page": 1,
  "limit": 20,
  "totalPages": 8
}
```

### Default Values

- `page`: `1`
- `limit`: `20` (max: `100`)

### Endpoints Requiring Pagination

- `GET /api/jobs` — could have thousands of listings
- `GET /api/jobs/matches` — same dataset, sorted
- `GET /api/jobs/map` — optional (depends on viewport size)
- `GET /api/employer/jobs` — typically small dataset, optional

---

## 10. Security Guidelines

### Authentication

- Store passwords hashed with **bcrypt** (cost factor ≥ 12) or **argon2id**
- Never return `passwordHash` in any API response
- Use HTTP-only, Secure, SameSite cookies for refresh tokens
- Implement CSRF protection if using cookies

### Input Validation

- Validate and sanitize all inputs server-side
- Use a schema validation library (Zod, Joi, class-validator)
- Limit string lengths (e.g., `name` ≤ 100 chars, `description` ≤ 10,000 chars)
- Validate enum values against allowed lists

### Rate Limiting

- Auth endpoints: 5 requests / minute / IP
- Resume upload: 10 requests / hour / user
- General API: 100 requests / minute / user

### File Uploads

- Validate MIME type server-side (don't trust `Content-Type` header)
- Scan for malware before processing
- Max file size: 10 MB
- Only accept: `application/pdf`, `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`, `text/plain`

### Data Access

- Always scope queries to the authenticated user's data
- Applications: user can only see/edit their own
- Job postings: employer can only manage their own
- Company profile: one per employer user

### CORS

- Restrict allowed origins to frontend domain(s)
- Allow credentials for cookie-based auth

---

## 11. Suggested Tech Stack

### Option A: Node.js (Best Frontend Parity)

| Layer          | Technology                                |
| -------------- | ----------------------------------------- |
| Runtime        | Node.js 20+                               |
| Framework      | Express / Fastify / Hono                  |
| ORM            | Prisma / Drizzle                          |
| Database       | PostgreSQL                                |
| Validation     | Zod                                       |
| Auth           | jsonwebtoken + bcrypt                     |
| File Storage   | AWS S3 / Cloudflare R2                    |
| Resume Parsing | OpenAI API / pdf-parse + LLM              |
| Search         | PostgreSQL full-text search / Meilisearch |

### Option B: Python (Best for ML/AI)

| Layer          | Technology                       |
| -------------- | -------------------------------- |
| Framework      | FastAPI / Django REST            |
| ORM            | SQLAlchemy / Django ORM          |
| Database       | PostgreSQL                       |
| Validation     | Pydantic                         |
| Auth           | PyJWT + passlib                  |
| File Storage   | boto3 (S3)                       |
| Resume Parsing | LangChain + OpenAI / pyresparser |
| Search         | PostgreSQL / Elasticsearch       |

### Option C: Next.js API Routes (Monorepo)

Since the frontend is already Next.js 16, you could use **Next.js Route Handlers** (`app/api/`) for the backend:

| Layer          | Technology                                 |
| -------------- | ------------------------------------------ |
| Framework      | Next.js 16 Route Handlers                  |
| ORM            | Prisma / Drizzle                           |
| Database       | PostgreSQL (Neon / Supabase / PlanetScale) |
| Auth           | NextAuth.js v5 / Lucia                     |
| File Storage   | Vercel Blob / S3                           |
| Resume Parsing | OpenAI API                                 |

This avoids CORS entirely and shares types across frontend and backend.

---

## Appendix A: Complete Request/Response Reference

### Quick Reference Table

| #   | Method   | Endpoint                          | Auth | Role     | Purpose                      |
| --- | -------- | --------------------------------- | ---- | -------- | ---------------------------- |
| 1   | `POST`   | `/api/auth/signup`                | No   | —        | Create account               |
| 2   | `POST`   | `/api/auth/login`                 | No   | —        | Sign in                      |
| 3   | `POST`   | `/api/auth/logout`                | Yes  | Any      | Invalidate session           |
| 4   | `GET`    | `/api/auth/me`                    | Yes  | Any      | Get current user             |
| 5   | `POST`   | `/api/resume/upload`              | Yes  | Seeker   | Upload & parse resume        |
| 6   | `POST`   | `/api/onboarding/complete`        | Yes  | Seeker   | Finish onboarding            |
| 7   | `GET`    | `/api/profile`                    | Yes  | Seeker   | Get full profile             |
| 8   | `PUT`    | `/api/profile/resume`             | Yes  | Seeker   | Update resume data           |
| 9   | `PUT`    | `/api/profile/work-style`         | Yes  | Seeker   | Update work style & passions |
| 10  | `PUT`    | `/api/profile/career-preferences` | Yes  | Seeker   | Update career prefs          |
| 11  | `PUT`    | `/api/profile/portfolio-links`    | Yes  | Seeker   | Update portfolio URLs        |
| 12  | `GET`    | `/api/jobs`                       | Yes  | Seeker   | Search/filter jobs           |
| 13  | `GET`    | `/api/jobs/recommended`           | Yes  | Seeker   | Top matched jobs             |
| 14  | `GET`    | `/api/jobs/matches`               | Yes  | Seeker   | All jobs by match score      |
| 15  | `GET`    | `/api/jobs/map`                   | Yes  | Seeker   | Jobs with coordinates        |
| 16  | `GET`    | `/api/jobs/:id`                   | Yes  | Seeker   | Single job detail            |
| 17  | `GET`    | `/api/applications`               | Yes  | Seeker   | All user applications        |
| 18  | `POST`   | `/api/applications`               | Yes  | Seeker   | Save/apply to job            |
| 19  | `PATCH`  | `/api/applications/:id/status`    | Yes  | Seeker   | Update app status            |
| 20  | `PATCH`  | `/api/applications/:id/notes`     | Yes  | Seeker   | Update app notes             |
| 21  | `DELETE` | `/api/applications/:id`           | Yes  | Seeker   | Remove application           |
| 22  | `GET`    | `/api/dashboard/stats`            | Yes  | Seeker   | Dashboard stats              |
| 23  | `GET`    | `/api/employer/company`           | Yes  | Employer | Get company profile          |
| 24  | `PUT`    | `/api/employer/company`           | Yes  | Employer | Upsert company profile       |
| 25  | `GET`    | `/api/employer/jobs`              | Yes  | Employer | List job postings            |
| 26  | `POST`   | `/api/employer/jobs`              | Yes  | Employer | Create job posting           |
| 27  | `PATCH`  | `/api/employer/jobs/:id/status`   | Yes  | Employer | Change posting status        |
| 28  | `DELETE` | `/api/employer/jobs/:id`          | Yes  | Employer | Delete posting               |

**Total: 28 endpoints**

---

## Appendix B: Onboarding Step Mapping

The frontend onboarding flow has **5 steps** (indexed 0–4). Each step collects specific data and maps to specific API calls:

| Step | Name        | Data Collected                                                                 | API Call                                                 |
| ---- | ----------- | ------------------------------------------------------------------------------ | -------------------------------------------------------- |
| 0    | Resume      | File upload + skills + education + experience                                  | `POST /api/resume/upload` then `PUT /api/profile/resume` |
| 1    | Work Style  | collaboration, structure, riskTolerance (1–5 each)                             | _(saved with step 2)_                                    |
| 2    | Passions    | passions[] (from PASSIONS list)                                                | `PUT /api/profile/work-style` (includes step 1 data)     |
| 3    | Preferences | targetRoles, industries, arrangement, type, size, salary, relocate, start date | `PUT /api/profile/career-preferences`                    |
| 4    | Portfolio   | LinkedIn, GitHub, Portfolio, Design, Blog URLs                                 | `PUT /api/profile/portfolio-links`                       |
| —    | Complete    | —                                                                              | `POST /api/onboarding/complete`                          |

**Note:** Steps 1 and 2 are sent together in a single `PUT /api/profile/work-style` call because the frontend combines `workStyle` and `passions` into the `HolisticProfile` object.

---

## Appendix C: Frontend Store Actions → API Mapping

This maps every Zustand store action to its corresponding API call for migration:

| Store Action                          | API Endpoint                      | HTTP Method |
| ------------------------------------- | --------------------------------- | ----------- |
| `login(email, password)`              | `/api/auth/login`                 | `POST`      |
| `signup(name, email, password)`       | `/api/auth/signup`                | `POST`      |
| `logout()`                            | `/api/auth/logout`                | `POST`      |
| `setResumeData(data)`                 | `/api/profile/resume`             | `PUT`       |
| `setHolisticProfile(profile)`         | `/api/profile/work-style`         | `PUT`       |
| `setCareerPreferences(prefs)`         | `/api/profile/career-preferences` | `PUT`       |
| `setPortfolioLinks(links)`            | `/api/profile/portfolio-links`    | `PUT`       |
| `completeOnboarding()`                | `/api/onboarding/complete`        | `POST`      |
| `addApplication(job, status)`         | `/api/applications`               | `POST`      |
| `updateApplicationStatus(id, status)` | `/api/applications/:id/status`    | `PATCH`     |
| `updateApplicationNotes(id, notes)`   | `/api/applications/:id/notes`     | `PATCH`     |
| `removeApplication(id)`               | `/api/applications/:id`           | `DELETE`    |
| `setCompanyProfile(profile)`          | `/api/employer/company`           | `PUT`       |
| `addJobPosting(posting)`              | `/api/employer/jobs`              | `POST`      |
| `updateJobPosting(id, updates)`       | `/api/employer/jobs/:id`          | `PATCH`     |
| `updateJobPostingStatus(id, status)`  | `/api/employer/jobs/:id/status`   | `PATCH`     |
| `removeJobPosting(id)`                | `/api/employer/jobs/:id`          | `DELETE`    |

---
