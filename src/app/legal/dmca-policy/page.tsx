import { LegalPage } from '@/components/legal-page';

export default function DMCAPolicyPage() {
  return (
    <LegalPage title="DMCA Policy">
      <h2>Digital Millennium Copyright Act ("DMCA") Policy</h2>
      <p>Canvas Crop respects the intellectual property rights of others. However, as a client-side application, we have no control over the content that users process through our Service, nor do we host any user-generated content.</p>

      <h2>1. No User Content is Stored</h2>
      <p>Canvas Crop operates entirely within the user's web browser. All images and other materials ("Content") that a user chooses to process with the Service are handled locally on their own device. We do not have servers that store user Content, and we have no access to it. Therefore, we are not a "service provider" in the traditional sense as it applies to hosting user-generated content under the DMCA.</p>

      <h2>2. Reporting Copyright Infringement</h2>
      <p>Because we do not host any Content, we are unable to process DMCA takedown notices. If you believe that your copyrighted work has been used in a way that constitutes copyright infringement, you must contact the individual or entity who is using your work. Canvas Crop is a tool, much like a word processor or photo editor, and is not responsible for the materials that users create or process with it.</p>

      <h2>3. Our Commitment</h2>
      <p>We do not condone copyright infringement. We encourage all users to respect the intellectual property rights of others and to only use content that they have the legal right to use and modify.</p>
    </LegalPage>
  );
}
