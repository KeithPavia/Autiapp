"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendScheduledDailyReports = exports.sendDailyReportNow = void 0;
const scheduler_1 = require("firebase-functions/v2/scheduler");
const https_1 = require("firebase-functions/v2/https");
const params_1 = require("firebase-functions/params");
const resend_1 = require("resend");
const admin = __importStar(require("firebase-admin"));
admin.initializeApp();
const db = admin.firestore();
const RESEND_API_KEY = (0, params_1.defineSecret)('RESEND_API_KEY');
const COLLECTIONS = {
    parents: 'parents',
    children: 'children',
    progress: 'progressLogs',
    alerts: 'emotionAlerts',
};
const TEST_EMAIL = 'keithpavia79@gmail.com';
function msFromFirestore(value) {
    if (!value)
        return 0;
    if (typeof value === 'number')
        return value;
    if (value.seconds)
        return value.seconds * 1000;
    if (typeof value.toDate === 'function')
        return value.toDate().getTime();
    return 0;
}
function startOfDayMs(d) {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x.getTime();
}
function endOfDayMs(d) {
    const x = new Date(d);
    x.setHours(23, 59, 59, 999);
    return x.getTime();
}
async function findParentByEmail(email) {
    const parentsRef = db.collection(COLLECTIONS.parents);
    const fields = ['email', 'authEmail', 'registeredEmail'];
    for (const field of fields) {
        const snap = await parentsRef.where(field, '==', email).limit(1).get();
        if (!snap.empty) {
            const doc = snap.docs[0];
            return { id: doc.id, data: doc.data() };
        }
    }
    throw new Error(`No parent found for email: ${email}`);
}
async function getChildrenForParent(parentId) {
    const qs = await db.collection(COLLECTIONS.children).where('parentId', '==', parentId).get();
    return qs.docs.map((d) => ({ id: d.id, ...d.data() }));
}
async function getLogsForChildRange(childId, startMs, endMs) {
    const qs = await db.collection(COLLECTIONS.progress).where('childId', '==', childId).get();
    return qs.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((x) => {
        const ms = msFromFirestore(x.createdAt);
        return ms >= startMs && ms <= endMs;
    });
}
async function getAlertsForChildRange(childId, startMs, endMs) {
    const qs = await db.collection(COLLECTIONS.alerts).where('childId', '==', childId).get();
    return qs.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((x) => {
        const ms = msFromFirestore(x.createdAt);
        return ms >= startMs && ms <= endMs;
    });
}
function buildHtmlEmail(parentName, reportDate, summaries) {
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
async function sendDailyReportForEmail(email) {
    const parent = await findParentByEmail(email);
    const parentId = parent.id;
    const parentName = parent.data.displayName || parent.data.name || 'Parent';
    const now = new Date();
    const children = await getChildrenForParent(parentId);
    const summaries = await Promise.all(children.map(async (child) => {
        const todayLogs = await getLogsForChildRange(child.id, startOfDayMs(now), endOfDayMs(now));
        const alerts = await getAlertsForChildRange(child.id, startOfDayMs(now), endOfDayMs(now));
        const scored = todayLogs.filter((x) => typeof x?.score === 'number' && typeof x?.total === 'number' && x.total > 0);
        const avgScoreToday = scored.length > 0
            ? Math.round(scored.reduce((sum, x) => sum + (x.score / x.total) * 100, 0) / scored.length)
            : null;
        return {
            childName: child.displayName || 'Child',
            activitiesToday: todayLogs.length,
            alertsToday: alerts,
            avgScoreToday,
        };
    }));
    const html = buildHtmlEmail(parentName, now, summaries);
    const resend = new resend_1.Resend(RESEND_API_KEY.value());
    const response = await resend.emails.send({
        from: 'AutiApp Reports <onboarding@resend.dev>',
        to: email,
        subject: 'AutiApp Daily Report',
        html,
    });
    console.log('RESEND RESPONSE:', JSON.stringify(response));
    return { email, response };
}
exports.sendDailyReportNow = (0, https_1.onCall)({
    secrets: [RESEND_API_KEY],
    region: 'europe-west1',
}, async () => {
    return await sendDailyReportForEmail(TEST_EMAIL);
});
exports.sendScheduledDailyReports = (0, scheduler_1.onSchedule)({
    schedule: 'every day 20:00',
    timeZone: 'Europe/Malta',
    secrets: [RESEND_API_KEY],
    region: 'europe-west1',
}, async () => {
    try {
        await sendDailyReportForEmail(TEST_EMAIL);
    }
    catch (e) {
        console.error('SCHEDULED REPORT ERROR:', e);
    }
});
