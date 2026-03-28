"use client";

import Button from "@/components/ui/Button";
import Link from "next/link";
import { Download, ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { giving } from "@/lib/api";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Skeleton, SkeletonGroup } from "@/components/ui/Skeleton";

interface Transaction {
  id: string;
  date: string;
  amount: string;
  category: string;
  method: string;
  status: string;
}

function GivingHistoryContent() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await giving.getHistory();
        setTransactions(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch giving history");
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  if (loading) {
    return (
      <div className="bg-off-white min-h-screen">
        <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 md:px-8">
          <div className="flex items-center gap-3 mb-6">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-8 w-48" />
          </div>
          <SkeletonGroup count={5} variant="table-row" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-off-white min-h-screen">
      <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 md:px-8">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/dashboard" className="text-gray-text hover:text-purple transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="font-heading text-2xl font-bold text-slate">
            Giving History
          </h1>
        </div>

        {error ? (
          <div className="rounded-[8px] border border-error/30 bg-error/10 p-4 text-center">
            <p className="font-body text-sm text-error">{error}</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="rounded-[8px] border border-gray-border bg-white p-12 text-center shadow-sm">
            <p className="font-body text-base text-gray-text">No transactions found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-[8px] border border-gray-border bg-white shadow-sm">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-gray-border bg-off-white">
                  <th className="px-4 py-3 text-left font-heading text-xs font-bold uppercase tracking-wider text-gray-text">Date</th>
                  <th className="px-4 py-3 text-left font-heading text-xs font-bold uppercase tracking-wider text-gray-text">Amount</th>
                  <th className="px-4 py-3 text-left font-heading text-xs font-bold uppercase tracking-wider text-gray-text">Category</th>
                  <th className="px-4 py-3 text-left font-heading text-xs font-bold uppercase tracking-wider text-gray-text">Method</th>
                  <th className="px-4 py-3 text-left font-heading text-xs font-bold uppercase tracking-wider text-gray-text">Status</th>
                  <th className="px-4 py-3 text-left font-heading text-xs font-bold uppercase tracking-wider text-gray-text">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-border">
                {transactions.map((t) => (
                  <tr key={t.id} className="hover:bg-off-white/50 transition-colors">
                    <td className="px-4 py-3 font-body text-sm text-slate">{t.date}</td>
                    <td className="px-4 py-3 font-heading text-sm font-semibold text-slate">{t.amount}</td>
                    <td className="px-4 py-3 font-body text-sm text-gray-text">{t.category}</td>
                    <td className="px-4 py-3 font-body text-sm text-gray-text">{t.method}</td>
                    <td className="px-4 py-3">
                      <span className="inline-block rounded-full bg-success/10 px-2 py-0.5 text-[11px] font-heading font-semibold text-success">
                        {t.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button className="text-purple-vivid hover:underline">
                        <Download size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default function GivingHistoryPage() {
  return (
    <ProtectedRoute>
      <GivingHistoryContent />
    </ProtectedRoute>
  );
}
