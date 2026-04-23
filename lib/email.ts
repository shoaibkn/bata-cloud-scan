import { Resend } from "resend";

import { env } from "@/lib/env";

type EmailInput = {
  email: string;
  subject: string;
  html: string;
  text: string;
};

let resendClient: Resend | null = null;

function getResendClient() {
  if (!env.resendApiKey) {
    return null;
  }

  resendClient ??= new Resend(env.resendApiKey);

  return resendClient;
}

export async function sendAuthEmail(input: EmailInput) {
  const resend = getResendClient();

  if (!resend || !env.resendFromEmail) {
    console.info("[auth-email:dev-fallback]", input.subject, input.email, input.text);
    return;
  }

  const { error } = await resend.emails.send({
    from: env.resendFromEmail,
    to: [input.email],
    subject: input.subject,
    html: input.html,
    text: input.text,
  });

  if (error) {
    throw new Error(`Failed to send auth email via Resend: ${error.message}`);
  }
}

export async function sendOnboardingEmail(input: EmailInput) {
  const resend = getResendClient();

  if (!resend || !env.resendFromEmail) {
    console.info("[onboarding-email:dev-fallback]", input.subject, input.email, input.text);
    return;
  }

  const { error } = await resend.emails.send({
    from: env.resendFromEmail,
    to: [input.email],
    subject: input.subject,
    html: input.html,
    text: input.text,
  });

  if (error) {
    throw new Error(`Failed to send onboarding email via Resend: ${error.message}`);
  }
}

export function buildOnboardingHtml(params: {
  tenantName: string;
  tenantSlug: string;
  siteHostname: string;
  scanHostname: string;
  agentToken: string;
  agentDownloadUrl: string;
}) {
  const { tenantName, tenantSlug, siteHostname, scanHostname, agentToken, agentDownloadUrl } = params;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Welcome to Lumin8 SVS</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  
  <div style="background: linear-gradient(135deg, #020617 0%, #030712 100%); padding: 24px; border-radius: 12px; margin-bottom: 24px;">
    <h1 style="color: #d0fcl00; margin: 0; font-size: 24px; letter-spacing: 0.1em;">LUMIN8 SVS</h1>
  </div>
  
  <h2 style="color: #1a1a1a;">Welcome, ${tenantName}!</h2>
  
  <p>Your Lumin8 SVS account is now active. Here is everything you need to get started with remote barcode scanning for Bata SVS ERP.</p>
  
  <div style="background: #f5f5f5; border-radius: 8px; padding: 16px; margin: 20px 0;">
    <h3 style="margin-top: 0; color: #1a1a1a;">Your Scanner Endpoint</h3>
    <p style="font-size: 18px; font-weight: bold; color: #059669; margin-bottom: 0;">
      ${scanHostname}:9100
    </p>
    <p style="font-size: 14px; color: #666; margin-top: 8px;">Use this address in your Android scanner settings.</p>
  </div>
  
  <div style="background: #f5f5f5; border-radius: 8px; padding: 16px; margin: 20px 0;">
    <h3 style="margin-top: 0; color: #1a1a1a;">Your Portal</h3>
    <p style="font-size: 14px; color: #666; margin-bottom: 0;">
      ${siteHostname}
    </p>
  </div>
  
  <h3 style="color: #1a1a1a;">Step 1: Download and Install the Agent</h3>
  <p>The Lumin8 Agent keeps your scanner endpoint updated automatically. Download it here:</p>
  <a href="${agentDownloadUrl}" style="display: inline-block; background: #059669; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; margin: 8px 0;">Download Lumin8 Agent</a>
  
  <h3 style="color: #1a1a1a;">Step 2: Configure the Agent</h3>
  <ol style="color: #444;">
    <li>Extract the downloaded zip file</li>
    <li>Open the <code>config.json</code> file in a text editor</li>
    <li>Paste your agent token:</li>
  </ol>
  <div style="background: #333; color: #d0fcl00; padding: 12px; border-radius: 4px; font-family: monospace; overflow-x: auto; margin: 12px 0;">
    <code style="font-size: 12px; color: #a0fcd0;">"AgentToken": "${agentToken}"</code>
  </div>
  <li>Save the file and run <code>Lumin8.Agent.exe</code></li>
  
  <h3 style="color: #1a1a1a;">Step 3: Configure Your Android Scanner</h3>
  <ol style="color: #444;">
    <li>Open your scanner settings</li>
    <li>Set the host to: <strong>${scanHostname}</strong></li>
    <li>Set the port to: <strong>9100</strong></li>
    <li>Save and test a scan</li>
  </ol>
  
  <div style="background: #fff3cd; border: 1px solid #ffc107; border-radius: 8px; padding: 16px; margin: 20px 0;">
    <h4 style="margin: 0 0 8px 0; color: #856404;">Important Notes</h4>
    <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #856404;">
      <li>Make sure your ERP reader service is running on port 9100</li>
      <li>If using a dynamic IP, keep the agent running at all times</li>
      <li>For static IPs, you can configure your scanner and close the agent</li>
      <li>Scanner endpoint is: ${scanHostname}:9100</li>
    </ul>
  </div>
  
  <p style="color: #666; font-size: 14px; margin-top: 24px;">
    Need help? Contact us at <a href="mailto:hello@lumin8.in">hello@lumin8.in</a>
  </p>
  
  <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">
  <p style="color: #999; font-size: 12px;">
    Lumin8 SVS is an independent scanner routing service for Bata SVS ERP users. We are not affiliated with Barcode India Private Limited.
  </p>
</body>
</html>`;
}

export function buildOnboardingText(params: {
  tenantName: string;
  tenantSlug: string;
  siteHostname: string;
  scanHostname: string;
  agentToken: string;
  agentDownloadUrl: string;
}) {
  const { tenantName, tenantSlug, siteHostname, scanHostname, agentToken, agentDownloadUrl } = params;

  return `
Welcome to Lumin8 SVS, ${tenantName}!

Your Lumin8 SVS account is now active. Here is everything you need to get started.

YOUR SCANNER ENDPOINT
${scanHostname}:9100

YOUR PORTAL
${siteHostname}

STEP 1: DOWNLOAD AND INSTALL THE AGENT
Download the Lumin8 Agent from: ${agentDownloadUrl}

The agent keeps your scanner endpoint updated automatically.

STEP 2: CONFIGURE THE AGENT
1. Extract the downloaded zip file
2. Open config.json and paste your agent token:
   "AgentToken": "${agentToken}"
3. Save the file
4. Run Lumin8.Agent.exe

STEP 3: CONFIGURE YOUR ANDROID SCANNER
1. Open your scanner settings
2. Set the host to: ${scanHostname}
3. Set the port to: 9100
4. Save and test a scan

IMPORTANT NOTES
- Make sure your ERP reader service is running on port 9100
- If using a dynamic IP, keep the agent running at all times
- For static IPs, you can close the agent after configuration

Need help? Contact us at hello@lumin8.in

---
Lumin8 SVS is an independent scanner routing service for Bata SVS ERP users.
We are not affiliated with Barcode India Private Limited.
`.trim();
}