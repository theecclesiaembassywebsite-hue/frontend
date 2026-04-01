"use client";

import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { useEffect, useState } from "react";
import { Search, User } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { admin } from "@/lib/api";
import { Skeleton, SkeletonGroup } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";

const roleOptions = [
  { value: "", label: "All Roles" },
  { value: "VISITOR", label: "Visitor" },
  { value: "FIRST_TIMER", label: "First Timer" },
  { value: "MEMBER", label: "Member" },
  { value: "HUB_LEADER", label: "Hub Leader" },
  { value: "SQUAD_LEADER", label: "Squad Leader" },
  { value: "MODERATOR", label: "Moderator" },
  { value: "ADMIN", label: "Admin" },
];

function AdminMembersContent() {
  const [members, setMembers] = useState<any[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const { success, error } = useToast();

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const result = await admin.getMembers(1);
        setMembers(result.members || result as any);
        setFilteredMembers(result.members || result as any);
      } catch (err) {
        error("Failed to load members");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [error]);

  useEffect(() => {
    const filtered = members.filter((m) => {
      const matchesSearch = !search || m.profile?.firstName?.toLowerCase().includes(search.toLowerCase()) || m.email.toLowerCase().includes(search.toLowerCase());
      const matchesRole = !roleFilter || m.role === roleFilter;
      return matchesSearch && matchesRole;
    });
    setFilteredMembers(filtered);
  }, [search, roleFilter, members]);

  const handleRoleChange = async (memberId: string, newRole: string) => {
    setUpdating(memberId);
    try {
      await admin.updateMemberRole(memberId, newRole);
      setMembers(members.map((m) => m.id === memberId ? { ...m, role: newRole } : m));
      success("Member role updated");
    } catch (err) {
      error("Failed to update member role");
      console.error(err);
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <div className="p-6 md:p-8">
        <h1 className="font-heading text-2xl font-bold text-slate mb-6">Member Management</h1>
        <SkeletonGroup count={5} />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8">
      <h1 className="font-heading text-2xl font-bold text-slate mb-6">Member Management</h1>

      <div className="flex flex-col gap-3 md:flex-row md:items-end mb-6">
        <div className="flex-1 relative">
          <Input id="search" placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-text pointer-events-none" />
        </div>
        <div className="w-full md:w-48">
          <Select id="role" options={roleOptions} value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} />
        </div>
      </div>

      <div className="overflow-x-auto rounded-[8px] border border-gray-border bg-white shadow-sm">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="border-b border-gray-border bg-off-white">
              <th className="px-4 py-3 text-left font-heading text-xs font-bold uppercase tracking-wider text-gray-text">Member</th>
              <th className="px-4 py-3 text-left font-heading text-xs font-bold uppercase tracking-wider text-gray-text">Email</th>
              <th className="px-4 py-3 text-left font-heading text-xs font-bold uppercase tracking-wider text-gray-text">Role</th>
              <th className="px-4 py-3 text-left font-heading text-xs font-bold uppercase tracking-wider text-gray-text">Status</th>
              <th className="px-4 py-3 text-left font-heading text-xs font-bold uppercase tracking-wider text-gray-text">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-border">
            {filteredMembers.map((m) => (
              <tr key={m.id} className="hover:bg-off-white/50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-light">
                      <User size={14} className="text-purple/50" />
                    </div>
                    <span className="font-heading text-sm font-semibold text-slate">{m.profile?.firstName} {m.profile?.lastName}</span>
                  </div>
                </td>
                <td className="px-4 py-3 font-body text-sm text-gray-text">{m.email}</td>
                <td className="px-4 py-3">
                  <select
                    className="rounded-[4px] border border-gray-border bg-off-white px-2 py-1 text-xs font-heading font-semibold text-slate disabled:opacity-50"
                    value={m.role}
                    onChange={(e) => handleRoleChange(m.id, e.target.value)}
                    disabled={updating === m.id}
                  >
                    {roleOptions.filter((r) => r.value).map((r) => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-heading font-semibold ${m.emailVerified ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`}>
                    {m.emailVerified ? "Verified" : "Pending"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button className="text-xs font-heading font-semibold text-purple-vivid hover:underline">View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-body-small">{filteredMembers.length} member{filteredMembers.length !== 1 ? "s" : ""}</p>
    </div>
  );
}

export default function AdminMembersPage() {
  return (
    <ProtectedRoute requiredRoles={["ADMIN", "SUPER_ADMIN"]}>
      <AdminMembersContent />
    </ProtectedRoute>
  );
}
