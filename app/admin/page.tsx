export default function AdminPage() {
  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <h1 className="mb-6 text-4xl font-bold text-black">
        Admin Dashboard
      </h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">

        <div className="rounded-xl bg-white p-6 shadow">
          <h2 className="text-lg font-semibold text-black">
            Total Coaches
          </h2>
          <p className="mt-2 text-3xl font-bold text-black">
            -
          </p>
        </div>

        <div className="rounded-xl bg-white p-6 shadow">
          <h2 className="text-lg font-semibold text-black">
            Total Clients
          </h2>
          <p className="mt-2 text-3xl font-bold text-black">
            -
          </p>
        </div>

        <div className="rounded-xl bg-white p-6 shadow">
          <h2 className="text-lg font-semibold text-black">
            Total Bookings
          </h2>
          <p className="mt-2 text-3xl font-bold text-black">
            -
          </p>
        </div>

        <div className="rounded-xl bg-white p-6 shadow">
          <h2 className="text-lg font-semibold text-black">
            Today's Bookings
          </h2>
          <p className="mt-2 text-3xl font-bold text-black">
            -
          </p>
        </div>

      </div>
    </main>
  )
}