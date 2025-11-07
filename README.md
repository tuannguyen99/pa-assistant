# pa-system — Performance Assessment System

**A comprehensive performance management platform that digitizes annual performance reviews, replacing manual Excel-based workflows with structured, auditable, and data-driven processes.**

## Overview

pa-system transforms the company's performance review process from Excel chaos into enterprise-grade software with:
- **Structured digital workflows** for target setting and evaluation
- **Role-based access control** (RBAC) with multi-role support
- **Complete audit trails** for all actions and state transitions
- **Multi-year analytics** for strategic talent management
- **Automated calculations** to eliminate manual errors
- **Optional AI writing assistance** (system fully functional without AI)

## Key Features

**Core System:**
- Digital target setting and performance evaluation workflows
- Automated score calculation and rank conversion
- Manager dashboards with team analytics
- HR company-wide reporting and consolidation
- Historical data preservation with read-only archives
- Employee career progression tracking

**Optional Enhancements:**
- AI-assisted writing for self-reviews (optional, clearly marked)
- AI synthesis for manager assessments (optional, transparent)
- Flexible AI backend (Ollama local or cloud APIs)

## Documentation

Key docs:
- `docs/PRD.md` — **Product Requirements Document** (detailed functional requirements, user journeys, technical specs)
- `docs/bmm-product-brief-pa-assistant-2025-11-02.md` — **Product Brief** (executive summary, problem statement, business impact)
- `docs/epics.md` — **Epic Breakdown** (25 stories across 3 epics)
- `docs/architecture.md` — **Technical Architecture** (database schema, API design, tech stack)
- `docs/README.md` — **Documentation Index** and role behaviour summary

## Role Behaviour (Short Summary)

A user account can have multiple roles (Employee, Manager, HR Admin, General Director, Board of Manager). The system supports:
- **Role switching** with contextual UI indicators ("Acting as: Reviewer — Reviewing: Akira Sato")
- **Reviewer scoping** by manager→direct-report relationships
- **HR Admin elevated visibility** with auditable privileges
- **Complete audit logging** of all role switches and actions

See `docs/PRD.md` for full RBAC specifications.

## Project Status

**Current Phase:** Requirements & Design Complete  
**Epic Count:** 3 epics, 25 stories  
**Target Scale:** MVP - 200 users (pilot: 10 users)  
**Tech Stack:** Next.js 14+, TypeScript, Prisma, SQLite (MVP) → PostgreSQL (production)

## Quick Start

See `docs/architecture.md` for complete project initialization and setup instructions.
