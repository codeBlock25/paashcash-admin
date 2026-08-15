'use client';

import {
    AlertTriangle,
    CheckCircle2,
    Clock3,
    MessageCircle,
    RefreshCw,
    Search,
    Settings2,
    UserRoundCheck
} from 'lucide-react';
import {useCallback, useEffect, useMemo, useState} from 'react';
import {toast} from 'sonner';
import {authenticatedFetch} from '@/lib/authenticated-fetch';

type CaseItem = {
    id: string;
    bookingId: string;
    status: string;
    applicant: { name: string };
    agency: { name: string };
    assignment: null | { managerAccountId: string; priority: string; slaDueAt: string }
};
type Manager = {
    id: string;
    firstName: string;
    lastName: string;
    status: string;
    available: boolean;
    workload: number;
    capacity: number;
    remainingCapacity: number;
    suspendedAt: string | null
};
type Escalation = {
    id: string;
    caseId: string;
    reason: string;
    priority: string;
    status: string;
    description: string;
    internalAction: string | null;
    createdAt: string
};
type Settings = {
    mode: 'manual' | 'auto_workload';
    defaultCapacity: number;
    defaultSlaHours: number;
    notifyStaffOnAssignment: boolean;
    notifyParticipantOnDocumentAction: boolean;
    notifySuperAdminOnOverdue: boolean
};

const label = (value: string) => value.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());

async function json<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await authenticatedFetch(`/api/case-management/${path}`, {
        ...init,
        headers: {'content-type': 'application/json', ...init?.headers}
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.message ?? 'Request failed.');
    return payload as T;
}

