"use client";

import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { admin } from "@/lib/api";
import { SkeletonGroup } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import { formatMoney, formatMoneyByCurrency } from "@/lib/money";

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
        setLoading(true);
        const data = await admin.getGivingAnalytics(period);
        setAnalytics(data);
      } catch (err) {
        error("Failed to load giving analytics");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [error, period]);

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

  const totalAmount = formatMoneyByCurrency(analytics?.total?.byCurrency);
  const paystackTotal = formatMoneyByCurrency(analytics?.paystackByCurrency);
  const paypalTotal = formatMoneyByCurrency(analytics?.paypalByCurrency);

  const categoryTotal = (category: string) =>
    formatMoneyByCurrency(
      (analytics?.byCategory || []).filter((c: any) => c.category === category),
    );

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
          <p className="text-[11px] text-gray-text">Total</p>
          <p className="font-heading text-xl font-bold text-slate">{totalAmount}</p>
        </div>
        <div className="rounded-[8px] border border-gray-border bg-white p-4 shadow-sm">
          <p className="text-[11px] text-gray-text">Paystack</p>
          <p className="font-heading text-xl font-bold text-purple">{paystackTotal}</p>
        </div>
        <div className="rounded-[8px] border border-gray-border bg-white p-4 shadow-sm">
          <p className="text-[11px] text-gray-text">PayPal</p>
          <p className="font-heading text-xl font-bold text-info">{paypalTotal}</p>
        </div>
        <div className="rounded-[8px] border border-gray-border bg-white p-4 shadow-sm">
          <p className="text-[11px] text-gray-text">Tithes</p>
          <p className="font-heading text-xl font-bold text-success">{categoryTotal("TITHE")}</p>
        </div>
      </div>

      {/* By Category */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 mb-8">
        {[
          { label: "Offerings", value: categoryTotal("OFFERING") },
          { label: "Sow a Seed", value: categoryTotal("SOW_A_SEED") },
          { label: "Project Giving", value: categoryTotal("PROJECT_GIVING") },
          { label: "Special Offering", value: categoryTotal("SPECIAL_OFFERING") },
        ].map((c) => (
          <div key={c.label} className="rounded-[8px] bg-white border border-gray-border p-3 shadow-sm">
            <p className="text-[10px] text-gray-text">{c.label}</p>
            <p className="font-heading text-base font-bold text-slate">{c.value}</p>
          </div>
        ))}
      </div>

      {/* By Payment Method */}
      <h2 className="font-heading text-lg font-bold text-slate mb-3">By Payment Method</h2>
      <div className="overflow-x-auto rounded-[8px] border border-gray-border bg-white shadow-sm mb-8">
        <table className="w-full min-w-[400px]">
          <thead>
            <tr className="border-b border-gray-border bg-off-white">
              <th className="px-4 py-3 text-left font-heading text-xs font-bold uppercase tracking-wider text-gray-text">Method</th>
              <th className="px-4 py-3 text-left font-heading text-xs font-bold uppercase tracking-wider text-gray-text">Transactions</th>
              <th className="px-4 py-3 text-left font-heading text-xs font-bold uppercase tracking-wider text-gray-text">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-border">
            {(analytics?.byMethod || []).map((m: any) => (
              <tr key={`${m.paymentMethod}-${m.currency}`} className="hover:bg-off-white/50">
                <td className="px-4 py-3 font-heading text-sm font-semibold text-slate">{m.paymentMethod?.replace(/_/g, " ")}</td>
                <td className="px-4 py-3 font-body text-sm text-gray-text">{m.count}</td>
                <td className="px-4 py-3 font-heading text-sm font-bold text-slate">{formatMoney(m.amount, m.currency)}</td>
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
