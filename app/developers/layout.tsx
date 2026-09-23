import { DevShell } from "@/components/developers/dev-shell"

export default function DevelopersLayout({ children }: { children: React.ReactNode }) {
  return <DevShell>{children}</DevShell>
}
