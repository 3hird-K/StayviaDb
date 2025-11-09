// TableCellViewer.tsx
import { Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter, DrawerClose } from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useIsMobile } from "@/hooks/use-mobile"
import { ChartConfig } from "./ui/chart"
import { ChartViewer } from "./chart-viewer"
import { CourseInfo } from "./course-info"
import { z } from "zod"

export const schema = z.object({
id: z.string(),
firstname: z.string(),
lastname: z.string(),
role: z.string().nullable(),
email: z.string().nullable(),
created_at: z.string().nullable(),
course_id: z.string().nullable(),
avatar_url: z.string().nullable()
})


export type User = z.infer<typeof schema>


const chartData = [
  { month: "January", desktop: 186, mobile: 80 },
  { month: "February", desktop: 305, mobile: 200 },
  { month: "March", desktop: 237, mobile: 120 },
  { month: "April", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "June", desktop: 214, mobile: 140 },
]

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "var(--primary)",
  },
  mobile: {
    label: "Mobile",
    color: "var(--primary)",
  },
} satisfies ChartConfig

function toCapitalize(str?: string) {
  if (!str) return ""
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

function TableCellViewer({ item }: { item: User }) {
  const isMobile = useIsMobile()
  function toCapitalize(str?: string) {
    if (!str) return ""
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
  }

  return (
    <Drawer direction={isMobile ? "bottom" : "right"}>
      <DrawerTrigger asChild>
        <Button variant="link" className="text-foreground w-fit px-0 text-left">
          {item.id}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="gap-1">
          <DrawerTitle>
            {toCapitalize(item.lastname)} {toCapitalize(item.firstname)}
          </DrawerTitle>
          <DrawerDescription>Showing Account Info</DrawerDescription>
        </DrawerHeader>

        <div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm">
          {!isMobile && (
            <ChartViewer
              data={chartData}
              config={chartConfig}
              title="GoogleMeet Attendance"
              description="Student log and activeness on online class meetings."
            />
          )}

          {/* Account Info Display */}
          <div className="grid gap-5">
            <div>
              <Label className="mb-1 text-muted-foreground">Account Type</Label>
              <p className="font-medium capitalize">{item.role}</p>
            </div>
            <div>
              <CourseInfo course_id={item.course_id} />
            </div>
          </div>
        </div>

        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline">Back</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

