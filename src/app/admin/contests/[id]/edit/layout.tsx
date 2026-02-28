export default function AdminContestEditLayout({
  children,
}: {
  children: React.ReactNode
  params: Promise<{ id: string }>
}) {
  return (
    <>{children}</>
  )
}
