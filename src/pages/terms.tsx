import { NextPage } from "next";
import React from "react";

import { Footer } from "~/components/layout/Footer";
import { Navbar } from "~/components/layout/Navbar";
import { Container } from "~/components/ui/Container";
import * as Copy from "~/components/ui/Copy";

const Terms: NextPage = () => {
  return (
    <div className="absolute h-full w-full overflow-y-scroll z-50 text-lg text-gray-900">
      <Navbar />

      <Container dense>
        <div>
          <Copy.Title>Website Terms and Conditions of Use</Copy.Title>

          <Copy.Subtitle>1. Terms</Copy.Subtitle>

          <Copy.Paragraph>
            By accessing this Website, accessible from pelica.co, you are agreeing to be bound by these Website Terms
            and Conditions of Use and agree that you are responsible for the agreement with any applicable local laws.
            If you disagree with any of these terms, you are prohibited from accessing this site. The materials
            contained in this Website are protected by copyright and trade mark law.
          </Copy.Paragraph>

          <Copy.Subtitle>2. Use License</Copy.Subtitle>

          <Copy.Paragraph>
            Permission is granted to temporarily download one copy of the materials on Pelica Labs's Website for
            personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title,
            and under this license you may not:
          </Copy.Paragraph>

          <Copy.List>
            <li>modify or copy the materials;</li>
            <li>use the materials for any commercial purpose or for any public display;</li>
            <li>attempt to reverse engineer any software contained on Pelica Labs's Website;</li>
            <li>remove any copyright or other proprietary notations from the materials; or</li>
            <li>transferring the materials to another person or "mirror" the materials on any other server.</li>
          </Copy.List>

          <Copy.Paragraph>
            This will let Pelica Labs to terminate upon violations of any of these restrictions. Upon termination, your
            viewing right will also be terminated and you should destroy any downloaded materials in your possession
            whether it is printed or electronic format. These Terms of Service has been created with the help of the{" "}
            <Copy.Link href="https://www.termsofservicegenerator.net">Terms Of Service Generator</Copy.Link> and the{" "}
            <Copy.Link href="https://www.generateprivacypolicy.com">Privacy Policy Generator</Copy.Link>.
          </Copy.Paragraph>

          <Copy.Subtitle>3. Disclaimer</Copy.Subtitle>

          <Copy.Paragraph>
            All the materials on Pelica Labs’s Website are provided "as is". Pelica Labs makes no warranties, may it be
            expressed or implied, therefore negates all other warranties. Furthermore, Pelica Labs does not make any
            representations concerning the accuracy or reliability of the use of the materials on its Website or
            otherwise relating to such materials or any sites linked to this Website.
          </Copy.Paragraph>

          <Copy.Subtitle>4. Limitations</Copy.Subtitle>

          <Copy.Paragraph>
            Pelica Labs or its suppliers will not be hold accountable for any damages that will arise with the use or
            inability to use the materials on Pelica Labs’s Website, even if Pelica Labs or an authorize representative
            of this Website has been notified, orally or written, of the possibility of such damage. Some jurisdiction
            does not allow limitations on implied warranties or limitations of liability for incidental damages, these
            limitations may not apply to you.
          </Copy.Paragraph>

          <Copy.Subtitle>5. Revisions and Errata</Copy.Subtitle>

          <Copy.Paragraph>
            The materials appearing on Pelica Labs’s Website may include technical, typographical, or photographic
            errors. Pelica Labs will not promise that any of the materials in this Website are accurate, complete, or
            current. Pelica Labs may change the materials contained on its Website at any time without notice. Pelica
            Labs does not make any commitment to update the materials.
          </Copy.Paragraph>

          <Copy.Subtitle>6. Links</Copy.Subtitle>

          <Copy.Paragraph>
            Pelica Labs has not reviewed all of the sites linked to its Website and is not responsible for the contents
            of any such linked site. The presence of any link does not imply endorsement by Pelica Labs of the site. The
            use of any linked website is at the user’s own risk.
          </Copy.Paragraph>

          <Copy.Subtitle>7. Site Terms of Use Modifications</Copy.Subtitle>

          <Copy.Paragraph>
            Pelica Labs may revise these Terms of Use for its Website at any time without prior notice. By using this
            Website, you are agreeing to be bound by the current version of these Terms and Conditions of Use.
          </Copy.Paragraph>

          <Copy.Subtitle>8. Your Privacy</Copy.Subtitle>

          <Copy.Paragraph>Please read our Privacy Policy.</Copy.Paragraph>

          <Copy.Subtitle>9. Governing Law</Copy.Subtitle>

          <Copy.Paragraph>
            Any claim related to Pelica Labs's Website shall be governed by the laws of fr without regards to its
            conflict of law provisions.
          </Copy.Paragraph>
        </div>
      </Container>

      <Footer />
    </div>
  );
};

export default Terms;
