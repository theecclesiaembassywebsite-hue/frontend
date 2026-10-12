"use client";

import { useCallback, useEffect, useState } from "react";
import { Users, Plus, Trash2, Pencil, X, Check, UserPlus, UserMinus } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { squads, admin as adminAPI } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

interface SquadFormData {
  name: string;
  description: string;
  leaderId: string;
  meetingDay: string;
  meetingTime: string;
  activities: string;
}

const EMPTY_FORM: SquadFormData = {
  name: "",
  description: "",
  leaderId: "",
  meetingDay: "",
  meetingTime: "",
  activities: "",
};

function SquadForm({
  data,
  onChange,
  members,
}: {
  data: SquadFormData;
  onChange: (d: SquadFormData) => void;
  members: any[];
}) {
  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Input
          id="name"
          label="Squad Name *"
          placeholder="e.g. Worship Squad"
          value={data.name}
          onChange={(e) => onChange({ ...data, name: e.target.value })}
        />
        <div className="flex flex-col gap-1.5">
          <label className="font-body text-sm font-medium text-slate">Squad Leader *</label>
          <select
            className="h-12 w-full rounded-[4px] border border-gray-border bg-white px-4 font-body text-base text-slate focus:border-purple-vivid focus:outline-none"
            value={data.leaderId}
            onChange={(e) => onChange({ ...data, leaderId: e.target.value })}
          >
            <option value="">Select a leader</option>
            {members.map((m: any) => (
              <option key={m.id} value={m.id}>
                {m.profile?.firstName} {m.profile?.lastName} ({m.email})
              </option>
            ))}
          </select>
        </div>
        <Input
          id="meetingDay"
          label="Meeting Day"
          placeholder="e.g. Saturdays"
          value={data.meetingDay}
          onChange={(e) => onChange({ ...data, meetingDay: e.target.value })}
        />
        <Input
          id="meetingTime"
          label="Meeting Time"
          placeholder="e.g. 3:00 PM"
          value={data.meetingTime}
          onChange={(e) => onChange({ ...data, meetingTime: e.target.value })}
        />
      </div>
      <div className="mt-4">
        <label className="font-body text-sm font-medium text-slate block mb-1.5">Description *</label>
        <textarea
          rows={3}
          className="w-full rounded-[4px] border border-gray-border bg-white px-4 py-3 font-body text-sm text-slate placeholder:text-gray-text focus:border-purple-vivid focus:outline-none resize-y"
          placeholder="Describe the squad's purpose and activities..."
          value={data.description}
          onChange={(e) => onChange({ ...data, description: e.target.value })}
        />
      </div>
      <Input
        id="activities"
        label="Activities"
        placeholder="e.g. Rehearsals, worship nights, music production"
        value={data.activities}
        onChange={(e) => onChange({ ...data, activities: e.target.value })}
        className="mt-4"
      />
    </>
  );
}

