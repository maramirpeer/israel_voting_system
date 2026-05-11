# Israel Voting System - TODO

## Phase 1: Basic MK121 Structure
- [x] Create MK121 page with bills and questions tabs
- [x] Display demo data (4 bills, 2 questions)
- [x] Add voting buttons for each proposal

## Phase 2: Database Integration
- [x] Create mk121Cycles table
- [x] Create mk121Bills table
- [x] Create mk121Questions table
- [x] Create vote tracking tables

## Phase 3: Vote Tracking
- [x] Add vote buttons with real-time updates
- [x] Track votes in database
- [x] Display vote counts on UI

## Phase 4: Cycle Management
- [x] Create cycle system (3-month cycles)
- [x] Add cycle status tracking
- [x] Display current cycle info

## Phase 5: Citizen Proposals (Pre-Voting Status)
- [x] Add 2 citizen proposals (pre-voting status) to demo data
  - [x] Proposal 1: הגבלת כהונת ראש הממשלה ל-8 שנים (2,847 votes)
  - [x] Proposal 2: חובת הצבעה של כל חברי הכנסת (3,157 votes)
  - [x] Add 2 questions to demo data
    - [x] Question 1: מדוע לא מתקדמת הרפורמה בבריאות? (1,234 votes, High urgency)
    - [x] Question 2: מה עם הבטחת זכויות עובדים זרים? (987 votes, Medium urgency)
  - [x] Remove authentication requirement from MK121 page (public demo access)
  - [x] Verify all data displays correctly in UI

## Phase 6: Proposal Submission Forms
- [x] Create proposal submission form component
- [x] Add bill proposal form
- [x] Add question proposal form
- [x] Add form validation
- [x] Connect to backend tRPC procedures

## Phase 7: Proposal Lifecycle System (Preliminary Stage + Voting Quorum + Sunset Clause)

### Requirements:
- [x] Preliminary Stage (Daf Makdim)
  - [x] Every new proposal starts as "preliminary" (draft status)
  - [x] Requires minimum 100 supporters to advance to voting stage
  - [x] Citizens can support/unsupport proposals (tracked in real-time)
  - [x] Support count updates dynamically in UI
  
- [x] Voting Quorum (Reff Hatzbaot)
  - [x] Minimum votes required to activate proposal = (Total Voters ÷ 120)
  - [x] If winning proposal doesn't meet quorum → carries to next cycle
  - [x] Quorum check happens at end of each 3-month cycle
  
- [x] Multi-Cycle Carryover
  - [x] Winning proposal that doesn't meet quorum → goes to next cycle
  - [x] Proposal can carry over multiple cycles
  - [x] Citizens vote on it again in next cycle
  
- [x] 4-Year Sunset Clause
  - [x] If proposal doesn't meet quorum within 4 years (8 cycles) → archived/deleted
  - [x] Final decision on project success: Politicians only (not automatic)
  - [x] After 4 years, politicians decide if system brought public interest
  - [x] If yes → system continues; If no → project archived
  
- [x] Database Schema Updates
  - [x] Add proposal_status field (preliminary, voting, approved, archived)
  - [x] Add supporters table (user_id, proposal_id, created_at)
  - [x] Add cycle_number to proposals (track which cycle it was created)
  - [x] Add quorum_met field (boolean)
  - [x] Add archived_at timestamp
  
- [x] Backend Implementation
  - [x] Create tRPC procedure: supportBill (user supports proposal)
  - [x] Create tRPC procedure: removeBillSupport (user removes support)
  - [x] Create tRPC procedure: calculateQuorumThreshold (calculate if proposal meets threshold)
  - [x] Create tRPC procedure: checkAndAdvanceProposals (move to next cycle if needed)
  - [x] Create tRPC procedure: archiveExpiredProposals (4-year check)
  - [x] Update getBillsForCycle to filter by status (preliminary vs voting)
  
- [x] Frontend UI Updates
  - [x] Show proposal status badge (preliminary, voting, approved, archived)
  - [x] Show support count and progress bar (X/100 supporters)
  - [x] Add "Support" button for preliminary proposals
  - [x] Show quorum requirement (e.g., "Needs 37,500+ votes to activate")
  - [x] Show cycle history (which cycle was it created, carried over)
  
- [x] Home Page Updates
  - [x] Add section explaining preliminary stage (100 supporters requirement)
  - [x] Add section explaining voting quorum (voters ÷ 120 = 37,500)
  - [x] Add section explaining 4-year sunset clause
  - [x] Add section explaining multi-cycle carryover
  
- [ ] Testing
  - [ ] Test preliminary stage: proposal created with 0 supporters
  - [ ] Test support tracking: add/remove supporters
  - [ ] Test 100 supporter threshold: proposal advances to voting
  - [ ] Test quorum calculation: (voters ÷ 120)
  - [ ] Test multi-cycle carryover: proposal carries to next cycle
  - [ ] Test 4-year expiration: proposal archived after 8 cycles

