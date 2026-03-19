# AdmitConnect UI Migration Guide

## Purpose

This document defines the UI and migration rules for the AdmitConnect frontend.

The goal is not just to complete a Tailwind + shadcn/ui migration, but to end up with a UI that is clean, readable, trustworthy, and consistent.

The current risk is that component migration may succeed while page composition becomes worse. A page is not considered successful unless it is both technically migrated and visually readable.

---

## Core Goal

AdmitConnect should feel:

- clean
- credible
- premium
- academic
- calm
- readable

The product should feel closer to Stripe, Linear, or a polished education platform than to a flashy Dribbble concept.

Readability, hierarchy, and trust matter more than visual cleverness.

---

## Important Rule

Do not improvise page design freely.

This project should not be redesigned page by page in an ad hoc way.

Instead:

1. follow the layout rules in this document
2. reuse the same page patterns
3. preserve readability first
4. preserve behavior while improving presentation

A migration is only successful if the result is easy to read and easy to use.

---

## Migration Priorities

### Primary objective
Migrate the existing UI to Tailwind + shadcn/ui without breaking layout, readability, or behavior.

### Secondary objective
Improve consistency and polish after the layout is stable.

### Non-goals
Do not:
- redesign the whole product from scratch
- invent a brand new visual language page by page
- change backend logic unless explicitly requested
- rewrite application behavior while doing UI migration
- use fixed heights for text cards unless absolutely necessary
- prioritize “looking modern” over readability

---

## Visual Principles

### 1. Readability over style
A plain but readable page is better than a stylish unreadable page.

### 2. Strong hierarchy
Each page should clearly show:
- what this page is about
- what the user should read first
- what action they should take next

### 3. Use space intentionally
Whitespace should support hierarchy, not create emptiness.

### 4. Let text breathe
Large headlines need width.
Paragraphs need comfortable line length.
Cards should not trap large text in narrow columns.

### 5. Reuse patterns
This app should feel like one product, not many unrelated screens.

---

## Layout System

### Global container
Use a consistent page container:

- `max-w-7xl mx-auto px-6 lg:px-8`

For text-heavy content, use a narrower reading width inside sections:

- `max-w-3xl`

### Section spacing
Default section spacing:

- desktop: `py-16`
- mobile: `py-10`

### Grid behavior
Use grids for structure, not decoration.

Rules:
- two-column layouts should collapse cleanly to one column on smaller screens
- avoid layouts where the most important content becomes too narrow
- do not put giant headings inside narrow cards

### Cards
Cards should usually size to content.

Rules:
- avoid fixed-height text cards
- do not force equal heights if it creates empty space
- cards should support content, not constrain it unnaturally

---

## Typography Rules

### Hero headings
Use large headings only when they have enough width.

Recommended pattern:
- `text-[clamp(3rem,7vw,5.5rem)]`
- tight but readable line-height
- never place large hero text inside a narrow feature card

### Section headings
Use:
- `text-3xl` or `text-4xl`

### Body text
Use:
- `text-base` or `text-lg`
- comfortable line height
- muted text for secondary information

### Reading width
Long paragraphs should not stretch too wide.

Target:
- around 60–70 characters per line

---

## Component Rules

### Buttons
Use a small, consistent button system:
- primary
- secondary or outline
- ghost

Do not invent multiple button styles unless necessary.

### Badges and chips
Metadata and tags should be visually structured.

Use badges/chips for:
- specialties
- price
- timezone
- verification-related labels
- status labels

Never render long comma-separated specialties as a raw paragraph.

### Cards
Use at most 2–3 card styles across the app.

### Inputs and forms
Forms should prioritize clarity:
- label above input
- predictable spacing
- clear submit hierarchy
- avoid decorative complexity

---

## Canonical Page Patterns

These patterns should be reused consistently.

### 1. Marketing / Landing Page Pattern

Use for:
- homepage
- top-level promotional pages

Structure:
- hero section with generous width
- supporting feature cards to the side or below
- hero is not a card tile
- feature cards are secondary

Rules:
- the main headline must remain fully readable
- do not squeeze the hero into a narrow column
- feature cards should auto-size to content
- avoid large empty unused areas

### 2. Marketplace Detail Page Pattern

Use for:
- tutor detail pages
- profile-style pages

Structure:
- top summary header
- main content on the left
- sidebar / booking / availability card on the right
- single column on smaller screens

Rules:
- left side contains bio, specialties, details, trust signals
- right side contains booking or availability
- metadata should be neatly grouped
- specialties must be badges, not raw text blocks

### 3. Form / Dashboard Page Pattern

Use for:
- login
- signup
- onboarding
- admin forms
- settings

