# Database Security & Architectural Analysis: Refactoring Plan

This document provides a critical evaluation of the existing Supabase data structures, security policies, and database functions. It serves as both a roadmap for technical improvements and a guide for implementing production-grade PostgreSQL patterns.

---

## Phase 1: Immediate Security Hardening
**Objective:** Close critical exploits that allow unauthorized data manipulation and mitigate platform-specific vulnerabilities.

### 1.1 Mandatory Row Level Security (RLS)
*   **The Case:** Currently, `blips`, `blip_views`, and `project_views` have RLS disabled. In a Supabase environment, this means the `anon` key (exposed in the browser) has full `INSERT`, `UPDATE`, and `DELETE` privileges by default. An attacker could wipe your entire `blips` table with a single `fetch` call from the console.
*   **Learning Outcome:** **"Default-Deny" Security Model.** You will learn how to implement a fail-safe architecture where data is inaccessible unless a specific policy explicitly permits it.
*   **Action:** 
    ```sql
    ALTER TABLE public.blips ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Allow public read-only access" ON public.blips FOR SELECT USING (true);
    -- No policies for INSERT/UPDATE/DELETE ensures only service_role can modify.
    ```

### 1.2 Defensive `SECURITY DEFINER` Functions
*   **The Case:** Functions like `increment_bloq_view` run with the privileges of the creator (owner) rather than the caller. Without a fixed `search_path`, an attacker could create a malicious table named `bloq_views` in their own schema, and if they can influence the session's search path, your function might update *their* table instead of yours.
*   **Learning Outcome:** **Search Path Hijacking Mitigation.** You will learn how to write "hermetic" SQL functions that are immune to environment manipulation.
*   **Action:** Add `SET search_path = public` to all `SECURITY DEFINER` functions.

### 1.3 Identity-Bound Policies
*   **The Case:** The `claps` update policy is "Anyone can update." This allows User A to change User B's `clap_count` if they know the record ID.
*   **Learning Outcome:** **Resource Ownership Validation.** You will learn how to use session variables (like `user_fingerprint` or `auth.uid()`) to bind write operations to the original creator of the record.

---

## Phase 2: Architectural Refactoring (The DRY Principle)
**Objective:** Reduce code surface area by 60% and eliminate redundant maintenance tasks.

### 2.1 Unified View Tracking (Polymorphism)
*   **The Case:** You currently have 3 tables and ~6 functions to do the same thing: increment a counter. If you add a "News" section tomorrow, you'd have to create a 4th table and 2 more functions.
*   **Learning Outcome:** **Polymorphic Schema Design.** You will learn how to use a single table to handle multiple entity types (bloqs, blips, projects) using a `target_type` discriminator.
*   **Action:** 
    - Create `entity_views (entity_type text, entity_id text, count int)`.
    - Create a single `increment_view(p_type, p_id)` function.
    - Result: One source of truth for all analytics.

### 2.2 Privacy-First IP Tracking
*   **The Case:** Storing raw IP addresses in `visits` is a liability. If your database ever leaks, you've leaked the physical location history of your visitors.
*   **Learning Outcome:** **Cryptographic Anonymization.** You will learn how to use `digest()` (from `pgcrypto`) to store a "Salted Hash" of an IP. This allows you to count "Unique Visitors" (the hashes match) without ever knowing who the visitor actually is.

### 2.3 Atomic Upserts (Concurrency Control)
*   **The Case:** Your `upsert_clap` function uses `SELECT` -> `IF FOUND` -> `UPDATE` -> `ELSE` -> `INSERT`. If two claps arrive at the exact same millisecond, both might see "Not Found" and both will try to `INSERT`, causing one to fail with a primary key violation.
*   **Learning Outcome:** **Atomic Operations.** You will learn to use `INSERT ... ON CONFLICT`, which handles the check and the action in a single, thread-safe database cycle.

---

## Phase 3: Data Integrity & Modernization
**Objective:** Shift validation from the Application Layer (Next.js) to the Data Layer (Postgres) for "bulletproof" consistency.

### 3.1 Custom Domain Types & Enums
*   **The Case:** `post_type` is currently a `text` field with a `CHECK` constraint. This is "stringly-typed" and prone to typos.
*   **Learning Outcome:** **Type-Safe Databases.** You will learn how to create custom PostgreSQL `ENUM` types that act like TypeScript Unions, providing autocomplete and strict validation at the engine level.
*   **Action:** `CREATE TYPE entity_type AS ENUM ('bloq', 'blip', 'project');`

### 3.2 Global Audit Triggers
*   **The Case:** You have multiple `touch_updated_at` functions. 
*   **Learning Outcome:** **Trigger Abstraction.** You will learn how to create one generic "Audit Trigger" that can be attached to any table in the database to automatically maintain `updated_at` timestamps without writing new code for new tables.

---

## Summary of Outcomes
1.  **Reduced Liability:** No PII (IPs) or open write-access.
2.  **Lower Maintenance:** One view table instead of three.
3.  **High Reliability:** No race conditions in claps or views.
4.  **Developer Growth:** Moving from "Using Supabase as a JSON store" to "Architecting a Relational Database."
