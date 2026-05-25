import Link from "next/link"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-5xl font-bold">
        Gemini Golf
      </h1>

      <p className="mt-4 text-gray-600">
        Lesson Booking Portal
      </p>

      <div className="mt-10 flex gap-4">
        <Link
          href="/client"
          className="rounded bg-blue-600 px-6 py-3 text-white"
        >
          Client Login
        </Link>

        <Link
          href="/coach"
          className="rounded bg-green-600 px-6 py-3 text-white"
        >
          Coach Login
        </Link>
      </div>
    </main>
  )
}