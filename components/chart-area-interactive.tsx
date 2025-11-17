"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { format, subDays, startOfDay, isAfter } from "date-fns"

// --- ⚠️ REQUIRED IMPORTS FROM YOUR ENVIRONMENT ---
import { useQuery } from "@tanstack/react-query"
// FIX: Changed aliased paths (@/) to relative paths (../) to resolve build errors.
import { getAllPosts } from "../lib/supabase/postService" 
import { getAllLandlords, getAllStudent } from "../lib/supabase/userService"
import { Skeleton } from "@/components/ui/skeleton"
// import { useIsMobile } from "@/hooks/use-mobile" 
// --------------------------------------------------

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardAction, 
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"
import { Database } from "@/database.types"


// --- 0. TYPE DEFINITIONS ---

// Define types for the raw data arrays coming from Supabase
type Post = Database["public"]["Tables"]["posts"]["Row"];
type User = Database["public"]["Tables"]["users"]["Row"];
interface CustomCSSProperties extends React.CSSProperties {
  '--color-area-fill'?: string;
}


type MetricKey = "properties" | "verified" | "pending" | "students";
type TimeRange = "7d" | "30d" | "90d";

interface ChartDataItem {
  date: string;
  properties: number;
  verified: number;
  pending: number;
  students: number;
  // Index signature for dynamic access
  [key: string]: string | number; 
}

interface Metric {
  value: MetricKey;
  label: string;
}

// --- 1. DATA TRANSFORMATION LOGIC (Supabase to Chart) ---

/**
 * Transforms raw Supabase data into cumulative time-series data for the chart.
 */
const createTimeSeriesData = (
  posts: Post[], 
  verifiedLandlords: User[], 
  pendingLandlords: User[], 
  students: User[], 
  days: number
): ChartDataItem[] => {
  const dataMap = new Map<string, Omit<ChartDataItem, 'date'>>();
  const today = startOfDay(new Date());
  
  // 1. Initialize data structure for the past 'days'
  for (let i = days; i >= 0; i--) {
    const date = format(subDays(today, i), "yyyy-MM-dd");
    dataMap.set(date, { properties: 0, verified: 0, pending: 0, students: 0 });
  }

  // Helper to safely count creation dates
  const countCreations = (items: (Post | User)[], key: MetricKey) => {
    items.forEach(item => {
      // Ensure created_at is valid before processing
      if (item.created_at) {
        const itemDate = format(startOfDay(new Date(item.created_at)), "yyyy-MM-dd");
        if (dataMap.has(itemDate)) {
          const current = dataMap.get(itemDate)!;
          current[key] = (current[key] as number) + 1;
        }
      }
    });
  };

  // 2. Count daily creations (non-cumulative yet)
  countCreations(posts, "properties");
  countCreations(verifiedLandlords, "verified");
  countCreations(pendingLandlords, "pending");
  countCreations(students, "students");

  // 3. Convert Map to sorted array and calculate cumulative totals
  const sortedDates = Array.from(dataMap.keys()).sort();
  const timeSeries: ChartDataItem[] = [];
  let cumulative = { properties: 0, verified: 0, pending: 0, students: 0 };

  for (const date of sortedDates) {
    const dailyData = dataMap.get(date)!;
    
    cumulative.properties += dailyData.properties as number;
    cumulative.verified += dailyData.verified as number;
    cumulative.pending += dailyData.pending as number;
    cumulative.students += dailyData.students as number;

    timeSeries.push({
      date,
      properties: cumulative.properties,
      verified: cumulative.verified,
      pending: cumulative.pending,
      students: cumulative.students,
    });
  }

  return timeSeries;
};


// --- 2. CHART CONFIGURATION ---
const chartConfig = {
  counts: { label: "Total Count", color: "hsl(var(--chart-1))" }, // Default color holder
  properties: { label: "Total Properties", color: "hsl(var(--chart-1))" }, // Blue/Primary
  verified: { label: "Verified Landlords", color: "hsl(var(--chart-2))" }, // Green
  pending: { label: "Pending Verifications", color: "hsl(var(--chart-3))" }, // Orange/Yellow
  students: { label: "Registered Students", color: "hsl(var(--chart-4))" }, // Purple
} satisfies ChartConfig

// List of metrics the user can select
const metrics: Metric[] = [
  { value: "properties", label: "Total Properties" },
  { value: "verified", label: "Verified Landlords" },
  { value: "pending", label: "Pending Verifications" },
  { value: "students", label: "Students" },
]

