import { LegalPage } from '@/components/legal-page';

export default function PrivacyPolicyPage() {
  return (
    <LegalPage title="Privacy Policy">
      <h2>1. Information We Do Not Collect</h2>
      <p>Canvas Crop is designed with privacy at its core. We do not collect, store, or have access to any personal data or any images you upload and process. All operations, from file selection to image editing, are performed exclusively on your local computer (client-side).</p>

      <h2>2. How Your Data is Handled</h2>
      <p>Your images and files are never transmitted to our servers or any third-party service. When you select a file, it is loaded directly into your web browser's memory. When you are finished editing, you can save the image to your computer or copy it to your clipboard. At no point does your data leave your machine.</p>

      <h2>3. Cookies and Tracking Technologies</h2>
      <p>We do not use cookies or any other tracking technologies to monitor your activity on our website. We do not collect analytics, telemetry, or any form of usage data.</p>

      <h2>4. Third-Party Services</h2>
      <p>This Service does not integrate with any third-party services that would have access to your data. All functionality is self-contained within the application.</p>

      <h2>5. Data Security</h2>
      <p>Since we do not handle or store your data, the security of your files remains entirely in your control on your own device. We have no ability to access, view, or share your content.</p>

      <h2>6. Children's Privacy</h2>
      <p>Our Service does not address anyone under the age of 13. We do not knowingly collect personally identifiable information from children under 13. Since we collect no data, we are in compliance with this requirement by default.</p>

      <h2>7. Changes to This Privacy Policy</h2>
      <p>We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes.</p>
    </LegalPage>
  );
}
