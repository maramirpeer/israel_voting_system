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

- [ ] Budget-based decision classification
  - [ ] Add budget field to decisions table in schema
  - [ ] Implement logic: budget > threshold → minimum medium category
  - [ ] Update decision creation form with budget input
- [ ] Real-time public voting on ministerial decisions (72-hour window)
  - [ ] Add public_votes table for tracking citizen votes on decisions
  - [ ] Create 72-hour countdown timer from decision creation
  - [ ] Implement real-time vote aggregation and display
  - [ ] Display dynamic public voice percentage in Governance page
  - [ ] Show vote count, percentage for/against, and time remaining
- [ ] MK121 live updates during 3-month cycle
  - [ ] Display current bills and questions with live vote counts
  - [ ] Real-time vote aggregation from citizen votes
  - [ ] Show top proposals with dynamic ranking by votes
  - [ ] Update vote counts without page refresh
