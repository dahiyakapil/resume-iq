import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CalendarDays, Download, Filter, Trash2, Eye } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "@/app/store";
import { fetchReports, deleteReport } from "@/app/features/admin/adminSlice";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

export function Reports() {
  const [dateFilter, setDateFilter] = useState("all");
  const [openDialog, setOpenDialog] = useState<string | null>(null);

  const dispatch = useDispatch<AppDispatch>();
  const { reports, loadingReports, error } = useSelector(
    (state: RootState) => state.admin
  );

  useEffect(() => {
    dispatch(fetchReports());
  }, [dispatch]);

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 90) return "default";
    if (score >= 70) return "secondary";
    return "outline";
  };

  const handleDelete = async (reportId: string) => {
    try {
      await dispatch(deleteReport(reportId)).unwrap();
      toast.success("Report deleted successfully");
      setOpenDialog(null); // ✅ close dialog after delete
    } catch (err) {
      const errorMessage = err as string;
      toast.error(errorMessage);
    }
  };

  const handleView = (reportId: string) => {
    window.location.href = `/reports/${reportId}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground">
            Resume analysis history and results
          </p>
        </div>
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Export Reports
        </Button>
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Analysis History</CardTitle>
                <CardDescription>
                  View all resume analysis reports and results
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Date" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {loadingReports ? (
              <p className="text-center text-muted-foreground">
                Loading reports...
              </p>
            ) : error ? (
              <p className="text-center text-red-500">{error}</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>File Name</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Feedback</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.map((report) => (
                    <TableRow key={report.reportId}>
                      <TableCell className="font-medium">
                        {report.user
                          ? `${report.user.firstName} ${report.user.lastName}`.trim() ||
                            report.user.email
                          : "Unknown"}
                      </TableCell>

                      <TableCell className="font-mono text-sm">
                        {report.resumeName ?? "N/A"}
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-2">
                          <CalendarDays className="h-4 w-4 text-muted-foreground" />
                          {report.createdAt
                            ? new Date(report.createdAt).toLocaleDateString()
                            : "—"}
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant={getScoreBadgeVariant(
                            report.analysis?.ats_score ?? 0
                          )}
                        >
                          {report.analysis?.ats_score ?? 0}/100
                        </Badge>
                      </TableCell>

                      <TableCell className="max-w-xs truncate whitespace-nowrap overflow-hidden">
                        {report.analysis?.suggestions?.length > 0
                          ? report.analysis.suggestions[0]
                          : "No feedback"}
                      </TableCell>

                      <TableCell className="flex gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleView(report.reportId)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>

                        {/* Controlled AlertDialog */}
                        <AlertDialog
                          open={openDialog === report.reportId}
                          onOpenChange={(isOpen) =>
                            setOpenDialog(isOpen ? report.reportId : null)
                          }
                        >
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="icon">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Report</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will
                                permanently delete the resume report and remove
                                it from our database.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel
                                onClick={() => setOpenDialog(null)}
                              >
                                Cancel
                              </AlertDialogCancel>
                              <Button
                                variant="destructive"
                                onClick={() => handleDelete(report.reportId)}
                              >
                                Delete
                              </Button>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
