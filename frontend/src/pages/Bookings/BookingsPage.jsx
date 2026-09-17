import { useState } from "react";
import { toast } from "react-toastify";
import { Plus, Ban } from "lucide-react";
import Topbar from "../../components/layout/Topbar";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import DataTable from "../../components/ui/DataTable";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import BookingFormModal from "./BookingFormModal";
import { useGetBookingsQuery, useCancelBookingMutation } from "../../features/bookings/bookingsApiSlice";
import { formatCurrency, formatDate } from "../../utils/helpers";

const STATUS_STYLES = {
  CONFIRMED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  CANCELLED: "bg-red-50 text-red-700 border-red-200",
};

export default function BookingsPage() {
  const { data: bookings = [], isLoading } = useGetBookingsQuery();
  const [cancelBooking, { isLoading: cancelling }] = useCancelBookingMutation();
  const [formOpen, setFormOpen] = useState(false);
  const [cancelling_, setCancelling_] = useState(null);

  async function confirmCancel() {
    try {
      await cancelBooking(cancelling_.id).unwrap();
      toast.success("Booking cancelled. Unit is available again.");
      setCancelling_(null);
    } catch (err) {
      toast.error(err?.data?.message || "Could not cancel booking.");
    }
  }

  const columns = [
    { header: "Customer", accessor: (b) => <div><p className="font-semibold text-ink-800">{b.lead.name}</p><p className="text-xs text-ink-400">{b.lead.phone}</p></div> },
    { header: "Unit", accessor: (b) => <span className="text-ink-600">{b.unit.unitNo} — {b.unit.building.project.name}</span> },
    { header: "Amount", accessor: (b) => <span className="font-medium text-ink-700">{formatCurrency(b.amount)}</span> },
    { header: "Booked By", accessor: (b) => <span className="text-ink-500">{b.bookedBy.name}</span> },
    { header: "Date", accessor: (b) => <span className="text-ink-500">{formatDate(b.bookingDate)}</span> },
    { header: "Status", accessor: (b) => <Badge className={STATUS_STYLES[b.status]}>{b.status}</Badge> },
    {
      header: "",
      headerClassName: "text-right",
      className: "text-right",
      accessor: (b) =>
        b.status === "CONFIRMED" && (
          <button onClick={() => setCancelling_(b)} className="btn-ghost p-1.5 hover:text-red-600" title="Cancel booking">
            <Ban size={15} />
          </button>
        ),
    },
  ];

  return (
    <>
      <Topbar
        title="Bookings"
        subtitle="Every unit is locked to a single active booking — no double-booking"
        actions={<Button icon={Plus} onClick={() => setFormOpen(true)}>New Booking</Button>}
      />

      <div className="p-6 max-w-7xl mx-auto">
        <div className="card p-6">
          <DataTable
            columns={columns}
            data={bookings}
            loading={isLoading}
            emptyTitle="No bookings yet"
            emptyDesc="Connect a lead to an available unit to create your first booking."
          />
        </div>
      </div>

      <BookingFormModal open={formOpen} onClose={() => setFormOpen(false)} />
      <ConfirmDialog
        open={!!cancelling_}
        onClose={() => setCancelling_(null)}
        onConfirm={confirmCancel}
        loading={cancelling}
        title="Cancel Booking"
        description="This will free up the unit so it can be booked again. Continue?"
      />
    </>
  );
}