// --- 3. CHART COMPONENT (Integrated with Data Fetching) ---
export function ChartAreaInteractive() {
  const isMobile: boolean = false; // Replace with actual useIsMobile() hook if available
  
  const [timeRange, setTimeRange] = React.useState<TimeRange>("90d")
  const [selectedMetric, setSelectedMetric] = React.useState<MetricKey>("properties")
  
  // Define maximum days for fetching (used for data transformation)
  const MAX_DAYS = 90; 

  // --- DATA FETCHING (using the functions from your original component) ---
  const { data: posts, isLoading: postsLoading, error: postsError } = useQuery({
    queryKey: ["posts"],
    queryFn: () => getAllPosts(),
  });

  const {
      data: verifiedLandlords,
      isLoading: verifiedLoading,
      error: verifiedError,
    } = useQuery({
      queryKey: ["users", "landlords"],
      queryFn: () => getAllLandlords("landlord"),
    })
  const {
      data: pendingLandlords,
      isLoading: pendingLoading,
      error: pendingError,
    } = useQuery({
      queryKey: ["users", "pendingLandlords"],
      queryFn: () => getAllLandlords("landlord_unverified"),
    })

 

  const { data: students, isLoading: studentsLoading, error: studentsError } = useQuery<User[]>({
    queryKey: ["users", "students"],
    queryFn: () => getAllStudent(),
  });
  // --------------------------------------------------------------------------

  const loading = postsLoading || verifiedLoading || studentsLoading || pendingLoading;
  const error = postsError || verifiedError || studentsError || pendingError;

  // 4. Transform Data and Filter based on time range
  const filteredData: ChartDataItem[] = React.useMemo(() => {
    // Return empty array if data is still loading or an error occurred
    if (loading || error || !posts || !verifiedLandlords || !pendingLandlords || !students) {
      return [];
    }

    // A. Generate the full time series (cumulative counts for 90 days)
    const rawTimeSeries = createTimeSeriesData(
      posts, 
      verifiedLandlords, 
      pendingLandlords, 
      students, 
      MAX_DAYS
    );

    // B. Apply Time Range Filter
    const today = startOfDay(new Date())
    let daysToSubtract = timeRange === "30d" ? 30 : timeRange === "7d" ? 7 : 90;

    const startDate = format(subDays(today, daysToSubtract), "yyyy-MM-dd");
    
    // Filter the full time series
    return rawTimeSeries.filter((item) => {
      return item.date >= startDate
    });

  }, [timeRange, loading, error, posts, verifiedLandlords, pendingLandlords, students]);


  // Handle loading and error states
  if (loading) {
    return (
        <Card className="w-full h-[350px] flex items-center justify-center rounded-xl shadow-lg border border-gray-200 dark:border-gray-800">
            <div className="flex flex-col items-center space-y-4">
                <Skeleton className="h-6 w-64 mb-4" />
                <Skeleton className="h-[200px] w-[95%]" />
                <Skeleton className="h-8 w-40" />
            </div>
        </Card>
    );
  }

  if (error) {
    console.error("Chart data fetch error:", error);
    return (
        <Card className="w-full h-[350px] flex items-center justify-center rounded-xl shadow-lg border border-red-500/40 bg-red-50 dark:bg-red-950/20">
          <p className="text-red-600 dark:text-red-400 font-medium p-4 text-center">
            Error loading dashboard data. Check console for details.
          </p>
        </Card>
    );
  }


  // UI logic continues
  const selectedMetricConfig = chartConfig[selectedMetric] || chartConfig.properties;

  // Safely retrieve the total count for the last day in the filtered data
  const totalCount: number = filteredData.length > 0 
    ? filteredData[filteredData.length - 1][selectedMetric] as number 
    : 0;
  
  // Set the gradient ID dynamically
  const gradientId: string = `fill-${selectedMetric}`;


  return (
    <Card className="@container/card w-full rounded-xl shadow-lg border border-gray-200 dark:border-gray-800">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 p-4 sm:p-6">
        <div>
          <CardTitle className="text-xl font-bold">
            {selectedMetricConfig.label} Trend
          </CardTitle>
          <CardDescription className="text-sm text-gray-500 dark:text-gray-400">
            Cumulative Total: <span className="font-semibold text-foreground text-base">{totalCount.toLocaleString()}</span>
          </CardDescription>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Metric Selector (Select) */}
          <Select value={selectedMetric} onValueChange={setSelectedMetric as (value: string) => void}>
            <SelectTrigger
              className="w-full sm:w-[180px] text-sm"
              aria-label="Select metric"
            >
              <SelectValue placeholder="Select Metric" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {metrics.map((metric: Metric) => (
                <SelectItem key={metric.value} value={metric.value} className="rounded-lg">
                  {metric.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        
          {/* Time Range Selector (Toggle Group) */}
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange as (value: string) => void}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:!px-3 @[400px]/card:flex"
          >
            <ToggleGroupItem value="90d">90D</ToggleGroupItem>
            <ToggleGroupItem value="30d">30D</ToggleGroupItem>
            <ToggleGroupItem value="7d">7D</ToggleGroupItem>
          </ToggleGroup>
        </div>
      </CardHeader>
      
      <CardContent className="px-2 pt-0 sm:px-6 sm:pt-4">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
          style={{
            '--color-area-fill': selectedMetricConfig.color,
          } as CustomCSSProperties} 
        >
          <AreaChart
            data={filteredData}
            margin={{ top: 10, right: 30, left: 10, bottom: 0 }}
          >
            <defs>
              {/* Dynamic Gradient based on selectedMetric color */}
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-area-fill)" stopOpacity={1.0} />
                <stop offset="95%" stopColor="var(--color-area-fill)" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-800" />
            
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value: string) => {
                const date = new Date(value)
                return format(date, "MMM d")
              }}
            />
            
            <YAxis 
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                domain={['auto', 'auto']}
                tickFormatter={(value: number) => value.toLocaleString()}
            />

            <ChartTooltip
              cursor={true} // Enable cursor line
              content={
                <ChartTooltipContent
                  labelFormatter={(value: string) => format(new Date(value), "MMM d, yyyy")}
                  indicator="dot"
                  className="rounded-lg shadow-md"
                />
              }
            />
            
            {/* Dynamic Area based on selectedMetric */}
            <Area
              dataKey={selectedMetric}
              name={selectedMetricConfig.label}
              type="monotone"
              fill={`url(#${gradientId})`}
              stroke="var(--color-area-fill)"
              activeDot={{
                r: 6,
                style: { fill: "var(--color-area-fill)", opacity: 0.8 },
              }}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}