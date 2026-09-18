import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import { usePageTitle } from "@/hooks/use-page-title";

const legalContent: Record<string, { title: string; sections: { heading: string; body: string }[] }> = {
  terms: {
    title: "Terms & Conditions",
    sections: [
      {
        heading: "1. Agreement",
        body: "By purchasing tickets or attending any After Dark Socials event, you agree to these terms and conditions in full. After Dark Socials reserves the right to update these terms at any time without prior notice.",
      },
      {
        heading: "2. Ticket Purchase",
        body: "All ticket sales are final unless an event is cancelled by After Dark Socials. Tickets are non-transferable and must be presented (digital or printed) upon entry. After Dark Socials is not responsible for lost or stolen tickets.",
      },
      {
        heading: "3. Entry & Conduct",
        body: "After Dark Socials reserves the right to refuse entry or remove any person from the venue for disruptive, aggressive, or inappropriate behaviour. Entry is subject to venue capacity. Being listed on a guest list or holding a ticket does not guarantee entry if venue capacity is reached.",
      },
      {
        heading: "4. Age Restriction",
        body: "All After Dark Socials events are strictly 18+. Valid government-issued photo identification will be required on entry. Guests who cannot provide valid ID will be refused entry with no refund.",
      },
      {
        heading: "5. Liability",
        body: "After Dark Socials is not liable for any personal injury, loss, or damage to property sustained at any event. Attendees attend at their own risk. After Dark Socials is not responsible for the actions of third parties including venue staff, security, or other guests.",
      },
      {
        heading: "6. Event Changes",
        body: "After Dark Socials reserves the right to change event details including lineup, venue, date, and time. In the event of a full cancellation, ticket holders will be notified and a refund process will be initiated.",
      },
      {
        heading: "7. Photography & Media",
        body: "By attending an After Dark Socials event, you consent to being photographed or filmed for promotional purposes. Images and footage may be used on our website and social media platforms.",
      },
      {
        heading: "8. Contact",
        body: "For any queries regarding these terms, please contact us at afterdarksocials@gmail.com or via WhatsApp at +230 5820 5220.",
      },
    ],
  },
  privacy: {
    title: "Privacy Policy",
    sections: [
      {
        heading: "1. Data We Collect",
        body: "When you purchase tickets, make a booking enquiry, or contact us, we may collect your name, email address, phone number, and payment details. We also collect basic analytics data from our website.",
      },
      {
        heading: "2. How We Use Your Data",
        body: "Your data is used solely to process bookings, send event updates, and respond to enquiries. We do not sell, rent, or share your personal information with third parties for marketing purposes.",
      },
      {
        heading: "3. Data Storage",
        body: "Your data is stored securely and retained only for as long as necessary to fulfil the purposes outlined in this policy. Payment data is processed through secure third-party payment providers and is not stored on our servers.",
      },
      {
        heading: "4. Communications",
        body: "By providing your contact details, you consent to receiving event updates and communications from After Dark Socials. You may opt out at any time by contacting us directly.",
      },
      {
        heading: "5. Your Rights",
        body: "You have the right to request access to, correction of, or deletion of your personal data at any time. To exercise these rights, contact us at afterdarksocials@gmail.com.",
      },
      {
        heading: "6. Cookies",
        body: "Our website uses cookies to improve your browsing experience. By continuing to use the site, you consent to the use of cookies in accordance with this policy.",
      },
      {
        heading: "7. Contact",
        body: "For any privacy-related queries, please contact us at afterdarksocials@gmail.com.",
      },
    ],
  },
  refund: {
    title: "Refund Policy",
    sections: [
      {
        heading: "1. General Policy",
        body: "All ticket sales are final. After Dark Socials does not offer refunds or exchanges for change of mind, personal scheduling conflicts, or failure to present valid identification at entry.",
      },
      {
        heading: "2. Event Cancellation",
        body: "In the event that After Dark Socials cancels an event entirely, all ticket holders will be entitled to a full refund. Refunds will be processed within 10 business days using the original payment method.",
      },
      {
        heading: "3. Event Postponement",
        body: "If an event is postponed, your ticket will remain valid for the rescheduled date. If you are unable to attend the rescheduled event, you may request a refund within 7 days of the postponement announcement.",
      },
      {
        heading: "4. Venue or Lineup Changes",
        body: "After Dark Socials reserves the right to change the venue or lineup without issuing refunds, provided the event still takes place on the advertised date. Significant changes will be communicated as early as possible.",
      },
      {
        heading: "5. Refused Entry",
        body: "Guests refused entry due to failure to present valid ID, intoxication, or disruptive behaviour are not entitled to a refund.",
      },
      {
        heading: "6. How to Request a Refund",
        body: "To request a refund for eligible circumstances, contact us at afterdarksocials@gmail.com with your booking reference and reason for the request. Refund requests must be submitted within the specified timeframes outlined above.",
      },
    ],
  },
  age: {
    title: "Age Requirements",
    sections: [
      {
        heading: "Strictly 18+",
        body: "All After Dark Socials events are strictly for persons aged 18 years and above. This policy is enforced without exception at all events and venues.",
      },
      {
        heading: "Valid Identification",
        body: "All guests must present a valid, government-issued photo identification document upon entry. Accepted forms of ID include: National Identity Card (NIC), Passport, and Driver's Licence. Digital copies or photocopies of ID will not be accepted.",
      },
      {
        heading: "Refusal of Entry",
        body: "Any guest who cannot provide valid photo identification proving they are 18 years of age or older will be refused entry. No refund will be issued in this circumstance.",
      },
      {
        heading: "Alcohol",
        body: "Alcohol is served at our events and venues in accordance with Mauritius liquor licensing laws. After Dark Socials promotes responsible drinking. We reserve the right to refuse service of alcohol to any guest who appears intoxicated.",
      },
      {
        heading: "Venue Policy",
        body: "All events are subject to the age and entry policies of the host venue in addition to After Dark Socials' own requirements. The stricter policy will always apply.",
      },
      {
        heading: "Questions",
        body: "For any questions regarding our age requirements, please contact us at afterdarksocials@gmail.com before purchasing tickets.",
      },
    ],
  },
};

