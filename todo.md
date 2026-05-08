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
