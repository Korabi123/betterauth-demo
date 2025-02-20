import { Resend } from "resend";
import { ipToLocation } from "./ip-to-location";
import RecentLoginEmail from "@/components/emails/recent-login";
import { UAParser } from "ua-parser-js";

const resend = new Resend("re_Ge9VmW4H_5uJcrT5VpREdPhqJsrQTBkuL");
export const sendLoginEmail = async (userEmail: string, ip: string, userAgent: string) => {

  const geolocation = await ipToLocation(ip!);

  const ua = UAParser(userAgent);

  await resend.emails.send({
    from: 'no-reply@korabimeri.work.gd',
    to: userEmail,
    subject: 'Recent login to your APP_NAME account',
    react: RecentLoginEmail({
      userFirstName: userEmail,
      loginDate: new Date(),
      loginDevice: `${ua.browser.name} ${ua.device.model}`,
      loginLocation: `${geolocation.city}, ${geolocation.region}, ${geolocation.country_name}`,
      loginIp: geolocation.ip,
    }),
  })
}
