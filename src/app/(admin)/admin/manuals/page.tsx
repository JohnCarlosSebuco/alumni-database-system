"use client";

import React, { useState } from "react";
import { FileDown } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";

export const dynamic = "force-dynamic";

type Tab = "system" | "transfer" | "security" | "storage" | "troubleshooting";

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
   SYSTEM SECURITY DOCUMENTATION CONTENT
   ═══════════════════════════════════════════════════════════ */
function SecurityManual() {
  return (
    <div className="space-y-8">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
        <strong>What this document covers:</strong> This guide explains how the AlumNayan system
        protects your data and keeps the platform secure.
      </div>

      <Section title="1. How Logging In Works">
        <p>
          Think of logging in like using a key to enter a building. Only people with the right key
          (username and password) can get inside. AlumNayan uses <strong>Firebase Authentication</strong>,
          a trusted security service by Google, to manage all logins safely.
        </p>
        <SubSection title="Email Verification">
          <p>
            When someone creates a new account, the system sends a verification email to their inbox.
            The person must click the link in that email to confirm their identity before they can fully
            access their account. This prevents fake or typo-filled email addresses from being used.
          </p>
          <p>
            <em>Analogy: It&apos;s like receiving a letter at your home address to prove you really live there.</em>
          </p>
        </SubSection>
        <SubSection title="Password Reset">
          <p>
            If someone forgets their password, they can click &quot;Forgot Password&quot; on the login page.
            The system sends a secure reset link to their email. The old password is immediately invalidated
            once a new one is set.
          </p>
        </SubSection>
        <SubSection title="Passwords Are Never Stored as Plain Text">
          <p>
            AlumNayan never stores anyone&apos;s actual password in the database. Instead, Firebase converts
            passwords into a scrambled, unreadable code (called a &quot;hash&quot;) before saving them. Even if
            someone somehow accessed the database, they would not be able to read any passwords.
          </p>
          <p>
            <em>Analogy: Imagine locking your secret message inside a box, melting the key, and keeping only the lock — nobody can re-open it.</em>
          </p>
        </SubSection>
      </Section>

      <Section title="2. Who Can See and Do What (Roles &amp; Permissions)">
        <p>
          Not everyone who logs in can do the same things. AlumNayan has three levels of access,
          like different floors in an office building with different key cards:
        </p>
        <SubSection title="Alumni (Ground Floor)">
          <ul className="list-disc pl-5 space-y-1">
            <li>Can view and update their own profile only</li>
            <li>Can browse jobs and events posted by admins</li>
            <li>Can respond to surveys</li>
            <li>Cannot see other alumni&apos;s private information</li>
            <li>Cannot access any admin tools or settings</li>
          </ul>
        </SubSection>
        <SubSection title="Admin (Second Floor)">
          <ul className="list-disc pl-5 space-y-1">
            <li>Can manage the alumni directory, jobs, events, and surveys</li>
            <li>Can view alumni data for reporting purposes</li>
            <li>Cannot change system-level settings or assign new admins</li>
            <li>Cannot delete alumni accounts permanently</li>
          </ul>
        </SubSection>
        <SubSection title="Super Admin (Top Floor)">
          <ul className="list-disc pl-5 space-y-1">
            <li>Has all Admin permissions</li>
            <li>Can assign or remove the Admin role from other users</li>
            <li>Can permanently delete alumni accounts</li>
            <li>This role should only be given to the most trusted personnel</li>
          </ul>
        </SubSection>
        <p className="text-sm bg-yellow-50 border border-yellow-200 rounded p-3 text-yellow-800">
          <strong>Important:</strong> These rules are enforced by the system automatically. Even if
          someone tries to access a page they are not allowed to visit, the system will block them
          and show an &quot;Access Denied&quot; message.
        </p>
      </Section>

      <Section title="3. Data Protection (Who Can Read the Database)">
        <p>
          The database (where all alumni information is stored) is protected by a set of rules
          called <strong>Firestore Security Rules</strong>. These rules act like a security guard
          at the door of the database — they check every request before allowing any data to be
          read or changed.
        </p>
        <SubSection title="How it works in plain terms">
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <strong>Alumni</strong> can only read or update their own personal record. They cannot
              look up other alumni&apos;s data.
            </li>
            <li>
              <strong>Admins</strong> can read alumni data to generate reports and manage the platform,
              but they cannot write to records outside their allowed scope.
            </li>
            <li>
              <strong>Anonymous visitors</strong> (people not logged in) cannot access any private data
              in the database at all.
            </li>
          </ul>
        </SubSection>
        <p>
          These security rules are deployed directly to the database and run on Google&apos;s infrastructure,
          meaning they are enforced even if someone tried to access the database directly — not just through
          the website.
        </p>
      </Section>

      <Section title="4. All Connections Are Encrypted (HTTPS)">
        <p>
          Whenever you use AlumNayan — whether logging in, submitting a form, or viewing a report —
          all the information traveling between your device and the system is <strong>encrypted</strong>.
          This means it is scrambled so that nobody listening on the network (like on a public Wi-Fi)
          can read it.
        </p>
        <p>
          This is done through <strong>HTTPS</strong> (the padlock icon you see in your browser&apos;s
          address bar). All modern hosting platforms like Vercel automatically provide this encryption
          certificate.
        </p>
        <p>
          <em>Analogy: It&apos;s like sending a letter inside a sealed envelope instead of on a postcard — only the intended recipient can read it.</em>
        </p>
      </Section>

      <Section title="5. Admin Actions Are Double-Checked on the Server">
        <p>
          Sensitive actions — like importing alumni data, generating reports, or assigning admin roles —
          are handled through protected server routes. Before any of these actions are performed, the
          system checks that:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>The person is actually logged in (not just claiming to be)</li>
          <li>They have the correct role (Admin or Super Admin)</li>
          <li>The request came through the official system, not from an outside source</li>
        </ul>
        <p>
          This prevents attacks where someone might try to trigger admin actions by sending a fake request
          to the system without proper authorization.
        </p>
      </Section>

      <Section title="6. Sessions Stay Secure (Login Cookies)">
        <p>
          After you log in, the system creates a short-lived, secure <strong>session</strong> to remember
          who you are while you browse. Think of it like a wristband at an event — you show it once at
          the entrance, and the staff can verify it without you having to re-enter your password every
          few seconds.
        </p>
        <p>
          These session tokens are:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Short-lived</strong> — they expire automatically after a set time</li>
          <li><strong>Verified server-side</strong> — the server checks their validity on every admin action</li>
          <li><strong>Sent securely</strong> — only over encrypted HTTPS connections</li>
        </ul>
        <p>
          When you log out, your session is immediately invalidated so no one else can reuse it.
        </p>
      </Section>

      <Section title="7. Image &amp; File Uploads Are Handled Safely">
        <p>
          When profile photos or event banners are uploaded, they go to <strong>Cloudinary</strong>,
          a secure third-party image hosting service. This means:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Images are not stored directly inside the main database</li>
          <li>Only the image&apos;s web address (URL) is saved in the system</li>
          <li>Cloudinary handles image storage, resizing, and delivery securely</li>
          <li>Upload permissions are controlled through a preset that only allows specific file types</li>
        </ul>
        <p>
          <em>Analogy: Instead of keeping physical photos in the filing cabinet, you store only the address
          of where the photo can be found — in a secure, separate photo album.</em>
        </p>
      </Section>

      <Section title="8. Summary: Key Security Features at a Glance">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 text-left font-semibold text-gray-700 border-b">Security Feature</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-700 border-b">Plain Language Explanation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr><td className="px-4 py-2 font-medium">Email Verification</td><td className="px-4 py-2">Confirms identity before allowing full access</td></tr>
              <tr><td className="px-4 py-2 font-medium">Hashed Passwords</td><td className="px-4 py-2">Passwords are scrambled and can never be read by anyone</td></tr>
              <tr><td className="px-4 py-2 font-medium">Role-Based Access</td><td className="px-4 py-2">Each user type can only do what they are allowed to</td></tr>
              <tr><td className="px-4 py-2 font-medium">Firestore Security Rules</td><td className="px-4 py-2">Database access is guarded and enforced automatically</td></tr>
              <tr><td className="px-4 py-2 font-medium">HTTPS Encryption</td><td className="px-4 py-2">All data in transit is encrypted (padlock in browser)</td></tr>
              <tr><td className="px-4 py-2 font-medium">Server-Side Auth Checks</td><td className="px-4 py-2">Admin actions require verified login on every request</td></tr>
              <tr><td className="px-4 py-2 font-medium">Secure Sessions</td><td className="px-4 py-2">Login sessions expire automatically and are verified each time</td></tr>
              <tr><td className="px-4 py-2 font-medium">Cloudinary File Storage</td><td className="px-4 py-2">Uploaded files are stored safely outside the main database</td></tr>
            </tbody>
          </table>
        </div>
      </Section>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   STORAGE PLAN CONTENT
   ═══════════════════════════════════════════════════════════ */
function StoragePlan() {
  return (
    <div className="space-y-8">
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-800">
        Based on the estimated number of alumni and usage patterns for a
        college department system, AlumNayan is very unlikely to exceed Firebase&apos;s free tier limits
        within the next 5–10 years. This document explains why, and what the plan is if usage grows.
      </div>

      <Section title="1. What Storage Does the System Use?">
        <p>
          AlumNayan uses three different storage services, each for a different purpose:
        </p>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 text-left font-semibold text-gray-700 border-b">Service</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-700 border-b">What It Stores</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-700 border-b">Provider</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr>
                <td className="px-4 py-2 font-medium">Database</td>
                <td className="px-4 py-2">Alumni profiles, jobs, events, surveys, notifications</td>
                <td className="px-4 py-2">Firebase Firestore (Google)</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-medium">File Storage</td>
                <td className="px-4 py-2">Uploaded resumes, certificates, documents</td>
                <td className="px-4 py-2">Firebase Cloud Storage (Google)</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-medium">Image Storage</td>
                <td className="px-4 py-2">Profile photos, event banners</td>
                <td className="px-4 py-2">Cloudinary (separate service — not Firebase)</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-sm bg-blue-50 border border-blue-200 rounded p-3 text-blue-800">
          <strong>Note on Images:</strong> Profile photos and event banners are stored on Cloudinary,
          not on Firebase. Cloudinary&apos;s free tier gives 25 GB of storage and 25 GB bandwidth/month —
          far more than this system will need. Images do not count against Firebase&apos;s storage limits.
        </p>
      </Section>

      <Section title="2. Firebase Free Tier Limits (Spark Plan)">
        <p>
          Firebase offers a free plan called the <strong>Spark Plan</strong>. Here are the relevant
          limits for this system:
        </p>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 text-left font-semibold text-gray-700 border-b">Resource</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-700 border-b">Free Limit</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-700 border-b">Reset Period</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr><td className="px-4 py-2 font-medium">Firestore Storage</td><td className="px-4 py-2">1 GB total</td><td className="px-4 py-2">Cumulative (grows)</td></tr>
              <tr><td className="px-4 py-2 font-medium">Firestore Reads</td><td className="px-4 py-2">50,000 per day</td><td className="px-4 py-2">Daily</td></tr>
              <tr><td className="px-4 py-2 font-medium">Firestore Writes</td><td className="px-4 py-2">20,000 per day</td><td className="px-4 py-2">Daily</td></tr>
              <tr><td className="px-4 py-2 font-medium">Firestore Deletes</td><td className="px-4 py-2">20,000 per day</td><td className="px-4 py-2">Daily</td></tr>
              <tr><td className="px-4 py-2 font-medium">Firebase Storage (files)</td><td className="px-4 py-2">5 GB total</td><td className="px-4 py-2">Cumulative (grows)</td></tr>
              <tr><td className="px-4 py-2 font-medium">Storage Downloads</td><td className="px-4 py-2">1 GB per day</td><td className="px-4 py-2">Daily</td></tr>
              <tr><td className="px-4 py-2 font-medium">Cloud Functions Calls</td><td className="px-4 py-2">125,000 per month</td><td className="px-4 py-2">Monthly</td></tr>
              <tr><td className="px-4 py-2 font-medium">Authentication (Email)</td><td className="px-4 py-2">Unlimited</td><td className="px-4 py-2">—</td></tr>
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="3. How Much Data Does AlumNayan Actually Use?">
        <SubSection title="Database (Firestore) — Estimated Sizes">
          <p>
            Each piece of data stored in Firestore has an estimated size. Here&apos;s how the system&apos;s
            data breaks down:
          </p>
          <div className="overflow-x-auto mt-2">
            <table className="min-w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left font-semibold text-gray-700 border-b">Data Type</th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700 border-b">Size per Record</th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700 border-b">Estimated Count (5 yrs)</th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700 border-b">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr><td className="px-4 py-2">Alumni profiles</td><td className="px-4 py-2">~8 KB each</td><td className="px-4 py-2">~2,750</td><td className="px-4 py-2 font-medium">~22 MB</td></tr>
                <tr><td className="px-4 py-2">Survey responses</td><td className="px-4 py-2">~3 KB each</td><td className="px-4 py-2">~10,000</td><td className="px-4 py-2 font-medium">~30 MB</td></tr>
                <tr><td className="px-4 py-2">Job postings</td><td className="px-4 py-2">~2 KB each</td><td className="px-4 py-2">~500</td><td className="px-4 py-2 font-medium">~1 MB</td></tr>
                <tr><td className="px-4 py-2">Events</td><td className="px-4 py-2">~2 KB each</td><td className="px-4 py-2">~250</td><td className="px-4 py-2 font-medium">~500 KB</td></tr>
                <tr><td className="px-4 py-2">Notifications</td><td className="px-4 py-2">~0.5 KB each</td><td className="px-4 py-2">~50,000</td><td className="px-4 py-2 font-medium">~25 MB</td></tr>
                <tr className="bg-gray-50 font-semibold"><td className="px-4 py-2" colSpan={3}>Estimated Total Firestore Storage After 5 Years</td><td className="px-4 py-2 text-green-700">~80–100 MB</td></tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm text-green-700 font-medium mt-2">
            80–100 MB is only 8–10% of the 1 GB Firestore limit. The system would need roughly 12× more data to come close.
          </p>
        </SubSection>

        <SubSection title="File Storage (Firebase Cloud Storage) — Estimated Sizes">
          <p>
            Firebase Storage holds uploaded documents like resumes and certificates. Profile photos
            go to Cloudinary and do not count here.
          </p>
          <div className="overflow-x-auto mt-2">
            <table className="min-w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left font-semibold text-gray-700 border-b">File Type</th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700 border-b">Avg. Size</th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700 border-b">Estimated Uploads (5 yrs)</th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700 border-b">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr><td className="px-4 py-2">Resumes (PDF)</td><td className="px-4 py-2">~500 KB</td><td className="px-4 py-2">~1,000 (40% adoption)</td><td className="px-4 py-2 font-medium">~500 MB</td></tr>
                <tr><td className="px-4 py-2">Certificates/Licenses</td><td className="px-4 py-2">~300 KB</td><td className="px-4 py-2">~500</td><td className="px-4 py-2 font-medium">~150 MB</td></tr>
                <tr className="bg-gray-50 font-semibold"><td className="px-4 py-2" colSpan={3}>Estimated Total Firebase Storage After 5 Years</td><td className="px-4 py-2 text-green-700">~650 MB – 1 GB</td></tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm text-green-700 font-medium mt-2">
            650 MB – 1 GB is 13–20% of the 5 GB Firebase Storage limit. Well within the free tier even at 5 years.
          </p>
        </SubSection>
      </Section>

      <Section title="4. 5-Year Growth Projection">
        <p>
          Based on an estimated <strong>150 new alumni per year</strong> across 3 departments
          (approximately 50 graduates per department per year) and assuming the system currently has
          around 2,000 alumni records:
        </p>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 text-left font-semibold text-gray-700 border-b">Year</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-700 border-b">Total Alumni</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-700 border-b">Firestore Storage</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-700 border-b">File Storage</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-700 border-b">% of 1 GB DB Limit</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-700 border-b">% of 5 GB File Limit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr><td className="px-4 py-2">2025 (now)</td><td className="px-4 py-2">~2,000</td><td className="px-4 py-2">~60 MB</td><td className="px-4 py-2">~400 MB</td><td className="px-4 py-2 text-green-700">6%</td><td className="px-4 py-2 text-green-700">8%</td></tr>
              <tr><td className="px-4 py-2">2026</td><td className="px-4 py-2">~2,150</td><td className="px-4 py-2">~65 MB</td><td className="px-4 py-2">~480 MB</td><td className="px-4 py-2 text-green-700">7%</td><td className="px-4 py-2 text-green-700">10%</td></tr>
              <tr><td className="px-4 py-2">2027</td><td className="px-4 py-2">~2,300</td><td className="px-4 py-2">~72 MB</td><td className="px-4 py-2">~570 MB</td><td className="px-4 py-2 text-green-700">7%</td><td className="px-4 py-2 text-green-700">11%</td></tr>
              <tr><td className="px-4 py-2">2028</td><td className="px-4 py-2">~2,450</td><td className="px-4 py-2">~79 MB</td><td className="px-4 py-2">~650 MB</td><td className="px-4 py-2 text-green-700">8%</td><td className="px-4 py-2 text-green-700">13%</td></tr>
              <tr><td className="px-4 py-2">2029</td><td className="px-4 py-2">~2,600</td><td className="px-4 py-2">~86 MB</td><td className="px-4 py-2">~730 MB</td><td className="px-4 py-2 text-green-700">9%</td><td className="px-4 py-2 text-green-700">15%</td></tr>
              <tr className="bg-gray-50 font-semibold"><td className="px-4 py-2">2030 (Year 5)</td><td className="px-4 py-2">~2,750</td><td className="px-4 py-2">~95 MB</td><td className="px-4 py-2">~820 MB</td><td className="px-4 py-2 text-green-700 font-bold">10%</td><td className="px-4 py-2 text-green-700 font-bold">16%</td></tr>
            </tbody>
          </table>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="font-semibold text-green-800 text-sm">Firestore Database</p>
            <p className="text-sm text-green-700 mt-1">
              At current growth, the system would need approximately <strong>30+ more years</strong> of
              data accumulation to reach the 1 GB Firestore limit.
            </p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="font-semibold text-green-800 text-sm">Firebase File Storage</p>
            <p className="text-sm text-green-700 mt-1">
              File uploads (resumes, certificates) would take approximately <strong>15–20+ years</strong> to
              reach the 5 GB Firebase Storage limit.
            </p>
          </div>
        </div>
      </Section>

      <Section title="5. What About Daily Usage Limits (Reads &amp; Writes)?">
        <p>
          Firebase&apos;s free tier also has limits on how many times the database can be read or written
          per day. These are more of a daily activity concern than a storage concern.
        </p>
        <SubSection title="Estimated Daily Activity">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left font-semibold text-gray-700 border-b">Activity</th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700 border-b">Estimated Reads/Day</th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700 border-b">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr><td className="px-4 py-2">Admin dashboard loads</td><td className="px-4 py-2">~200–500</td><td className="px-4 py-2">~5–10 admin logins/day</td></tr>
                <tr><td className="px-4 py-2">Alumni browsing app</td><td className="px-4 py-2">~500–2,000</td><td className="px-4 py-2">~50–100 alumni active/day</td></tr>
                <tr><td className="px-4 py-2">Report generation</td><td className="px-4 py-2">~2,000–5,000</td><td className="px-4 py-2">Each report reads all alumni records</td></tr>
                <tr><td className="px-4 py-2">Survey submissions</td><td className="px-4 py-2">~100–300</td><td className="px-4 py-2">Occasional campaign days</td></tr>
                <tr className="bg-gray-50 font-semibold"><td className="px-4 py-2">Typical Daily Total</td><td className="px-4 py-2 text-green-700">~3,000–8,000</td><td className="px-4 py-2 text-green-700">6–16% of the 50,000/day limit</td></tr>
              </tbody>
            </table>
          </div>
        </SubSection>
        <SubSection title="Peak Risk: Report Generation Days">
          <p>
            The highest read activity happens when admins generate outcome reports (which reads all
            alumni records). If multiple admins generate large reports at the same time, daily reads
            could temporarily spike. However, for a school department with a small admin team, this
            is very unlikely to exceed the 50,000 reads/day limit.
          </p>
          <p className="text-sm bg-yellow-50 border border-yellow-200 rounded p-3 text-yellow-800">
            <strong>Recommendation:</strong> If reports are generated frequently, consider spacing them
            out during the day rather than running many at once. This is a precaution, not a current problem.
          </p>
        </SubSection>
      </Section>

      <Section title="6. Cloud Functions Usage">
        <p>
          The system has 4 automated Cloud Functions that run in the background:
        </p>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 text-left font-semibold text-gray-700 border-b">Function</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-700 border-b">When It Runs</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-700 border-b">Est. Calls/Month</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr><td className="px-4 py-2 font-medium">onUserCreated</td><td className="px-4 py-2">When an alumni account is created</td><td className="px-4 py-2">~10–20</td></tr>
              <tr><td className="px-4 py-2 font-medium">onJobPosted</td><td className="px-4 py-2">When a new job is posted</td><td className="px-4 py-2">~5–20</td></tr>
              <tr><td className="px-4 py-2 font-medium">onEventPosted</td><td className="px-4 py-2">When a new event is created</td><td className="px-4 py-2">~5–10</td></tr>
              <tr><td className="px-4 py-2 font-medium">generateReport</td><td className="px-4 py-2">When admin triggers a report</td><td className="px-4 py-2">~10–30</td></tr>
              <tr className="bg-gray-50 font-semibold"><td className="px-4 py-2">Monthly Total</td><td className="px-4 py-2"></td><td className="px-4 py-2 text-green-700">~30–80 calls (0.06% of 125,000 limit)</td></tr>
            </tbody>
          </table>
        </div>
        <p className="text-sm text-green-700 font-medium mt-2">
          These functions only use Firebase&apos;s own services (no external email or API calls), so
          they are fully compatible with the free Spark plan and have virtually no risk of hitting the limit.
        </p>
      </Section>

      <Section title="7. Will the School Need to Pay for Firebase?">
        <SubSection title="Short Answer: Very Likely Not — For Many Years">
          <p>
            Based on all the estimates above, AlumNayan is not expected to reach any Firebase free
            tier limit within the next 5–10 years under normal usage by a college department.
          </p>
        </SubSection>
        <SubSection title="The Only Scenario That Might Require an Upgrade">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left font-semibold text-gray-700 border-b">Scenario</th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700 border-b">Likelihood</th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700 border-b">What to Do</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr>
                  <td className="px-4 py-2">System expands to all departments in the college (10+ programs)</td>
                  <td className="px-4 py-2 text-yellow-700">Medium</td>
                  <td className="px-4 py-2">Monitor Firestore reads; still likely within free tier</td>
                </tr>
                <tr>
                  <td className="px-4 py-2">Need to send custom email notifications via external email service</td>
                  <td className="px-4 py-2 text-yellow-700">Medium (future feature)</td>
                  <td className="px-4 py-2">Upgrade to Blaze (pay-as-you-go) — costs ~₱0–₱100/month</td>
                </tr>
                <tr>
                  <td className="px-4 py-2">Hundreds of alumni uploading large files daily</td>
                  <td className="px-4 py-2 text-green-700">Very Low</td>
                  <td className="px-4 py-2">Would take 15+ years to be an issue at current rates</td>
                </tr>
                <tr>
                  <td className="px-4 py-2">Database storage hits 1 GB</td>
                  <td className="px-4 py-2 text-green-700">Extremely Low</td>
                  <td className="px-4 py-2">Would require 30+ years of growth at current rate</td>
                </tr>
              </tbody>
            </table>
          </div>
        </SubSection>
        <SubSection title="If an Upgrade Is Ever Needed: Firebase Blaze Plan (Pay-as-you-go)">
          <p>
            Firebase&apos;s paid plan (Blaze) is not a fixed subscription. It only charges for what you
            use above the free tier — and the free tier quota still applies every month. For a school
            department system:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Firestore extra reads: $0.06 per 100,000 reads (~₱3.50 per 100K)</li>
            <li>Firebase Storage extra: $0.026 per GB/month (~₱1.50 per GB/month)</li>
            <li>Cloud Functions: $0.40 per million extra calls (virtually free for this scale)</li>
          </ul>
          <p className="text-sm bg-blue-50 border border-blue-200 rounded p-3 text-blue-800 mt-2">
            <strong>Realistic cost estimate if upgraded to Blaze:</strong> Based on expected usage,
            the monthly bill would likely be <strong>₱0–₱150/month</strong> (approximately $0–$3 USD),
            which is far lower than any traditional server hosting. The Blaze plan also has a
            monthly budget cap feature to prevent unexpected charges.
          </p>
        </SubSection>
      </Section>

      <Section title="8. Summary &amp; Recommendation">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 text-left font-semibold text-gray-700 border-b">Resource</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-700 border-b">Free Limit</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-700 border-b">Est. Usage at Year 5</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-700 border-b">Risk of Hitting Limit</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-700 border-b">Years Until Limit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr><td className="px-4 py-2 font-medium">Firestore Storage</td><td className="px-4 py-2">1 GB</td><td className="px-4 py-2">~95 MB (10%)</td><td className="px-4 py-2 text-green-700 font-semibold">Very Low</td><td className="px-4 py-2 text-green-700">30+ years</td></tr>
              <tr><td className="px-4 py-2 font-medium">Firestore Reads/day</td><td className="px-4 py-2">50,000</td><td className="px-4 py-2">~3K–8K (16%)</td><td className="px-4 py-2 text-green-700 font-semibold">Low</td><td className="px-4 py-2 text-green-700">Not data-driven</td></tr>
              <tr><td className="px-4 py-2 font-medium">Firebase File Storage</td><td className="px-4 py-2">5 GB</td><td className="px-4 py-2">~820 MB (16%)</td><td className="px-4 py-2 text-green-700 font-semibold">Very Low</td><td className="px-4 py-2 text-green-700">15–20+ years</td></tr>
              <tr><td className="px-4 py-2 font-medium">Cloud Functions</td><td className="px-4 py-2">125K/month</td><td className="px-4 py-2">~80 calls (&lt;1%)</td><td className="px-4 py-2 text-green-700 font-semibold">Negligible</td><td className="px-4 py-2 text-green-700">Not applicable</td></tr>
              <tr><td className="px-4 py-2 font-medium">Authentication</td><td className="px-4 py-2">Unlimited</td><td className="px-4 py-2">~2,750 users</td><td className="px-4 py-2 text-green-700 font-semibold">None</td><td className="px-4 py-2 text-green-700">No limit</td></tr>
              <tr><td className="px-4 py-2 font-medium">Cloudinary Images</td><td className="px-4 py-2">25 GB</td><td className="px-4 py-2">~1–2 GB</td><td className="px-4 py-2 text-green-700 font-semibold">Very Low</td><td className="px-4 py-2 text-green-700">10+ years</td></tr>
            </tbody>
          </table>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
          <p className="font-semibold text-green-800">Recommendation for the School</p>
          <ul className="list-disc pl-5 space-y-1 text-sm text-green-800 mt-2">
            <li><strong>No Firebase subscription is needed for at least the next 5–10 years</strong> based on estimated usage for 3 engineering departments.</li>
            <li>The current Firebase Spark (free) plan is more than sufficient for the system&apos;s scale.</li>
            <li>If the system ever expands significantly (e.g., covers the entire college with 20+ programs), consider upgrading to the Blaze plan — which would likely cost <strong>less than ₱150/month</strong>.</li>
            <li>Monitor Firebase usage quarterly from the Firebase Console dashboard to stay informed.</li>
          </ul>
        </div>
      </Section>
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════
   TROUBLESHOOTING GUIDE CONTENT
   ═══════════════════════════════════════════════════════════ */

function Issue({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-200">
        <p className="text-sm font-semibold text-gray-800">{title}</p>
      </div>
      <div className="px-4 py-3 text-sm text-gray-700 leading-relaxed space-y-2">{children}</div>
    </div>
  );
}

function Steps({ items }: { items: string[] }) {
  return (
    <ol className="list-decimal pl-5 space-y-1 text-sm text-gray-700">
      {items.map((item, i) => <li key={i}>{item}</li>)}
    </ol>
  );
}

function TroubleshootingGuide() {
  return (
    <div className="space-y-8">
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
        <strong>When to use this guide:</strong> If you encounter an error, unexpected behavior, or something
        is not working as expected in AlumNayan, find your issue below and follow the steps.
      </div>

      <Section title="1. Login &amp; Account Access Problems">
        <div className="space-y-4">
          <Issue title="Cannot log in — wrong email or password">
            <Steps items={[
              'Make sure you are entering the correct email address (check for typos).',
              'Passwords are case-sensitive — check if Caps Lock is on.',
              'Click "Forgot Password?" on the login page to receive a reset link by email.',
              'Check your spam/junk folder if the reset email does not arrive within 2 minutes.',
              'If you still cannot log in, contact your admin to verify your account exists.',
            ]} />
          </Issue>

          <Issue title="Account says email is not verified">
            <Steps items={[
              'Check your inbox for a verification email from AlumNayan.',
              'Check spam/junk folder if it is not in your inbox.',
              'On the login page, click "Resend Verification Email" to get a new link.',
              'Click the link in the email — it expires after 24 hours.',
              'After verifying, refresh the page and try logging in again.',
            ]} />
          </Issue>

          <Issue title="Password reset email never arrives">
            <Steps items={[
              'Wait 2–3 minutes — email delivery can be delayed.',
              'Check your spam, junk, and promotions folders.',
              'Make sure you entered the correct email address associated with your account.',
              'Try requesting the reset email again from the login page.',
              'If using a school email address, check if your institution blocks automated emails.',
            ]} />
          </Issue>

          <Issue title="Admin says 'Access Denied' or redirects to login">
            <Steps items={[
              'Only accounts with the Admin or Super Admin role can access the admin panel.',
              'Log out and log back in — your session may have expired.',
              'Ask your Super Admin to verify that your account has been assigned the correct role.',
              'Clear your browser cookies and cache, then try logging in again.',
            ]} />
          </Issue>
        </div>
      </Section>

      <Section title="2. Alumni Import Problems">
        <div className="space-y-4">
          <Issue title="Excel file upload fails or shows an error">
            <Steps items={[
              'Make sure the file is in .xlsx or .xls format — .csv files are not supported.',
              'Check that the file size is reasonable (under 10 MB for typical alumni data).',
              'Open the file in Excel to confirm it is not corrupted and can be opened normally.',
              'Make sure the first row contains column headers (not data).',
              'Try saving the file as a new .xlsx file and uploading again.',
            ]} />
          </Issue>

          <Issue title="Many alumni records show as 'skipped' after import">
            <p>Records are skipped when:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>The row has no email address — email is required to match or create an account.</li>
              <li>The email already exists in the system and the data has not changed.</li>
              <li>The row is completely empty.</li>
            </ul>
            <Steps items={[
              'Check that the email column in your Excel file is filled in for every row.',
              'Ensure the email column header matches expected names like "Email Address" or "Email".',
              'Open the import result and look at the "Failed Rows" list for specific error messages.',
            ]} />
          </Issue>

          <Issue title="Alumni claim emails are not being received">
            <Steps items={[
              'Ask the alumni to check their spam/junk folder.',
              'Verify the email address in their record is spelled correctly.',
              'In the admin panel, go to the alumni profile and check if isClaimed is still false.',
              'The claim link expires — if it has been more than 7 days, the alumni may need a new invite.',
              'Contact your developer to resend the claim email if the feature is unavailable in the UI.',
            ]} />
          </Issue>

          <Issue title="Imported alumni show wrong employment or abroad data">
            <Steps items={[
              'Go to the specific alumni profile and manually update the field.',
              'Re-import the Excel file with corrected data — the system will update existing records.',
              'For "Working Abroad" detection: make sure the Company Address column contains a country name or city outside the Philippines.',
              'For course alignment: make sure the survey response column is filled with "Yes" or "No".',
            ]} />
          </Issue>
        </div>
      </Section>

      <Section title="3. Report Generation Problems">
        <div className="space-y-4">
          <Issue title="Report shows 0 or very low employment numbers">
            <Steps items={[
              'Check that alumni profiles have the "isEmployed" field filled in (via import or profile update).',
              'Try changing the filter — select "All Programs" and "All Batch Years" to see the full count.',
              'Alumni who registered but never filled in their profile may not have employment data.',
              'Re-import the Excel survey data to populate employment fields from survey responses.',
            ]} />
          </Issue>

          <Issue title="PDF or CSV export button does nothing">
            <Steps items={[
              'Make sure your browser allows pop-ups and file downloads from this website.',
              'Check your browser\'s download bar or downloads folder — the file may have downloaded silently.',
              'Try a different browser (Chrome or Edge are recommended).',
              'If the page is still loading, wait for it to finish before clicking export.',
              'Disable browser extensions (especially ad blockers) and try again.',
            ]} />
          </Issue>

          <Issue title="College Goals or Graduate Attributes show unexpected numbers">
            <Steps items={[
              'These numbers are calculated from employment and survey data — make sure alumni records are up to date.',
              'For "Working Abroad" (Goal 1): the system checks the company address and locality fields for international keywords.',
              'Re-import the survey Excel file to refresh all computed fields.',
              'If a specific alumni appears to be counted incorrectly, check their individual profile.',
            ]} />
          </Issue>

          <Issue title="Report generation is very slow">
            <Steps items={[
              'Large reports (all programs, all batch years) can take 10–20 seconds.',
              'Avoid clicking the generate button multiple times — wait for it to finish.',
              'Try filtering by a specific program or batch year to generate a smaller, faster report.',
              'If it times out after 30+ seconds, refresh the page and try again.',
            ]} />
          </Issue>
        </div>
      </Section>

      <Section title="4. File Upload Problems (Photos, Resumes, Certificates)">
        <div className="space-y-4">
          <Issue title="Profile photo upload fails or does not appear">
            <Steps items={[
              'Photos must be JPG, PNG, or WebP format — other file types are not supported.',
              'Maximum recommended file size is 5 MB.',
              'Try a different image or resize the photo before uploading.',
              'Check your internet connection — slow connections may cause upload timeouts.',
              'Disable browser extensions and try again.',
              'If the photo uploads but does not appear, do a hard refresh (Ctrl+Shift+R or Cmd+Shift+R).',
            ]} />
          </Issue>

          <Issue title="Resume or certificate upload fails">
            <Steps items={[
              'Only PDF files are supported for resumes and certificates.',
              'Make sure the file is not password-protected or corrupted.',
              'Try re-saving the PDF using a PDF editor or printing to PDF.',
              'Maximum file size is typically 10 MB — compress the PDF if it is too large.',
            ]} />
          </Issue>
        </div>
      </Section>

      <Section title="5. Survey Problems">
        <div className="space-y-4">
          <Issue title="Alumni cannot see or access a survey">
            <Steps items={[
              'Check that the survey status is set to "Active" — Draft surveys are not visible to alumni.',
              'Confirm the survey has at least one question before publishing.',
              'Ask the alumni to log out and log back in to refresh their session.',
              'Check that the alumni\'s account is active (isActive = true in their profile).',
            ]} />
          </Issue>

          <Issue title="Survey responses are not showing in the admin panel">
            <Steps items={[
              'Go to Surveys → click the survey → click "View Responses".',
              'Responses submitted via Google Form must be synced manually — use the "Sync" button if available.',
              'Refresh the page — responses update in real time but may take a few seconds.',
              'Confirm the alumni actually completed and submitted the survey (not just opened it).',
            ]} />
          </Issue>

          <Issue title="Survey results do not reflect in the outcome reports">
            <Steps items={[
              'Survey responses must be synced to alumni profiles to appear in reports.',
              'In the survey responses view, use the "Sync to Profiles" button to update alumni records.',
              'After syncing, regenerate the report to see updated numbers.',
            ]} />
          </Issue>
        </div>
      </Section>

      <Section title="6. Notification Problems">
        <div className="space-y-4">
          <Issue title="Alumni are not receiving notifications">
            <Steps items={[
              'Check the alumni\'s notification preferences in their profile (jobs and events toggles).',
              'Notifications are delivered inside the app (bell icon) — they are not sent by SMS or push notification.',
              'Ask the alumni to check their notifications page inside AlumNayan.',
              'Verify that the job or event was set to "Active" / "Published" status when created — draft postings do not trigger notifications.',
            ]} />
          </Issue>

          <Issue title="Notification count badge is stuck or shows wrong number">
            <Steps items={[
              'Log out and log back in to reset the notification count.',
              'Click each unread notification to mark it as read.',
              'Do a hard refresh (Ctrl+Shift+R or Cmd+Shift+R) to force reload the page.',
            ]} />
          </Issue>
        </div>
      </Section>

      <Section title="7. Page Loading &amp; Display Problems">
        <div className="space-y-4">
          <Issue title="Page shows a blank screen or spinner that never stops">
            <Steps items={[
              'Refresh the page (F5 or Ctrl+R).',
              'Clear your browser cache and cookies, then try again.',
              'Try a different browser (Chrome or Edge are recommended).',
              'Check your internet connection.',
              'If the blank screen happens consistently, contact your developer — there may be a code error.',
            ]} />
          </Issue>

          <Issue title="Data seems outdated or changes are not reflected">
            <Steps items={[
              'Do a hard refresh (Ctrl+Shift+R or Cmd+Shift+R) to bypass cached data.',
              'Log out and log back in.',
              'Check if someone else may have changed the data — the system updates in real time.',
              'Wait 10–15 seconds and refresh again — Firestore sometimes has a brief delay.',
            ]} />
          </Issue>

          <Issue title="Charts on the dashboard are empty or missing">
            <Steps items={[
              'Charts require alumni data — if there are no alumni records, charts will appear empty.',
              'Make sure alumni have employment status data filled in.',
              'Refresh the page.',
              'Try a different browser or disable browser extensions.',
            ]} />
          </Issue>

          <Issue title="Mobile layout looks broken or elements overlap">
            <Steps items={[
              'Try rotating your device to landscape mode for better table visibility.',
              'Use a tablet or desktop for the admin panel — it is optimized for wider screens.',
              'Try zooming out in your browser (Ctrl+- or pinch out).',
              'Update your browser to the latest version.',
            ]} />
          </Issue>
        </div>
      </Section>

      <Section title="8. General Tips &amp; When to Contact Support">
        <div className="space-y-3">
          <p>Before contacting your support, try these general fixes first — they resolve most common issues:</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong>Hard refresh the page</strong> — Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)</li>
            <li><strong>Clear browser cache</strong> — Settings → Clear browsing data → Cached images and files</li>
            <li><strong>Log out and log back in</strong> — resolves most session-related issues</li>
            <li><strong>Try a different browser</strong> — Chrome or Edge are most compatible</li>
            <li><strong>Check your internet connection</strong> — some features require a stable connection</li>
          </ul>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-2">
            <p className="font-semibold text-red-800 text-sm">Contact your support if:</p>
            <ul className="list-disc pl-5 space-y-1 text-sm text-red-700 mt-1">
              <li>The system shows a red error message with a code (e.g., "500 Internal Server Error")</li>
              <li>Data is missing that was previously there</li>
              <li>The login page cannot be reached at all</li>
              <li>An action (import, report, export) consistently fails after multiple attempts</li>
              <li>Alumni cannot register even after email verification</li>
            </ul>
          </div>
        </div>
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

async function exportSecurityManualPDF() {
  const { jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");
  const doc = new jsPDF();

  // Title page
  doc.setFontSize(22); doc.setFont("helvetica", "bold"); doc.setTextColor(30, 41, 82);
  doc.text("AlumNayan", 14, 40);
  doc.setFontSize(16); doc.setTextColor(80);
  doc.text("System Security Documentation", 14, 52);
  doc.setFontSize(10); doc.setFont("helvetica", "normal"); doc.setTextColor(120);
  doc.text("College of Engineering", 14, 62);
  doc.text("Electronics, Industrial & Mechanical Engineering", 14, 68);
  doc.text(`Generated: ${new Date().toLocaleDateString("en-PH")}`, 14, 78);
  doc.setDrawColor(30, 41, 82); doc.setLineWidth(0.5); doc.line(14, 82, 196, 82);

  doc.addPage();
  let y = 20;

  // Intro
  y = addWrappedText(doc, "This document explains how the AlumNayan system protects your data and keeps the platform secure — written in plain language so anyone can understand it, no technical background needed.", 14, y, 182, 4.5);
  y += 6;

  // 1. Login Security
  y = addSectionHeader(doc, "1. How Logging In Works", y);
  y = addWrappedText(doc, "Think of logging in like using a key to enter a building. Only people with the right key (username and password) can get inside. AlumNayan uses Firebase Authentication, a trusted security service by Google, to manage all logins safely.", 14, y, 182, 4.5);
  y += 3;
  y = addSubHeader(doc, "Email Verification", y);
  y = addWrappedText(doc, "When someone creates a new account, the system sends a verification email to their inbox. The person must click the link in that email before they can fully access their account. This prevents fake or typo-filled email addresses from being used.", 14, y, 182, 4.5);
  y = addWrappedText(doc, "Analogy: It's like receiving a letter at your home address to prove you really live there.", 14, y, 182, 4.5);
  y += 3;
  y = addSubHeader(doc, "Password Reset", y);
  y = addWrappedText(doc, "If someone forgets their password, they can click 'Forgot Password' on the login page. The system sends a secure reset link to their email. The old password is immediately invalidated once a new one is set.", 14, y, 182, 4.5);
  y += 3;
  y = addSubHeader(doc, "Passwords Are Never Stored as Plain Text", y);
  y = addWrappedText(doc, "AlumNayan never stores anyone's actual password in the database. Instead, Firebase converts passwords into a scrambled, unreadable code (called a 'hash') before saving them. Even if someone somehow accessed the database, they would not be able to read any passwords.", 14, y, 182, 4.5);
  y = addWrappedText(doc, "Analogy: Imagine locking your secret message inside a box, melting the key, and keeping only the lock — nobody can re-open it.", 14, y, 182, 4.5);
  y += 6;

  // 2. Roles
  y = addSectionHeader(doc, "2. Who Can See and Do What (Roles & Permissions)", y);
  y = addWrappedText(doc, "Not everyone who logs in can do the same things. AlumNayan has three levels of access, like different floors in an office building with different key cards:", 14, y, 182, 4.5);
  y += 3;
  y = addSubHeader(doc, "Alumni (Ground Floor)", y);
  y = addBullet(doc, "Can view and update their own profile only", 18, y, 178);
  y = addBullet(doc, "Can browse jobs and events posted by admins", 18, y, 178);
  y = addBullet(doc, "Cannot see other alumni's private information", 18, y, 178);
  y = addBullet(doc, "Cannot access any admin tools or settings", 18, y, 178);
  y += 3;
  y = addSubHeader(doc, "Admin (Second Floor)", y);
  y = addBullet(doc, "Can manage the alumni directory, jobs, events, and surveys", 18, y, 178);
  y = addBullet(doc, "Can view alumni data for reporting purposes", 18, y, 178);
  y = addBullet(doc, "Cannot change system-level settings or assign new admins", 18, y, 178);
  y = addBullet(doc, "Cannot delete alumni accounts permanently", 18, y, 178);
  y += 3;
  y = addSubHeader(doc, "Super Admin (Top Floor)", y);
  y = addBullet(doc, "Has all Admin permissions", 18, y, 178);
  y = addBullet(doc, "Can assign or remove the Admin role from other users", 18, y, 178);
  y = addBullet(doc, "Can permanently delete alumni accounts", 18, y, 178);
  y = addBullet(doc, "This role should only be given to the most trusted personnel", 18, y, 178);
  y += 3;
  y = addWrappedText(doc, "Important: These rules are enforced by the system automatically. Even if someone tries to access a page they are not allowed to visit, the system will block them and show an 'Access Denied' message.", 14, y, 182, 4.5);
  y += 6;

  // 3. Data Protection
  y = addSectionHeader(doc, "3. Data Protection (Who Can Read the Database)", y);
  y = addWrappedText(doc, "The database is protected by Firestore Security Rules — these act like a security guard at the door of the database. They check every request before allowing any data to be read or changed.", 14, y, 182, 4.5);
  y += 3;
  y = addBullet(doc, "Alumni can only read or update their own personal record. They cannot look up other alumni's data.", 18, y, 178);
  y = addBullet(doc, "Admins can read alumni data to generate reports, but cannot write outside their allowed scope.", 18, y, 178);
  y = addBullet(doc, "Anonymous visitors (not logged in) cannot access any private data at all.", 18, y, 178);
  y += 3;
  y = addWrappedText(doc, "These security rules are deployed directly to the database and run on Google's infrastructure, meaning they are enforced even if someone tried to access the database directly — not just through the website.", 14, y, 182, 4.5);
  y += 6;

  // 4. HTTPS
  y = addSectionHeader(doc, "4. All Connections Are Encrypted (HTTPS)", y);
  y = addWrappedText(doc, "Whenever you use AlumNayan — whether logging in, submitting a form, or viewing a report — all the information traveling between your device and the system is encrypted. This means it is scrambled so that nobody listening on the network (like on a public Wi-Fi) can read it.", 14, y, 182, 4.5);
  y = addWrappedText(doc, "This is done through HTTPS (the padlock icon you see in your browser's address bar). All modern hosting platforms like Vercel automatically provide this encryption certificate.", 14, y, 182, 4.5);
  y = addWrappedText(doc, "Analogy: It's like sending a letter inside a sealed envelope instead of on a postcard — only the intended recipient can read it.", 14, y, 182, 4.5);
  y += 6;

  // 5. Server-side auth
  y = addSectionHeader(doc, "5. Admin Actions Are Double-Checked on the Server", y);
  y = addWrappedText(doc, "Sensitive actions — like importing alumni data, generating reports, or assigning admin roles — are handled through protected server routes. Before any of these actions are performed, the system checks that:", 14, y, 182, 4.5);
  y += 2;
  y = addBullet(doc, "The person is actually logged in (not just claiming to be)", 18, y, 178);
  y = addBullet(doc, "They have the correct role (Admin or Super Admin)", 18, y, 178);
  y = addBullet(doc, "The request came through the official system, not from an outside source", 18, y, 178);
  y += 3;
  y = addWrappedText(doc, "This prevents attacks where someone might try to trigger admin actions by sending a fake request to the system without proper authorization.", 14, y, 182, 4.5);
  y += 6;

  // 6. Sessions
  y = addSectionHeader(doc, "6. Sessions Stay Secure (Login Cookies)", y);
  y = addWrappedText(doc, "After you log in, the system creates a short-lived, secure session to remember who you are while you browse. Think of it like a wristband at an event — you show it once at the entrance, and the staff can verify it without you having to re-enter your password every few seconds.", 14, y, 182, 4.5);
  y += 2;
  y = addBullet(doc, "Short-lived — they expire automatically after a set time", 18, y, 178);
  y = addBullet(doc, "Verified server-side — the server checks their validity on every admin action", 18, y, 178);
  y = addBullet(doc, "Sent securely — only over encrypted HTTPS connections", 18, y, 178);
  y = addBullet(doc, "When you log out, your session is immediately invalidated", 18, y, 178);
  y += 6;

  // 7. Cloudinary
  y = addSectionHeader(doc, "7. Image & File Uploads Are Handled Safely", y);
  y = addWrappedText(doc, "When profile photos or event banners are uploaded, they go to Cloudinary, a secure third-party image hosting service. This means:", 14, y, 182, 4.5);
  y += 2;
  y = addBullet(doc, "Images are not stored directly inside the main database", 18, y, 178);
  y = addBullet(doc, "Only the image's web address (URL) is saved in the system", 18, y, 178);
  y = addBullet(doc, "Cloudinary handles image storage, resizing, and delivery securely", 18, y, 178);
  y = addBullet(doc, "Upload permissions are controlled through a preset that only allows specific file types", 18, y, 178);
  y = addWrappedText(doc, "Analogy: Instead of keeping physical photos in the filing cabinet, you store only the address of where the photo can be found — in a secure, separate photo album.", 14, y, 182, 4.5);
  y += 6;

  // 8. Summary table
  y = addSectionHeader(doc, "8. Summary: Key Security Features at a Glance", y);
  autoTable(doc, {
    startY: y,
    head: [["Security Feature", "Plain Language Explanation"]],
    body: [
      ["Email Verification", "Confirms identity before allowing full access"],
      ["Hashed Passwords", "Passwords are scrambled and can never be read by anyone"],
      ["Role-Based Access", "Each user type can only do what they are allowed to"],
      ["Firestore Security Rules", "Database access is guarded and enforced automatically"],
      ["HTTPS Encryption", "All data in transit is encrypted (padlock in browser)"],
      ["Server-Side Auth Checks", "Admin actions require verified login on every request"],
      ["Secure Sessions", "Login sessions expire automatically and are verified each time"],
      ["Cloudinary File Storage", "Uploaded files are stored safely outside the main database"],
    ],
    styles: { fontSize: 9 },
    headStyles: { fillColor: [30, 41, 82] },
    columnStyles: { 0: { cellWidth: 60, fontStyle: "bold" } },
    margin: { left: 14, right: 14 },
  });

  doc.save("AlumNayan-Security-Documentation.pdf");
}

async function exportStoragePlanPDF() {
  const { jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");
  const doc = new jsPDF();

  // Title page
  doc.setFontSize(22); doc.setFont("helvetica", "bold"); doc.setTextColor(30, 41, 82);
  doc.text("AlumNayan", 14, 40);
  doc.setFontSize(16); doc.setTextColor(80);
  doc.text("Storage & Scalability Plan", 14, 52);
  doc.setFontSize(10); doc.setFont("helvetica", "normal"); doc.setTextColor(120);
  doc.text("College of Engineering", 14, 62);
  doc.text("Electronics, Industrial & Mechanical Engineering", 14, 68);
  doc.text(`Generated: ${new Date().toLocaleDateString("en-PH")}`, 14, 78);
  doc.setDrawColor(30, 41, 82); doc.setLineWidth(0.5); doc.line(14, 82, 196, 82);

  doc.addPage();
  let y = 20;

  // Intro
  y = addWrappedText(doc, "Short Answer: Based on estimated alumni count and usage patterns for a college department system, AlumNayan is very unlikely to exceed Firebase's free tier limits within the next 5-10 years.", 14, y, 182, 4.5);
  y += 6;

  // 1. Storage services overview
  y = addSectionHeader(doc, "1. What Storage Does the System Use?", y);
  autoTable(doc, {
    startY: y,
    head: [["Service", "What It Stores", "Provider"]],
    body: [
      ["Database", "Alumni profiles, jobs, events, surveys, notifications", "Firebase Firestore (Google)"],
      ["File Storage", "Uploaded resumes, certificates, documents", "Firebase Cloud Storage (Google)"],
      ["Image Storage", "Profile photos, event banners", "Cloudinary (separate — not Firebase)"],
    ],
    styles: { fontSize: 9 },
    headStyles: { fillColor: [30, 41, 82] },
    margin: { left: 14, right: 14 },
  });
  y = (doc as any).lastAutoTable.finalY + 4;
  y = addWrappedText(doc, "Note: Profile photos and event banners go to Cloudinary (25 GB free tier) — they do NOT count against Firebase's storage limits.", 14, y, 182, 4.5);
  y += 6;

  // 2. Free tier limits
  y = addSectionHeader(doc, "2. Firebase Free Tier Limits (Spark Plan)", y);
  autoTable(doc, {
    startY: y,
    head: [["Resource", "Free Limit", "Reset Period"]],
    body: [
      ["Firestore Storage", "1 GB total", "Cumulative (grows)"],
      ["Firestore Reads", "50,000 per day", "Daily"],
      ["Firestore Writes", "20,000 per day", "Daily"],
      ["Firebase Storage (files)", "5 GB total", "Cumulative (grows)"],
      ["Storage Downloads", "1 GB per day", "Daily"],
      ["Cloud Functions", "125,000 calls/month", "Monthly"],
      ["Authentication (Email)", "Unlimited", "—"],
    ],
    styles: { fontSize: 9 },
    headStyles: { fillColor: [30, 41, 82] },
    margin: { left: 14, right: 14 },
  });
  y = (doc as any).lastAutoTable.finalY + 8;

  // 3. Data size estimates
  y = addSectionHeader(doc, "3. Estimated Data Sizes (After 5 Years)", y);
  y = addSubHeader(doc, "Firestore Database", y);
  autoTable(doc, {
    startY: y,
    head: [["Data Type", "Size/Record", "Est. Count (5 yrs)", "Total"]],
    body: [
      ["Alumni profiles", "~8 KB", "~2,750", "~22 MB"],
      ["Survey responses", "~3 KB", "~10,000", "~30 MB"],
      ["Job postings", "~2 KB", "~500", "~1 MB"],
      ["Events", "~2 KB", "~250", "~500 KB"],
      ["Notifications", "~0.5 KB", "~50,000", "~25 MB"],
      ["TOTAL", "", "", "~80–100 MB  (10% of 1 GB limit)"],
    ],
    styles: { fontSize: 9 },
    headStyles: { fillColor: [30, 41, 82] },
    margin: { left: 14, right: 14 },
  });
  y = (doc as any).lastAutoTable.finalY + 4;
  y = addSubHeader(doc, "Firebase File Storage", y);
  autoTable(doc, {
    startY: y,
    head: [["File Type", "Avg. Size", "Est. Uploads (5 yrs)", "Total"]],
    body: [
      ["Resumes (PDF)", "~500 KB", "~1,000 (40% alumni)", "~500 MB"],
      ["Certificates/Licenses", "~300 KB", "~500", "~150 MB"],
      ["TOTAL", "", "", "~650 MB – 1 GB  (13–20% of 5 GB limit)"],
    ],
    styles: { fontSize: 9 },
    headStyles: { fillColor: [30, 41, 82] },
    margin: { left: 14, right: 14 },
  });
  y = (doc as any).lastAutoTable.finalY + 8;

  // 4. 5-Year projection
  y = addSectionHeader(doc, "4. 5-Year Growth Projection (~150 new alumni/year)", y);
  autoTable(doc, {
    startY: y,
    head: [["Year", "Total Alumni", "Firestore", "File Storage", "% DB Limit", "% File Limit"]],
    body: [
      ["2025 (now)", "~2,000", "~60 MB", "~400 MB", "6%", "8%"],
      ["2026", "~2,150", "~65 MB", "~480 MB", "7%", "10%"],
      ["2027", "~2,300", "~72 MB", "~570 MB", "7%", "11%"],
      ["2028", "~2,450", "~79 MB", "~650 MB", "8%", "13%"],
      ["2029", "~2,600", "~86 MB", "~730 MB", "9%", "15%"],
      ["2030 (Year 5)", "~2,750", "~95 MB", "~820 MB", "10%", "16%"],
    ],
    styles: { fontSize: 9 },
    headStyles: { fillColor: [30, 41, 82] },
    margin: { left: 14, right: 14 },
  });
  y = (doc as any).lastAutoTable.finalY + 4;
  y = addWrappedText(doc, "Firestore: ~30+ years to reach limit at current growth. File Storage: ~15-20+ years to reach limit.", 14, y, 182, 4.5);
  y += 6;

  // 5. Daily reads
  y = addSectionHeader(doc, "5. Estimated Daily Database Activity (Reads)", y);
  autoTable(doc, {
    startY: y,
    head: [["Activity", "Estimated Reads/Day", "Notes"]],
    body: [
      ["Admin dashboard loads", "~200–500", "~5–10 admin logins/day"],
      ["Alumni browsing app", "~500–2,000", "~50–100 active alumni/day"],
      ["Report generation", "~2,000–5,000", "Each report reads all alumni"],
      ["Survey submissions", "~100–300", "Occasional campaign days"],
      ["Typical Daily Total", "~3,000–8,000", "6–16% of 50,000/day free limit"],
    ],
    styles: { fontSize: 9 },
    headStyles: { fillColor: [30, 41, 82] },
    margin: { left: 14, right: 14 },
  });
  y = (doc as any).lastAutoTable.finalY + 6;

  // 6. Cloud functions
  y = addSectionHeader(doc, "6. Cloud Functions Usage", y);
  autoTable(doc, {
    startY: y,
    head: [["Function", "When It Runs", "Est. Calls/Month"]],
    body: [
      ["onUserCreated", "When an alumni account is created", "~10–20"],
      ["onJobPosted", "When a new job is posted", "~5–20"],
      ["onEventPosted", "When a new event is created", "~5–10"],
      ["generateReport", "When admin triggers a report", "~10–30"],
      ["Monthly Total", "", "~30–80 calls (<0.1% of 125,000 limit)"],
    ],
    styles: { fontSize: 9 },
    headStyles: { fillColor: [30, 41, 82] },
    margin: { left: 14, right: 14 },
  });
  y = (doc as any).lastAutoTable.finalY + 4;
  y = addWrappedText(doc, "All functions use only Firebase's own services (no external API calls), so they are fully compatible with the free Spark plan.", 14, y, 182, 4.5);
  y += 6;

  // 7. Upgrade scenarios
  y = addSectionHeader(doc, "7. Will the School Need to Pay for Firebase?", y);
  y = addWrappedText(doc, "Short Answer: Very likely not — for at least 5-10 years. Based on all estimates, no Firebase free tier limit is expected to be reached under normal usage by 3 college departments.", 14, y, 182, 4.5);
  y += 4;
  autoTable(doc, {
    startY: y,
    head: [["Scenario", "Likelihood", "What to Do"]],
    body: [
      ["System expands to 10+ programs", "Medium", "Monitor reads — likely still within free tier"],
      ["Need external email service in Functions", "Medium (future)", "Upgrade to Blaze — cost ~₱0–₱100/month"],
      ["Many alumni uploading large files daily", "Very Low", "Takes 15+ years to be an issue"],
      ["Database storage hits 1 GB", "Extremely Low", "Requires 30+ years at current rate"],
    ],
    styles: { fontSize: 9 },
    headStyles: { fillColor: [30, 41, 82] },
    margin: { left: 14, right: 14 },
  });
  y = (doc as any).lastAutoTable.finalY + 4;
  y = addWrappedText(doc, "If upgrade is ever needed: Firebase Blaze is pay-as-you-go. Estimated cost for this school system: ₱0–₱150/month (approximately $0–$3 USD). The free quota still applies every month on Blaze.", 14, y, 182, 4.5);
  y += 6;

  // 8. Summary table
  y = addSectionHeader(doc, "8. Summary & Recommendation", y);
  autoTable(doc, {
    startY: y,
    head: [["Resource", "Free Limit", "Year 5 Usage", "Risk", "Years Until Limit"]],
    body: [
      ["Firestore Storage", "1 GB", "~95 MB (10%)", "Very Low", "30+ years"],
      ["Firestore Reads/day", "50,000", "~3K–8K (16%)", "Low", "Not data-driven"],
      ["Firebase File Storage", "5 GB", "~820 MB (16%)", "Very Low", "15–20+ years"],
      ["Cloud Functions", "125K/month", "~80 calls (<1%)", "Negligible", "Not applicable"],
      ["Authentication", "Unlimited", "~2,750 users", "None", "No limit"],
      ["Cloudinary (Images)", "25 GB", "~1–2 GB", "Very Low", "10+ years"],
    ],
    styles: { fontSize: 9 },
    headStyles: { fillColor: [30, 41, 82] },
    margin: { left: 14, right: 14 },
  });
  y = (doc as any).lastAutoTable.finalY + 6;
  y = addWrappedText(doc, "Recommendation: No Firebase subscription is needed for at least 5-10 years. If the system expands to the entire college, upgrade to Blaze (pay-as-you-go) — estimated cost less than ₱150/month. Monitor Firebase usage quarterly from the Firebase Console dashboard.", 14, y, 182, 4.5);

  doc.save("AlumNayan-Storage-Plan.pdf");
}

async function exportTroubleshootingPDF() {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF();

  // Title page
  doc.setFontSize(22); doc.setFont("helvetica", "bold"); doc.setTextColor(30, 41, 82);
  doc.text("AlumNayan", 14, 40);
  doc.setFontSize(16); doc.setTextColor(80);
  doc.text("Troubleshooting Guide", 14, 52);
  doc.setFontSize(10); doc.setFont("helvetica", "normal"); doc.setTextColor(120);
  doc.text("College of Engineering", 14, 62);
  doc.text("Electronics, Industrial & Mechanical Engineering", 14, 68);
  doc.text(`Generated: ${new Date().toLocaleDateString("en-PH")}`, 14, 78);
  doc.setDrawColor(30, 41, 82); doc.setLineWidth(0.5); doc.line(14, 82, 196, 82);
  doc.setFontSize(9); doc.setTextColor(100);
  doc.text("Use this guide when something is not working as expected in AlumNayan.", 14, 90);
  doc.text("Try the steps listed under your issue. Contact your developer if the problem persists.", 14, 96);

  doc.addPage();
  let y = 20;

  const issues: Array<{ section: string; title: string; steps: string[] }> = [
    {
      section: "1. Login & Account Access",
      title: "Cannot log in — wrong email or password",
      steps: [
        "Make sure you are entering the correct email address (check for typos).",
        "Passwords are case-sensitive — check if Caps Lock is on.",
        "Click 'Forgot Password?' on the login page to receive a reset link by email.",
        "Check your spam/junk folder if the reset email does not arrive within 2 minutes.",
        "If you still cannot log in, contact your admin to verify your account exists.",
      ],
    },
    {
      section: "",
      title: "Account says email is not verified",
      steps: [
        "Check your inbox for a verification email from AlumNayan.",
        "Check spam/junk folder if it is not in your inbox.",
        "On the login page, click 'Resend Verification Email' to get a new link.",
        "Click the link in the email — it expires after 24 hours.",
        "After verifying, refresh the page and try logging in again.",
      ],
    },
    {
      section: "",
      title: "Admin says 'Access Denied' or redirects to login",
      steps: [
        "Only accounts with the Admin or Super Admin role can access the admin panel.",
        "Log out and log back in — your session may have expired.",
        "Ask your Super Admin to verify that your account has the correct role.",
        "Clear your browser cookies and cache, then try logging in again.",
      ],
    },
    {
      section: "2. Alumni Import Problems",
      title: "Excel file upload fails or shows an error",
      steps: [
        "Make sure the file is in .xlsx or .xls format — .csv files are not supported.",
        "Check that the file size is reasonable (under 10 MB for typical alumni data).",
        "Open the file in Excel to confirm it is not corrupted.",
        "Make sure the first row contains column headers (not data).",
        "Try saving the file as a new .xlsx file and uploading again.",
      ],
    },
    {
      section: "",
      title: "Many alumni records show as 'skipped' after import",
      steps: [
        "Check that the email column is filled in for every row (email is required).",
        "Ensure the email column header matches expected names like 'Email Address'.",
        "Open the import result and look at the 'Failed Rows' list for specific errors.",
        "Records with no data changes from what is already stored are also skipped.",
      ],
    },
    {
      section: "",
      title: "Alumni claim emails are not being received",
      steps: [
        "Ask the alumni to check their spam/junk folder.",
        "Verify the email address in their record is spelled correctly.",
        "The claim link expires after 7 days — a new invite may be needed.",
        "Contact your developer to resend the claim email if unavailable in the UI.",
      ],
    },
    {
      section: "3. Report Generation Problems",
      title: "Report shows 0 or very low employment numbers",
      steps: [
        "Check that alumni profiles have the 'isEmployed' field filled in.",
        "Try selecting 'All Programs' and 'All Batch Years' to see the full count.",
        "Alumni who never filled in their profile may not have employment data.",
        "Re-import the Excel survey data to populate employment fields.",
      ],
    },
    {
      section: "",
      title: "PDF or CSV export button does nothing",
      steps: [
        "Make sure your browser allows pop-ups and file downloads from this website.",
        "Check your browser's downloads folder — the file may have downloaded silently.",
        "Try a different browser (Chrome or Edge are recommended).",
        "Disable browser extensions (especially ad blockers) and try again.",
      ],
    },
    {
      section: "",
      title: "College Goals or Graduate Attributes show unexpected numbers",
      steps: [
        "These numbers are calculated from employment and survey data — make sure alumni records are up to date.",
        "For 'Working Abroad': the system checks company address for international keywords.",
        "Re-import the survey Excel file to refresh all computed fields.",
        "If a specific alumni appears incorrectly counted, check their individual profile.",
      ],
    },
    {
      section: "4. File Upload Problems",
      title: "Profile photo upload fails or does not appear",
      steps: [
        "Photos must be JPG, PNG, or WebP format. Maximum recommended size is 5 MB.",
        "Try a different image or resize the photo before uploading.",
        "Check your internet connection — slow connections may cause upload timeouts.",
        "If the photo uploads but does not appear, do a hard refresh (Ctrl+Shift+R).",
      ],
    },
    {
      section: "",
      title: "Resume or certificate upload fails",
      steps: [
        "Only PDF files are supported for resumes and certificates.",
        "Make sure the file is not password-protected or corrupted.",
        "Maximum file size is typically 10 MB — compress the PDF if it is too large.",
      ],
    },
    {
      section: "5. Survey Problems",
      title: "Alumni cannot see or access a survey",
      steps: [
        "Check that the survey status is set to 'Active' — Draft surveys are not visible to alumni.",
        "Confirm the survey has at least one question before publishing.",
        "Ask the alumni to log out and log back in to refresh their session.",
      ],
    },
    {
      section: "",
      title: "Survey results do not reflect in outcome reports",
      steps: [
        "Survey responses must be synced to alumni profiles to appear in reports.",
        "In the survey responses view, use the 'Sync to Profiles' button to update alumni records.",
        "After syncing, regenerate the report to see updated numbers.",
      ],
    },
    {
      section: "6. Notification Problems",
      title: "Alumni are not receiving notifications",
      steps: [
        "Check the alumni's notification preferences in their profile (jobs and events toggles).",
        "Notifications are delivered inside the app (bell icon) — not by SMS or push notification.",
        "Verify the job or event was set to Active/Published — drafts do not trigger notifications.",
      ],
    },
    {
      section: "7. Page Loading & Display Problems",
      title: "Page shows a blank screen or spinner that never stops",
      steps: [
        "Refresh the page (F5 or Ctrl+R).",
        "Clear your browser cache and cookies, then try again.",
        "Try a different browser (Chrome or Edge are recommended).",
        "If it consistently happens, contact your developer — there may be a code error.",
      ],
    },
    {
      section: "",
      title: "Data seems outdated or changes are not reflected",
      steps: [
        "Do a hard refresh (Ctrl+Shift+R or Cmd+Shift+R) to bypass cached data.",
        "Log out and log back in.",
        "Wait 10–15 seconds and refresh again — the database sometimes has a brief delay.",
      ],
    },
  ];

  let currentSection = "";

  for (const issue of issues) {
    if (issue.section && issue.section !== currentSection) {
      if (y > 250) { doc.addPage(); y = 20; }
      y = addSectionHeader(doc, issue.section, y);
      currentSection = issue.section;
    }

    if (y > 240) { doc.addPage(); y = 20; }
    y = addSubHeader(doc, issue.title, y);
    for (let i = 0; i < issue.steps.length; i++) {
      if (y > 275) { doc.addPage(); y = 20; }
      y = addWrappedText(doc, `${i + 1}. ${issue.steps[i]}`, 18, y, 175, 4.5);
    }
    y += 4;
  }

  // General tips
  if (y > 230) { doc.addPage(); y = 20; }
  y = addSectionHeader(doc, "8. General Tips & When to Contact Support", y);
  y = addWrappedText(doc, "Before contacting your developer, try these general fixes first:", 14, y, 182, 4.5);
  y += 2;
  y = addBullet(doc, "Hard refresh the page — Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)", 18, y, 178);
  y = addBullet(doc, "Clear browser cache — Settings > Clear browsing data > Cached images and files", 18, y, 178);
  y = addBullet(doc, "Log out and log back in — resolves most session-related issues", 18, y, 178);
  y = addBullet(doc, "Try a different browser — Chrome or Edge are most compatible", 18, y, 178);
  y = addBullet(doc, "Check your internet connection — some features require a stable connection", 18, y, 178);
  y += 4;
  y = addSubHeader(doc, "Contact your developer if:", y);
  y = addBullet(doc, "The system shows a red error message with a code (e.g., '500 Internal Server Error')", 18, y, 178);
  y = addBullet(doc, "Data is missing that was previously there", 18, y, 178);
  y = addBullet(doc, "The login page cannot be reached at all", 18, y, 178);
  y = addBullet(doc, "An action (import, report, export) consistently fails after multiple attempts", 18, y, 178);
  y = addBullet(doc, "Alumni cannot register even after email verification", 18, y, 178);

  doc.save("AlumNayan-Troubleshooting-Guide.pdf");
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
          <button
            type="button"
            className={cn(
              "px-4 py-2 text-sm font-medium transition-colors border-l border-gray-200",
              tab === "security"
                ? "bg-navy-800 text-white"
                : "bg-white text-gray-600 hover:bg-gray-50"
            )}
            onClick={() => setTab("security")}
          >
            System Security
          </button>
          <button
            type="button"
            className={cn(
              "px-4 py-2 text-sm font-medium transition-colors border-l border-gray-200",
              tab === "storage"
                ? "bg-navy-800 text-white"
                : "bg-white text-gray-600 hover:bg-gray-50"
            )}
            onClick={() => setTab("storage")}
          >
            Storage Plan
          </button>
          <button
            type="button"
            className={cn(
              "px-4 py-2 text-sm font-medium transition-colors border-l border-gray-200",
              tab === "troubleshooting"
                ? "bg-navy-800 text-white"
                : "bg-white text-gray-600 hover:bg-gray-50"
            )}
            onClick={() => setTab("troubleshooting")}
          >
            Troubleshooting
          </button>
        </div>

        <Button
          variant="secondary"
          size="sm"
          leftIcon={<FileDown size={14} />}
          onClick={() =>
            tab === "system"
              ? exportSystemManualPDF()
              : tab === "transfer"
              ? exportTransferManualPDF()
              : tab === "security"
              ? exportSecurityManualPDF()
              : tab === "storage"
              ? exportStoragePlanPDF()
              : exportTroubleshootingPDF()
          }
        >
          Download PDF
        </Button>
      </div>

      {/* Content */}
      <Card>
        <CardBody className="p-6 sm:p-8">
          {tab === "system" ? <SystemManual />
            : tab === "transfer" ? <TransferManual />
            : tab === "security" ? <SecurityManual />
            : tab === "storage" ? <StoragePlan />
            : <TroubleshootingGuide />}
        </CardBody>
      </Card>
    </div>
  );
}
