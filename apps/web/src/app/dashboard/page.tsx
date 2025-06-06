import { Metadata } from 'next';
import { PersonalProfileForm } from '@/components/personal-profile-form';
import { AssetManagementForm } from '@/components/asset-management-form';
import { IncomeStreamForm } from '@/components/income-stream-form';
import { MilestoneForm } from '@/components/milestone-form';
import { ScenarioStatus } from '@/components/scenario-status';

export const metadata: Metadata = {
  title: 'Dashboard | Finpilot',
  description: 'Manage your financial scenarios',
};

export default function DashboardPage() {
  return (
    <div className="container mx-auto py-8">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Financial Dashboard</h1>
        <p className="text-lg text-muted-foreground">
          Create and manage your financial scenarios to plan for your future.
        </p>
      </div>

      {/* Main Content Area */}
      <div className="grid gap-8">
        {/* Scenarios Overview Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">Your Scenarios</h2>
            <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
              + New Scenario
            </button>
          </div>

          {/* Empty State - Will be replaced with actual scenarios later */}
          <div className="border-2 border-dashed border-border rounded-lg p-12 text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-muted flex items-center justify-center">
              <svg
                className="h-6 w-6 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-2">No scenarios yet</h3>
            <p className="text-muted-foreground mb-4">
              Get started by creating your first financial scenario.
            </p>
            <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
              Create Your First Scenario
            </button>
          </div>
        </section>

        {/* Scenario Editor Section - Will be populated in next steps */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Scenario Editor</h2>
            <div className="text-sm text-muted-foreground">
              Changes are automatically saved to your browser
            </div>
          </div>

          {/* Add the status component */}
          <ScenarioStatus />

          {/* Placeholder cards for the sections we'll build */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Personal Profile Card - Now with actual form */}
            <div className="p-6 bg-card rounded-lg border">
              <PersonalProfileForm />
            </div>

            {/* Assets Card - Now with actual asset management */}
            <div className="p-6 bg-card rounded-lg border">
              <AssetManagementForm />
            </div>

            {/* Income Streams Card - Now with actual income stream management */}
            <div className="p-6 bg-card rounded-lg border">
              <IncomeStreamForm />
            </div>

            {/* Milestones Card */}
            <div className="p-6 bg-card rounded-lg border md:col-span-2 lg:col-span-3">
              <MilestoneForm />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
