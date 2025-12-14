// // src/pages/AdminAnalytics.tsx
// import { useEffect, useMemo } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import type { AppDispatch, RootState } from "@/app/store";
// import { fetchNewUsers } from "@/app/features/admin/adminAnalytics"; // ✅ Import slice thunk
// import { motion } from "framer-motion";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import {
//   LineChart,
//   Line,
//   BarChart,
//   Bar,
//   PieChart,
//   Pie,
//   Cell,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
//   ResponsiveContainer,
// } from "recharts";

// // ✅ Default data
// const defaultLineChartData = [
//   { name: "Aug", users: setNewUsersCount, analyses: 3200 },
// ];

// const barChartData = [
//   { name: "Basic", count: 1245, color: "#8884d8" },
//   { name: "Pro", count: 1832, color: "#82ca9d" },
//   { name: "Premium", count: 987, color: "#ffc658" },
// ];

// const pieChartData = [
//   { name: "Completed", value: 78, color: "#10b981" },
//   { name: "Failed", value: 15, color: "#ef4444" },
//   { name: "Processing", value: 7, color: "#f59e0b" },
// ];

// const COLORS = ["#10b981", "#ef4444", "#f59e0b"];

// export function AdminAnalytics() {
//   const dispatch = useDispatch<AppDispatch>();

//   // ✅ Get newUsers count from Redux
//   const { count: newUsers, loading, error } = useSelector(
//     (state: RootState) => state.newUsers
//   );

//   // ✅ Fetch once on mount
//   useEffect(() => {
//     dispatch(fetchNewUsers());
//   }, [dispatch]);

//   // ✅ Replace "users" field dynamically with backend count
//   const lineChartData = useMemo(() => {
//     return defaultLineChartData.map((item, index) =>
//       index === defaultLineChartData.length - 1 // Replace latest month with backend count
//         ? { ...item, users: newUsers }
//         : item
//     );
//   }, [newUsers]);

//   return (
//     <div className="space-y-6">
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.5 }}
//       >
//         <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
//         <p className="text-muted-foreground">
//           Detailed insights and performance metrics
//         </p>
//       </motion.div>

//       <div className="grid gap-6">
//         {/* Line Chart */}
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.5, delay: 0.1 }}
//         >
//           <Card>
//             <CardHeader>
//               <CardTitle>User Growth & Analysis Trends</CardTitle>
//               <CardDescription>
//                 Monthly user registrations and resume analyses over time
//               </CardDescription>
//             </CardHeader>
//             <CardContent>
//               {loading && <p>Loading new users...</p>}
//               {error && <p className="text-red-500">{error}</p>}

//               <ResponsiveContainer width="100%" height={300}>
//                 <LineChart data={lineChartData}>
//                   <CartesianGrid strokeDasharray="3 3" />
//                   <XAxis dataKey="name" />
//                   <YAxis />
//                   <Tooltip />
//                   <Legend />
//                   <Line
//                     type="monotone"
//                     dataKey="users"
//                     stroke="#8884d8"
//                     strokeWidth={2}
//                     name="New Users"
//                   />
//                   <Line
//                     type="monotone"
//                     dataKey="analyses"
//                     stroke="#82ca9d"
//                     strokeWidth={2}
//                     name="Analyses"
//                   />
//                 </LineChart>
//               </ResponsiveContainer>
//             </CardContent>
//           </Card>
//         </motion.div>

//         <div className="grid gap-6 md:grid-cols-2">
//           {/* Bar Chart */}
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.5, delay: 0.2 }}
//           >
//             <Card>
//               <CardHeader>
//                 <CardTitle>Subscription Plans</CardTitle>
//                 <CardDescription>
//                   Distribution of users across different plans
//                 </CardDescription>
//               </CardHeader>
//               <CardContent>
//                 <ResponsiveContainer width="100%" height={250}>
//                   <BarChart data={barChartData}>
//                     <CartesianGrid strokeDasharray="3 3" />
//                     <XAxis dataKey="name" />
//                     <YAxis />
//                     <Tooltip />
//                     <Bar dataKey="count" fill="#8884d8" />
//                   </BarChart>
//                 </ResponsiveContainer>
//               </CardContent>
//             </Card>
//           </motion.div>

