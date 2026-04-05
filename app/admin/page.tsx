import Link from "next/link";
import AdminBookingsPanel from "@/components/AdminBookingsPanel";

const AdminPage = async () => {
    return (
        <section className="flex flex-col gap-6" id="admin-home">
            <div className="rounded-2xl border border-dark-200 bg-dark-100/80 p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Admin</p>
                <h1 className="mt-2">Admin Dashboard</h1>
                <p className="mt-3 max-w-3xl text-sm text-light-200">
                    Restricted to the owner account. Manage pending event approvals and track booked users.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <article className="rounded-xl border border-dark-200 bg-dark-100/70 p-5">
                    <h2 className="text-2xl font-bold">Pending Events</h2>
                    <p className="mt-2 text-sm text-light-200">
                        Review Telegram-ingested pending posts and approve/reject publication.
                    </p>
                    <Link
                        href="/admin/pending"
                        className="mt-4 inline-flex rounded-md border border-primary/50 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary"
                    >
                        Open /admin/pending
                    </Link>
                </article>

                <article className="rounded-xl border border-dark-200 bg-dark-100/70 p-5">
                    <h2 className="text-2xl font-bold">Bookings Export</h2>
                    <p className="mt-2 text-sm text-light-200">
                        Track booked users by event and export attendee emails to Telegram as CSV.
                    </p>
                </article>
            </div>

            <AdminBookingsPanel />
        </section>
    );
};

export default AdminPage;