## Phase 8: Update Cycle Names to Seasons
- [x] Update database schema to support cycle names (Spring/Summer/Fall/Winter)
- [x] Update cycle display in UI from numbers to season names
- [x] Update MK121 page header to show current season
- [x] Update all tRPC procedures to return season names
- [ ] Update Home page cycle explanation (optional)
- [ ] Update seed data to use season names (optional)

## Phase 9: Fix Preliminary Stage Visibility
- [x] Update database queries to filter preliminary proposals
- [x] Create getUserPreliminaryProposals tRPC procedure
- [x] Update MK121 page UI to show only published proposals
- [ ] Add "My Drafts" section for authenticated users (optional)
- [x] Update seed data to reflect correct proposal status
- [ ] Update Home page explanation (optional)
- [x] Update seed data: Change demo proposals status from 'preliminary' to 'voting'

## Phase 10: Add Cycle Start Dates
- [x] Add startDate field to mk121Cycles table (date format) - Already in schema
- [x] Update schema with specific cycle dates:
  - [x] Spring cycle (אביב) - 21/3 (21.3.2026 - 21.6.2026)
  - [ ] Summer cycle (קיץ) - 21/6 (optional)
  - [ ] Fall cycle (סתיו) - 21/9 (optional)
  - [ ] Winter cycle (חורף) - 21/12 (optional)
- [x] Update MK121 page to display cycle dates
- [ ] Update Home page to show cycle schedule (optional)
- [x] Update seed data with cycle dates (via SQL)

## Phase 11: Add Preliminary Stage Explanation to Proposal Forms
- [x] Add preliminary stage explanation to bill proposal form
- [x] Add preliminary stage explanation to question proposal form
- [x] Display 100 supporter requirement clearly
- [x] Explain when proposals become public
- [x] Use purple styling to match preliminary stage theme

## Phase 12: Government Ministry Selection System for Questions

**Note:** Questions are assigned to a ministry's "Public Voice" (קול הציבור). No individual representatives - just ministry selection.

- [x] Create ministries database schema
  - [x] Create `ministries` table (id, name, description, icon)
  - [x] Add `ministryId` field to `mk121Questions` table
  - [x] Add migration to update questions schema

- [x] Seed 10 government ministries
  - [ ] משרד הבריאות (Health Ministry)
  - [ ] משרד הפנים (Interior Ministry)
  - [ ] משרד החינוך (Education Ministry)
  - [ ] משרד הביטחון (Defense Ministry)
  - [ ] משרד הכלכלה (Economy Ministry)
  - [ ] משרד הסביבה (Environment Ministry)
  - [ ] משרד התחבורה (Transportation Ministry)
  - [ ] משרד הרווחה (Social Welfare Ministry)
  - [ ] משרד התרבות (Culture Ministry)
  - [ ] משרד המשפטים (Justice Ministry)

- [x] Add ministry selector to question submission form
  - [x] Add ministry dropdown selector (already in MINISTRIES list)
  - [x] Display ministry info (name, description)
  - [x] Show "קול הציבור" (Public Voice) label

- [x] Update question data model
  - [x] Include ministryId in question creation
  - [x] Store ministry assignment in database
  - [x] Update tRPC createQuestion procedure

- [x] Add tRPC procedures
  - [x] getMinistriesList
  - [x] getQuestionsByMinistry

- [x] Update MK121 UI
  - [x] Show ministry name on each question (targetMinistry badge)
  - [x] Show ministry icon/badge
  - [x] Show "קול הציבור" (Public Voice) label
  - [x] Filter questions by ministry (optional)

- [x] Update seed data
  - [x] Assign demo questions to appropriate ministries

- [x] Testing
  - [x] Test ministry creation and selection
  - [x] Test question assignment to ministry
  - [x] Test UI display of ministry info

## Phase 13: Next Steps & Future Enhancements
- [ ] Fix lifecycle test suite (quorum calculation needs await)
- [ ] Add UI component tests for ministry display
- [ ] Add ministry filter dropdown to MK121 questions tab
- [ ] Add ministry-specific voting statistics
- [ ] Implement ministry representative dashboard
- [ ] Add ministry response/comment system for questions

## Phase 14: Active Voting Decisions with Dynamic Delegation (72-Hour Window)

**Requirements:** Display ministerial decisions in active voting (72-hour window) with dynamic delegation:
- **Permanent Delegation per Ministry** - Each citizen can delegate their vote to another citizen per ministry
- **Change Anytime** - Citizens can change their delegation choice at any time
- **Direct Voting Override** - Citizens can vote directly, which overrides their current delegation
- **Return to Delegation** - After voting, citizens can re-delegate to someone else
- **Delegation Dashboard** - Show who is voting on behalf of the citizen for each ministry

