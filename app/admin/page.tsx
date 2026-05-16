"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  ShoppingBag, 
  Users, 
  IndianRupee, 
  Package, 
  AlertTriangle,
  History,
  TrendingDown,
  TrendingUp,
  RefreshCcw
} from "lucide-react";
import { 
  Bar, 
  BarChart, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  Tooltip,
  Cell
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const res = await fetch("/api/admin/stats");
      if (!res.ok) throw new Error("Failed to fetch stats");
      return res.json();
    },
  });

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  const stats = [
    {
      title: "Total Revenue",
      value: `₹${data?.stats.totalRevenue.toLocaleString()}`,
      icon: IndianRupee,
      description: "Lifetime revenue from paid orders",
    },
    {
      title: "Orders",
      value: data?.stats.totalOrders,
      icon: ShoppingBag,
      description: "Total orders placed",
    },
    {
      title: "Customers",
      value: data?.stats.totalCustomers,
      icon: Users,
      description: "Registered organic lovers",
    },
    {
      title: "Products",
      value: data?.stats.totalProducts,
      icon: Package,
      description: "Total products in catalog",
    },
  ];

  return (
    <div className="space-y-8 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-serif">Executive Overview</h1>
        <p className="text-muted-foreground">Monitor your organic business growth and health.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="shadow-sm border-neutral-200 bg-background/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground pt-1">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 shadow-md border-neutral-200">
          <CardHeader>
            <CardTitle>Revenue Trends</CardTitle>
            <CardDescription>Daily revenue trends for the last 7 days.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.recentSales}>
                  <XAxis 
                    dataKey="createdAt" 
                    tickFormatter={(val) => format(new Date(val), 'eee')}
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `₹${value}`}
                  />
                  <Tooltip 
                    cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', background: 'white' }}
                  />
                  <Bar dataKey="totalAmount" fill="#059669" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Alerts */}
        <Card className="col-span-3 shadow-md border-neutral-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-700">
              <AlertTriangle className="h-5 w-5" />
              Low Stock Alerts
            </CardTitle>
            <CardDescription>Critical inventory levels requiring restock.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data?.lowStockProducts.map((product: any) => (
                <div key={product.id} className="flex items-center justify-between bg-amber-50/50 p-3 rounded-lg border border-amber-100">
                  <div className="space-y-1">
                    <p className="text-sm font-bold leading-none">{product.name}</p>
                    <p className="text-xs text-amber-600 uppercase font-medium tracking-wider">{product.unit}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-lg font-bold text-amber-700">{product.stock}</span>
                    <Badge variant="destructive" className="text-[9px] h-4">
                      {product.stock === 0 ? "CRITICAL" : "LOW"}
                    </Badge>
                  </div>
                </div>
              ))}
              {data?.lowStockProducts.length === 0 && (
                <div className="h-40 flex flex-col items-center justify-center text-center gap-2">
                  <Package className="h-10 w-10 text-emerald-100" />
                  <p className="text-sm text-muted-foreground">All stock levels are optimal.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* New Section: Recent Inventory Activity */}
      <Card className="shadow-md border-neutral-200">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5 text-emerald-600" />
              Recent Inventory Activity
            </CardTitle>
            <CardDescription>Live feed of stock movements across the store.</CardDescription>
          </div>
          <RefreshCcw className="h-4 w-4 text-muted-foreground animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
             {data?.recentTransactions?.map((tx: any) => (
               <div key={tx.id} className="flex items-start gap-4 p-4 rounded-xl border border-border bg-white hover:shadow-sm transition-all">
                  <div className={`p-2 rounded-lg ${
                    tx.type === 'SALE' ? 'bg-red-50' : 
                    tx.type === 'RETURN' ? 'bg-blue-50' : 'bg-emerald-50'
                  }`}>
                    {tx.quantity < 0 ? (
                      <TrendingDown className={`h-5 w-5 ${tx.type === 'SALE' ? 'text-red-600' : 'text-emerald-600'}`} />
                    ) : (
                      <TrendingUp className={`h-5 w-5 ${tx.type === 'RETURN' ? 'text-blue-600' : 'text-emerald-600'}`} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate">{tx.product.name}</p>
                    {tx.variant && <p className="text-xs text-muted-foreground">{tx.variant.name}</p>}
                    <p className="text-[11px] text-muted-foreground mt-1">{format(new Date(tx.createdAt), 'MMM d, p')}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-black ${tx.quantity < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                      {tx.quantity > 0 ? '+' : ''}{tx.quantity}
                    </p>
                    <Badge variant="outline" className="text-[8px] px-1 py-0 h-4 uppercase">
                      {tx.type}
                    </Badge>
                  </div>
               </div>
             ))}
             {(!data?.recentTransactions || data?.recentTransactions.length === 0) && (
               <div className="col-span-full py-10 text-center text-muted-foreground border-2 border-dashed rounded-xl">
                 No recent inventory activity detected.
               </div>
             )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8 p-6">
      <Skeleton className="h-10 w-[250px]" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}><CardHeader><Skeleton className="h-4 w-[100px]" /></CardHeader><CardContent><Skeleton className="h-8 w-[60px]" /></CardContent></Card>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 h-[400px] shadow-sm"><Skeleton className="h-full w-full" /></Card>
        <Card className="col-span-3 h-[400px] shadow-sm"><Skeleton className="h-full w-full" /></Card>
      </div>
    </div>
  );
}
