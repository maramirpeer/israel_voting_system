import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Governance from "./pages/Governance";
import DecisionsSummary from "./pages/DecisionsSummary";
import MinistryDashboard from "./pages/MinistryDashboard";
import MinistryDetails from "./pages/MinistryDetails";
import DelegateSelection from "./pages/DelegateSelection";
import MK121 from "./pages/MK121";
import MK121Threshold from "./pages/MK121Threshold";
import MK121VoteRouting from "./pages/MK121VoteRouting";
import GovernanceVoteRouting from "./pages/GovernanceVoteRouting";
import { Analytics } from "./pages/Analytics";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/governance/decisions-summary"} component={DecisionsSummary} />
      <Route path={"/governance/vote-routing"} component={GovernanceVoteRouting} />
      <Route path={"/governance"} component={Governance} />
      <Route path={"/"} component={Home} />
      <Route path={"/ministry/:id"} component={MinistryDetails} />
      <Route path={"/ministry-dashboard"} component={MinistryDashboard} />
      <Route path={"/delegate-selection/:ministryId"} component={DelegateSelection} />
      <Route path={"/delegate-selection"} component={DelegateSelection} />
      <Route path={"/mk121/vote-routing"} component={MK121VoteRouting} />
      <Route path={"/mk121/threshold"} component={MK121Threshold} />
      <Route path={"/mk121"} component={MK121} />
      <Route path={"/analytics"} component={Analytics} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
