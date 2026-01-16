import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ThemeProvider } from '@/components/theme-provider';
import { AppLayout } from '@/components/layout/AppLayout';
import { Dashboard } from '@/pages/Dashboard';
import { Employees } from '@/pages/Employees';
import { EmployeeDetail } from '@/pages/EmployeeDetail';
import { Teams } from '@/pages/Teams';
import { TeamDetail } from '@/pages/TeamDetail';
import { Utilization } from '@/pages/Utilization';
import { Skills } from '@/pages/Skills';
import { Optimization } from '@/pages/Optimization';
import { AllocationBoard } from '@/pages/AllocationBoard';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <TooltipProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<AppLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="/employees" element={<Employees />} />
                <Route path="/employees/:id" element={<EmployeeDetail />} />
                <Route path="/teams" element={<Teams />} />

                <Route path="/teams/:id" element={<TeamDetail />} />
                <Route path="utilization" element={<Utilization />} />
                <Route path="skills" element={<Skills />} />
                <Route path="optimization" element={<Optimization />} />
                <Route path="allocations" element={<AllocationBoard />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;

