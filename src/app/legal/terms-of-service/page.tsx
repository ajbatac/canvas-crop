import { LegalPage } from '@/components/legal-page';

export default function TermsOfServicePage() {
  return (
    <LegalPage title="Terms of Service">
      <h2>1. Acceptance of Terms</h2>
      <p>By accessing and using Canvas Crop ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. The Service is provided as-is, with no warranties whatsoever.</p>

      <h2>2. Description of Service</h2>
      <p>Canvas Crop is a client-side web application that allows users to resize, crop, and edit images directly in their browser. All processing is performed on the user's local machine; no image data is ever uploaded to, processed on, or stored on our servers.</p>

      <h2>3. User Conduct</h2>
      <p>You agree to use the Service only for lawful purposes. You are solely responsible for the content you process through the Service and for any consequences thereof.</p>

      <h2>4. Intellectual Property</h2>
      <p>The Service and its original content, features, and functionality are owned by the project creators and are protected by international copyright, trademark, and other intellectual property laws. You retain all rights to the images you process with the Service.</p>

      <h2>5. Disclaimer of Warranties</h2>
      <p>The Service is provided "as is." We make no warranty that the Service will meet your requirements, be uninterrupted, timely, secure, or error-free. Any reliance you place on such information is therefore strictly at your own risk.</p>

      <h2>6. Limitation of Liability</h2>
      <p>In no event shall the creators of Canvas Crop be liable for any direct, indirect, incidental, special, consequential or exemplary damages, including but not limited to, damages for loss of profits, goodwill, use, data or other intangible losses resulting from the use of or inability to use the service.</p>

      <h2>7. Changes to Terms</h2>
      <p>We reserve the right to modify these terms from time to time at our sole discretion. Therefore, you should review this page periodically. Your continued use of the Service after any such change constitutes your acceptance of the new Terms.</p>
    </LegalPage>
  );
}
