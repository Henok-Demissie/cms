import { MessageForm } from "@/components/marketing/message-form"

export function FeedbackSection() {
  return (
    <section id="feedback" className="scroll-mt-20 px-5 py-16 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="mb-5 inline-flex items-center gap-2 rounded-md border border-primary/30 bg-primary/10 px-3 py-1.5">
            <span className="text-xs uppercase tracking-widest text-primary">Feedback</span>
          </div>
          <h2 className="font-sans text-4xl md:text-5xl font-semibold mb-4">Share Your Feedback</h2>
          <p className="text-base text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Tell us what you think about AbetBay, suggest improvements, or report issues so we can make the platform better for your team.
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
