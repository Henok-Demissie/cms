import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  CalendarDays,
  Globe,
  LockKeyhole,
  Mail,
  Phone,
  Shield,
  ShieldCheck,
  UserRound,
} from "lucide-react"

async function updateProfile(formData: FormData) {
  "use server"
  const session = await auth()
  if (!session?.user?.id) redirect("/login")
  const firstName = formData.get("firstName")?.toString().trim() || null
  const lastName = formData.get("lastName")?.toString().trim() || null
  const phone = formData.get("phone")?.toString().trim() || null
  const gender = formData.get("gender")?.toString().trim() || null
  const language = formData.get("language")?.toString().trim() || null
  const nationalId = formData.get("nationalId")?.toString().trim() || null
  const name = [firstName, lastName].filter(Boolean).join(" ") || session.user.name || "User"
  await prisma.user.update({
    where: { id: session.user.id },
    data: { firstName, lastName, phone, gender, language, nationalId, name },
  })
  revalidatePath("/dashboard/profile")
}



export default async function ProfilePage() {
  const session = await auth()
  if (!session?.user) redirect("/login")
  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (!user) redirect("/login")

  const initials = (user.name || "User")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase()

  const joined = new Intl.DateTimeFormat("en", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(user.createdAt)



  return (
    <div className="flex flex-1 flex-col gap-0 bg-background">
      {/* ─── Hero Banner ─── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/80 via-primary/55 to-amber-400/75 px-6 py-10 text-primary-foreground md:px-10 md:py-12">
        {/* Decorative circles */}
        <div className="absolute -left-20 -top-20 h-52 w-52 rounded-full bg-white/10" />
        <div className="absolute -bottom-28 right-8 h-52 w-52 rounded-full bg-white/10" />
        <div className="absolute left-1/2 top-0 h-32 w-32 -translate-x-1/2 rounded-full bg-white/5" />

        <div className="relative flex flex-wrap items-start justify-between gap-5">
          <span className="rounded-md bg-white/15 px-3 py-1.5 text-xs font-medium backdrop-blur-sm">
            ✧ Profile Settings
          </span>
          <button className="inline-flex items-center gap-2 rounded-md bg-white/15 px-3 py-1.5 text-xs font-medium backdrop-blur-sm transition-colors hover:bg-white/25">
            <LockKeyhole className="h-3.5 w-3.5" />
            Change Password
          </button>
        </div>

        <div className="relative mt-8 flex flex-wrap items-center gap-6">
          <div className="grid h-28 w-28 place-items-center rounded-full border-4 border-white/80 bg-primary/40 font-serif text-3xl font-semibold shadow-lg backdrop-blur-sm">
            {initials}
          </div>
          <div>
            <h1 className="font-serif text-3xl font-semibold">{user.name}</h1>
            <div className="mt-2.5 flex flex-wrap gap-x-5 gap-y-1.5 text-sm opacity-90">
              <span className="inline-flex items-center gap-1.5">
                <Mail className="h-4 w-4" />
                {user.email}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Phone className="h-4 w-4" />
                {user.phone || "No phone added"}
              </span>
            </div>
            <div className="mt-3.5 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur-sm">
                <Shield className="h-3 w-3" />
                {user.role === "CUSTOMER" ? "Customer" : user.role === "ADMIN" ? "Administrator" : "Agent"}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs backdrop-blur-sm">
                <Globe className="h-3 w-3" />
                {user.language === "AM" ? "Amharic" : user.language === "EN" ? "English" : user.language || "Amharic"}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs backdrop-blur-sm">
                <CalendarDays className="h-3 w-3" />
                Since {joined}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Main Content ─── */}
      <div className="flex flex-1 flex-col gap-5 p-4 md:p-7">
          {/* ─── Personal Information Form ─── */}
          <section className="mx-auto w-full max-w-4xl overflow-hidden rounded-xl border border-border bg-card shadow-sm">
            <div className="grid grid-cols-3 border-b border-border">
              <button className="border-b-2 border-primary px-4 py-3.5 text-sm font-medium text-primary">
                Profile
              </button>
              <button className="px-4 py-3.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
                Sessions
              </button>
              <button className="px-4 py-3.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
                Security
              </button>
            </div>

            <form action={updateProfile} className="p-5 md:p-7">
              <div className="mb-6 flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/15 text-primary">
                  <UserRound className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="font-serif text-xl font-semibold">Personal Information</h2>
                  <p className="text-sm text-muted-foreground">Update your personal details</p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    defaultValue={user.firstName ?? user.name.split(" ")[0] ?? ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    defaultValue={user.lastName ?? user.name.split(" ").slice(1).join(" ")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" value={user.email} readOnly className="opacity-60" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    defaultValue={user.phone ?? ""}
                    placeholder="Add your phone number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Input
                    id="gender"
                    name="gender"
                    defaultValue={user.gender ?? ""}
                    placeholder="e.g. Male, Female"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Input
                    id="language"
                    name="language"
                    defaultValue={user.language ?? "AM"}
                    placeholder="e.g. AM, EN"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="nationalId">National ID</Label>
                  <Input
                    id="nationalId"
                    name="nationalId"
                    defaultValue={user.nationalId ?? ""}
                    placeholder="Your national identification number"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <Button type="submit" className="gap-2">
                  <ShieldCheck className="h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </form>
          </section>
      </div>
    </div>
  )
}
