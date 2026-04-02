import { onSchedule } from 'firebase-functions/v2/scheduler';
import { onCall } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import { Resend } from 'resend';
import * as admin from 'firebase-admin';

admin.initializeApp();
const db = admin.firestore();
const RESEND_API_KEY = defineSecret('RESEND_API_KEY');

const COLLECTIONS = {
  parents: 'parents',
  children: 'children',
  progress: 'progressLogs',
  alerts: 'emotionAlerts',
};

const TEST_EMAIL = 'keithpavia79@gmail.com';

function msFromFirestore(value: any): number {
  if (!value) return 0;
  if (typeof value === 'number') return value;
  if (value.seconds) return value.seconds * 1000;
  if (typeof value.toDate === 'function') return value.toDate().getTime();
  return 0;
}

function startOfDayMs(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x.getTime();
}

function endOfDayMs(d: Date) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x.getTime();
}

async function findParentByEmail(email: string) {
  const parentsRef = db.collection(COLLECTIONS.parents);
  const fields = ['email', 'authEmail', 'registeredEmail'];

  for (const field of fields) {
    const snap = await parentsRef.where(field, '==', email).limit(1).get();
    if (!snap.empty) {
      const doc = snap.docs[0];
      return { id: doc.id, data: doc.data() as any };
    }
  }

  throw new Error(`No parent found for email: ${email}`);
}

async function getChildrenForParent(parentId: string) {
  const qs = await db.collection(COLLECTIONS.children).where('parentId', '==', parentId).get();
  return qs.docs.map((d) => ({ id: d.id, ...d.data() })) as any[];
}

async function getLogsForChildRange(childId: string, startMs: number, endMs: number) {
  const qs = await db.collection(COLLECTIONS.progress).where('childId', '==', childId).get();
  return qs.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .filter((x) => {
      const ms = msFromFirestore((x as any).createdAt);
      return ms >= startMs && ms <= endMs;
    });
}

async function getAlertsForChildRange(childId: string, startMs: number, endMs: number) {
  const qs = await db.collection(COLLECTIONS.alerts).where('childId', '==', childId).get();
  return qs.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .filter((x) => {
      const ms = msFromFirestore((x as any).createdAt);
      return ms >= startMs && ms <= endMs;
    });
}

function buildHtmlEmail(parentName: string, reportDate: Date, summaries: any[]) {
  const dateLabel = reportDate.toLocaleDateString('en-GB', {
    dateStyle: 'full',
    timeZone: 'Europe/Malta',
  });

  return `
    <div style="font-family:Arial,sans-serif;padding:20px;">
      <h1>AutiApp Daily Report</h1>
      <p>${dateLabel}</p>
      <p>Hello ${parentName || 'Parent'}, here is your report.</p>
      ${summaries.map((s) => `
        <hr/>
        <h2>${s.childName}</h2>
        <p>Activities: ${s.activitiesToday}</p>
        <p>Warnings: ${s.alertsToday.length}</p>
        <p>Average Score: ${s.avgScoreToday ?? 'n/a'}%</p>
      `).join('')}
    </div>
  `;
}

async function sendDailyReportForEmail(email: string) {
  const parent = await findParentByEmail(email);
  const parentId = parent.id;
  const parentName = parent.data.displayName || parent.data.name || 'Parent';
  const now = new Date();

  const children = await getChildrenForParent(parentId);

  const summaries = await Promise.all(
    children.map(async (child) => {
      const todayLogs = await getLogsForChildRange(child.id, startOfDayMs(now), endOfDayMs(now));
      const alerts = await getAlertsForChildRange(child.id, startOfDayMs(now), endOfDayMs(now));

      const scored = todayLogs.filter(
        (x: any) => typeof x?.score === 'number' && typeof x?.total === 'number' && x.total > 0
      );

      const avgScoreToday =
        scored.length > 0
          ? Math.round(
              scored.reduce((sum: number, x: any) => sum + (x.score / x.total) * 100, 0) / scored.length
            )
          : null;

      return {
        childName: child.displayName || 'Child',
        activitiesToday: todayLogs.length,
        alertsToday: alerts,
        avgScoreToday,
      };
    })
  );

  const html = buildHtmlEmail(parentName, now, summaries);
  const resend = new Resend(RESEND_API_KEY.value());

  const response = await resend.emails.send({
    from: 'AutiApp Reports <onboarding@resend.dev>',
    to: email,
    subject: 'AutiApp Daily Report',
    html,
  });

  console.log('RESEND RESPONSE:', JSON.stringify(response));
  return { email, response };
}

export const sendDailyReportNow = onCall(
  {
    secrets: [RESEND_API_KEY],
    region: 'europe-west1',
  },
  async () => {
    return await sendDailyReportForEmail(TEST_EMAIL);
  }
);

export const sendScheduledDailyReports = onSchedule(
  {
    schedule: 'every day 20:00',
    timeZone: 'Europe/Malta',
    secrets: [RESEND_API_KEY],
    region: 'europe-west1',
  },
  async () => {
    try {
      await sendDailyReportForEmail(TEST_EMAIL);
    } catch (e) {
      console.error('SCHEDULED REPORT ERROR:', e);
    }
  }
);
