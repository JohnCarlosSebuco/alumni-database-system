"use client";

import React, { useState } from "react";
import { FileDown } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";

export const dynamic = "force-dynamic";

type Tab = "system" | "transfer";

/* ─── Section helper ─── */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-bold text-gray-900 border-b border-gray-200 pb-2">{title}</h2>
      <div className="text-sm text-gray-700 leading-relaxed space-y-2">{children}</div>
    </section>
  );
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5 pl-1">
      <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
      <div className="text-sm text-gray-600 leading-relaxed space-y-1.5">{children}</div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   SYSTEM MANUAL CONTENT
   ═══════════════════════════════════════════════════════════ */
function SystemManual() {
  return (
    <div className="space-y-8">
      <Section title="1. System Overview">
        <p>
          <strong>AlumNayan</strong> is a web-based Alumni Database System developed for the College of Engineering
          (Electronics Engineering, Industrial Engineering, and Mechanical Engineering departments).
          It tracks alumni employment outcomes, course-aligned placement rates, and supports data-driven
          evaluation of Program Educational Objectives (PEO), Graduate Attributes (GA), and College Goals.
        </p>
        <p>
          The system enables administrators to manage alumni records, post job opportunities and events,
          distribute surveys, and generate comprehensive outcome reports with PDF/CSV export.
        </p>
      </Section>

      <Section title="2. User Roles &amp; Permissions">
        <SubSection title="Alumni">
          <ul className="list-disc pl-5 space-y-1">
            <li>Register or claim an imported account via email verification</li>
            <li>Complete and update their profile (personal, education, employment info)</li>
            <li>Browse and apply to job postings</li>
            <li>View and RSVP to events</li>
            <li>Respond to surveys distributed by admins</li>
            <li>Receive notifications for new jobs, events, and announcements</li>
          </ul>
        </SubSection>
        <SubSection title="Admin">
          <ul className="list-disc pl-5 space-y-1">
            <li>Access the Admin Dashboard with aggregate metrics and charts</li>
            <li>Manage alumni records (view, import via Excel, edit)</li>
            <li>Create, edit, and delete job postings</li>
            <li>Create, edit, and delete events</li>
            <li>Create and manage surveys</li>
            <li>Generate filtered reports and export to PDF/CSV</li>
            <li>Send notifications to alumni</li>
          </ul>
        </SubSection>
        <SubSection title="Super Admin">
          <ul className="list-disc pl-5 space-y-1">
            <li>All Admin permissions</li>
            <li>Access the Super Panel to assign or revoke Admin roles</li>
            <li>Delete alumni accounts permanently</li>
          </ul>
        </SubSection>
      </Section>

      <Section title="3. Authentication">
        <SubSection title="Sign Up &amp; Login">
          <p>
            Alumni register with email and password. After registration, a verification email is sent.
            Users must verify their email before accessing protected features. Admins log in with the same
            flow but are assigned the admin role by a Super Admin.
          </p>
        </SubSection>
        <SubSection title="Imported Alumni (Claim Flow)">
          <p>
            Admins can bulk-import alumni from an Excel file. Imported alumni receive an email with a
            claim link. When they click the link, they set a password and claim their pre-populated account.
            This links their authentication to the existing Firestore record without creating duplicates.
          </p>
        </SubSection>
        <SubSection title="Password Reset">
          <p>
            Users can request a password reset from the login page. Firebase sends a reset email with a
            secure link to set a new password.
          </p>
        </SubSection>
      </Section>

      <Section title="4. Admin Dashboard">
        <p>The dashboard provides a real-time overview of the alumni database:</p>
        <SubSection title="KPI Cards">
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Total Alumni</strong> - count of all registered alumni</li>
            <li><strong>Active Jobs</strong> - total job postings in the system</li>
            <li><strong>Events</strong> - total events created</li>
            <li><strong>Employment Rate</strong> - (Employed / Total) x 100</li>
            <li><strong>Unemployment Rate</strong> - 100 - Employment Rate</li>
          </ul>
        </SubSection>
        <SubSection title="Employment Overview">
          <p>Visual breakdown of employed vs. unemployed alumni with progress bars and counts.</p>
        </SubSection>
        <SubSection title="Course-Aligned Employment">
          <p>Shows alignment rates grouped by career stage:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Recent Graduate Placement</strong> (0-2 years out)</li>
            <li><strong>Mid-Career Alignment</strong> (3-5 years out)</li>
            <li><strong>Established Career</strong> (6+ years out)</li>
          </ul>
          <p>Alignment is determined by survey responses or job title keyword matching against the graduate&apos;s program.</p>
        </SubSection>
        <SubSection title="Charts">
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Alumni by Course</strong> - pie/donut chart showing distribution across programs (top 8)</li>
            <li><strong>Employment by Course</strong> - bar chart of employed vs. total per program (top 6)</li>
          </ul>
        </SubSection>
        <SubSection title="Tables">
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Time to First Job</strong> - distribution of how long alumni took to get their first job</li>
            <li><strong>Cohort Outcomes</strong> - employment and alignment rates per batch year with 5-year evaluation cycle</li>
            <li><strong>Interval Outcomes</strong> - employment rate at 1, 2, 5, and 8 years after graduation</li>
          </ul>
        </SubSection>
      </Section>

      <Section title="5. Alumni Management">
        <SubSection title="Alumni Directory">
          <p>
            A searchable, filterable table of all alumni. Admins can search by name, filter by program,
            batch year, and employment status. Each row links to a detailed alumni profile.
          </p>
        </SubSection>
        <SubSection title="Importing Alumni">
          <p>
            Admins can bulk-import alumni from an Excel (.xlsx) file. The file should contain columns for
            name, email, course/program, batch year, and other profile fields. The system creates Firestore
            records and sends claim emails to each imported alumni.
          </p>
        </SubSection>
        <SubSection title="Alumni Profile View">
          <p>
            The detail view shows complete alumni information: personal details, education, employment history,
            profile completion percentage, and account status (claimed vs. unclaimed).
          </p>
        </SubSection>
      </Section>

      <Section title="6. Job Board">
        <p>
          Admins create job postings with title, description, company, location, salary range, and requirements.
          Alumni can browse jobs, view details, and submit applications. Admins can view applicants for each
          job posting. Jobs can be edited or deleted by admins.
        </p>
      </Section>

      <Section title="7. Events">
        <p>
          Admins create events with title, description, date/time, location, and banner image.
          Alumni can view event details and mark attendance. Admins can view the attendee list
          for each event. Events can be edited or deleted by admins.
        </p>
      </Section>

      <Section title="8. Surveys">
        <p>
          Admins create surveys to collect data from alumni (e.g., employment status at specific intervals,
          job satisfaction, course relevance). Survey responses feed into the outcome metrics and reports.
          Surveys support multiple question types and can be distributed to specific alumni groups.
        </p>
      </Section>

      <Section title="9. Reports &amp; Export">
        <SubSection title="Generating Reports">
          <p>
            The Reports page allows admins to filter alumni by program and batch year, then generate a
            comprehensive report including:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Employment statistics (employed count, employment/unemployment rate)</li>
            <li>Course-aligned placement rates by career stage</li>
            <li>Cohort outcomes by batch year</li>
            <li>Interval outcomes (1, 2, 5, 8 years after graduation)</li>
            <li>Time to first job distribution</li>
            <li>College Goals mapping (PEO-to-Goal)</li>
            <li>Program Educational Objectives (POE) classification</li>
            <li>Graduate Attributes (GA) classification</li>
          </ul>
        </SubSection>
        <SubSection title="Export Formats">
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>PDF</strong> - multi-page report with tables, styled headers, and alumni registry</li>
            <li><strong>CSV</strong> - raw data export for use in spreadsheet applications</li>
            <li><strong>Print</strong> - browser print dialog for direct printing</li>
          </ul>
        </SubSection>
      </Section>

      <Section title="10. Notifications">
        <p>
          The system sends automatic notifications to alumni when:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>A new job is posted</li>
          <li>A new event is created</li>
          <li>An admin sends a custom announcement</li>
        </ul>
        <p>
          Notifications appear in the bell icon dropdown in the top bar with unread count badge.
          Alumni can view all notifications on a dedicated notifications page.
        </p>
      </Section>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   TRANSFER / DEPLOYMENT MANUAL CONTENT
   ═══════════════════════════════════════════════════════════ */
function TransferManual() {
  return (
    <div className="space-y-8">
      <Section title="1. Prerequisites">
        <p>Before transferring the system, ensure you have the following installed:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Node.js 18+</strong> - runtime for the application</li>
          <li><strong>npm</strong> - package manager (comes with Node.js)</li>
          <li><strong>Git</strong> - version control</li>
          <li><strong>Firebase CLI</strong> - install with <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">npm install -g firebase-tools</code></li>
          <li><strong>Vercel CLI</strong> (optional) - install with <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">npm install -g vercel</code></li>
        </ul>
      </Section>

      <Section title="2. Technology Stack">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 text-left font-semibold text-gray-700 border-b">Component</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-700 border-b">Technology</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr><td className="px-4 py-2 font-medium">Framework</td><td className="px-4 py-2">Next.js 14 (App Router)</td></tr>
              <tr><td className="px-4 py-2 font-medium">Language</td><td className="px-4 py-2">TypeScript</td></tr>
              <tr><td className="px-4 py-2 font-medium">Styling</td><td className="px-4 py-2">Tailwind CSS</td></tr>
              <tr><td className="px-4 py-2 font-medium">Authentication</td><td className="px-4 py-2">Firebase Authentication (Email/Password)</td></tr>
              <tr><td className="px-4 py-2 font-medium">Database</td><td className="px-4 py-2">Cloud Firestore (NoSQL)</td></tr>
              <tr><td className="px-4 py-2 font-medium">File Storage</td><td className="px-4 py-2">Firebase Cloud Storage + Cloudinary (images)</td></tr>
              <tr><td className="px-4 py-2 font-medium">Backend Functions</td><td className="px-4 py-2">Firebase Cloud Functions (Node.js)</td></tr>
              <tr><td className="px-4 py-2 font-medium">Hosting</td><td className="px-4 py-2">Vercel (or any Node.js host)</td></tr>
              <tr><td className="px-4 py-2 font-medium">Charts</td><td className="px-4 py-2">Recharts</td></tr>
              <tr><td className="px-4 py-2 font-medium">PDF Generation</td><td className="px-4 py-2">jsPDF + jsPDF-AutoTable</td></tr>
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="3. Environment Variables">
        <p>
          Create a <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">.env.local</code> file in the project root.
          Copy from <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">.env.example</code> and fill in values:
        </p>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 text-left font-semibold text-gray-700 border-b">Variable</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-700 border-b">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr><td className="px-4 py-2 font-mono text-xs">NEXT_PUBLIC_FIREBASE_API_KEY</td><td className="px-4 py-2">Firebase project API key (from Firebase Console &gt; Project Settings)</td></tr>
              <tr><td className="px-4 py-2 font-mono text-xs">NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN</td><td className="px-4 py-2">Auth domain (e.g., your-project.firebaseapp.com)</td></tr>
              <tr><td className="px-4 py-2 font-mono text-xs">NEXT_PUBLIC_FIREBASE_PROJECT_ID</td><td className="px-4 py-2">Firebase project ID</td></tr>
              <tr><td className="px-4 py-2 font-mono text-xs">NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET</td><td className="px-4 py-2">Storage bucket URL</td></tr>
              <tr><td className="px-4 py-2 font-mono text-xs">NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID</td><td className="px-4 py-2">Cloud Messaging sender ID</td></tr>
              <tr><td className="px-4 py-2 font-mono text-xs">NEXT_PUBLIC_FIREBASE_APP_ID</td><td className="px-4 py-2">Firebase app ID</td></tr>
              <tr><td className="px-4 py-2 font-mono text-xs">FIREBASE_ADMIN_PROJECT_ID</td><td className="px-4 py-2">Same as project ID (server-only)</td></tr>
              <tr><td className="px-4 py-2 font-mono text-xs">FIREBASE_ADMIN_CLIENT_EMAIL</td><td className="px-4 py-2">Service account email from Firebase Console</td></tr>
              <tr><td className="px-4 py-2 font-mono text-xs">FIREBASE_ADMIN_PRIVATE_KEY</td><td className="px-4 py-2">Service account private key (keep secret, newlines as \n)</td></tr>
              <tr><td className="px-4 py-2 font-mono text-xs">NEXT_PUBLIC_APP_NAME</td><td className="px-4 py-2">Application name (AlumNayan)</td></tr>
              <tr><td className="px-4 py-2 font-mono text-xs">NEXT_PUBLIC_APP_URL</td><td className="px-4 py-2">Public URL of the deployed application</td></tr>
              <tr><td className="px-4 py-2 font-mono text-xs">NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME</td><td className="px-4 py-2">Cloudinary cloud name for image uploads</td></tr>
              <tr><td className="px-4 py-2 font-mono text-xs">NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET</td><td className="px-4 py-2">Cloudinary unsigned upload preset</td></tr>
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="4. Step-by-Step Transfer Guide">
        <SubSection title="Step 1: Clone the Repository">
          <div className="bg-gray-900 text-green-400 rounded-lg p-4 font-mono text-xs space-y-1 overflow-x-auto">
            <p>git clone https://github.com/your-org/alumni-database-system.git</p>
            <p>cd alumni-database-system</p>
            <p>npm install</p>
          </div>
        </SubSection>

        <SubSection title="Step 2: Create a New Firebase Project">
          <ol className="list-decimal pl-5 space-y-1.5">
            <li>Go to <strong>Firebase Console</strong> (console.firebase.google.com)</li>
            <li>Click &quot;Add project&quot; and follow the setup wizard</li>
            <li>Enable <strong>Authentication</strong> &gt; Sign-in method &gt; Email/Password</li>
            <li>Create a <strong>Cloud Firestore</strong> database (start in production mode)</li>
            <li>Enable <strong>Cloud Storage</strong></li>
            <li>Go to Project Settings &gt; Service Accounts &gt; Generate new private key</li>
          </ol>
        </SubSection>

        <SubSection title="Step 3: Deploy Firestore Rules &amp; Indexes">
          <div className="bg-gray-900 text-green-400 rounded-lg p-4 font-mono text-xs space-y-1 overflow-x-auto">
            <p>firebase login</p>
            <p>firebase use --add  <span className="text-gray-500"># select your new project</span></p>
            <p>firebase deploy --only firestore:rules</p>
            <p>firebase deploy --only firestore:indexes</p>
            <p>firebase deploy --only storage</p>
          </div>
          <p>
            This deploys the security rules from <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">firestore.rules</code>,
            the composite indexes from <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">firestore.indexes.json</code>,
            and storage rules from <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">storage.rules</code>.
          </p>
        </SubSection>

        <SubSection title="Step 4: Deploy Cloud Functions">
          <div className="bg-gray-900 text-green-400 rounded-lg p-4 font-mono text-xs space-y-1 overflow-x-auto">
            <p>cd functions</p>
            <p>npm install</p>
            <p>cd ..</p>
            <p>firebase deploy --only functions</p>
          </div>
          <p>
            This deploys 4 Cloud Functions: <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">onUserCreated</code>,{" "}
            <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">onJobPosted</code>,{" "}
            <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">onEventPosted</code>, and{" "}
            <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">generateReport</code>.
          </p>
        </SubSection>

        <SubSection title="Step 5: Set Up Cloudinary (Image Uploads)">
          <ol className="list-decimal pl-5 space-y-1.5">
            <li>Create an account at <strong>cloudinary.com</strong></li>
            <li>Go to Settings &gt; Upload &gt; Upload presets</li>
            <li>Create an <strong>unsigned</strong> upload preset</li>
            <li>Copy the cloud name and preset name to your environment variables</li>
          </ol>
        </SubSection>

        <SubSection title="Step 6: Configure Environment Variables">
          <p>
            Copy <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">.env.example</code> to{" "}
            <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">.env.local</code> and fill in all values from
            your new Firebase project and Cloudinary account. See section 3 above for details on each variable.
          </p>
        </SubSection>

        <SubSection title="Step 7: Deploy to Vercel">
          <div className="bg-gray-900 text-green-400 rounded-lg p-4 font-mono text-xs space-y-1 overflow-x-auto">
            <p>vercel login</p>
            <p>vercel  <span className="text-gray-500"># follow prompts to link project</span></p>
            <p><span className="text-gray-500"># Add environment variables in Vercel dashboard:</span></p>
            <p><span className="text-gray-500"># Settings &gt; Environment Variables &gt; add all .env.local vars</span></p>
            <p>vercel --prod  <span className="text-gray-500"># deploy to production</span></p>
          </div>
          <p>
            Alternatively, connect the Git repository to Vercel for automatic deployments on push.
          </p>
        </SubSection>

        <SubSection title="Alternative: Deploy to Other Hosts">
          <p>
            The app is a standard Next.js application. It can be deployed to any platform that supports Node.js:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Railway / Render</strong> - connect Git repo, set env vars, auto-deploy</li>
            <li><strong>Self-hosted</strong> - run <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">npm run build && npm run start</code> behind a reverse proxy (nginx)</li>
            <li><strong>Docker</strong> - create a Dockerfile with Node.js base image, copy build output, expose port 3000</li>
          </ul>
        </SubSection>
      </Section>

      <Section title="5. Database Transfer (Firestore)">
        <SubSection title="Export from Source Project">
          <p>Use the Firebase CLI to export Firestore data:</p>
          <div className="bg-gray-900 text-green-400 rounded-lg p-4 font-mono text-xs space-y-1 overflow-x-auto">
            <p><span className="text-gray-500"># Install gcloud CLI if not already installed</span></p>
            <p>gcloud firestore export gs://SOURCE_BUCKET/backup-folder \</p>
            <p>  --project=SOURCE_PROJECT_ID</p>
          </div>
          <p>
            This creates a backup of all Firestore collections in the specified Cloud Storage bucket.
          </p>
        </SubSection>

        <SubSection title="Import to Destination Project">
          <div className="bg-gray-900 text-green-400 rounded-lg p-4 font-mono text-xs space-y-1 overflow-x-auto">
            <p><span className="text-gray-500"># Copy the backup to the destination bucket first</span></p>
            <p>gsutil -m cp -r gs://SOURCE_BUCKET/backup-folder gs://DEST_BUCKET/</p>
            <p></p>
            <p><span className="text-gray-500"># Import into the destination Firestore</span></p>
            <p>gcloud firestore import gs://DEST_BUCKET/backup-folder \</p>
            <p>  --project=DEST_PROJECT_ID</p>
          </div>
        </SubSection>

        <SubSection title="Alternative: Script-Based Transfer">
          <p>
            For smaller databases, you can use a Node.js script with <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">firebase-admin</code> to
            read all documents from the source project and write them to the destination. The collections to transfer are:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li><code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">users</code> - alumni and admin accounts</li>
            <li><code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">jobs</code> - job postings</li>
            <li><code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">events</code> - events</li>
            <li><code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">notifications</code> - notification records</li>
            <li><code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">surveys</code> - survey definitions and responses</li>
          </ul>
        </SubSection>
      </Section>

      <Section title="6. Storage Transfer (Firebase Storage)">
        <p>Firebase Storage contains uploaded files (profile photos, resumes, licenses, event banners).</p>
        <SubSection title="Using gsutil">
          <div className="bg-gray-900 text-green-400 rounded-lg p-4 font-mono text-xs space-y-1 overflow-x-auto">
            <p><span className="text-gray-500"># Download all files from source</span></p>
            <p>gsutil -m cp -r gs://SOURCE_STORAGE_BUCKET/ ./storage-backup/</p>
            <p></p>
            <p><span className="text-gray-500"># Upload to destination</span></p>
            <p>gsutil -m cp -r ./storage-backup/* gs://DEST_STORAGE_BUCKET/</p>
          </div>
        </SubSection>
        <p>
          <strong>Note:</strong> Image files uploaded to Cloudinary are stored externally and do not need
          to be migrated from Firebase. However, you will need a new Cloudinary account/preset for the
          destination environment.
        </p>
      </Section>

      <Section title="7. Authentication Transfer">
        <p>
          Firebase Authentication user accounts (emails, passwords) are stored separately from Firestore.
          To transfer user accounts:
        </p>
        <div className="bg-gray-900 text-green-400 rounded-lg p-4 font-mono text-xs space-y-1 overflow-x-auto">
          <p><span className="text-gray-500"># Export users from source project</span></p>
          <p>firebase auth:export users.json --format=json --project=SOURCE_PROJECT_ID</p>
          <p></p>
          <p><span className="text-gray-500"># Import users into destination project</span></p>
          <p>firebase auth:import users.json --project=DEST_PROJECT_ID</p>
        </div>
        <p>
          This preserves user UIDs so Firestore document references remain valid.
        </p>
      </Section>

      <Section title="8. Domain &amp; DNS Setup">
        <SubSection title="Vercel Custom Domain">
          <ol className="list-decimal pl-5 space-y-1.5">
            <li>Go to Vercel Dashboard &gt; your project &gt; Settings &gt; Domains</li>
            <li>Add your custom domain (e.g., alumnayan.example.com)</li>
            <li>Update your DNS records as instructed by Vercel (CNAME or A record)</li>
            <li>Vercel automatically provisions an SSL certificate</li>
          </ol>
        </SubSection>
        <SubSection title="Firebase Auth Domain">
          <p>
            Update <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN</code> in
            your environment variables if using a custom domain for authentication.
          </p>
        </SubSection>
      </Section>

      <Section title="9. Post-Transfer Checklist">
        <ul className="list-disc pl-5 space-y-1.5">
          <li>Verify all environment variables are set correctly in the hosting platform</li>
          <li>Test user login and registration</li>
          <li>Test the claim flow for imported alumni</li>
          <li>Verify Firestore data appears correctly on the admin dashboard</li>
          <li>Test file uploads (profile photo, resume, event banner)</li>
          <li>Test PDF/CSV export from the Reports page</li>
          <li>Verify Cloud Functions trigger correctly (post a job, create an event)</li>
          <li>Check that notifications are delivered</li>
          <li>Confirm Firestore security rules are deployed</li>
          <li>Set up a Super Admin account using Firebase Console or the Super Panel</li>
        </ul>
      </Section>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   PDF EXPORT HELPERS
   ═══════════════════════════════════════════════════════════ */

function addWrappedText(
  doc: import("jspdf").jsPDF,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
): number {
  const lines = doc.splitTextToSize(text, maxWidth) as string[];
  for (const line of lines) {
    if (y > 275) {
      doc.addPage();
      y = 20;
    }
    doc.text(line, x, y);
    y += lineHeight;
  }
  return y;
}

function addSectionHeader(
  doc: import("jspdf").jsPDF,
  title: string,
  y: number,
): number {
  if (y > 260) {
    doc.addPage();
    y = 20;
  }
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 41, 82);
  doc.text(title, 14, y);
  doc.setDrawColor(200);
  doc.line(14, y + 2, 196, y + 2);
  doc.setTextColor(0);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  return y + 8;
}

function addSubHeader(
  doc: import("jspdf").jsPDF,
  title: string,
  y: number,
): number {
  if (y > 265) {
    doc.addPage();
    y = 20;
  }
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(50);
  doc.text(title, 14, y);
  doc.setTextColor(0);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  return y + 6;
}

function addBullet(
  doc: import("jspdf").jsPDF,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
): number {
  if (y > 275) { doc.addPage(); y = 20; }
  doc.text("\u2022", x, y);
  return addWrappedText(doc, text, x + 5, y, maxWidth - 5, 4.5);
}

async function exportSystemManualPDF() {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF();

  // Title page
  doc.setFontSize(22); doc.setFont("helvetica", "bold"); doc.setTextColor(30, 41, 82);
  doc.text("AlumNayan", 14, 40);
  doc.setFontSize(16); doc.setTextColor(80);
  doc.text("System Manual", 14, 52);
  doc.setFontSize(10); doc.setFont("helvetica", "normal"); doc.setTextColor(120);
  doc.text("College of Engineering", 14, 62);
  doc.text("Electronics, Industrial & Mechanical Engineering", 14, 68);
  doc.text(`Generated: ${new Date().toLocaleDateString("en-PH")}`, 14, 78);
  doc.setDrawColor(30, 41, 82); doc.setLineWidth(0.5); doc.line(14, 82, 196, 82);

  doc.addPage();
  let y = 20;

  // 1. System Overview
  y = addSectionHeader(doc, "1. System Overview", y);
  y = addWrappedText(doc, "AlumNayan is a web-based Alumni Database System developed for the College of Engineering (Electronics Engineering, Industrial Engineering, and Mechanical Engineering departments). It tracks alumni employment outcomes, course-aligned placement rates, and supports data-driven evaluation of Program Educational Objectives (PEO), Graduate Attributes (GA), and College Goals.", 14, y, 182, 4.5);
  y += 3;
  y = addWrappedText(doc, "The system enables administrators to manage alumni records, post job opportunities and events, distribute surveys, and generate comprehensive outcome reports with PDF/CSV export.", 14, y, 182, 4.5);
  y += 6;

  // 2. User Roles
  y = addSectionHeader(doc, "2. User Roles & Permissions", y);
  y = addSubHeader(doc, "Alumni", y);
  y = addBullet(doc, "Register or claim an imported account via email verification", 18, y, 178);
  y = addBullet(doc, "Complete and update their profile (personal, education, employment info)", 18, y, 178);
  y = addBullet(doc, "Browse and apply to job postings", 18, y, 178);
  y = addBullet(doc, "View and RSVP to events", 18, y, 178);
  y = addBullet(doc, "Respond to surveys distributed by admins", 18, y, 178);
  y = addBullet(doc, "Receive notifications for new jobs, events, and announcements", 18, y, 178);
  y += 3;
  y = addSubHeader(doc, "Admin", y);
  y = addBullet(doc, "Access the Admin Dashboard with aggregate metrics and charts", 18, y, 178);
  y = addBullet(doc, "Manage alumni records (view, import via Excel, edit)", 18, y, 178);
  y = addBullet(doc, "Create, edit, and delete job postings and events", 18, y, 178);
  y = addBullet(doc, "Create and manage surveys", 18, y, 178);
  y = addBullet(doc, "Generate filtered reports and export to PDF/CSV", 18, y, 178);
  y += 3;
  y = addSubHeader(doc, "Super Admin", y);
  y = addBullet(doc, "All Admin permissions", 18, y, 178);
  y = addBullet(doc, "Access the Super Panel to assign or revoke Admin roles", 18, y, 178);
  y = addBullet(doc, "Delete alumni accounts permanently", 18, y, 178);
  y += 6;

  // 3. Authentication
  y = addSectionHeader(doc, "3. Authentication", y);
  y = addSubHeader(doc, "Sign Up & Login", y);
  y = addWrappedText(doc, "Alumni register with email and password. After registration, a verification email is sent. Users must verify their email before accessing protected features.", 14, y, 182, 4.5);
  y += 3;
  y = addSubHeader(doc, "Imported Alumni (Claim Flow)", y);
  y = addWrappedText(doc, "Admins can bulk-import alumni from an Excel file. Imported alumni receive an email with a claim link. When they click the link, they set a password and claim their pre-populated account.", 14, y, 182, 4.5);
  y += 3;
  y = addSubHeader(doc, "Password Reset", y);
  y = addWrappedText(doc, "Users can request a password reset from the login page. Firebase sends a reset email with a secure link to set a new password.", 14, y, 182, 4.5);
  y += 6;

  // 4. Admin Dashboard
  y = addSectionHeader(doc, "4. Admin Dashboard", y);
  y = addWrappedText(doc, "The dashboard provides a real-time overview of the alumni database:", 14, y, 182, 4.5);
  y += 2;
  y = addSubHeader(doc, "KPI Cards", y);
  y = addBullet(doc, "Total Alumni - count of all registered alumni", 18, y, 178);
  y = addBullet(doc, "Active Jobs - total job postings in the system", 18, y, 178);
  y = addBullet(doc, "Events - total events created", 18, y, 178);
  y = addBullet(doc, "Employment Rate - (Employed / Total) x 100", 18, y, 178);
  y = addBullet(doc, "Unemployment Rate - 100 - Employment Rate", 18, y, 178);
  y += 3;
  y = addSubHeader(doc, "Course-Aligned Employment", y);
  y = addBullet(doc, "Recent Graduate Placement (0-2 years out)", 18, y, 178);
  y = addBullet(doc, "Mid-Career Alignment (3-5 years out)", 18, y, 178);
  y = addBullet(doc, "Established Career (6+ years out)", 18, y, 178);
  y += 3;
  y = addSubHeader(doc, "Charts & Tables", y);
  y = addBullet(doc, "Alumni by Course - distribution across programs", 18, y, 178);
  y = addBullet(doc, "Employment by Course - employed vs total per program", 18, y, 178);
  y = addBullet(doc, "Time to First Job - waiting time distribution", 18, y, 178);
  y = addBullet(doc, "Cohort Outcomes - employment/alignment rates per batch year", 18, y, 178);
  y = addBullet(doc, "Interval Outcomes - employment rate at 1, 2, 5, 8 years after graduation", 18, y, 178);
  y += 6;

  // 5-8 condensed
  y = addSectionHeader(doc, "5. Alumni Management", y);
  y = addWrappedText(doc, "A searchable, filterable directory of all alumni. Admins can search by name, filter by program, batch year, and employment status. Bulk import from Excel is supported with claim email distribution.", 14, y, 182, 4.5);
  y += 6;

  y = addSectionHeader(doc, "6. Job Board", y);
  y = addWrappedText(doc, "Admins create job postings with title, description, company, location, salary range, and requirements. Alumni can browse, view details, and submit applications. Admins can view applicants per posting.", 14, y, 182, 4.5);
  y += 6;

  y = addSectionHeader(doc, "7. Events", y);
  y = addWrappedText(doc, "Admins create events with title, description, date/time, location, and banner image. Alumni can view event details and mark attendance. Admins can view the attendee list.", 14, y, 182, 4.5);
  y += 6;

  y = addSectionHeader(doc, "8. Surveys", y);
  y = addWrappedText(doc, "Admins create surveys to collect data from alumni (employment status, job satisfaction, course relevance). Survey responses feed into the outcome metrics and reports.", 14, y, 182, 4.5);
  y += 6;

  // 9. Reports
  y = addSectionHeader(doc, "9. Reports & Export", y);
  y = addWrappedText(doc, "The Reports page allows admins to filter alumni by program and batch year, then generate comprehensive reports including:", 14, y, 182, 4.5);
  y += 2;
  y = addBullet(doc, "Employment statistics and rates", 18, y, 178);
  y = addBullet(doc, "Course-aligned placement rates by career stage", 18, y, 178);
  y = addBullet(doc, "Cohort outcomes by batch year", 18, y, 178);
  y = addBullet(doc, "Interval outcomes (1, 2, 5, 8 years post-graduation)", 18, y, 178);
  y = addBullet(doc, "College Goals, POE, and GA classifications", 18, y, 178);
  y += 2;
  y = addWrappedText(doc, "Export formats: PDF (multi-page report), CSV (raw data), Print (browser dialog).", 14, y, 182, 4.5);
  y += 6;

  // 10. Notifications
  y = addSectionHeader(doc, "10. Notifications", y);
  y = addWrappedText(doc, "The system sends automatic notifications to alumni when a new job is posted, a new event is created, or an admin sends a custom announcement. Notifications appear in the bell icon dropdown with an unread count badge.", 14, y, 182, 4.5);

  doc.save("AlumNayan-System-Manual.pdf");
}

async function exportTransferManualPDF() {
  const { jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");
  const doc = new jsPDF();

  // Title page
  doc.setFontSize(22); doc.setFont("helvetica", "bold"); doc.setTextColor(30, 41, 82);
  doc.text("AlumNayan", 14, 40);
  doc.setFontSize(16); doc.setTextColor(80);
  doc.text("Deployment & Transfer Guide", 14, 52);
  doc.setFontSize(10); doc.setFont("helvetica", "normal"); doc.setTextColor(120);
  doc.text("College of Engineering", 14, 62);
  doc.text(`Generated: ${new Date().toLocaleDateString("en-PH")}`, 14, 72);
  doc.setDrawColor(30, 41, 82); doc.setLineWidth(0.5); doc.line(14, 76, 196, 76);

  doc.addPage();
  let y = 20;

  // 1. Prerequisites
  y = addSectionHeader(doc, "1. Prerequisites", y);
  y = addBullet(doc, "Node.js 18+ (runtime for the application)", 18, y, 178);
  y = addBullet(doc, "npm (package manager, comes with Node.js)", 18, y, 178);
  y = addBullet(doc, "Git (version control)", 18, y, 178);
  y = addBullet(doc, "Firebase CLI: npm install -g firebase-tools", 18, y, 178);
  y = addBullet(doc, "Vercel CLI (optional): npm install -g vercel", 18, y, 178);
  y += 6;

  // 2. Tech Stack
  y = addSectionHeader(doc, "2. Technology Stack", y);
  autoTable(doc, {
    startY: y,
    head: [["Component", "Technology"]],
    body: [
      ["Framework", "Next.js 14 (App Router)"],
      ["Language", "TypeScript"],
      ["Styling", "Tailwind CSS"],
      ["Authentication", "Firebase Authentication (Email/Password)"],
      ["Database", "Cloud Firestore (NoSQL)"],
      ["File Storage", "Firebase Cloud Storage + Cloudinary"],
      ["Backend Functions", "Firebase Cloud Functions (Node.js)"],
      ["Hosting", "Vercel (or any Node.js host)"],
      ["Charts", "Recharts"],
      ["PDF Generation", "jsPDF + jsPDF-AutoTable"],
    ],
    styles: { fontSize: 9 },
    headStyles: { fillColor: [30, 41, 82] },
    margin: { left: 14, right: 14 },
  });
  y = (doc as any).lastAutoTable.finalY + 8;

  // 3. Environment Variables
  y = addSectionHeader(doc, "3. Environment Variables", y);
  y = addWrappedText(doc, "Create a .env.local file in the project root. Copy from .env.example and fill in values:", 14, y, 182, 4.5);
  y += 2;
  autoTable(doc, {
    startY: y,
    head: [["Variable", "Description"]],
    body: [
      ["NEXT_PUBLIC_FIREBASE_API_KEY", "Firebase project API key"],
      ["NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN", "Auth domain (e.g., project.firebaseapp.com)"],
      ["NEXT_PUBLIC_FIREBASE_PROJECT_ID", "Firebase project ID"],
      ["NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET", "Storage bucket URL"],
      ["NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID", "Cloud Messaging sender ID"],
      ["NEXT_PUBLIC_FIREBASE_APP_ID", "Firebase app ID"],
      ["FIREBASE_ADMIN_PROJECT_ID", "Same as project ID (server-only)"],
      ["FIREBASE_ADMIN_CLIENT_EMAIL", "Service account email"],
      ["FIREBASE_ADMIN_PRIVATE_KEY", "Service account private key (keep secret)"],
      ["NEXT_PUBLIC_APP_NAME", "Application name (AlumNayan)"],
      ["NEXT_PUBLIC_APP_URL", "Public URL of the deployed app"],
      ["NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME", "Cloudinary cloud name"],
      ["NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET", "Cloudinary unsigned upload preset"],
    ],
    styles: { fontSize: 7 },
    headStyles: { fillColor: [30, 41, 82] },
    columnStyles: { 0: { cellWidth: 70, fontStyle: "bold" } },
    margin: { left: 14, right: 14 },
  });
  y = (doc as any).lastAutoTable.finalY + 8;

  // 4. Transfer Steps
  y = addSectionHeader(doc, "4. Step-by-Step Transfer Guide", y);

  y = addSubHeader(doc, "Step 1: Clone the Repository", y);
  y = addWrappedText(doc, "git clone <repository-url> && cd alumni-database-system && npm install", 14, y, 182, 4.5);
  y += 4;

  y = addSubHeader(doc, "Step 2: Create a New Firebase Project", y);
  y = addBullet(doc, "Go to Firebase Console (console.firebase.google.com)", 18, y, 178);
  y = addBullet(doc, "Click 'Add project' and follow the setup wizard", 18, y, 178);
  y = addBullet(doc, "Enable Authentication > Sign-in method > Email/Password", 18, y, 178);
  y = addBullet(doc, "Create a Cloud Firestore database (production mode)", 18, y, 178);
  y = addBullet(doc, "Enable Cloud Storage", 18, y, 178);
  y = addBullet(doc, "Generate a service account private key", 18, y, 178);
  y += 4;

  y = addSubHeader(doc, "Step 3: Deploy Firestore Rules & Indexes", y);
  y = addWrappedText(doc, "firebase login && firebase use --add && firebase deploy --only firestore:rules && firebase deploy --only firestore:indexes && firebase deploy --only storage", 14, y, 182, 4.5);
  y += 4;

  y = addSubHeader(doc, "Step 4: Deploy Cloud Functions", y);
  y = addWrappedText(doc, "cd functions && npm install && cd .. && firebase deploy --only functions", 14, y, 182, 4.5);
  y = addWrappedText(doc, "Functions: onUserCreated, onJobPosted, onEventPosted, generateReport", 14, y, 182, 4.5);
  y += 4;

  y = addSubHeader(doc, "Step 5: Set Up Cloudinary", y);
  y = addBullet(doc, "Create account at cloudinary.com", 18, y, 178);
  y = addBullet(doc, "Create an unsigned upload preset in Settings > Upload", 18, y, 178);
  y = addBullet(doc, "Copy cloud name and preset to environment variables", 18, y, 178);
  y += 4;

  y = addSubHeader(doc, "Step 6: Configure Environment Variables", y);
  y = addWrappedText(doc, "Copy .env.example to .env.local and fill in all values from your new Firebase project and Cloudinary account.", 14, y, 182, 4.5);
  y += 4;

  y = addSubHeader(doc, "Step 7: Deploy to Vercel", y);
  y = addWrappedText(doc, "vercel login && vercel (follow prompts). Add all environment variables in Vercel Dashboard > Settings > Environment Variables. Run 'vercel --prod' for production deployment.", 14, y, 182, 4.5);
  y += 6;

  // 5. Database Transfer
  y = addSectionHeader(doc, "5. Database Transfer (Firestore)", y);
  y = addSubHeader(doc, "Export from Source Project", y);
  y = addWrappedText(doc, "gcloud firestore export gs://SOURCE_BUCKET/backup --project=SOURCE_PROJECT_ID", 14, y, 182, 4.5);
  y += 3;
  y = addSubHeader(doc, "Import to Destination", y);
  y = addWrappedText(doc, "gsutil -m cp -r gs://SOURCE_BUCKET/backup gs://DEST_BUCKET/", 14, y, 182, 4.5);
  y = addWrappedText(doc, "gcloud firestore import gs://DEST_BUCKET/backup --project=DEST_PROJECT_ID", 14, y, 182, 4.5);
  y += 3;
  y = addWrappedText(doc, "Collections to transfer: users, jobs, events, notifications, surveys", 14, y, 182, 4.5);
  y += 6;

  // 6. Storage Transfer
  y = addSectionHeader(doc, "6. Storage Transfer", y);
  y = addWrappedText(doc, "Download: gsutil -m cp -r gs://SOURCE_BUCKET/ ./storage-backup/", 14, y, 182, 4.5);
  y = addWrappedText(doc, "Upload: gsutil -m cp -r ./storage-backup/* gs://DEST_BUCKET/", 14, y, 182, 4.5);
  y += 3;
  y = addWrappedText(doc, "Note: Cloudinary images are stored externally and need a new Cloudinary account for the destination.", 14, y, 182, 4.5);
  y += 6;

  // 7. Auth Transfer
  y = addSectionHeader(doc, "7. Authentication Transfer", y);
  y = addWrappedText(doc, "Export: firebase auth:export users.json --format=json --project=SOURCE_PROJECT_ID", 14, y, 182, 4.5);
  y = addWrappedText(doc, "Import: firebase auth:import users.json --project=DEST_PROJECT_ID", 14, y, 182, 4.5);
  y = addWrappedText(doc, "This preserves user UIDs so Firestore document references remain valid.", 14, y, 182, 4.5);
  y += 6;

  // 8. Post-transfer
  y = addSectionHeader(doc, "8. Post-Transfer Checklist", y);
  y = addBullet(doc, "Verify all environment variables are set correctly", 18, y, 178);
  y = addBullet(doc, "Test user login and registration", 18, y, 178);
  y = addBullet(doc, "Test the claim flow for imported alumni", 18, y, 178);
  y = addBullet(doc, "Verify Firestore data on admin dashboard", 18, y, 178);
  y = addBullet(doc, "Test file uploads (profile photo, resume, event banner)", 18, y, 178);
  y = addBullet(doc, "Test PDF/CSV export from Reports page", 18, y, 178);
  y = addBullet(doc, "Verify Cloud Functions trigger correctly", 18, y, 178);
  y = addBullet(doc, "Check notifications are delivered", 18, y, 178);
  y = addBullet(doc, "Confirm Firestore security rules are deployed", 18, y, 178);
  y = addBullet(doc, "Set up a Super Admin account", 18, y, 178);

  doc.save("AlumNayan-Transfer-Guide.pdf");
}

/* ═══════════════════════════════════════════════════════════
   PAGE COMPONENT
   ═══════════════════════════════════════════════════════════ */
export default function ManualsPage() {
  const [tab, setTab] = useState<Tab>("system");

  return (
    <div className="space-y-6">
      <PageHeader
        title="System Manuals"
        breadcrumbs={[{ label: "Admin" }, { label: "Manuals" }]}
      />

      {/* Tab bar + download */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex rounded-lg border border-gray-200 overflow-hidden self-start">
          <button
            type="button"
            className={cn(
              "px-4 py-2 text-sm font-medium transition-colors",
              tab === "system"
                ? "bg-navy-800 text-white"
                : "bg-white text-gray-600 hover:bg-gray-50"
            )}
            onClick={() => setTab("system")}
          >
            System Manual
          </button>
          <button
            type="button"
            className={cn(
              "px-4 py-2 text-sm font-medium transition-colors border-l border-gray-200",
              tab === "transfer"
                ? "bg-navy-800 text-white"
                : "bg-white text-gray-600 hover:bg-gray-50"
            )}
            onClick={() => setTab("transfer")}
          >
            Transfer Guide
          </button>
        </div>

        <Button
          variant="secondary"
          size="sm"
          leftIcon={<FileDown size={14} />}
          onClick={() =>
            tab === "system"
              ? exportSystemManualPDF()
              : exportTransferManualPDF()
          }
        >
          Download PDF
        </Button>
      </div>

      {/* Content */}
      <Card>
        <CardBody className="p-6 sm:p-8">
          {tab === "system" ? <SystemManual /> : <TransferManual />}
        </CardBody>
      </Card>
    </div>
  );
}
