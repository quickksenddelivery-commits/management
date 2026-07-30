import LegalPage from '../components/legal/LegalPage';
import { useSeo } from '../components/seo/useSeo';

export default function Terms() {
  useSeo({
    title: 'Terms of Service',
    description: 'The terms that govern booking tickets, following celebrities, and applying for sponsorship on FanConnectPro.',
    path: '/terms',
  });

  return (
    <LegalPage
      eyebrow="Legal"
      title="Terms of Service"
      lastUpdated="July 30, 2026"
      intro="These terms govern your use of FanConnectPro — from browsing events to buying tickets in cryptocurrency to applying as a sponsor."
      sections={[
        {
          id: 'acceptance',
          heading: '1. Acceptance of Terms',
          body: (
            <p>
              By creating an account or using FanConnectPro, you agree to these terms. If you're using the
              platform on behalf of a company (for example, to sponsor an event), you're confirming you
              have the authority to bind that company to these terms.
            </p>
          ),
        },
        {
          id: 'eligibility',
          heading: '2. Eligibility',
          body: (
            <p>
              You must be at least 16 years old to create an account. Individual events may carry their
              own age restrictions (shown on the event page, e.g. "18+") — you're responsible for meeting
              those requirements before attending.
            </p>
          ),
        },
        {
          id: 'accounts',
          heading: '3. Accounts',
          body: (
            <p>
              You're responsible for keeping your password secure and for all activity under your account.
              Repeated failed login attempts will temporarily lock your account as a security measure. Tell
              us immediately if you suspect unauthorized access.
            </p>
          ),
        },
        {
          id: 'tickets-and-events',
          heading: '4. Tickets & Events',
          body: (
            <>
              <p>
                Each ticket tier has limited availability; seats are reserved the moment your order is
                created and released back to the pool if payment isn't confirmed. Your ticket is a
                QR-coded credential tied to your order — treat it like cash and don't share the code
                publicly.
              </p>
              <p>
                Events are organized by celebrities and their teams, not by FanConnectPro directly. Dates,
                venues, and lineups can change, and events can be postponed, moved online, or cancelled by
                the organizer. We'll reflect status changes on the event page as soon as we're notified.
              </p>
            </>
          ),
        },
        {
          id: 'crypto-payments',
          heading: '5. Cryptocurrency Payments',
          body: (
            <>
              <p>
                All payments settle in cryptocurrency (USDT, USDC, BTC, ETH, or BNB). You send funds
                directly from your own wallet to the address shown at checkout, on the exact network
                specified — sending the wrong asset or using the wrong network can result in permanent
                loss of funds, and FanConnectPro cannot recover them.
              </p>
              <p>
                On-chain payments are irreversible. Once a transaction confirms, it cannot be reversed by
                us or by you. Double-check the amount, coin, and address before sending.
              </p>
              <p>
                Crypto prices are volatile. The fiat-equivalent price shown at checkout is indicative;
                you're paying the stated crypto amount, not a guaranteed fiat value.
              </p>
            </>
          ),
        },
        {
          id: 'sponsorship',
          heading: '6. Sponsorship Applications',
          body: (
            <p>
              Submitting a sponsorship application is a request, not a confirmed booking — packages have
              limited slots, and our partnerships team reviews every application before approving it.
              Sponsorship fees, once approved and paid, follow the same crypto payment terms above.
            </p>
          ),
        },
        {
          id: 'prohibited-conduct',
          heading: '7. Prohibited Conduct',
          body: (
            <ul className="list-disc pl-5 space-y-2">
              <li>Reselling or transferring tickets in a way that violates an event organizer's stated policy.</li>
              <li>Attempting to circumvent ticket-tier limits, rate limits, or account security controls.</li>
              <li>Uploading content (avatars, event media) you don't have the rights to use.</li>
              <li>Using the platform to harass, impersonate, or defraud another user, celebrity, or sponsor.</li>
            </ul>
          ),
        },
        {
          id: 'intellectual-property',
          heading: '8. Intellectual Property',
          body: (
            <p>
              The FanConnectPro name, logo, and platform design are our property. Celebrity names, images,
              and event content belong to the respective celebrities, organizers, or their agencies, and
              are used with their authorization.
            </p>
          ),
        },
        {
          id: 'disclaimers',
          heading: '9. Disclaimers & Limitation of Liability',
          body: (
            <p>
              The platform is provided "as is." We don't guarantee an event will occur as scheduled, and
              we're not liable for losses caused by an organizer's decisions, network congestion or fees on
              a given blockchain, or funds sent to an incorrect address. To the extent permitted by law, our
              liability is limited to the amount you paid for the order in question.
            </p>
          ),
        },
        {
          id: 'termination',
          heading: '10. Termination',
          body: (
            <p>
              We may suspend or close an account that violates these terms, without affecting tickets
              already validly issued. You can stop using the platform, or ask us to close your account,
              at any time.
            </p>
          ),
        },
        {
          id: 'changes',
          heading: '11. Changes to These Terms',
          body: (
            <p>
              We may update these terms as the platform evolves. We'll update the "last updated" date
              above, and material changes will be communicated directly where appropriate. Continuing to
              use FanConnectPro after a change means you accept the updated terms.
            </p>
          ),
        },
      ]}
    />
  );
}
