import { MessageForm } from "@/components/marketing/message-form"

export function FeedbackSection() {
  return (
    <section id="feedback" className="scroll-mt-28 py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#ADA996] to-[#F2F2F2] rounded-full mb-6">
            <span className="text-xs text-black uppercase tracking-widest">Feedback</span>
          </div>
          <h2 className="font-sans text-4xl md:text-5xl font-semibold mb-4">Share Your Feedback</h2>
          <p className="text-base text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Tell us what you think about ResolveHQ, suggest improvements, or report issues so we can make the platform better for your team.
          </p>
        </div>

        <MessageForm
          id="feedback-message"
          label="Your feedback"
          placeholder="Write your feedback here..."
          submitLabel="Submit feedback"
          successMessage="Thank you! Your feedback has been submitted."
        />
      </div>
    </section>
  )
}
