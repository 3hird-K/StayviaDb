"use client"

import { SiteHeader } from "@/components/site-header"
import UsersTableStudents from "@/components/users-table-students"
// Assuming your Tabs components are here:
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs" 
import ActiveRenters from "@/components/active-renters"
import PendingVerifications from "@/components/pending-verifications"

export default function UsersPage() {
  return (
    <>
      <SiteHeader title="Manage Students" subtitle="Dashboard" />
      
      {/* Tabs Component for Navigation */}
      <Tabs defaultValue="list" className="w-full mt-6">
        
        {/* Tabs List (Navigation) */}
        <TabsList className="w-full justify-start h-auto p-0 border-b bg-transparent rounded-none">
          <TabsTrigger 
            value="list" 
            className="rounded-b-none data-[state=active]:bg-background data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary py-4 text-sm"
          >
            Student List
          </TabsTrigger>
          <TabsTrigger 
            value="active" 
            className="rounded-b-none data-[state=active]:bg-background data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary py-4 text-sm"
          >
            Active Renters
          </TabsTrigger>
          <TabsTrigger 
            value="pending" 
            className="rounded-b-none data-[state=active]:bg-background data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary py-4 text-sm"
          >
            Pending Verification
          </TabsTrigger>
        </TabsList>
        
        {/* Tab Content for Student List (Data Table) */}
        <TabsContent value="list" className="mt-4">
          <UsersTableStudents />
        </TabsContent>
        
        {/* Tab Content for Another Tab (Analytics/Placeholder) */}
        <TabsContent value="active" className="mt-4 p-6">
          <ActiveRenters />
        </TabsContent>

        <TabsContent value="pending" className="mt-4 p-6">
          <PendingVerifications />
        </TabsContent>
      </Tabs>
    </>
  )
}