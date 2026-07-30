type DashboardContainerProps = {
  children: React.ReactNode
}

export default function DashboardContainer({
  children,
}: DashboardContainerProps) {
  return (
    <div className="mx-auto mt-10 w-full max-w-5xl px-2 lg:mt-12 lg:px-4">
      {children}
    </div>
  )
}