//           {/* Pie Chart */}
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.5, delay: 0.3 }}
//           >
//             <Card>
//               <CardHeader>
//                 <CardTitle>Analysis Status</CardTitle>
//                 <CardDescription>
//                   Resume analysis completion rates
//                 </CardDescription>
//               </CardHeader>
//               <CardContent>
//                 <ResponsiveContainer width="100%" height={250}>
//                   <PieChart>
//                     <Pie
//                       data={pieChartData}
//                       cx="50%"
//                       cy="50%"
//                       labelLine={false}
//                       label={({ name, percent }) =>
//                         `${name} ${(percent * 100).toFixed(0)}%`
//                       }
//                       outerRadius={80}
//                       fill="#8884d8"
//                       dataKey="value"
//                     >
//                       {pieChartData.map((entry, index) => (
//                         <Cell
//                           key={`cell-${index}`}
//                           fill={COLORS[index % COLORS.length]}
//                         />
//                       ))}
//                     </Pie>
//                     <Tooltip />
//                   </PieChart>
//                 </ResponsiveContainer>
//               </CardContent>
//             </Card>
//           </motion.div>
//         </div>
//       </div>
//     </div>
//   );
// }




// src/pages/AdminAnalytics.tsx
import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/app/store";
import { fetchNewUsers, fetchResumesAnalyzed } from "@/app/features/admin/adminAnalytics";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const barChartData = [
  { name: "Basic", count: 1245, color: "#8884d8" },
  { name: "Pro", count: 1832, color: "#82ca9d" },
  { name: "Premium", count: 987, color: "#ffc658" },
];

const pieChartData = [
  { name: "Completed", value: 78, color: "#10b981" },
  { name: "Failed", value: 15, color: "#ef4444" },
  { name: "Processing", value: 7, color: "#f59e0b" },
];

const COLORS = ["#10b981", "#ef4444", "#f59e0b"];

export function AdminAnalytics() {
  const dispatch = useDispatch<AppDispatch>();

  // ✅ Get from Redux
  const { newUsers, resumesAnalyzed } = useSelector(
    (state: RootState) => state.analytics
  );

  // ✅ Fetch on mount
  useEffect(() => {
    dispatch(fetchNewUsers());
    dispatch(fetchResumesAnalyzed());
  }, [dispatch]);

  // ✅ Combine users + resumes analyzed for line chart
  const lineChartData = useMemo(() => {
    return resumesAnalyzed.data.map((item) => ({
      name: `${item.month} ${item.year}`,
      users: newUsers.count, // single count (applies latest value)
      analyses: item.count,
    }));
  }, [resumesAnalyzed.data, newUsers.count]);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">
          Detailed insights and performance metrics
        </p>
      </motion.div>

      <div className="grid gap-6">
        {/* Line Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>User Growth & Analysis Trends</CardTitle>
              <CardDescription>
                Monthly user registrations and resume analyses over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              {newUsers.loading && <p>Loading new users...</p>}
              {resumesAnalyzed.loading && <p>Loading resumes analyzed...</p>}
              {newUsers.error && <p className="text-red-500">{newUsers.error}</p>}
              {resumesAnalyzed.error && (
                <p className="text-red-500">{resumesAnalyzed.error}</p>
              )}

              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={lineChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="users"
                    stroke="#8884d8"
                    strokeWidth={2}
                    name="New Users"
                  />
                  <Line
                    type="monotone"
                    dataKey="analyses"
                    stroke="#82ca9d"
                    strokeWidth={2}
                    name="Resumes Analyzed"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Bar Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Subscription Plans</CardTitle>
                <CardDescription>
                  Distribution of users across different plans
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={barChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Pie Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Analysis Status</CardTitle>
                <CardDescription>
                  Resume analysis completion rates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieChartData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
