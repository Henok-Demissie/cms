import { MessageForm } from "@/components/marketing/message-form"

export function SuggestionsSection() {
  return (
    <section id="suggestions" className="scroll-mt-28 py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#ADA996] to-[#F2F2F2] rounded-full mb-6">
            <span className="text-xs text-black uppercase tracking-widest">Suggestions</span>
          </div>
          <h2 className="font-sans text-4xl md:text-5xl font-semibold mb-4">Submit a Suggestion</h2>
          <p className="text-base text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Send us your ideas for new features or workflows so ResolveHQ can better support your complaint management needs.
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
