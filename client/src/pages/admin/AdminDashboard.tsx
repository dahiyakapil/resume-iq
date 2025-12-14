// AdminDashboard.tsx
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { Users, FileText, Activity, AlertTriangle } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { StatsCard } from "@/components/ui/stats-card";
import type { AppDispatch, RootState } from "@/app/store";
import { fetchAllResumes, fetchAllUsers } from "@/app/features/admin/adminSlice";

export function AdminDashboard() {
  const dispatch = useDispatch<AppDispatch>();

  // ✅ Select real data from Redux
  const users = useSelector((state: RootState) => state.admin.users);
  const resumes = useSelector((state: RootState) => state.admin.resumes);
  const loading = useSelector((state: RootState) => state.admin.loadingUsers);
  const error = useSelector((state: RootState) => state.admin.error);

  // Fetch data on mount
  useEffect(() => {
    dispatch(fetchAllUsers());
    dispatch(fetchAllResumes());
  }, [dispatch]);

  // ✅ Stats section (show real counts)
  const statsData = [
    {
      title: "Total Users",
      value: users?.length?.toString() || "0",
      change: `${users?.length || 0} registered`,
      changeType: "positive" as const,
      icon: Users,
    },
    {
      title: "Resumes Analyzed",
      value: resumes?.length?.toString() || "0",
      change: `${resumes?.length || 0} uploaded`,
      changeType: "positive" as const,
      icon: FileText,
    },
    {
      title: "API Usage",
      value: `${(resumes?.length || 0) * 2} requests`, // example derived metric
      change: "Based on resume uploads",
      changeType: "positive" as const,
      icon: Activity,
    },
    {
      title: "System Errors",
      value: error ? "1+" : "0",
      change: error ? "Check logs" : "No issues",
      changeType: error ? ("negative" as const) : ("positive" as const),
      icon: AlertTriangle,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here’s the latest stats from your AI Resume Analyzer.
        </p>
      </motion.div>

      {/* Loading / Error */}
      {loading && <p className="text-muted-foreground">Loading data...</p>}
      {error && <p className="text-destructive">Error: {error}</p>}

      {/* Stats Cards */}
      {!loading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
        >
          {statsData.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 + index * 0.1 }}
            >
              <StatsCard {...stat} />
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Recent Users */}
      {!loading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Recent Users</CardTitle>
              <CardDescription>
                Latest users registered in the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users && users.length > 0 ? (
                  users.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between border-b border-border pb-4 last:border-0 last:pb-0"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar>
                          {user.avatar ? (
                            <AvatarImage src={user.avatar} alt={user.firstName} />
                          ) : (
                            <AvatarFallback>
                              {user.firstName[0]}
                              {user.lastName?.[0] || ''}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">
                            {user.firstName} {user.lastName || ''}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-medium px-2 py-1 rounded bg-muted">
                        {user.role ?? "user"}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No recent users</p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
