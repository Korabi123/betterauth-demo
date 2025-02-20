import RecentLoginEmail from '@/components/emails/recent-login';
import { ipToLocation } from '@/lib/ip-to-location';
import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { UAParser } from 'ua-parser-js';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { body } = await req.json();
    const { email, ip, userAgent, name } = body;

    if (!email || !ip || !userAgent || !name) {
      return new NextResponse("Invalid request", { status: 400 });
    }

    const ua = UAParser(userAgent);
    const geolocation = await ipToLocation(ip!);

    const { data, error } = await resend.emails.send({
      from: 'no-reply@korabimeri.work.gd',
      to: [email],
      subject: 'Recent login to your APP_NAME account',
      react: RecentLoginEmail({
        userFirstName: name,
        loginDate: new Date(),
        loginDevice: `${ua.os.name}, ${ua.browser.name}`,
        loginLocation: `${geolocation.city}, ${geolocation.country_name}`,
        loginIp: ip,
      }),
    });

    if (error) {
      return Response.json({ error }, { status: 500 });
    }

    return Response.json(data);
  } catch (error) {
    console.error(error);
    return Response.json({ error }, { status: 500 });
  }
}
