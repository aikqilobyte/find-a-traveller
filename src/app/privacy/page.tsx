import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { LegalPage, Clause } from "@/components/legal/legal-page";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <LegalPage title="Privacy Policy" updated="3 October 2026">
          <Clause heading="1. What we collect">
            <p>
              <strong className="text-foreground">You give us:</strong> your name, email address,
              password (stored only as a cryptographic hash, never readable by us), and optionally a
              phone number, country, photo and short bio.
            </p>
            <p>
              <strong className="text-foreground">You create as you use it:</strong> posts and
              requests, messages, bookings, payment records, delivery confirmations and reviews.
            </p>
            <p>
              <strong className="text-foreground">We record automatically:</strong> basic technical
              information needed to run and secure the service, such as IP address and timestamps.
            </p>
          </Clause>

          <Clause heading="2. Why we hold it">
            <p>
              To run the marketplace: showing posts, matching the two sides, carrying messages,
              taking payment, confirming delivery and publishing reviews. To keep people safe:
              detecting fraud and abuse. To meet legal and accounting obligations.
            </p>
          </Clause>

          <Clause heading="3. What other users see">
            <p>
              Before a booking is paid for, the other party sees only your rating, country and
              verification status &mdash; not your name, photo or contact details. Once payment
              completes, your name and contact details are shared with that one counterparty so the
              handover can happen.
            </p>
            <p>
              Messages are filtered before payment to remove phone numbers, email addresses and
              links. That filtering is automated; we do not read conversations routinely, but we may
              review a specific conversation when investigating a report or a dispute.
            </p>
            <p>Reviews you write, and your rating, are public.</p>
          </Clause>

          <Clause heading="4. Who else sees it">
            <p>
              Service providers that make the platform work, and only for that purpose: our database
              and authentication provider, our email provider, and our payment provider. Each
              processes data under its own terms.
            </p>
            <p>
              We do not sell your data, and we do not share it for advertising. We may disclose
              information where the law requires it.
            </p>
          </Clause>

          <Clause heading="5. Where it is held">
            <p>
              Our database and servers may be located outside Bangladesh. By using the platform you
              accept that your information is processed in those locations.
            </p>
          </Clause>

          <Clause heading="6. How long we keep it">
            <p>
              Account and transaction records are kept while your account is open and afterwards for
              as long as accounting and legal obligations require. Messages and booking history
              attached to a completed delivery are retained as a record of what was agreed.
            </p>
          </Clause>

          <Clause heading="7. Your choices">
            <p>
              You can view and edit your profile at any time, and request a copy or deletion of your
              data through{" "}
              <Link href="/support" className="text-primary hover:underline">
                support
              </Link>
              . Some records cannot be deleted where we are required to keep them &mdash; completed
              transactions, for instance.
            </p>
          </Clause>

          <Clause heading="8. Security">
            <p>
              Passwords are hashed. Access to the database is restricted at row level, so one user
              cannot read another&rsquo;s data. Traffic is encrypted in transit. No system is
              perfect; tell us immediately if you think your account has been accessed by someone
              else.
            </p>
          </Clause>

          <Clause heading="9. Children">
            <p>The platform is not for under-18s, and we do not knowingly collect their data.</p>
          </Clause>

          <Clause heading="10. Changes and contact">
            <p>
              If this policy changes materially we will say so in the app or by email. Questions go
              to{" "}
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