const slugMap: Record<string, string> = {
  "/terms": "terms",
  "/privacy": "privacy",
  "/refund": "refund",
  "/age-requirements": "age",
};

export default function LegalPage() {
  const [location] = useLocation();
  const slug = slugMap[location] || "terms";
  const content = legalContent[slug];
  usePageTitle(content.title);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Top bar */}
      <div className="border-b border-white/10">
        <div className="max-w-4xl mx-auto px-6 lg:px-12 py-6 flex items-center justify-between">
          <a
            href="/"
            className="inline-flex items-center gap-3 text-white/40 hover:text-white text-xs uppercase tracking-[0.2em] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </a>
          <span className="text-[#c72d28] text-xs uppercase tracking-[0.3em]">
            After Dark Socials
          </span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 lg:px-12 py-20">
        {/* Header */}
        <div className="mb-16 border-b border-white/10 pb-16">
          <p className="text-[#c72d28] text-xs uppercase tracking-[0.3em] mb-6">Legal</p>
          <h1
            className="text-6xl sm:text-8xl font-black text-white leading-none"
            style={{ fontFamily: "'Bebas Neue', Impact, sans-serif" }}
          >
            {content.title}
          </h1>
          <p className="text-white/30 text-sm mt-6">
            Last updated: May 2026 · After Dark Socials, Mauritius
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-12">
          {content.sections.map((section) => (
            <div key={section.heading} className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-12">
              <div>
                <h2 className="text-white/40 text-xs uppercase tracking-[0.2em] leading-relaxed">
                  {section.heading}
                </h2>
              </div>
              <div className="md:col-span-3">
                <p className="text-white/60 text-sm leading-relaxed">{section.body}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <div className="mt-20 pt-12 border-t border-white/10">
          <p className="text-white/20 text-xs uppercase tracking-[0.2em]">
            © 2026 After Dark Socials. All rights reserved. · afterdarksocials@gmail.com
          </p>
        </div>
      </div>
    </div>
  );
}