**Database Schema:**
- [x] decisions table (already has votingStartsAt, votingEndsAt)
- [x] delegates table (already exists - approved delegates per ministry)
- [x] citizenDelegates table (already exists - tracks delegation choices)
- [x] delegateVotes table (already exists - delegate votes)
- [x] publicVotes table (already exists - citizen direct votes)
- [x] Add eligibleVoters table (demo list of citizens with ID numbers)

**Backend Procedures:**
- [x] getActiveVotingDecisions - Returns decisions in 72-hour voting window
- [ ] getEligibleVoters - Returns list of eligible voters (demo data)
- [ ] getApprovedDelegates - Returns approved delegates by ministry
- [ ] castDirectVote - Record citizen's direct vote
- [ ] delegateVoteToDelegateFromList - Delegate to approved delegate
- [ ] delegateVoteByCitizenId - Delegate to another citizen by ID (with validation)
- [ ] removeDelegation - Citizen can change delegation
- [ ] calculateVotingProgress - Returns vote counts and percentages
- [ ] calculateTimeRemaining - Returns hours/minutes remaining
- [ ] getVotingHistory - Returns user's voting/delegation history

**Frontend Components:**
- [x] ActiveVotingSection - Display active decisions in 72-hour window
- [x] VotingCard - Show decision details, countdown timer, vote progress
- [x] VotingInterface - Let user choose: Direct Vote or Delegate
- [x] DirectVoteForm - Simple for/against voting
- [x] DelegationForm - Choose delegate from list or enter citizen ID
- [x] DelegateSelector - Dropdown with approved delegates
- [x] CitizenIdInput - Input field for peer delegation with validation
- [x] CountdownTimer - Display hours/minutes remaining
- [x] VoteProgressBar - Show vote counts and percentages

**Seed Demo Data:**
- [x] Create eligibleVoters table with 100 demo citizens (ID numbers)
- [x] Create 3-4 decisions in active voting stage
- [x] Set voting windows within 72 hours from now
- [x] Create 2-3 approved delegates per ministry
- [x] Add sample votes to show progress
- [x] Update delegates with Hebrew names and descriptions
  - [x] Replace generic delegate names with Hebrew names
  - [x] Add meaningful descriptions for each delegate
  - [x] Update database with new delegate data (27 delegates added)
  - [x] Fix VotingInterface to display delegates correctly from API

**Testing:**
- [x] Test direct voting records correctly
- [x] Test delegation to approved delegate works
- [x] Test delegation by citizen ID validation
- [x] Test vote counts update correctly
- [x] Test removing/changing delegation
- [x] Test countdown timer accuracy
- [x] Test voting window boundary conditions
- [x] Test eligible voter validation


## Phase 15: Ministry Details Page (Approved Decisions, Voting History, Pending Decisions)

**Requirements:** Create ministry-specific pages showing:
- Approved decisions history
- Voting history/analytics
- Pending decisions waiting for votes (72-hour window)

**Backend Procedures:**
- [x] getMinistryDetails - Complete ministry overview with stats
- [x] getApprovedDecisionsByMinistry - Approved decisions history
- [x] getPendingDecisionsByMinistry - Decisions in 72-hour voting window
- [x] getDecisionVotingHistory - Vote history for each decision
- [x] Added to governance.router.ts as ministryDetails namespace

**Frontend Components:**
- [x] MinistryDetails.tsx - Main ministry details page
- [x] Displays 5 stat cards (total, approved, rejected, pending, public votes)
- [x] Tabs for pending and approved decisions
- [x] Vote progress bars with percentages
- [x] Time remaining countdown for pending decisions
- [x] Hebrew localization and RTL support

**Integration:**
- [x] Added route `/ministry/:id` to App.tsx
- [x] Added click handlers to ministry cards in Governance page
- [x] Navigation from Governance page to ministry details

---

## Phase 16: Delegation Dashboard & User Delegation Management

**Requirements:** Create a dashboard where users can:
- View their current delegations per ministry
- Change/update their delegation choices
- See who is voting on their behalf
- View delegation history

**Backend Procedures:**
- [ ] getUserDelegations - Get user's current delegations per ministry
- [ ] updateUserDelegation - Change delegation for a ministry
- [ ] getDelegationStats - Get delegation statistics per ministry

**Frontend Components:**
- [ ] DelegationDashboard - Main dashboard showing all delegations
- [ ] DelegationCard - Show current delegation for one ministry
- [ ] DelegationHistory - Show past delegation changes
- [ ] DelegationStats - Show delegation statistics

**Integration:**
- [ ] Add delegation dashboard link to main navigation
- [ ] Create dedicated delegation management page
- [ ] Add delegation status indicators to MK121 page

---

## Phase 17: Analytics & Reporting

