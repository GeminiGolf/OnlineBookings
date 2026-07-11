import Link from "next/link";

export default function PublicBookingCalendar() {
  return (
    <div className="border rounded-xl p-6 min-h-[600px]">
      <h2 className="text-2xl font-semibold mb-6">
        Public Booking Calendar
      </h2>

      <div className="mt-10">
        <h3 className="font-semibold mb-4">
          Available Time Slots
        </h3>

        <p className="text-gray-500">
          No date selected.
        </p>
      </div>

      <div className="mt-10 text-center">
        <p className="text-gray-600">
          <Link
            href="/login"
            className="text-blue-600 hover:underline font-medium"
          >
            Log in
          </Link>{" "}
          or{" "}
          <Link
            href="/signup"
            className="text-blue-600 hover:underline font-medium"
          >
            Sign Up
          </Link>{" "}
          to book a lesson.
        </p>
      </div>
    </div>
  );
}