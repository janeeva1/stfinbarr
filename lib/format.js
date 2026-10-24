export const fmtDate = (d, opts = { day: 'numeric', month: 'long', year: 'numeric' }) =>
  d ? new Date(d).toLocaleDateString('en-GB', opts) : '';
export const fmtTime = (d) => (d ? new Date(d).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : '');
export const fmtMoney = (n, cur = '₦') => `${cur}${Number(n || 0).toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
export const excerpt = (t = '', n = 140) => (t && t.length > n ? t.slice(0, n).trim() + '…' : t || '');
