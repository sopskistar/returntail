import type { Metadata } from 'next';
import Link from 'next/link';
import { Header, Footer } from '@/components/shell';
import { BreakItLab, InvariantEvidence } from '@/components/break-it-lab';
export const metadata: Metadata = { title: 'Break It Lab — read-only security checks', description: 'Inspect real unauthenticated API responses and source-backed refund safeguards. No funds move.' };
export default function Lab() { return <><Header /><main id="main" className="container lab-main"><div className="lab-intro"><h1>Break It Lab.</h1><p className="lead">Trust needs something you can inspect.</p><p>Run focused, read-only probes against this application. Check the boundary between public readiness and private purchase records, then inspect the tests behind the refund safeguards.</p><div className="lab-scope">No wallet connection. No signing. No payment or refund writes.</div></div><BreakItLab /><InvariantEvidence /><p className="lab-return"><Link className="text-link" href="/guide">Follow the refund journey</Link></p></main><Footer /></>; }