export function CaseManagementPage({view}: {
    view: 'cases' | 'assignments' | 'escalations' | 'settings' | 'messages'
}) {
    const [cases, setCases] = useState<CaseItem[]>([]);
    const [managers, setManagers] = useState<Manager[]>([]);
    const [escalations, setEscalations] = useState<Escalation[]>([]);
    const [settings, setSettings] = useState<Settings | null>(null);
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const [caseRows, managerRows, escalationRows, currentSettings] = await Promise.all([
                json<CaseItem[]>('cases'), json<Manager[]>('managers'), json<Escalation[]>('escalations'), json<Settings>('settings'),
            ]);
            setCases(caseRows);
            setManagers(managerRows);
            setEscalations(escalationRows);
            setSettings(currentSettings);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Could not load case management.');
        } finally {
            setLoading(false);
        }
    }, []);
    useEffect(() => {
        void load();
    }, [load]);
    const filtered = useMemo(() => cases.filter((item) => `${item.id} ${item.bookingId} ${item.applicant.name} ${item.agency.name}`.toLowerCase().includes(search.toLowerCase())), [cases, search]);

    async function assign(caseIds: string[]) {
        const manager = managers.filter((item) => item.available && !item.suspendedAt && item.remainingCapacity > 0).sort((a, b) => a.workload - b.workload)[0];
        if (!manager) return toast.error('No available case manager has remaining capacity.');
        try {
            await json('assignments/bulk', {
                method: 'POST',
                body: JSON.stringify({
                    caseIds,
                    managerAccountId: manager.id,
                    reason: 'Manual assignment from case operations',
                    notifyParticipants: false,
                    priority: 'normal'
                })
            });
            toast.success(`${caseIds.length} case${caseIds.length === 1 ? '' : 's'} assigned to ${manager.firstName} ${manager.lastName}.`);
            setSelected([]);
            await load();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Assignment failed.');
        }
    }

    async function autoAssign() {
        try {
            const result = await json<{
                assigned: number;
                remainingUnassigned: number
            }>('assignments/auto-assign-all', {method: 'POST'});
            toast.success(`${result.assigned} eligible cases assigned; ${result.remainingUnassigned} remain.`);
            await load();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Auto-assignment failed.');
        }
    }

    async function saveSettings() {
        if (!settings) return;
        try {
            setSettings(await json<Settings>('settings', {method: 'PATCH', body: JSON.stringify(settings)}));
            toast.success('Case management settings saved and audited.');
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Could not save settings.');
        }
    }

    const title = {
        cases: 'All Cases',
        assignments: 'Assignments',
        escalations: 'Escalations',
        settings: 'Case Management Settings',
        messages: 'Case Conversations'
    }[view];
    return <section className="space-y-6">
        <header className="flex flex-wrap items-start justify-between gap-4">
            <div><p className="text-sm font-medium text-primary">Case operations</p><h1
                className="mt-1 text-3xl font-semibold tracking-tight">{title}</h1><p
                className="mt-2 text-sm text-muted-foreground">Funded casework only. Financial and escrow ledger details
                are intentionally excluded.</p></div>
            <button type="button" onClick={() => void load()}
                    className="flex h-10 items-center gap-2 rounded-lg border bg-white px-4 text-sm font-medium">
                <RefreshCw className="size-4"/>Refresh
            </button>
        </header>
        {loading ? <div className="rounded-xl border p-10 text-center text-muted-foreground">Loading case
            operations…</div> : null}
        {!loading && (view === 'cases' || view === 'assignments' || view === 'messages') ? <>
            <div className="grid gap-3 sm:grid-cols-3">
                <Metric icon={UserRoundCheck} label="Cases shown" value={cases.length}/>
                <Metric icon={Clock3} label="Unassigned" value={cases.filter((item) => !item.assignment).length}/>
                <Metric icon={CheckCircle2} label="Available capacity"
                        value={managers.reduce((sum, item) => sum + item.remainingCapacity, 0)}/>
            </div>
            <div className="rounded-xl border bg-white">
                <div className="flex flex-wrap items-center gap-3 border-b p-4">
                    <div className="relative min-w-64 flex-1"><Search
                        className="absolute left-3 top-3 size-4 text-muted-foreground"/><input value={search}
                                                                                               onChange={(event) => setSearch(event.target.value)}
                                                                                               placeholder="Search case, applicant, or agency"
                                                                                               className="h-10 w-full rounded-lg border pl-9 pr-3 text-sm"/>
                    </div>
                    {view === 'assignments' ? <>
                        <button type={'button'} onClick={() => void assign(selected)} disabled={!selected.length}
                                className="h-10 rounded-lg bg-primary px-4 text-sm font-medium text-white disabled:opacity-40">Assign
                            selected
                        </button>
                        <button type={'button'} onClick={() => void autoAssign()}
                                className="h-10 rounded-lg border px-4 text-sm font-medium">Auto-Assign All
                        </button>
                    </> : null}</div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                        <tr>{view === 'assignments' ? <th className="p-4">Select</th> : null}
                            <th className="p-4">Case</th>
                            <th className="p-4">Applicant / agency</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Priority / SLA</th>
                            <th className="p-4">Manager</th>
                            {view === 'messages' ? <th className="p-4">Channels</th> : null}</tr>
                        </thead>
                        <tbody>{filtered.map((item) => <tr key={item.id} className="border-t">{view === 'assignments' ?
                            <td className="p-4"><input type="checkbox" checked={selected.includes(item.id)}
                                                       onChange={(event) => setSelected((current) => event.target.checked ? [...current, item.id] : current.filter((id) => id !== item.id))}/>
                            </td> : null}
                            <td className="p-4 font-medium">
                                <div>{item.id.slice(0, 8)}</div>
                                <div className="text-xs text-muted-foreground">{item.bookingId.slice(0, 8)}</div>
                            </td>
                            <td className="p-4">
                                <div>{item.applicant.name}</div>
                                <div className="text-xs text-muted-foreground">{item.agency.name}</div>
                            </td>
                            <td className="p-4"><Pill value={item.status}/></td>
                            <td className="p-4">{item.assignment ? <><Pill value={item.assignment.priority}/>
                                <div
                                    className="mt-1 text-xs text-muted-foreground">Due {new Date(item.assignment.slaDueAt).toLocaleString()}</div>
                            </> : <span className="text-amber-700">Not assigned</span>}</td>
                            <td className="p-4">{item.assignment ? managers.find((manager) => manager.id === item.assignment?.managerAccountId)?.firstName ?? item.assignment.managerAccountId.slice(0, 8) : '—'}</td>
                            {view === 'messages' ? <td className="p-4">
                                <div className="flex gap-2"><ChannelButton caseId={item.id}
                                                                           party="agency"/><ChannelButton
                                    caseId={item.id} party="applicant"/></div>
                            </td> : null}</tr>)}</tbody>
                    </table>
                </div>
            </div>
        </> : null}
        {!loading && view === 'escalations' ?
            <div className="space-y-3">{escalations.length ? escalations.map((item) => <article key={item.id}
                                                                                                className="rounded-xl border bg-white p-5">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2"><AlertTriangle className="size-5 text-amber-600"/><h2
                            className="font-semibold">{label(item.reason)}</h2><Pill value={item.priority}/></div>
                        <p className="mt-2 text-sm text-muted-foreground">Case {item.caseId.slice(0, 8)} · {new Date(item.createdAt).toLocaleString()}</p>
                        <p className="mt-3 text-sm">{item.description}</p>{item.internalAction ?
                        <p className="mt-3 rounded-lg bg-muted p-3 text-sm"><strong>Internal
                            action:</strong> {item.internalAction}</p> : null}</div>
                    <Pill value={item.status}/></div>
            </article>) : <Empty text="No case escalations have been raised."/>}</div> : null}
        {!loading && view === 'settings' && settings ?
            <div className="max-w-3xl space-y-5 rounded-xl border bg-white p-6">
                <div><h2 className="font-semibold">Assignment strategy</h2><p
                    className="mt-1 text-sm text-muted-foreground">Auto-assignment uses lowest active workload and never
                    exceeds capacity.</p><select value={settings.mode} onChange={(event) => setSettings({
                    ...settings,
                    mode: event.target.value as Settings['mode']
                })} className="mt-3 h-11 w-full rounded-lg border px-3">
                    <option value="manual">Manual Assignment</option>
                    <option value="auto_workload">Auto-Assign by Workload</option>
                </select></div>
                <div className="grid gap-4 sm:grid-cols-2"><NumberSetting label="Default capacity"
                                                                          value={settings.defaultCapacity}
                                                                          onChange={(value) => setSettings({
                                                                              ...settings,
                                                                              defaultCapacity: value
                                                                          })}/><NumberSetting
                    label="Default SLA (hours)" value={settings.defaultSlaHours}
                    onChange={(value) => setSettings({...settings, defaultSlaHours: value})}/></div>
                <div className="divide-y rounded-lg border"><Toggle label="Notify staff when assigned"
                                                                    checked={settings.notifyStaffOnAssignment}
                                                                    onChange={(value) => setSettings({
                                                                        ...settings,
                                                                        notifyStaffOnAssignment: value
                                                                    })}/><Toggle
                    label="Notify applicant/agency on document actions"
                    checked={settings.notifyParticipantOnDocumentAction}
                    onChange={(value) => setSettings({...settings, notifyParticipantOnDocumentAction: value})}/><Toggle
                    label="Notify super admin on overdue case" checked={settings.notifySuperAdminOnOverdue}
                    onChange={(value) => setSettings({...settings, notifySuperAdminOnOverdue: value})}/></div>
                <button type={'button'} onClick={() => void saveSettings()}
                        className="h-11 rounded-lg bg-primary px-5 text-sm font-semibold text-white"><Settings2
                    className="mr-2 inline size-4"/>Save secure settings
                </button>
            </div> : null}
    </section>;
}

