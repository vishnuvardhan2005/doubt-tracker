# Doubt Tracker - Spec

## What it does
Student submits doubts, questions they are stuck-on
Teachers view all doubts and mark them resolved
Students can see the status of their own doubts

## Users
- Student: can submit doubts, view their doubts + status
- Teacher: can view all doubts, mark any doubt resolved

## Doubt fields
- Question (text)
- Subject (e.g. Maths, Physics)
- Priority (low / medium / high)
- Status (open / resolved)
- Submitted by (student)
- Created at

## What it is NOT (for now)
- No real-time updates
- No file attachments
- No comments/replies
- No notifications

## DB Schema

User
- id
- name
- email
- password (hashed)
- role (STUDENT | TEACHER)
- createdAt

Doubt
- id
- question
- subject
- priority (LOW | MEDIUM | HIGH)
- status (OPEN | RESOLVED)
- studentId (FK → User)
- resolvedBy (FK → User, nullable)
- createdAt
- updatedAt

## Feature: Priority Filter + Sort (v2)
<!-- added: phase 5 -->

### What it does
- Teacher: filter GET /api/doubts by priority and/or status via query params
- Student: sort GET /api/doubts/mine by priority (high → medium → low)

### API changes
GET /api/doubts?priority=HIGH&status=OPEN    → teacher
GET /api/doubts/mine?sort=priority           → student

### UI changes
- Teacher view: two dropdowns — filter by priority, filter by status
- Student view: sort toggle — sort by priority

### What does NOT change
- No new DB tables or columns (priority field already exists)
- No auth changes
- No changes to POST or PATCH endpoints

## Features in progress
- priority-filter branch: adds query param filtering to GET /api/doubts 
  and sort to GET /api/doubts/mine. No schema changes. No auth changes.