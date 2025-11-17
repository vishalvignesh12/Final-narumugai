"use client"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"
import { useEffect, useState } from "react"
import useFetch from "@/hooks/useFetch"

// --- UI CHANGES: Import Card components ---
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"


const chartConfig = {
    revenue: {
        label: "Revenue",
        color: "#8b5cf6",
    },
}

export function OrderOverview() {

    // --- NO LOGIC CHANGES ---
    const [chartData, setChartData] = useState([])
    const { data: sales, loading } = useFetch('/api/dashboard/admin/monthly-sales')

    useEffect(() => {
        if (sales && sales.success) {
            const monthData = sales.data.map((s) => ({
                month: s.month,
                revenue: s.totalSales
            }))
            setChartData(monthData)
        }
    }, [sales])
    // --- END OF LOGIC ---


    // --- UI CHANGES: Wrap component in <Card> ---
    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>Sales Overview</CardTitle>
                <CardDescription>Your total sales revenue for the last 6 months.</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px] w-full">
                    <BarChart accessibilityLayer data={chartData}>
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="month"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent
                                formatter={(value) => `₹${value.toLocaleString('en-IN')}`}
                            />}
                        />
                        <Bar dataKey="revenue" fill="var(--color-revenue)" radius={4} />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}