Structure:
- centered or contained form layout
- clean vertical rhythm
- restrained design
- emphasis on clarity, not drama

Rules:
- forms should feel stable and predictable
- avoid unnecessary card nesting
- avoid oversized headings above simple forms

---

## Reusable UI Primitives

Prefer creating and reusing layout primitives instead of repeating large custom class blocks.

Recommended shared components:
- `PageShell`
- `Section`
- `SectionHeader`
- `FeatureCard`
- `SidebarCard`
- `BadgeList`
- `MetricChip`

These should help pages remain consistent.

---

## Responsiveness Rules

Every page must work at:
- mobile (~390px)
- tablet (~768px)
- laptop (~1280px)
- desktop (~1440px)

Required behavior:
- no clipped text
- no oversized hero text inside narrow containers
- no layout collapse that destroys hierarchy
- no large blocks of dead space caused by fixed heights
- primary CTA remains easy to find

---

## Specific Known Failure Modes to Avoid

Do not produce these outcomes:

### 1. Giant headline trapped in a narrow card
This makes the page look modern but unreadable.

### 2. Fixed-height cards full of whitespace
This creates awkward empty UI and weakens hierarchy.

### 3. Raw comma-separated tag blobs
Convert these into badges or structured lists.

### 4. Technically correct but visually weak metadata
Price, timezone, school, and specialization should be grouped cleanly.

### 5. Beautiful grids with poor content hierarchy
The page must tell the user where to look first.

---

## Working Method for UI Migration

### Rule: separate migration from redesign

Do the work in two passes.

### Pass 1: system migration
Focus on:
- Tailwind migration
- shadcn/ui components
- layout cleanup
- preserved readability
- preserved behavior

### Pass 2: polish
Only after the page is stable:
- improve spacing
- improve hierarchy
- improve microcopy
- improve visual refinement

Do not combine both passes in a way that causes layout regressions.

---

## File-by-File Workflow

When modifying a page:

1. identify which canonical page pattern it belongs to
2. preserve content and behavior
3. replace old styles with Tailwind/shadcn/ui
4. ensure hierarchy is clear
5. check responsiveness
6. avoid new visual experiments unless requested

---

## Acceptance Checklist

A page is not complete unless all of these are true:

- no text overflow at common screen sizes
- no giant heading inside a narrow card
- no fixed-height text card causing wasted space
- no comma-separated tag blobs
- no unreadable text wrapping
- primary CTA is obvious within a few seconds
- the page feels like part of the same product
- readability is at least as good as before migration
- behavior is preserved unless explicitly changed

---

## Landing Page Rules

For the homepage:

- use a hero section, not a hero card
- give the main headline enough width
- keep supporting copy narrower and readable
- place feature cards beside or below the hero
- let cards auto-size to content
- avoid huge empty areas with weak structure

Do not:
- trap large text in a narrow card
- create an impressive-looking but unreadable composition

---

## Tutor Detail Page Rules

For tutor/profile pages:

- use a clean summary header
- show name, school, major, price, timezone in a structured way
- use a two-column layout on desktop
- left column for about/specialties/credibility
- right column for booking or availability
- specialties must be badges or chips
- long text should wrap cleanly and remain readable

Do not:
- dump specialties as one long paragraph
- crowd metadata into awkward horizontal lines
- make the availability card visually disconnected from the rest of the page

---

## Instructions for Codex

When editing files in this repo:

- preserve behavior
- preserve content
- improve presentation within the rules in this document
- do not invent new page patterns unless explicitly requested
- do not use fixed heights for text-based cards
- do not optimize for visual novelty
- optimize for readability, hierarchy, trust, and consistency

Whenever possible:
- reuse shared layout primitives
- keep diffs scoped
- explain layout choices briefly
- mention any follow-up cleanup that remains

---

## Expected Output Style from Codex

For each UI task, return:

1. changed files
2. what was changed structurally
3. why the new layout matches this guide
4. any remaining issues or follow-up suggestions

---

## Example Prompt Pattern for Codex

Use prompts in this style:

“Refactor this page using the rules in `UI_MIGRATION_GUIDE.md`.
Preserve all behavior and content.
Choose the correct canonical page pattern.
Prioritize readability and hierarchy.
Do not use fixed-height text cards.
Do not let large headings become constrained by narrow card widths.
Return only the changed files and a short explanation of the layout decisions.”

---

## Final Standard

A successful UI migration is not one that merely uses shadcn/ui.

A successful UI migration is one where:

- the interface is readable
- the hierarchy is obvious
- the product feels credible
- the layouts are consistent
- the codebase is easier to maintain
- the app looks better without becoming harder to use