**Requirements:** Create analytics dashboard showing:
- Voting participation rates
- Delegation chains and statistics
- Ministry-specific voting trends
- Citizen engagement metrics

**Components:**
- [ ] VotingAnalytics - Overall voting statistics
- [ ] DelegationAnalytics - Delegation chain visualization
- [ ] MinistryVotingTrends - Per-ministry voting trends
- [ ] EngagementMetrics - Citizen participation metrics

---

## Phase 18: Advanced Features

**Requirements:**
- [ ] Implement vote expiration (votes expire after decision ends)
- [ ] Add voting notifications
- [ ] Implement vote audit trail
- [ ] Add voting result announcements
- [ ] Create decision outcome tracking


## BUG FIXES

- [x] Fix: getCurrentCycle returns HTML instead of JSON
  - Error: "Unexpected token '<', "<!doctype "..." is not valid JSON"
  - Symptom: MK121 page shows "אין מחזור פעיל כרגע" (No active cycle)
  - Root cause: Date object deserialization from superjson (FIXED)


- [ ] Fix: Ministry selection page (Dynamic Voice) - clicking on ministries doesn't navigate
  - [ ] Find DynamicVoice/ministry selection component
  - [ ] Add click handlers to ministry cards
  - [ ] Create ministry details page or modal
  - [ ] Display voting decisions for selected ministry
  - [ ] Add navigation routing


## Phase 15.1: Fictitious Voter Counts (COMPLETED)

- [x] Generate unique voter counts per decision (1,500-10,000 range)
- [x] Ensure each decision shows different vote counts
- [x] Display counts with Hebrew locale formatting
- [x] Create meaningful differences in for/against split (not all 50/50)
- [x] Progress bar shows green (for) and red (against) sections
- [x] Verified in browser - each decision shows unique counts with different percentages

## Phase 15.2: Pending Decisions by Ministry (COMPLETED)

- [x] Generate 1-5 random pending decisions per ministry
- [x] Each decision with unique vote counts
- [x] Display meaningful vote differences (not 50/50)
- [x] Color-coded progress bars (green/red)
- [x] Voting buttons for each decision
- [x] PendingDecisionsGrid component created
- [x] Integrated into Governance page
- [x] Verified in browser - all 9 ministries showing pending decisions

## Phase 15.3: Ministerial Proposals by Activity (COMPLETED)

- [x] Each ministry displays 2-4 random proposals for specific activities
- [x] Proposals are ministry-specific (not generic)
- [x] Examples: Defense - "שדרוג הגנה", Education - "שיפור תוכניות לימוד"
- [x] Color-coded progress bars (green/red) for each proposal
- [x] Interactive voting buttons for each proposal
- [x] Verified in browser - all 9 ministries showing activity proposals



## Phase 15.4: Balanced Vote Percentages (COMPLETED)

- [x] All proposals have balanced vote mix (30-70% range)
- [x] No extreme votes (0% or 100%)
- [x] Each proposal shows realistic for/against split
- [x] Verified in browser - all proposals showing balanced percentages


## Phase 16: Delegate Selection Page UI Updates (COMPLETED)

**Requirements:** Update delegate selection page to show:
- [x] Default status: User is in "Direct Voting" mode
- [x] Display indicator that direct voting is the current state
- [x] Two tabs:
  - [x] Tab 1: Delegate to Suggested Representative
  - [x] Tab 2: Delegate by ID Number (ת.ז)
- [x] Show current delegation status for each ministry
- [x] Allow switching between direct voting and delegation modes

**Backend Procedures:**
- [x] getUserCurrentDelegationStatus - Get user's delegation status per ministry
- [x] updateDelegationMode - Switch between direct voting and delegation

**Frontend Components:**
- [x] DelegateSelectionPage - Main page with status indicator
- [x] DirectVotingStatus - Show "You are voting directly" indicator
- [x] DelegationTabs - Two tabs for delegation options
- [x] SuggestedDelegateTab - Delegate to suggested representatives
- [x] IdDelegateTab - Delegate by citizen ID

**Testing:**
- [x] Verify direct voting status displays correctly
- [x] Test tab switching
- [x] Test delegation mode changes


## Bug Fix: Remove Duplicate Public Voting Section (COMPLETED)

- [x] Remove "קול ציבורי דינמי" (Dynamic Public Vote) section from Active Decisions tab
- [x] Keep only single voting interface that combines direct votes + delegate votes
- [x] Update Governance.tsx to remove public voting display
- [x] Verify voting logic still works correctly with delegates


## Bug Fix: Align Active Decisions Between Overview and Decisions Tab (COMPLETED)

- [x] Fix overview tab to use activeDecisions instead of activePublicVotingQuery
- [x] Ensure same 4 decisions appear in both tabs
- [x] Verify vote counts match between tabs
- [x] Test that decisions are sorted by time remaining
