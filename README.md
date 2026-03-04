# Vocation - The Holistic Career Pathfinder

**Live:** [vocation.suppprith.com](https://vocation.suppprith.com)

Vocation is a career discovery platform that treats job hunting as more than a keyword exercise. It builds a complete picture of who you are - your skills, your passions, how you like to work, what kind of environment you thrive in - and uses that to surface roles that actually fit. It also has a full employer side, so companies can post jobs, manage listings, and set up their company presence in the same app.

## What It Does

Standard job boards match you on keywords. Vocation matches you on the full picture: what you can do, what you care about, how you prefer to work, and what kind of company culture suits you. Every job gets a match score derived from all of that, with a short explanation of why it's a good fit. On the flip side, employers can post jobs with detailed descriptions and manage them through a draft → active → paused → closed lifecycle.

## Features

### Authentication

- Combined sign-in and sign-up on one page with a tab switcher
- Persistent sessions via local storage
- Auth guards on all protected routes - unauthenticated users are redirected back to the root

### Onboarding

- Five-step guided wizard to build your full profile before hitting the dashboard
- Skills, education, and work history entry
- Work style sliders: collaboration, structure, and risk tolerance, each on a 1–5 scale
- Passion selection across 20 categories
- Career preferences: target roles, industries, company sizes, work arrangement, employment type
- Portfolio and profile links (LinkedIn, GitHub, personal site, design portfolio, blog)
- Progress bar across the top, with clickable step indicators to jump back and edit earlier answers

### Dashboard Home

- Stats at a glance: top match score, application count, skills tracked, interviews in progress
- Top 4 matched jobs with match scores and one-tap save
- Quick action cards linking to Matches, Tracker, and Profile

### Job Matching

- Full list of curated jobs sorted by match score
- Match score and match reason shown on every card
- Skill tags, work arrangement, employment type, and salary range visible without clicking in
- Save jobs straight to the tracker from this page

### Job Feed

- Searchable feed across job title, company, description, and skills
- Filter by industry, work arrangement, and company size - filters stack and clear independently
- Live result count updates as you type or filter

### Job Map

- Interactive map powered by MapLibre GL showing all onsite and hybrid positions
- Color-coded markers: lime green for onsite, yellow for hybrid
- Click a marker to open a popup with the job title, company, salary, and a link to the full detail
- "Locate me" button to move the map to your current location
- Tooltip on hover, full job detail modal on click

### Application Tracker

- Kanban board with five stages: Saved → Applied → Interviewing → Offer → Rejected
- Move cards forward or backward between stages
- Inline notes per application - click to edit, save or cancel in place
- Remove any application you no longer want to track

### Profile

- Collapsible sections for each profile dimension
- Inline skill editing with add-by-enter or button, and individual remove
- Visual 1–5 sliders for work style
- Passion tag selector
- Portfolio link editor
- Career preferences shown as tag groups
- Everything persists across sessions

### Employer - Company Profile

- Set up a company page with name, website, industry, size, location, and description
- Culture write-up, benefits list, tech stack tags, founded year, and LinkedIn URL
- Tags added inline, removed individually

### Employer - Post a Job

- Full job posting form: title, department, location, work arrangement, employment type, experience level
- Compensation range with currency selector
- Job summary, responsibilities, requirements, nice-to-haves, and required skills - all as editable lists
- Application URL and/or contact email
- Posts as draft by default; publish when ready

### Employer - Listings

- All posted jobs in one view with status badges (Draft, Active, Paused, Closed)
- Filter by status with live counts per tab
- Toggle a listing between Active and Paused in one click
- Delete with a confirmation step to avoid accidents
