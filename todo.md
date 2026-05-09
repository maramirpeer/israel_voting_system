# Israel Voting System - TODO

## Completed Features

- [x] Core MK 121 system (quarterly bill/question voting)
- [x] Dynamic Civic Voice system (daily ministry decision voting)
- [x] Dual delegation system (official representatives or citizen-to-citizen)
- [x] Ministry-specific dashboards
- [x] Delegation chain visualization
- [x] Hebrew translation (RTL support)
- [x] Database seeding with realistic Israeli government data
- [x] Proposal submission system with forms
- [x] Full RTL/right-alignment for Hebrew text on Home page
- [x] Fixed TypeScript error in storageProxy.ts
- [x] Fixed duplicate useAuth import in MK121.tsx

## Pending Features

- [ ] Complete RTL alignment on all remaining pages (MK121, Governance, DelegateSelection)
  - [x] Added RTL wrapper and header alignment to MK121, Governance, DelegateSelection
  - [ ] Complete RTL pass for all tabs, cards, forms, and content sections in MK121
  - [ ] Complete RTL pass for all tabs, cards, forms, and content sections in Governance
  - [ ] Complete RTL pass for all tabs, cards, forms, and content sections in DelegateSelection
- [ ] Interactive decision timeline with real-time status updates
- [ ] Citizen testimonials section with user stories
- [ ] Detailed FAQ expansion with edge case explanations
- [ ] Delegation history tracking and analytics
- [ ] User profile page with voting history
- [ ] Advanced filtering and search in proposal lists
- [ ] Mobile responsiveness optimization
- [ ] Performance optimization for large datasets
- [ ] Accessibility audit and improvements

## Known Issues

- None currently

## Testing Status

- All 10 vitest tests passing
- Dev server running without errors
- No TypeScript errors


## Phase 1: Budget-Based Decision Classification & Real-Time Public Voting

- [x] Budget-based decision classification
  - [x] Add budget field to decisions table in schema
  - [x] Implement logic: budget > threshold → minimum medium category (1M NIS threshold)
  - [x] Update decision creation form with budget input (FRONTEND)
- [x] Real-time public voting on ministerial decisions (72-hour window)
  - [x] Add publicVotes table for tracking citizen votes on decisions
  - [x] Add publicVotingStartsAt/publicVotingEndsAt timestamps to schema
  - [x] Implement server-side vote aggregation with deduplication
  - [x] Add tRPC procedures for public voting (cast, getByDecision, getUserVote, active)
  - [x] Wire publicVotingStartsAt/publicVotingEndsAt when decision enters voting
  - [x] Display dynamic public voice percentage in Governance page (purple section with live updates)
  - [x] Show vote count, percentage for/against, and time remaining (30-second polling)
- [x] MK121 live updates during 3-month cycle
  - [x] Display current bills and questions with live vote counts
  - [x] Real-time vote aggregation from other users' votes (30-second polling)
  - [x] Show top proposals with dynamic ranking by votes (sorted by votes DESC in DB)
  - [x] Auto-refresh vote counts every 30 seconds during voting (refetchInterval: 30000)

## Phase 2: Design & Visual Improvements

- [x] Replace hero section image with Hebrew version
  - [x] Generate new hero image with Hebrew text "לא מחלוקות. מחברים."
  - [x] Add unity/connection symbols (hands, hearts, people)
  - [x] Use warm positive colors (gold, orange, green)
  - [x] Upload image to S3 storage
  - [x] Update Home.tsx to use new image URL


## Phase 3: Demo Data & System Activity

- [x] Add seed data script to populate demo content
  - [x] Create 3 active decisions with votes (72-hour voting windows)
  - [x] Create 4 bills for MK121 with citizen votes
  - [x] Create public voting data (72-hour windows)
  - [x] Populate ministry data (4 ministries)
  - [ ] Add delegate representatives (optional)
