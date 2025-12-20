import { SiWhatsapp } from "react-icons/si";

export default function ComingSoonBanner() {
  return (
    <section className="relative py-6 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 border-y border-primary/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="bg-primary text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide animate-pulse" data-testid="banner-badge">
              Next Drop
            </span>
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-white" data-testid="banner-title">
                AFTR 2.0 <span className="text-primary">Coming Soon</span>
              </h3>
              <p className="text-sm text-white/70" data-testid="banner-subtitle">
                The rave returns — bigger, louder, unstoppable
              </p>
            </div>
          </div>
          
          <a 
            href="https://chat.whatsapp.com/LSCbHsSjnDt17WyJF0KXtO" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-6 py-3 gradient-bg text-white font-bold rounded-full hover:scale-105 transition-transform whitespace-nowrap"
            data-testid="banner-cta"
          >
            <SiWhatsapp className="text-lg" />
            Join Community
          </a>
        </div>
      </div>
    </section>
  );
}
