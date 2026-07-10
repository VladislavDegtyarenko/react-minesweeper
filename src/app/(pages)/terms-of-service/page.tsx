import LegalDocument from '@/components/LegalDocument';
import { ROUTES } from '@/config/routes';
import { generateMetadata as buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'Terms of Service',
  description:
    'Terms of Service for Minesweeper. Read the rules for accounts, public profiles, avatars, daily challenges, and the leaderboard.',
  path: ROUTES.TERMS_OF_SERVICE,
});

export default function TermsOfServicePage() {
  return (
    <LegalDocument
      title="Terms of Service"
      description="Rules for using Minesweeper, including accounts, public leaderboard participation, daily challenges, avatars, and acceptable use."
      lastUpdatedDateTime="2026-05-10"
      lastUpdated="May 10, 2026"
    >
      <section>
        <h2>1. Acceptance of these terms</h2>
        <p>
          By accessing or using Minesweeper, you agree to these Terms of
          Service. If you do not agree, do not use the site or its account
          features.
        </p>
      </section>

      <section>
        <h2>2. Accounts</h2>
        <ul>
          <li>
            You are responsible for the accuracy of the information you submit
            for your account and for maintaining the security of your login
            credentials.
          </li>
          <li>
            You must not attempt to access another user&apos;s account or
            interfere with authentication, password reset, or account recovery
            flows.
          </li>
          <li>
            You may delete your account through the account page. Deleting your
            account removes your stored best scores and daily challenge attempts
            from our database and deletes your account record at Clerk.
          </li>
        </ul>
      </section>

      <section>
        <h2>3. Public profiles, leaderboard, and daily challenge</h2>
        <ul>
          <li>
            If you use an account, your username, avatar, and qualifying best
            scores, daily wins, and daily streaks may appear on the public
            leaderboard.
          </li>
          <li>
            You should choose a username and avatar that you are comfortable
            making public.
          </li>
          <li>
            Minesweeper may remove, hide, or reset leaderboard entries that are
            believed to be inaccurate, abusive, fraudulent, or obtained through
            cheating or technical manipulation.
          </li>
          <li>
            Daily challenge attempts and streaks may be stored for your account
            and are derived from recorded results. Only the first daily result
            for each difficulty and UTC day counts; later replays of that same
            daily challenge are treated as practice.
          </li>
          <li>
            Daily losses may be shown in your private account history, but they
            are not shown as public daily leaderboard results.
          </li>
        </ul>
      </section>

      <section>
        <h2>4. User content</h2>
        <ul>
          <li>
            You keep ownership of content you upload, such as avatar images, but
            you give Minesweeper permission to host, process, resize, store, and
            display that content (through Clerk, our authentication and profile
            provider) as needed to operate the service.
          </li>
          <li>
            You must not upload content that is unlawful, infringing, deceptive,
            abusive, or harmful.
          </li>
        </ul>
      </section>

      <section>
        <h2>5. Acceptable use</h2>
        <ul>
          <li>
            Do not attempt to disrupt the service, bypass access controls,
            exploit vulnerabilities, scrape private data, or overload the site.
          </li>
          <li>
            Do not use bots, automation, modified clients, or other abusive
            methods to manipulate scores, daily challenge attempts, streaks,
            accounts, or public rankings.
          </li>
          <li>
            Do not impersonate other people or submit misleading public profile
            information.
          </li>
        </ul>
      </section>

      <section>
        <h2>6. Availability and changes</h2>
        <p>
          Minesweeper may change, suspend, or remove features at any time,
          including account features, leaderboard behavior, daily challenge
          behavior, and avatar handling. The service may be unavailable from
          time to time for maintenance, updates, or issues outside the
          operator&apos;s control.
        </p>
      </section>

      <section>
        <h2>7. Suspension or termination</h2>
        <p>
          Minesweeper may suspend, restrict, or terminate access to the service
          or to specific account features if these terms are violated, if misuse
          is suspected, or if doing so is necessary to protect the service,
          users, or legal rights.
        </p>
      </section>

      <section>
        <h2>8. Intellectual property</h2>
        <p>
          The site design, code, branding, and original content provided by
          Minesweeper remain the property of the operator or applicable
          licensors. These terms do not transfer ownership of the service to
          you.
        </p>
      </section>

      <section>
        <h2>9. Disclaimers and limitation of liability</h2>
        <p>
          Minesweeper is provided on an &quot;as is&quot; and &quot;as
          available&quot; basis to the maximum extent permitted by applicable
          law. The operator does not guarantee uninterrupted availability,
          error-free operation, or that the service will always be secure or
          free from defects.
        </p>
        <p>
          To the maximum extent permitted by law, the operator will not be
          liable for indirect, incidental, special, consequential, or punitive
          damages arising from or related to your use of the service.
        </p>
      </section>

      <section>
        <h2>10. Changes and contact</h2>
        <p>
          These terms may be updated as the service evolves. Continued use after
          an update means the new terms apply from their effective date.
        </p>
        <p>
          For questions about these terms, use the contact details published at{' '}
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
    </LegalDocument>
  );
}
