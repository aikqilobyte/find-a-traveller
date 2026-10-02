import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { LegalPage, Clause } from "@/components/legal/legal-page";

export const metadata: Metadata = { title: "Terms & Conditions" };

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <LegalPage title="Terms & Conditions" updated="3 October 2026">
          <Clause heading="1. What Find A Traveller is">
            <p>
              Find A Traveller is a marketplace. It introduces people who need an item carried
              (&ldquo;package owners&rdquo;) to people already travelling that route
              (&ldquo;travellers&rdquo;), and handles the booking, messaging and payment between
              them.
            </p>
            <p>
              We are not a courier, a freight forwarder or a customs agent. We do not take
              possession of any item at any point. The agreement to carry an item is between the
              package owner and the traveller; our role is to introduce them, hold the payment and
              keep a record.
            </p>
          </Clause>

          <Clause heading="2. Who may use it">
            <p>
              You must be at least 18 and legally able to enter a contract. One person, one account.
              You are responsible for everything done through your account, so keep your password to
              yourself.
            </p>
          </Clause>

          <Clause heading="3. What may not be carried">
            <p>
              You must not send, offer to send, or agree to carry anything that is illegal to
              possess, export or import in either country, or that the carrier prohibits. That
              includes but is not limited to: narcotics, weapons and ammunition, explosives and
              flammables, live animals, human remains, counterfeit goods, currency in bulk, and
              anything requiring a licence you do not hold.
            </p>
            <p>
              <strong className="text-foreground">Travellers must inspect every item before accepting it.</strong>{" "}
              Carrying a sealed package you have not seen the contents of puts you personally at risk
              at a border, and no term here protects you from that. If you are not shown the
              contents, refuse the booking.
            </p>
          </Clause>

          <Clause heading="4. Payment and release">
            <p>
              The package owner pays when a quote is accepted. We hold that payment and release it to
              the traveller once delivery is confirmed with the delivery code. Our fees are shown
              before payment and are deducted from the amount released.
            </p>
            <p>
              We are not a bank and this is not a trust or escrow account in the regulated sense.
              Funds are held in a company account pending release. Payments are processed by a
              third-party provider subject to their own terms.
            </p>
          </Clause>

          <Clause heading="5. Insurance and liability">
            <p>
              Any optional cover offered at checkout is described at the point of purchase. Where no
              cover is purchased, items travel at the owner&rsquo;s risk.
            </p>
            <p>
              We are not liable for loss, damage, delay, seizure by customs, or any dispute between a
              package owner and a traveller. Our maximum liability to you in any circumstance is
              limited to the fees you paid us on the booking in question.
            </p>
          </Clause>

          <Clause heading="6. Keeping deals on the platform">
            <p>
              Contact details are hidden until a booking is paid for, and messages are filtered
              before that point. This is not an inconvenience to work around: taking a deal
              off-platform removes the payment protection, the delivery code and any record we could
              use to help if something goes wrong.
            </p>
            <p>
              Repeatedly attempting to move deals off-platform, or to evade the message filter, may
              result in suspension.
            </p>
          </Clause>

          <Clause heading="7. Reviews and conduct">
            <p>
              Reviews must reflect a real transaction. Do not post abuse, threats, or anyone
              else&rsquo;s personal information. We may remove content and suspend accounts that
              breach this.
            </p>
          </Clause>

          <Clause heading="8. Suspension and termination">
            <p>
              We may suspend or close an account that breaches these terms, attempts fraud, or puts
              other users at risk. You may close your account at any time; obligations on bookings
              already in progress survive.
            </p>
          </Clause>

          <Clause heading="9. Changes">
            <p>
              We may update these terms. Material changes will be notified in the app or by email,
              and the date at the top will change. Continuing to use the platform after a change
              means you accept it.
            </p>
          </Clause>

          <Clause heading="10. Law and contact">
            <p>
              These terms are governed by the laws of Bangladesh. Questions go to{" "}
              <Link href="/support" className="text-primary hover:underline">
                our support page
              </Link>
              .
            </p>
          </Clause>
        </LegalPage>
      </main>
      <Footer />
    </div>
  );
}
