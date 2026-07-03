Here's a **production-grade prompt** you can use with an LLM (like ChatGPT, Claude, or Gemini) to generate a complete **Frontend Interview Preparation Web Application**. This prompt is designed to produce clean, scalable, modern code rather than a quick prototype.

# Frontend Interview Preparation Web Application - Master Development Prompt

You are a Staff Frontend Engineer, Senior UI/UX Designer, Product Designer, and Software Architect.

Your task is to build a production-quality web application for interview preparation.

The application should feel comparable to platforms like LeetCode, Frontend Interview Handbook, GreatFrontEnd, Roadmap.sh, and MDN.

---

# Tech Stack

Use:

* React 19
* TypeScript
* Vite
* React Router
* Tailwind CSS
* shadcn/ui
* Lucide Icons
* React Query (TanStack Query)
* Zustand
* React Hook Form
* Framer Motion
* Fuse.js (Search)
* Local Storage (Offline support)

Do NOT use Redux.

---

# Project Goals

The application should work completely offline.

All interview questions will be stored as JSON files.

No backend is required.

Everything should be loaded from local JSON.

The application should be responsive.

Desktop

Tablet

Mobile

PWA-ready architecture is preferred.

---

# Folder Structure

Create a scalable folder structure.

Example

src/

app/

components/

features/

hooks/

layouts/

pages/

routes/

services/

store/

types/

utils/

assets/

data/

styles/

---

# Interview Categories

Support:

HTML

CSS

JavaScript

TypeScript

React

Browser & Rendering

Performance

Accessibility

Security

System Design

Coding Questions

Behavioral Questions

---

# Home Page

Display

Search bar

Featured Categories

Continue Learning

Recently Viewed

Bookmarks

Interview Progress

Daily Question

Popular Topics

Difficulty Distribution

Statistics

---

# Category Page

Display

Category title

Description

Number of Questions

Progress

Filter

Search

Sort

Difficulty

Frequency

Tags

Companies

Estimated Reading Time

---

# Question List

Each card should display

Question title

Difficulty badge

Frequency badge

Reading time

Companies

Tags

Bookmark icon

Completed status

---

# Question Details Page

Display

Title

Difficulty

Frequency

Companies

Tags

Estimated Reading Time

Answer

Best Practices

Common Mistakes

Example

Interview Tip

Follow-up Questions

Related Questions

Previous Question

Next Question

Bookmark

Share

Copy Link

Mark Complete

---

# Search

Global search.

Search should work on

Title

Description

Tags

Companies

Category

Use Fuse.js.

---

# Filters

Difficulty

Easy

Medium

Hard

Frequency

Very High

High

Medium

Low

Companies

Tags

Estimated Reading Time

Completed

Bookmarked

---

# Bookmark Feature

Allow bookmarking.

Persist in Local Storage.

---

# Progress Tracking

Track

Completed Questions

Bookmarked Questions

Reading Progress

Category Progress

Overall Progress

Persist in Local Storage.

---

# Dark Mode

Support

Light

Dark

System

Persist preference.

---

# Animations

Use Framer Motion.

Smooth page transitions.

Card hover animations.

Sidebar animation.

Modal animation.

Search animation.

No excessive animation.

---

# Layout

Responsive Sidebar

Top Navigation

Breadcrumbs

Sticky Search

Sticky Filters

Scrollable Question Panel

---

# Components

Create reusable components.

Button

Card

Badge

Tag

Search Input

Filter Drawer

Sidebar

Navbar

Question Card

Progress Card

Modal

Accordion

Tabs

Toast

Skeleton Loader

Empty State

Error State

Loading State

---

# UI Design

Modern.

Clean.

Minimal.

Professional.

Excellent spacing.

Rounded corners.

Soft shadows.

Good typography.

Use Tailwind best practices.

Avoid inline styles.

---

# Accessibility

WCAG AA

Keyboard Navigation

Screen Reader Friendly

Proper aria labels

Visible Focus

Semantic HTML

Accessible Modals

Accessible Dialogs

Accessible Menus

Accessible Buttons

Accessible Forms

---

# Performance

Lazy Loading

Route Splitting

Component Memoization

Virtualized Lists if necessary

Image Optimization

Debounced Search

Efficient Rendering

Avoid unnecessary re-renders

---

# Routing

/

Home

/category/:category

/question/:id

/bookmarks

/progress

/settings

/about

---

# Settings Page

Dark Mode

Font Size

Compact Mode

Animations

Reset Progress

Export Progress

Import Progress

---

# Statistics Page

Questions Completed

Bookmarks

Time Spent

Category Progress

Difficulty Breakdown

Completion Percentage

Charts

---

# Offline Support

Load all JSON locally.

No API calls.

Cache assets.

Fast startup.

---

# Data Structure

Each question JSON has

id

category

title

difficulty

frequency

estimatedReadTime

companies

tags

description

bestPractices

commonMistakes

example

interviewTip

followUpQuestions

relatedQuestions

---

# Code Quality

Use

Reusable Components

Custom Hooks

Strong TypeScript types

No duplicated logic

Proper naming

Clean architecture

SOLID principles where applicable

---

# Deliverables

Generate the application step by step.

Do NOT generate everything at once.

Generate in this order:

1. Project setup
2. Folder structure
3. TypeScript models
4. Routing
5. Global layout
6. Theme
7. Sidebar
8. Navbar
9. Home page
10. Category page
11. Question page
12. Search
13. Filters
14. Bookmark system
15. Progress system
16. Statistics
17. Settings
18. Local Storage
19. Accessibility improvements
20. Performance optimizations
21. Final polishing

Generate complete production-ready code.

Every file should be complete.

Do not skip any code.

Do not use placeholders like "implement later".

Explain architectural decisions briefly before each major section.

Wait for my confirmation before moving to the next step.

This prompt guides the model to build the application incrementally, which produces higher-quality code, avoids context limits, and makes it easier to review each stage before proceeding.
