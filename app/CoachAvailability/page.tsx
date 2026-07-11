import PublicBookingCalendar from "@/components/booking/PublicBookingCalendar";
import PublicCoachCard from "@/components/booking/PublicCoachCard";

export default function CoachAvailabilityPage() {
  return (
    <main className="max-w-7xl mx-auto px-6 py-8">
      <h1 className="text-4xl font-bold text-center mb-10">
        Book a Lesson
      </h1>

      <div className="bg-white rounded-2xl shadow-md p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <PublicCoachCard />

          <PublicBookingCalendar />
        </div>
      </div>
    </main>
  );
}