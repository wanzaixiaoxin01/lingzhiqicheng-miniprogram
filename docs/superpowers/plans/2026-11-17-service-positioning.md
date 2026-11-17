# Service Positioning Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Align the mini-program and operations console with the approved offline-space, interest-activity, device-consultation, space-notice, and visit-record positioning.

**Architecture:** Preserve database models, routes, payload fields, and stored records. Change only visible copy, navigation labels, page metadata, defaults shown to new records, and seed examples; lock the behavior with source-level UI tests and run both existing suites.

**Tech Stack:** WeChat Mini Program JavaScript/WXML/JSON, Node test runner, FastAPI/Jinja2, Python unittest/pytest.

---

### Task 1: Mini-program positioning copy

**Files:**
- Modify: `tests/tab-bar.test.js`
- Modify: `tests/courses-page.test.js`
- Modify: `tests/articles-page.test.js`
- Modify: `tests/profile-page.test.js`
- Modify: `tests/appointment-page.test.js`
- Modify: `tests/self-study-room.test.js`
- Modify: `app.json`, `custom-tab-bar/index.js`
- Modify: `pages/home/*`, `pages/courses/*`, `pages/course-detail/*`, `pages/articles/*`, `pages/profile/*`, `pages/appointment/*`, `pages/self-study/*`
- Modify: `utils/course-catalog.js`, `utils/material-actions.js`

- [ ] Update assertions to require 兴趣活动、空间公告、到店记录、预约到店体验 and tutoring-free self-study copy.
- [ ] Run the focused Node tests and confirm they fail on the old labels.
- [ ] Replace the visible mini-program labels and descriptions while retaining page paths and API field names.
- [ ] Run the full mini-program test suite and confirm it passes.

### Task 2: Operations console positioning copy

**Files:**
- Create: `../services/api/tests/test_service_positioning_copy.py`
- Modify: `../services/api/app/templates/_nav.html`
- Modify: `../services/api/app/templates/dashboard.html`
- Modify: `../services/api/app/templates/resource_list.html`
- Modify: `../services/api/app/templates/resource_form.html`
- Modify: `../services/api/app/templates/attendance_roll_call.html`
- Modify: `../services/api/app/templates/operations_list.html`
- Modify: `../services/api/app/templates/operations_form.html`
- Modify: `../services/api/app/templates/admin_login.html`
- Modify: `../services/api/app/routes/admin_pages.py`
- Modify: `../services/api/app/routes/operations_admin.py`
- Modify: `../services/api/app/routes/public_api.py`
- Modify: `../services/api/app/seed.py`

- [ ] Add a source-level test for the approved console labels and removed customer-facing labels.
- [ ] Run the test and confirm it fails on the current templates.
- [ ] Replace visible console labels, form prompts, seed descriptions, and public error messages without changing routes or models.
- [ ] Run the full API test suite and confirm it passes.

### Task 3: Cross-project verification

**Files:**
- Verify only.

- [ ] Search both applications for remaining user-visible instances of the retired labels.
- [ ] Run the mini-program and API test suites once more after the final search fixes.
- [ ] Review both Git diffs to confirm no schema, route, or credential changes were introduced.
