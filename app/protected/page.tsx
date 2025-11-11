// pages/protected.tsx (server component)
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { InfoIcon, User, Mail, Shield } from "lucide-react"
import { FetchDataSteps } from "@/components/tutorial/fetch-data-steps"
import { getAdminUser } from "@/hooks/use-admin"
import { SectionCards } from "@/components/section-cards"
import { SiteHeader } from "@/components/site-header"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"

export default async function ProtectedPage() {
  const { claims } = await getAdminUser()
  

  return (
    <div className="flex-1 w-full flex flex-col gap-8">
       <SiteHeader 
          title="StayVia Admin" 
          subtitle="USTP Dashboard" 
        />

        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              {/* <div className="flex flex-row"> */}
                <SectionCards />
              {/* </div> */}
              <div className="px-4 lg:px-6">
                <ChartAreaInteractive />
              </div>
              {/* <DataTable data={data} /> */}
            </div>
          </div>
        </div>

          {/* <UsersTableClient /> */}
          <div className="bg-accent text-sm p-3 px-5 rounded-md text-foreground flex gap-3 items-center">
            <InfoIcon size={16} strokeWidth={2} />
            This is a protected page that you can only see as an Admin user
          </div>

      {/* Non-admin view */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Your User Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium">Email:</span>
            {claims.email}
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium">Role:</span> {claims.role ?? "N/A"}
          </div>

          {/* Debug full claims */}
          <pre className="text-xs font-mono p-3 rounded border max-h-40 overflow-auto bg-muted">
            {JSON.stringify(claims, null, 2)}
          </pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Next Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <FetchDataSteps />
        </CardContent>
      </Card>

    </div>
  )
}
