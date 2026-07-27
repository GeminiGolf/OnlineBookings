"use client"

export default function AllNotifications() {
  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="mb-4 text-[22px] font-bold">Sent Notifications</h1>

      <div className="overflow-hidden rounded-2xl border bg-white">
        <table className="w-full">
          <thead>
            <tr className="border-b text-left">
              <th className="p-4">Date</th>
              <th className="p-4">Notifications</th>
              <th className="p-4 text-center">Details</th>
            </tr>
          </thead>

          <tbody>
            <tr className="border-b">
              <td className="p-4">27/07/26</td>
              <td className="p-4">3 Notifications</td>
              <td className="p-4 text-center">▼</td>
            </tr>

            <tr>
              <td colSpan={3} className="border-t bg-white px-4 py-4">
                <div className="mx-auto w-fit rounded-lg border border-gray-300 bg-gray-50 p-4">
                  <table className="w-auto text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="px-2 py-2">✏️</th>
                        <th className="px-4 py-2 text-left">Recipient</th>
                        <th className="px-4 py-2 text-left">Notification Type</th>
                        <th className="px-4 py-2 text-left">Note</th>
                      </tr>
                    </thead>

                    <tbody>
                      <tr className="border-b">
                        <td className="px-2 py-2 text-center">✏️</td>
                        <td className="px-4 py-2">Ronald Lee</td>
                        <td className="px-4 py-2">admin_message_client</td>
                        <td className="px-4 py-2">Academy closed on Monday.</td>
                      </tr>

                      <tr className="border-b">
                        <td className="px-2 py-2 text-center">✏️</td>
                        <td className="px-4 py-2">Chris</td>
                        <td className="px-4 py-2">late_booking</td>
                        <td className="px-4 py-2">Late booking requires approval.</td>
                      </tr>

                      <tr>
                        <td className="px-2 py-2 text-center">✏️</td>
                        <td className="px-4 py-2">Alan Khoo</td>
                        <td className="px-4 py-2">booking_cancelled</td>
                        <td className="px-4 py-2">Lesson cancelled by client.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </td>
            </tr>

            <tr className="border-b">
              <td className="p-4">26/07/26</td>
              <td className="p-4">1 Notification</td>
              <td className="p-4 text-center">▼</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}