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