import LegalPage from '../components/legal/LegalPage';
import { useSeo } from '../components/seo/useSeo';

export default function Privacy() {
  useSeo({
    title: 'Privacy Policy',
    description: 'How FanConnectPro collects, uses, and protects your data — including account details, crypto payment information, and event activity.',
    path: '/privacy',
  });

  return (
    <LegalPage
      eyebrow="Legal"
      title="Privacy Policy"
      lastUpdated="July 30, 2026"
      intro="This policy explains what information FanConnectPro collects when you book tickets, follow celebrities, or apply for sponsorship — and what we do with it."
      sections={[
        {
          id: 'overview',
          heading: '1. Overview',
          body: (
            <p>
              FanConnectPro ("we," "us," "our") operates the celebrity events and ticketing platform at
              this domain. This policy applies to anyone who creates an account, browses events, or
              submits a sponsorship application. By using the platform, you agree to the collection and
              use of information as described here.
            </p>
          ),
        },
        {
          id: 'information-we-collect',
          heading: '2. Information We Collect',
          body: (
            <>
              <p><strong className="text-white">Account information.</strong> Name, email address, and password (stored as a salted hash — we never store your password in plain text). Optionally, an avatar image URL.</p>
              <p><strong className="text-white">Activity data.</strong> Celebrities you follow, events you save, your ticket and order history, and sponsorship applications you submit.</p>
              <p><strong className="text-white">Payment information.</strong> Because all payments settle in cryptocurrency, we do not collect card numbers or bank details. We do record the coin, network, wallet address, and transaction hash associated with an order — this data is inherently public on the relevant blockchain.</p>
              <p><strong className="text-white">Technical data.</strong> IP address and basic request metadata, collected for security (rate limiting, fraud prevention) and error logging.</p>
            </>
          ),
        },
        {
          id: 'how-we-use-it',
          heading: '3. How We Use Your Information',
          body: (
            <ul className="list-disc pl-5 space-y-2">
              <li>To create and secure your account, and to authenticate you via session tokens.</li>
              <li>To process ticket orders: reserve seats, generate your QR-coded tickets, and show your order history.</li>
              <li>To show you the celebrities you follow and the events you've saved.</li>
              <li>To review and respond to sponsorship applications you submit.</li>
              <li>To detect and prevent abuse — for example, locking an account after repeated failed logins.</li>
              <li>To send operational messages about your orders (payment confirmations, ticket issuance).</li>
            </ul>
          ),
        },
        {
          id: 'crypto-payments',
          heading: '4. Cryptocurrency Payments',
          body: (
            <>
              <p>
                All ticket and sponsorship payments are settled on-chain. When you pay, you send funds
                directly from your wallet to the address shown at checkout — we never take custody of
                your wallet or private keys.
              </p>
              <p>
                Blockchain transactions are public by design. Once you submit a transaction hash, anyone
                can look up that transaction on the relevant network's public ledger. We store the hash
                only to reconcile your payment with your order.
              </p>
            </>
          ),
        },
        {
          id: 'sharing',
          heading: '5. Sharing & Third Parties',
          body: (
            <>
              <p>We do not sell your personal data. We share it only where necessary to run the platform:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong className="text-white">Cloudinary</strong> — hosts uploaded images (avatars, event and celebrity media).</li>
                <li><strong className="text-white">Blockchain networks</strong> — receive whatever a public transaction inherently reveals; we don't share additional account data with them.</li>
                <li><strong className="text-white">Sponsors</strong> — see only the public event page and, if you choose to sponsor an event, the company details you submit. We never share fan account data with sponsors.</li>
              </ul>
            </>
          ),
        },
        {
          id: 'retention',
          heading: '6. Data Retention',
          body: (
            <p>
              We keep account and order data for as long as your account is active, so your ticket
              history and tickets remain accessible. If you close your account, we retain order records
              only as long as needed for accounting, dispute resolution, or legal obligations, and delete
              or anonymize the rest.
            </p>
          ),
        },
        {
          id: 'your-rights',
          heading: '7. Your Rights & Choices',
          body: (
            <ul className="list-disc pl-5 space-y-2">
              <li>Update your name and avatar anytime from your profile.</li>
              <li>Unfollow celebrities or unsave events at any time — this immediately stops that data from being used to personalize your feed.</li>
              <li>Request a copy of your account data, or ask us to delete your account, by emailing us (see below). We'll retain what the law or open orders require us to keep.</li>
            </ul>
          ),
        },
        {
          id: 'children',
          heading: "8. Children's Privacy",
          body: (
            <p>
              FanConnectPro is not directed at children under 16, and some events carry explicit age
              restrictions of their own (shown on the event page). We do not knowingly collect data from
              children under 16. If you believe a child has created an account, contact us and we'll remove it.
            </p>
          ),
        },
        {
          id: 'security',
          heading: '9. Security',
          body: (
            <p>
              Passwords are hashed, sessions use signed tokens with expiry, and repeated failed logins
              temporarily lock an account. No system is perfectly secure, so we can't guarantee absolute
              protection — but we treat account security as a first-class concern, not an afterthought.
            </p>
          ),
        },
        {
          id: 'changes',
          heading: '10. Changes to This Policy',
          body: (
            <p>
              If we make material changes to this policy, we'll update the "last updated" date above and,
              where appropriate, notify you directly. Continued use of the platform after a change means
              you accept the updated policy.
            </p>
          ),
        },
      ]}
    />
  );
}
