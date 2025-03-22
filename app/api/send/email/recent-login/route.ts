import RecentLoginEmail from '@/components/emails/recent-login';
import { ipToLocation } from '@/lib/ip-to-location';
import prismadb from '@/lib/prismadb';
import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { UAParser } from 'ua-parser-js';

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Handles a POST request to send a recent login notification email.
 *
 * This function parses the JSON body of the incoming request to extract the user's email, IP address, and user agent.
 * It then retrieves the user's name from the database based on the provided email. If any of these details are missing,
 * it returns a 400 error indicating an invalid request. Upon successful validation, it uses the user agent to determine
 * the operating system and browser, and obtains geolocation information from the IP address. Finally, it sends an email
 * notification about the recent login event using a React email template, returning the email sending result in a JSON response.
 *
 * @param req - The HTTP request containing the login notification details in its JSON body.
 * @returns A JSON response with the result of the email sending operation, or an error message with the corresponding HTTP status.
 */
export async function POST(req: Request) {
  try {
    const { email, ip, userAgent } = await req.json();

    const user = await prismadb.user.findUnique({
      where: {
        email,
      }
    });

    const name = user?.name;

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
