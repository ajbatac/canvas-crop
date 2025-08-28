import { LegalPage } from '@/components/legal-page';

export default function UGCDisclaimerPage() {
  return (
    <LegalPage title="User-Generated Content (UGC) Disclaimer">
      <h2>1. General Statement</h2>
      <p>Canvas Crop is a client-side tool that enables users to manipulate image files on their own devices. All content processed, created, or modified by users ("User-Generated Content" or "UGC") exists only on the user's local machine. Our service does not host, store, transmit, or have any visibility into this UGC.</p>

      <h2>2. Responsibility for Content</h2>
      <p>The user is solely and exclusively responsible for the content they choose to process with our tool. We are not responsible for any UGC and do not endorse any opinions contained in any UGC. You agree that if anyone brings a claim against Canvas Crop related to UGC that you process, you will indemnify and hold us harmless from and against all damages, losses, and expenses of any kind.</p>

      <h2>3. No Monitoring or Moderation</h2>
      <p>Given the client-side nature of our service, we do not and cannot monitor, review, or moderate any UGC. We have no knowledge of what users are creating or processing. As such, we cannot be held responsible for any inappropriate, illegal, or infringing content that a user may process.</p>
      
      <h2>4. Copyright and Intellectual Property</h2>
      <p>Users are responsible for ensuring they have the necessary rights, licenses, or permissions for any content they use with our service. Using our tool does not grant any rights to content that is otherwise protected by intellectual property laws.</p>
    </LegalPage>
  );
}
