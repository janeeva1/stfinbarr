import { NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import { RESOURCES, canAccess, labelFor } from '@/lib/resources';
import { query } from '@/lib/db';
import { todayLocal } from '@/lib/readings';

const cell = (v) => {
  if (v === null || v === undefined) return '';
  const s = v instanceof Date ? v.toISOString() : String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

// Download any admin list as a CSV file (opens in Excel / Google Sheets)
export async function GET(_req, { params }) {
  const user = await getUser();
  const res = RESOURCES[params.resource];
  if (!user || !res || !canAccess(user.role, params.resource)) return NextResponse.json({ error: 'No access' }, { status: 403 });
  const cols = ['id', ...Object.keys(res.fields).filter((k) => res.fields[k].type !== 'password' && !res.fields[k].hidden)];
  const rows = await query(`SELECT ${cols.join(',')} FROM ${params.resource} ORDER BY ${res.order}`);
  const csv = '﻿' + [cols.map((c) => cell(c === 'id' ? 'ID' : labelFor(c, res.fields[c]))).join(','), ...rows.map((r) => cols.map((c) => cell(r[c])).join(','))].join('\r\n');
  return new Response(csv, { headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="${params.resource}-${todayLocal()}.csv"` } });
}
