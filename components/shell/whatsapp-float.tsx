import { MessageCircle } from "lucide-react"

export function WhatsAppFloat() {
  return (
    <a
      href="https://wa.me/233245550198?text=Hi%20DataSell%2C%20I%20need%20help"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with DataSell on WhatsApp"
      className="whatsapp-float brand-gradient brand-glow fixed bottom-6 right-6 z-50 grid size-14 place-items-center rounded-full text-primary-foreground transition-transform hover:scale-105"
    >
      <MessageCircle className="size-6" />
      <span
        aria-hidden="true"
        className="absolute -right-0.5 -top-0.5 grid size-5 place-items-center rounded-full bg-destructive text-[10px] font-extrabold text-destructive-foreground ring-2 ring-background"
      >
        1
      </span>
    </a>
  )
}
