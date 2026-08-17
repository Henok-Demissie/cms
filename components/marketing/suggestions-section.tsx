import { MessageForm } from "@/components/marketing/message-form"

export function SuggestionsSection() {
  return (
    <section id="suggestions" className="scroll-mt-20 px-5 py-16 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="mb-5 inline-flex items-center gap-2 rounded-md border border-primary/30 bg-primary/10 px-3 py-1.5">
            <span className="text-xs uppercase tracking-widest text-primary">Suggestions</span>
          </div>
          <h2 className="font-sans text-4xl md:text-5xl font-semibold mb-4">Submit a Suggestion</h2>
          <p className="text-base text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Send us your ideas for new features or workflows so AbetBay can better support your complaint management needs.
          </p>
        </div>

        <MessageForm
          id="suggestion-message"
          label="Your suggestion"
          placeholder="Write your suggestion here..."
          submitLabel="Submit suggestion"
          successMessage="Thank you! Your suggestion has been submitted."
        />
      </div>
    </section>
  )
}
