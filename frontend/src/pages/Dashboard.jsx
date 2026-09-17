import { Users2, Building2, ClipboardCheck, IndianRupee, Clock, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import Topbar from "../components/layout/Topbar";
import StatCard from "../components/ui/StatCard";
import Spinner from "../components/ui/Spinner";
import Badge from "../components/ui/Badge";
import EmptyState from "../components/ui/EmptyState";
import { useGetDashboardSummaryQuery } from "../features/dashboard/dashboardApiSlice";
import { STAGE_LABELS, STAGE_STYLES } from "../utils/constants";
import { formatCurrency, formatDate } from "../utils/helpers";

export default function Dashboard() {
  const { data, isLoading } = useGetDashboardSummaryQuery();

  return (
    <>
      <Topbar title="Dashboard" subtitle="Overview of leads, properties and bookings" />
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {isLoading ? (
          <div className="flex justify-center py-24"><Spinner size={28} /></div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="Total Leads" value={data.totalLeads} icon={Users2} tint="brand" />
              <StatCard label="Total Units" value={data.totalUnits} icon={Building2} tint="sky" />
              <StatCard label="Confirmed Bookings" value={data.totalBookings} icon={ClipboardCheck} tint="emerald" />
              <StatCard label="Revenue Booked" value={formatCurrency(data.totalRevenue)} icon={IndianRupee} tint="amber" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Lead stage breakdown */}
              <div className="card p-5 lg:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-ink-900 text-sm">Leads by Stage</h3>
                  <Link to="/leads" className="text-xs font-semibold text-brand-600 flex items-center gap-1 hover:underline">
                    View all <ArrowUpRight size={13} />
                  </Link>
                </div>
                <div className="space-y-3">
                  {Object.keys(STAGE_LABELS).map((stage) => {
                    const count = data.stageCounts[stage] || 0;
                    const max = Math.max(...Object.values(data.stageCounts), 1);
                    return (
                      <div key={stage} className="flex items-center gap-3">
                        <Badge className={`${STAGE_STYLES[stage]} w-28 shrink-0 justify-center`}>{STAGE_LABELS[stage]}</Badge>
                        <div className="flex-1 h-2 bg-ink-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-brand-500 rounded-full transition-all"
                            style={{ width: `${(count / max) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-ink-700 w-6 text-right">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Upcoming follow-ups */}
              <div className="card p-5">
                <h3 className="font-bold text-ink-900 text-sm mb-4 flex items-center gap-2">
                  <Clock size={15} className="text-brand-600" /> Upcoming Follow-ups
                </h3>
                {data.upcomingFollowUps.length === 0 ? (
                  <EmptyState title="No follow-ups scheduled" />
                ) : (
                  <ul className="space-y-3">
                    {data.upcomingFollowUps.map((lead) => (
                      <li key={lead.id} className="flex items-center justify-between text-sm">
                        <div>
                          <p className="font-semibold text-ink-800">{lead.name}</p>
                          <p className="text-xs text-ink-400">{lead.phone}</p>
                        </div>
                        <span className="text-xs font-medium text-ink-500">{formatDate(lead.followUpDate)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Recent leads */}
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-ink-900 text-sm">Recently Added Leads</h3>
                <Link to="/leads" className="text-xs font-semibold text-brand-600 flex items-center gap-1 hover:underline">
                  View all <ArrowUpRight size={13} />
                </Link>
              </div>
              {data.recentLeads.length === 0 ? (
                <EmptyState title="No leads yet" description="Add your first lead to get started." />
              ) : (
                <ul className="divide-y divide-ink-100">
                  {data.recentLeads.map((lead) => (
                    <li key={lead.id} className="py-3 flex items-center justify-between">
                      <p className="text-sm font-semibold text-ink-800">{lead.name}</p>
                      <div className="flex items-center gap-3">
                        <Badge className={STAGE_STYLES[lead.stage]}>{STAGE_LABELS[lead.stage]}</Badge>
                        <span className="text-xs text-ink-400 w-20 text-right">{formatDate(lead.createdAt)}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