function SquadMembersPanel({
  squadId,
  candidates,
  onChanged,
}: {
  squadId: string;
  candidates: any[];
  onChanged: () => void;
}) {
  const [roster, setRoster] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState("");
  const [busy, setBusy] = useState(false);
  const [query, setQuery] = useState("");
  const [found, setFound] = useState<any[] | null>(null);
  const { success, error } = useToast();

  const load = useCallback(async () => {
    try {
      setRoster((await squads.getSquadMembers(squadId)) || []);
    } catch {
      error("Failed to load squad members");
    } finally {
      setLoading(false);
    }
  }, [squadId, error]);

  useEffect(() => {
    void load();
  }, [load]);

  // Debounced server-side search so any member can be found, not just page 1.
  useEffect(() => {
    const term = query.trim();
    if (!term) {
      setFound(null);
      return;
    }
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const res = await adminAPI.getMembers(1, encodeURIComponent(term));
        if (!cancelled) setFound(res.members || []);
      } catch {
        if (!cancelled) setFound([]);
      }
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

  const memberIds = new Set(roster.map((r) => r.userId));
  const available = (found ?? candidates).filter((c) => !memberIds.has(c.id));

  async function handleAdd() {
    if (!selected) return;
    try {
      setBusy(true);
      await squads.addSquadMember(squadId, selected);
      setSelected("");
      success("Member added");
      await load();
      onChanged();
    } catch {
      error("Failed to add member");
    } finally {
      setBusy(false);
    }
  }

  async function handleRemove(userId: string) {
    try {
      setBusy(true);
      await squads.removeSquadMember(squadId, userId);
      success("Member removed");
      await load();
      onChanged();
    } catch {
      error("Failed to remove member");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-4 border-t border-gray-border pt-4">
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search members by name or email..."
        className="mb-2 h-10 w-full rounded-[4px] border border-gray-border bg-white px-3 font-body text-sm text-slate placeholder:text-gray-text focus:border-purple-vivid focus:outline-none"
      />
      <div className="flex flex-col gap-2 sm:flex-row">
        <select
          className="h-10 flex-1 rounded-[4px] border border-gray-border bg-white px-3 font-body text-sm text-slate focus:border-purple-vivid focus:outline-none"
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
        >
          <option value="">
            {query.trim() && found && available.length === 0 ? "No matching members" : "Add a member..."}
          </option>
          {available.map((m: any) => (
            <option key={m.id} value={m.id}>
              {m.profile?.firstName} {m.profile?.lastName} ({m.email})
            </option>
          ))}
        </select>
        <Button variant="primary" onClick={handleAdd} disabled={!selected || busy}>
          <UserPlus size={14} className="mr-1" /> Add
        </Button>
      </div>
      {loading ? (
        <p className="mt-3 text-sm text-gray-text">Loading members...</p>
      ) : roster.length === 0 ? (
        <p className="mt-3 text-sm text-gray-text">No members in this squad yet.</p>
      ) : (
        <ul className="mt-3 divide-y divide-gray-border">
          {roster.map((r: any) => (
            <li key={r.id} className="flex items-center justify-between py-2">
              <div>
                <p className="font-body text-sm text-slate">
                  {r.user?.profile?.firstName} {r.user?.profile?.lastName}
                </p>
                <p className="text-[11px] text-gray-text">{r.user?.email}</p>
              </div>
              <button
                onClick={() => handleRemove(r.userId)}
                disabled={busy}
                className="p-1 text-gray-text transition-colors hover:text-error"
                title="Remove from squad"
              >
                <UserMinus size={15} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function AdminSquadsContent() {
  const [squadList, setSquadList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [members, setMembers] = useState<any[]>([]);
  const [openMembersId, setOpenMembersId] = useState<string | null>(null);
  const [createForm, setCreateForm] = useState<SquadFormData>(EMPTY_FORM);
  const [editForm, setEditForm] = useState<SquadFormData>(EMPTY_FORM);
  const { success, error } = useToast();

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [squadsData, membersData] = await Promise.all([
        squads.getSquads(),
        adminAPI.getMembers(1).catch(() => ({ members: [] })),
      ]);
      setSquadList(squadsData || []);
      setMembers((membersData as any).members || []);
    } catch {
      error("Failed to load squads");
    } finally {
      setLoading(false);
    }
  }, [error]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  async function handleCreate() {
    if (!createForm.name || !createForm.description || !createForm.leaderId) {
      error("Name, description, and leader are required");
      return;
    }
    try {
      setCreating(true);
      await squads.createSquad(createForm);
      success("Squad created!");
      setShowCreate(false);
      setCreateForm(EMPTY_FORM);
      void loadData();
    } catch {
      error("Failed to create squad");
    } finally {
      setCreating(false);
    }
  }

  function startEdit(squad: any) {
    setEditingId(squad.id);
    setEditForm({
      name: squad.name || "",
      description: squad.description || "",
      leaderId: squad.leader?.id || "",
      meetingDay: squad.meetingDay || "",
      meetingTime: squad.meetingTime || "",
      activities: squad.activities || "",
    });
  }

  async function handleUpdate() {
    if (!editForm.name || !editForm.description || !editForm.leaderId) {
      error("Name, description, and leader are required");
      return;
    }
    try {
      setSaving(true);
      await squads.updateSquad(editingId!, editForm);
      success("Squad updated!");
      setEditingId(null);
      void loadData();
    } catch {
      error("Failed to update squad");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this squad? This cannot be undone.")) return;
    try {
      await squads.deleteSquad(id);
      success("Squad deleted");
      void loadData();
    } catch {
      error("Failed to delete squad");
    }
  }

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-2xl font-bold text-slate">Squad Management</h1>
          <p className="text-body-small">Create and manage Kingdom Life Squads</p>
        </div>
        <Button variant="primary" onClick={() => { setShowCreate(!showCreate); setEditingId(null); }}>
          <Plus size={16} className="mr-1" /> New Squad
        </Button>
      </div>

      {/* Create Form */}
      {showCreate && (
        <div className="rounded-[8px] border border-gray-border bg-white p-6 shadow-sm mb-6">
          <h2 className="font-heading text-lg font-bold text-slate mb-4">Create New Squad</h2>
          <SquadForm data={createForm} onChange={setCreateForm} members={members} />
          <div className="mt-4 flex gap-3">
            <Button variant="primary" onClick={handleCreate} disabled={creating}>
              {creating ? "Creating..." : "Create Squad"}
            </Button>
            <Button variant="ghost" onClick={() => setShowCreate(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {/* Squad List */}
      {loading ? (
        <p className="text-gray-text">Loading...</p>
      ) : squadList.length === 0 ? (
        <div className="rounded-[8px] border border-gray-border bg-white p-12 text-center shadow-sm">
          <Users className="mx-auto h-12 w-12 text-gray-text/30 mb-3" />
          <p className="font-body text-base text-gray-text">No squads yet. Create your first squad above.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {squadList.map((squad: any) => (
            <div key={squad.id} className="rounded-[8px] border border-gray-border bg-white shadow-sm">
              {editingId === squad.id ? (
                /* Inline edit form */
                <div className="p-5">
                  <h3 className="font-heading text-base font-bold text-slate mb-4">Edit Squad</h3>
                  <SquadForm data={editForm} onChange={setEditForm} members={members} />
                  <div className="mt-4 flex gap-3">
                    <Button variant="primary" onClick={handleUpdate} disabled={saving}>
                      <Check size={14} className="mr-1" />
                      {saving ? "Saving..." : "Save Changes"}
                    </Button>
                    <Button variant="ghost" onClick={() => setEditingId(null)}>
                      <X size={14} className="mr-1" /> Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                /* Read-only row */
                <div className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-light">
                        <Users className="h-5 w-5 text-purple" />
                      </div>
                      <div>
                        <h3 className="font-heading text-base font-bold text-slate">{squad.name}</h3>
                        <p className="text-body-small">
                          {squad.leader?.profile?.firstName} {squad.leader?.profile?.lastName} &bull; {squad._count?.members || 0} members
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setOpenMembersId(openMembersId === squad.id ? null : squad.id)}
                        className="text-gray-text hover:text-purple transition-colors p-1"
                        title="Manage members"
                      >
                        <Users size={15} />
                      </button>
                      <button
                        onClick={() => startEdit(squad)}
                        className="text-gray-text hover:text-purple transition-colors p-1"
                        title="Edit squad"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(squad.id)}
                        className="text-gray-text hover:text-error transition-colors p-1"
                        title="Delete squad"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                  <p className="mt-2 font-body text-sm text-gray-text">{squad.description}</p>
                  {squad.meetingDay && (
                    <p className="mt-1 text-[11px] text-gray-text">
                      Meets: {squad.meetingDay}{squad.meetingTime ? ` at ${squad.meetingTime}` : ""}
                    </p>
                  )}
                  {openMembersId === squad.id && (
                    <SquadMembersPanel
                      squadId={squad.id}
                      candidates={members}
                      onChanged={() => void loadData()}
                    />
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminSquadsPage() {
  return (
    <ProtectedRoute requiredRoles={["ADMIN", "SUPER_ADMIN"]}>
      <AdminSquadsContent />
    </ProtectedRoute>
  );
}
