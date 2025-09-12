import { z } from "zod";

export type Severity = "critical" | "high" | "medium" | "low" | "unknown";

export const EmailEventSchema = z.object({
  subject: z.string().default("").optional(),
  from: z.string(),
  to: z.string(),
  cc: z.string().optional(),
  body: z.string().default("").optional(),
  messageId: z.string().optional(),
  headers: z.record(z.string()).optional(),
});
export type EmailEvent = z.infer<typeof EmailEventSchema>;

export interface ReplyAction {
  to: string;
  cc?: string[];
  subject: string;
  text: string;
}

export interface FollowUpPlan {
  inHours: number;
  reason: string;
}

export interface AutoReplyResult {
  severity: Severity;
  slaHours: number;
  initialReply: ReplyAction;
  followUps: FollowUpPlan[];
  escalate: boolean;
}

const KEYWORDS: Record<Severity, string[]> = {
  critical: [
    "rce",
    "remote code",
    "data leak",
    "prod credential",
    "private key",
    "ssrf",
    "supply chain",
  ],
  high: ["sql injection", "sqli", "xss", "csrf", "privilege escalation", "auth bypass"],
  medium: ["open redirect", "clickjacking", "dos", "rate limit", "insecure default"],
  low: ["info disclosure", "banner", "version", "typo"],
  unknown: [],
};

const SLAS: Record<Severity, number> = {
  critical: 24,
  high: 72,
  medium: 168,
  low: 336,
  unknown: 168,
};

function classifySeverity(input: string): Severity {
  const text = (input || "").toLowerCase();
  for (const s of ["critical", "high", "medium", "low"] as const) {
    if (KEYWORDS[s].some((k) => text.includes(k))) return s;
  }
  return "unknown";
}

function sanitizeForTemplate(_: string | undefined): string {
  // Do not reflect reporter content for safety; return empty string intentionally.
  return "";
}

export function generateInitialReply(evt: EmailEvent): ReplyAction {
  const severity = classifySeverity(`${evt.subject} ${evt.body}`);
  const sla = SLAS[severity];
  const to = evt.from;
  const subject = `[BrainSAIT Security] We received your report (ref: pending)`;
  const bodySafe = sanitizeForTemplate(evt.body);
  const text = [
    `Hello,`,
    ``,
    `Thank you for contacting BrainSAIT Security. We have received your report and begun triage.`,
    ``,
    `Reference: temporary (${evt.messageId ?? "n/a"}); severity (preliminary): ${severity.toUpperCase()}.`,
    `Acknowledgement SLA: within ${sla} hours. We will follow up with next steps or questions.`,
    ``,
    `Please avoid sharing PHI/PII or secrets over email. If needed, we can provide a secure channel and a PGP key.`,
    ``,
    `— BrainSAIT Security Team`,
  ].join("\n");
  const ccList = process.env.SECURITY_ESCALATE_TO?.split(",").map((s) => s.trim()).filter(Boolean);
  return {
    to,
    cc: ccList && ccList.length ? ccList : undefined,
    subject,
    text,
  };
}

export function planFollowUps(severity: Severity): FollowUpPlan[] {
  switch (severity) {
    case "critical":
      return [
        { inHours: 4, reason: "Initial triage update" },
        { inHours: 24, reason: "Mitigation or status" },
        { inHours: 72, reason: "Full remediation plan" },
      ];
    case "high":
      return [
        { inHours: 24, reason: "Triage update" },
        { inHours: 72, reason: "Mitigation or status" },
      ];
    case "medium":
      return [{ inHours: 72, reason: "Status update" }];
    case "low":
    case "unknown":
    default:
      return [{ inHours: 120, reason: "Status update" }];
  }
}

export function autoReply(evtInput: unknown): AutoReplyResult {
  const evt = EmailEventSchema.parse(evtInput);
  const severity = classifySeverity(`${evt.subject} ${evt.body}`);
  const slaHours = SLAS[severity];
  const initialReply = generateInitialReply(evt);
  const followUps = planFollowUps(severity);
  const escalate = severity === "critical" || severity === "high";
  return { severity, slaHours, initialReply, followUps, escalate };
}

// Helpers to integrate with providers (examples only; do not send automatically here).
export function buildSESSendEmailParams(result: AutoReplyResult) {
  const from = process.env.SECURITY_AUTOREPLY_FROM || "security@brainsait.com";
  return {
    Source: from,
    Destination: {
      ToAddresses: [result.initialReply.to],
      CcAddresses: result.initialReply.cc || [],
    },
    Message: {
      Subject: { Data: result.initialReply.subject },
      Body: { Text: { Data: result.initialReply.text } },
    },
  };
}

export function buildGmailSendPayload(result: AutoReplyResult) {
  const boundary = "simple-boundary";
  const from = process.env.SECURITY_AUTOREPLY_FROM || "security@brainsait.com";
  const raw = [
    `From: ${from}`,
    `To: ${result.initialReply.to}`,
    result.initialReply.cc && result.initialReply.cc.length ? `Cc: ${result.initialReply.cc.join(", ")}` : undefined,
    `Subject: ${result.initialReply.subject}`,
    `MIME-Version: 1.0`,
    `Content-Type: text/plain; charset=UTF-8`,
    ``,
    result.initialReply.text,
  ]
    .filter(Boolean)
    .join("\r\n");
  return { raw: Buffer.from(raw).toString("base64") };
}

