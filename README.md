# Sustain.AI

# AI Prompt Optimization Suite

## Overview
A focused application for optimizing AI prompts to reduce carbon emissions through improved efficiency and token reduction.

## Authentication
- Internet Identity integration for user authentication
- All data is user-specific and private
- Automatic access control initialization after authentication
- Graceful handling of uninitialized user states with fallback UI

## Prompt Optimization
Helps users reduce carbon impact through prompt efficiency with automated optimization:

### Core Features
- Dashboard overview with clear introductory section explaining:
  - The purpose of the Prompt Optimizer: helping users rewrite prompts to use fewer tokens and communicate more effectively
  - How the optimizer works: removing unnecessary words, clarifying instructions, and streamlining structure for efficiency
  - Why this matters: reducing compute load and energy consumption, leading to measurable carbon savings beneficial for companies and the environment
- Prompt analysis tool that evaluates prompt length and complexity
- Automated prompt optimization engine that applies optimization rules:
  - Remove filler words and redundant phrases
  - Shorten long instructions to direct commands
  - Replace verbose style descriptions with format instructions
  - Provide structured output suggestions
  - Suggest placeholders instead of long pasted content
  - Limit request outputs with specific constraints
  - Suggest token-conscious rewrites with word limits
- Real-time before/after comparison showing:
  - Original vs optimized prompt text
  - Token count difference and percentage reduction
  - Estimated CO₂ savings based on token reduction
- Analysis report card displaying optimization statistics
- Auto-save functionality that stores each optimization automatically with duplicate prevention:
  - Frontend debouncing to prevent multiple save calls per optimization
  - Unique ID or timestamp-based deduplication
  - "isSaving" state flag to prevent redundant saves during processing
  - Backend validation to ensure each optimization is recorded only once
- Side panel with optimization principles and practical examples
- Animated progress visualization showing prompt efficiency improvement percentage
- Save optimized prompts for reuse
- Delete History feature:
  - "🗑 Delete History" button in the Prompt Optimizer interface
  - Confirmation modal before deletion to prevent accidental data loss
  - Complete removal of all optimization history for the current user
  - Automatic refresh of history list after deletion

### Data Storage
Backend stores user's prompt optimization history with duplicate prevention, optimized versions, token counts, and calculated savings with unique IDs. Backend validates uniqueness before storing new optimization records. Backend provides functionality to clear all prompt optimizations for a user.

## Report Generation
- Report generator that creates summaries focused on prompt optimization:
  - Total optimizations performed
  - Cumulative token savings
  - Estimated CO₂ savings from prompt efficiency
  - Optimization success rates and patterns
- Export reports as downloadable summaries

## User Interface
- Clean, analytical design with optimization focus
- Single-module interface centered on prompt optimization
- Dashboard overview with introductory section explaining the optimizer's purpose and benefits
- Interactive optimization interface with real-time feedback and save state indicators
- Delete History button with confirmation modal in Prompt Optimizer
- Responsive design for desktop and mobile use
- Loading states with "Initializing access control..." fallback UI
- Error handling for authentication and initialization failures
- English language content throughout the application

## Backend Operations
- Store and retrieve prompt optimization data with detailed metrics and duplicate prevention
- Validate optimization uniqueness before storage using ID or timestamp checks
- Clear all prompt optimizations for a user (clearPromptOptimizations function)
- Generate optimization-focused reports
- Perform savings estimations based on token reduction
- User data management and retrieval
- Access control initialization for new users
- User role management and verification
- Graceful error handling for uninitialized users

## Technical Requirements
- Automatic detection of uninitialized access control after Internet Identity authentication
- Automatic triggering of access control initialization when needed
- Error handling for backend calls that fail due to uninitialized state
- Retry mechanisms for queries after successful initialization
- Console logging for initialization flow debugging
- Prevention of infinite loading states during initialization
- Confirmation of successful initialization before dashboard display
- Frontend debouncing and state management to prevent duplicate optimization saves
- Backend deduplication logic to ensure unique optimization records
- Confirmation modal system for destructive actions like history deletion
