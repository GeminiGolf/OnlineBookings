import Link from "next/link"

export default function Home() {
  return (
    <main className="p-10">
      <h1 className="text-4xl font-bold">
        Golf Lesson Scheduler
      </h1>

      <div className="mt-6 flex gap-4">
        <Link
          href="/login"
          className="rounded bg-blue-500 px-4 py-2 text-white"
        >
          Login
        </Link>

        <Link
          href="/dashboard"
          className="rounded bg-green-500 px-4 py-2 text-white"
        >
          Dashboard
        </Link>
      </div>
    </main>
  )
}