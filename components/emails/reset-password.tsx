import {
  Body,
  Button,
  Column,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Row,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface Props {
  userFirstName?: string;
  resetLink?: string;
  loginIp?: string;
}

export const ResetPasswordEmail = ({
  userFirstName,
  resetLink,
  loginIp,
}: Props) => {

  return (
    <Html>
      <Head />
      <Body style={main}>
        <Preview>Your password reset link...</Preview>
        <Container>
          {/* <Section style={logo}>
            <Img src="https://react-email-demo-qv38cga5x-resend.vercel.app/static/yelp-logo.png" />
          </Section> */}

          <Section style={content}>
            <Row>
              <Img
                style={image}
                width={620}
                src="https://react-email-demo-qv38cga5x-resend.vercel.app/static/yelp-header.png"
              />
            </Row>

            <Row style={{ ...boxInfos, paddingBottom: '0' }}>
              <Column>
                <Heading
                  style={{
                    fontSize: 32,
                    fontWeight: 'bold',
                    textAlign: 'center',
                  }}
                >
                  Hi {userFirstName},
                </Heading>
                <Heading
                  as="h2"
                  style={{
                    fontSize: 26,
                    fontWeight: 'bold',
                    textAlign: 'center',
                  }}
                >
                  you&apos;ve requested a password reset link
                </Heading>

                <Text style={paragraph}>
                  <b>Link: </b>
                  {resetLink}
                </Text>

                <Text style={paragraph}>
                  If this was you, click on the link to reset your password.
                </Text>
                <Text style={{ ...paragraph, marginTop: -5 }}>
                  If this wasn&apos;t you please ignore this email and enable 2fa.
                </Text>
              </Column>
            </Row>
          </Section>

          <Section style={containerImageFooter}>
            <Img
              style={image}
              width={620}
              src="https://react-email-demo-qv38cga5x-resend.vercel.app/static/yelp-footer.png"
            />
          </Section>

          <Text
            style={{
              textAlign: 'center',
              fontSize: 12,
              color: 'rgb(0,0,0, 0.7)',
            }}
          >
            © 2025 | APP_NAME | APP_WEBSITE
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default ResetPasswordEmail;

const main = {
  backgroundColor: '#fff',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const paragraph = {
  fontSize: 16,
};

const logo = {
  padding: '30px 20px',
};

const content = {
  border: '1px solid rgb(0,0,0, 0.1)',
  borderRadius: '3px',
  overflow: 'hidden',
};

const image = {
  maxWidth: '100%',
};

const boxInfos = {
  padding: '20px',
};

const containerImageFooter = {
  padding: '45px 0 0 0',
};
