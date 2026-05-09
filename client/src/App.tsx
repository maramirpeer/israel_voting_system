import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Governance from "./pages/Governance";
import MinistryDashboard from "./pages/MinistryDashboard";
import MinistryDetails from "./pages/MinistryDetails";
import DelegateSelection from "./pages/DelegateSelection";
import DelegationAnalytics from "./pages/DelegationAnalytics";
import MK121 from "./pages/MK121";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/governance"} component={Governance} />
      <Route path={"/ministry/:id"} component={MinistryDetails} />
      <Route path={"/ministry-dashboard"} component={MinistryDashboard} />
      <Route path={"/delegate-selection"} component={DelegateSelection} />
      <Route path={"/delegation-analytics"} component={DelegationAnalytics} />
      <Route path={"/mk121"} component={MK121} />
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