function Metric({icon: Icon, label: text, value}: { icon: typeof Clock3; label: string; value: number }) {
    return <div className="rounded-xl border bg-white p-5"><Icon className="size-5 text-primary"/><p
        className="mt-3 text-2xl font-semibold">{value}</p><p className="text-sm text-muted-foreground">{text}</p>
    </div>;
}

function Pill({value}: { value: string }) {
    return <span
        className="inline-flex rounded-full bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-700">{label(value)}</span>;
}

function Empty({text}: { text: string }) {
    return <div className="rounded-xl border border-dashed p-12 text-center text-muted-foreground">{text}</div>;
}

function NumberSetting({label: text, value, onChange}: {
    label: string;
    value: number;
    onChange: (value: number) => void
}) {
    return <label className="text-sm font-medium">{text}<input type="number" min={1} value={value}
                                                               onChange={(event) => onChange(Number(event.target.value))}
                                                               className="mt-2 h-11 w-full rounded-lg border px-3"/></label>;
}

function Toggle({label: text, checked, onChange}: {
    label: string;
    checked: boolean;
    onChange: (value: boolean) => void
}) {
    return <label className="flex items-center justify-between gap-4 p-4 text-sm"><span>{text}</span><input
        type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)}
        className="size-5 accent-primary"/></label>;
}

function ChannelButton({caseId, party}: { caseId: string; party: 'agency' | 'applicant' }) {
    const [busy, setBusy] = useState(false);
    return <button type={'button'} disabled={busy} onClick={async () => {
        setBusy(true);
        try {
            await json(`cases/${caseId}/conversations`, {method: 'POST', body: JSON.stringify({party})});
            toast.success(`${label(party)} channel ready.`);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Could not start conversation.');
        } finally {
            setBusy(false);
        }
    }} className="rounded-lg border px-3 py-2 text-xs font-medium"><MessageCircle
        className="mr-1 inline size-3"/>{label(party)}</button>;
}
