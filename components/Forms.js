'use client';
import { useState } from 'react';
import Link from 'next/link';

function Consent() {
  return (
    <label className="consent">
      <input type="checkbox" name="consent" value="yes" required />
      <span>I agree that the parish may use these details to respond to my request, as described in the <Link href="/privacy" target="_blank">Privacy Notice</Link>.</span>
    </label>
  );
}

function useSubmit(url) {
  const [state, setState] = useState({ busy: false, ok: '', err: '' });
  const submit = async (e, okMsg) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    setState({ busy: true, ok: '', err: '' });
    const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    const j = await r.json().catch(() => ({}));
    if (r.ok) { form.reset(); setState({ busy: false, ok: okMsg, err: '' }); }
    else setState({ busy: false, ok: '', err: j.error || 'Something went wrong' });
  };
  return [state, submit];
}

export function ContactForm({ defaultType = 'Contact' }) {
  const [st, submit] = useSubmit('/api/public/message');
  return (
    <form className="form" onSubmit={(e) => submit(e, 'Thank you! Your message has been received. God bless you.')}>
      <label className="f">I am sending a
        <select name="type" className="input" defaultValue={defaultType}>
          <option>Contact</option><option>Prayer Request</option><option>Volunteer</option>
        </select>
      </label>
      <div className="row2">
        <label className="f">Your name<input name="name" className="input" placeholder="Full name" /></label>
        <label className="f">Phone<input name="phone" className="input" placeholder="+234…" /></label>
      </div>
      <div className="row2">
        <label className="f">Email<input name="email" type="email" className="input" placeholder="you@example.com" /></label>
        <label className="f">Subject<input name="subject" className="input" /></label>
      </div>
      <label className="f">Message / Prayer intention<textarea name="message" rows={5} className="input" required /></label>
      <Consent />
      {st.ok && <div className="alert ok">{st.ok}</div>}{st.err && <div className="alert err">{st.err}</div>}
      <button className="btn btn-primary" disabled={st.busy}>{st.busy ? 'Sending…' : 'Send Message'}</button>
    </form>
  );
}

export function IntentionForm() {
  const [st, submit] = useSubmit('/api/public/intention');
  return (
    <form className="form" onSubmit={(e) => submit(e, 'Your Mass intention has been received. The parish office will confirm the date with you.')}>
      <div className="row2">
        <label className="f">Requested by *<input name="requested_by" className="input" required /></label>
        <label className="f">Phone<input name="phone" className="input" /></label>
      </div>
      <div className="row2">
        <label className="f">Type
          <select name="intention_type" className="input">
            <option>Thanksgiving</option><option>Repose of Soul</option><option>Special Intention</option><option>Birthday</option><option>Anniversary</option><option>Healing</option>
          </select>
        </label>
        <label className="f">Preferred date<input type="date" name="mass_date" className="input" /></label>
      </div>
      <label className="f">Intention *<textarea name="intention" rows={3} className="input" required placeholder="e.g. For the repose of the soul of…" /></label>
      <Consent />
      {st.ok && <div className="alert ok">{st.ok}</div>}{st.err && <div className="alert err">{st.err}</div>}
      <button className="btn btn-accent" disabled={st.busy}>{st.busy ? 'Sending…' : 'Book Mass Intention'}</button>
    </form>
  );
}

export function SacramentForm({ options, initial }) {
  const [st, submit] = useSubmit('/api/public/message');
  return (
    <form className="form" onSubmit={(e) => submit(e, 'Thank you! The parish office has received your registration and will contact you.')}>
      <input type="hidden" name="type" value="Sacrament Registration" />
      <label className="f">Sacrament *
        <select name="subject" className="input" defaultValue={options.includes(initial) ? initial : options[0]} required>{options.map((o) => <option key={o}>{o}</option>)}</select>
      </label>
      <div className="row2">
        <label className="f">Your name *<input name="name" className="input" required /></label>
        <label className="f">Phone *<input name="phone" className="input" required /></label>
      </div>
      <label className="f">Email<input name="email" type="email" className="input" /></label>
      <label className="f">Details *<textarea name="message" rows={4} className="input" required placeholder="Name of the candidate(s), age / date of birth, preferred date, and any questions" /></label>
      <Consent />
      {st.ok && <div className="alert ok">{st.ok}</div>}{st.err && <div className="alert err">{st.err}</div>}
      <button className="btn btn-primary" disabled={st.busy}>{st.busy ? 'Sending…' : 'Send Registration'}</button>
    </form>
  );
}
