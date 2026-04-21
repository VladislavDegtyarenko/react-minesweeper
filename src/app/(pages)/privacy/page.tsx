import LegalDocument from '@/components/LegalDocument';
import { generateMetadata } from '../../../utils/seo';

export const metadata = generateMetadata({
  title: 'Privacy Policy',
  description:
    'Privacy Policy for Minesweeper. Learn how we handle account data, public leaderboard data, cookies, and local storage.',
  path: '/privacy',
});

export default function PrivacyPage() {
  return (
    <LegalDocument
      title="Privacy Policy"
      description="How Minesweeper collects, uses, stores, and discloses personal data for accounts and the shared leaderboard."
      lastUpdatedDateTime="2026-04-18"
      lastUpdated="April 18, 2026"
    >
      <section>
        <h2>1. Controller and scope</h2>
        <p>
          Minesweeper is operated by Vladyslav Dihtiarenko. This Privacy Policy
          applies to the public website, account features, shared leaderboard,
          and related support interactions for the game.
        </p>
        <p>
          For privacy questions, requests, or account-related concerns, use the
          contact details published at{' '}
          <a
            href="https://vd-developer.online/"
            rel="noopener noreferrer"
            target="_blank"
          >
            vd-developer.online
          </a>
          .
        </p>
      </section>

      <section>
        <h2>2. Data we collect</h2>
        <ul>
          <li>
            <strong>Account data:</strong> email address, password credentials
            handled through Supabase Auth, nickname, and optional first name,
            last name, and country.
          </li>
          <li>
            <strong>Profile media:</strong> optional avatar images that you
            upload for your account profile.
          </li>
          <li>
            <strong>Gameplay records:</strong> account-backed best scores,
            level identifiers, and achievement timestamps used for your private
            account page and the public leaderboard.
          </li>
          <li>
            <strong>Session and device storage:</strong> authentication cookies
            required to keep signed-in sessions working and local storage used
            for guest best scores and gameplay preferences such as control mode,
            zoom, dig/flag toggle, question mark preference, and sound
            settings.
          </li>
        </ul>
      </section>

      <section>
        <h2>3. How we use the data</h2>
        <ul>
          <li>Create and manage your account.</li>
          <li>Authenticate sign-in, password reset, and account recovery flows.</li>
          <li>Save your account profile and avatar.</li>
          <li>Store and display account-backed leaderboard performance.</li>
          <li>Let you delete your account and associated stored profile data.</li>
          <li>Operate, secure, and troubleshoot the service.</li>
        </ul>
      </section>

      <section>
        <h2>4. What is public</h2>
        <ul>
          <li>
            Your <strong>nickname</strong>, optional <strong>avatar</strong>,
            best time, level, and achievement date can be shown publicly on the
            leaderboard when you play with an account.
          </li>
          <li>
            Your <strong>email address</strong> is not displayed publicly by the
            app.
          </li>
          <li>
            Your optional <strong>country</strong> is stored in your account
            profile for profile management and is not intended to be shown
            publicly by the app.
          </li>
        </ul>
      </section>

      <section>
        <h2>5. Legal bases for processing</h2>
        <p>
          When GDPR or UK GDPR applies, Minesweeper generally processes personal
          data because it is necessary to provide the account and leaderboard
          features you request, and because the service has legitimate interests
          in maintaining security, preventing abuse, and operating the site.
        </p>
      </section>

      <section>
        <h2>6. Sharing and service providers</h2>
        <ul>
          <li>
            Account, database, and avatar storage infrastructure is provided
            through Supabase.
          </li>
          <li>
            Public leaderboard visitors can see the public profile and score
            fields described above.
          </li>
          <li>
            Minesweeper does not sell personal information and does not
            currently use advertising trackers or analytics trackers in this
            app.
          </li>
        </ul>
      </section>

      <section>
        <h2>7. Retention and deletion</h2>
        <ul>
          <li>
            Account profile data and account-backed scores are retained until
            you delete the account or the data is otherwise removed for service
            administration.
          </li>
          <li>
            Avatar files are retained until you replace or remove them, or until
            the account is deleted.
          </li>
          <li>
            Guest best scores and gameplay preferences stored in local storage
            remain on your device until you clear them or your browser storage
            is removed.
          </li>
          <li>
            You can delete your account from the account page. That flow is
            designed to remove your account record and associated account-backed
            profile data from the service.
          </li>
        </ul>
      </section>

      <section>
        <h2>8. Cookies and similar storage</h2>
        <p>
          Minesweeper currently uses cookies that are necessary for signed-in
          Supabase sessions and browser local storage that supports gameplay and
          account functionality. At the time of this policy, the app does not
          use analytics cookies, advertising cookies, or cross-site tracking
          technologies.
        </p>
        <p>
          If that changes, the site will need updated disclosures and may need
          additional consent mechanisms depending on the feature and the
          location of the user.
        </p>
      </section>

      <section>
        <h2>9. International transfers and your rights</h2>
        <p>
          The service may process data in countries where Minesweeper or its
          infrastructure providers operate. Depending on your location, you may
          have rights to request access, correction, deletion, restriction, or
          portability of your personal data, and to object to certain
          processing. You may also have the right to lodge a complaint with a
          supervisory authority.
        </p>
      </section>

      <section>
        <h2>10. Changes to this policy</h2>
        <p>
          This Privacy Policy may be updated when the service, legal
          requirements, or data practices change. The version published on this
          page is the current version, and the effective date appears at the top
          of the page.
        </p>
      </section>
    </LegalDocument>
  );
}
