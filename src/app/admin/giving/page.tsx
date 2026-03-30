"use client";

import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { admin } from "@/lib/api";
import { Skeleton, SkeletonGroup } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";

const periodOptions = [
  { value: "this-month", label: "This Month" },
  { value: "last-month", label: "Last Month" },
  { value: "this-quarter", label: "This Quarter" },
  { value: "this-year", label: "This Year" },
];

function AdminGivingContent() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [period, setPeriod] = useState("this-month");
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const { success, error } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await admin.getGivingAnalytics();
        setAnalytics(data);
      } catch (err) {
        error("Failed to load giving analytics");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [error]);

  const handleExport = async () => {
    setExporting(true);
    try {
      admin.exportGiving(period);
      success("Giving report download started");
    } catch (err) {
      error("Failed to export giving report");
      console.error(err);
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 md:p-8">
        <h1 className="font-heading text-2xl font-bold text-slate mb-6">Giving Reports</h1>
        <SkeletonGroup count={8} />
      </div>
    );
  }

  const summaryData = analytics || {
    totalMonth: "0",
    paystack: "0",
    paypal: "0",
    tithes: "0",
    offerings: "0",
    seeds: "0",
    projects: "0",
  };

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold text-slate">Giving Reports</h1>
        <Button variant="primary" className="text-xs py-2 px-4 min-w-0" onClick={handleExport} disabled={exporting}>
          <Download size={14} className="mr-1" /> Export CSV
        </Button>
      </div>

      <div className="flex gap-3 mb-6">
        <div className="w-48">
          <Select
            id="period"
            options={periodOptions}
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 mb-8">
        <div className="rounded-[8px] border border-gray-border bg-white p-4 shadow-sm">
          <p className="text-[11px] text-gray-text">Total (Month)</p>
          <p className="font-heading text-xl font-bold text-slate">{summaryData.totalMonth}</p>
        </div>
        <div className="rounded-[8px] border border-gray-border bg-white p-4 shadow-sm">
          <p className="text-[11px] text-gray-text">Paystack</p>
          <p className="font-heading text-xl font-bold text-purple">{summaryData.paystack}</p>
        </div>
        <div className="rounded-[8px] border border-gray-border bg-white p-4 shadow-sm">
          <p className="text-[11px] text-gray-text">PayPal</p>
          <p className="font-heading text-xl font-bold text-info">{summaryData.paypal}</p>
        </div>
        <div className="rounded-[8px] border border-gray-border bg-white p-4 shadow-sm">
          <p className="text-[11px] text-gray-text">Tithes</p>
          <p className="font-heading text-xl font-bold text-success">{summaryData.tithes}</p>
        </div>
      </div>

      {/* By Category */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 mb-8">
        {[
          { label: "Offerings", value: summaryData.offerings },
          { label: "Sow a Seed", value: summaryData.seeds },
          { label: "Project Giving", value: summaryData.projects },
          { label: "Special", value: "0" },
        ].map((c) => (
          <div key={c.label} className="rounded-[8px] bg-white border border-gray-border p-3 shadow-sm">
            <p className="text-[10px] text-gray-text">{c.label}</p>
            <p className="font-heading text-base font-bold text-slate">{c.value}</p>
          </div>
        ))}
      </div>

      {/* Transaction Table */}
      <h2 className="font-heading text-lg font-bold text-slate mb-3">Recent Transactions</h2>
      <div className="overflow-x-auto rounded-[8px] border border-gray-border bg-white shadow-sm">
        <table className="w-full min-w-[650px]">
          <thead>
            <tr className="border-b border-gray-border bg-off-white">
              <th className="px-4 py-3 text-left font-heading text-xs font-bold uppercase tracking-wider text-gray-text">Date</th>
              <th className="px-4 py-3 text-left font-heading text-xs font-bold uppercase tracking-wider text-gray-text">Name</th>
              <th className="px-4 py-3 text-left font-heading text-xs font-bold uppercase tracking-wider text-gray-text">Amount</th>
              <th className="px-4 py-3 text-left font-heading text-xs font-bold uppercase tracking-wider text-gray-text">Category</th>
              <th className="px-4 py-3 text-left font-heading text-xs font-bold uppercase tracking-wider text-gray-text">Method</th>
              <th className="px-4 py-3 text-left font-heading text-xs font-bold uppercase tracking-wider text-gray-text">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-border">
            {(analytics?.transactions || []).map((t: any) => (
              <tr key={t.id} className="hover:bg-off-white/50">
                <td className="px-4 py-3 font-body text-sm text-slate">{t.date}</td>
                <td className="px-4 py-3 font-heading text-sm font-semibold text-slate">{t.name}</td>
                <td className="px-4 py-3 font-heading text-sm font-bold text-slate">{t.amount}</td>
                <td className="px-4 py-3 font-body text-sm text-gray-text">{t.category}</td>
                <td className="px-4 py-3 font-body text-sm text-gray-text">{t.method}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-success/10 px-2 py-0.5 text-[11px] font-heading font-semibold text-success">{t.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function AdminGivingPage() {
  return (
    <ProtectedRoute requiredRoles={["ADMIN", "SUPER_ADMIN"]}>
      <AdminGivingContent />
    </ProtectedRoute>
  );
}
