import { Link } from 'react-router';
import { SmallText } from '../../imports/UIComponents';
import imgImageRedHat from '@/assets/704f152a63b0b4badd89509f0db23ae863ffdf9b.png';

const JIRA_URL = 'https://redhat.atlassian.net/browse/HPUX-1363';
/** Matches the floating home button / conceptual label accent */
const PROTOTYPE_PINK = '#FF13F0';

/** Set to the calendar day this file (or the prototype) was last meaningfully updated (YYYY-MM-DD). */
const LAST_UPDATED_ISO = '2026-04-23';

function formatLastUpdated(iso: string) {
  const d = new Date(`${iso}T12:00:00`);
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'long' }).format(d);
}

export function TitlePage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center p-8">
      <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-6 px-1 text-center sm:px-0">
        <img
          alt="Red Hat"
          className="size-16 object-contain"
          src={imgImageRedHat}
        />
        <div className="w-full">
          <h1
            className="mb-3 text-balance text-center text-3xl sm:text-4xl"
            style={{
              fontFamily: 'var(--font-family-display)',
              fontWeight: 'var(--font-weight-bold)',
              lineHeight: 1.15,
            }}
          >
            Red Hat OpenShift Management Engine
          </h1>
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center">
            <p
              className="text-balance m-0"
              style={{
                fontFamily: 'var(--font-family-display)',
                fontSize: 'var(--text-lg)',
                fontWeight: 'var(--font-weight-medium)',
                color: 'var(--muted-foreground)',
              }}
            >
              Prototype console
            </p>
            <a
              href={JIRA_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline shrink-0"
              style={{
                fontFamily: 'var(--font-family-display)',
                fontSize: 'var(--text-lg)',
                fontWeight: 'var(--font-weight-medium)',
              }}
            >
              (HPUX-1363)
            </a>
          </div>
        </div>
        <div className="flex w-full flex-col gap-3 text-center">
          <p
            className="m-0 text-muted-foreground"
            style={{
              fontFamily: 'var(--font-family-text)',
              fontSize: 'var(--text-base)',
              lineHeight: 1.5,
            }}
          >
            Created by Joy Jean &amp; Peter Kreuser - OpenShift UXD
          </p>
          <SmallText muted className="m-0 text-center">
            Last updated: {formatLastUpdated(LAST_UPDATED_ISO)}
          </SmallText>
          <p
            className="m-0 max-w-none text-center"
            style={{
              fontFamily: 'var(--font-family-text)',
              fontSize: 'var(--text-sm)',
              lineHeight: 1.5,
              color: PROTOTYPE_PINK,
            }}
          >
            These designs are exploratory concepts only and are not intended for
            implementation.
          </p>
        </div>

        <div className="flex justify-center">
          <div className="inline-flex flex-col gap-3">
          <Link
            to="/overview"
            className="flex justify-center px-5 py-2.5 bg-primary text-primary-foreground hover:opacity-90 transition-opacity whitespace-nowrap"
            style={{
              fontFamily: 'var(--font-family-text)',
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-weight-medium)',
              borderRadius: 'var(--radius)',
              textDecoration: 'none',
            }}
          >
            Enter console
          </Link>
          <Link
            to="/day-one/terminal"
            className="flex justify-center px-5 py-2.5 border border-border bg-background text-foreground hover:bg-muted/80 transition-colors whitespace-nowrap"
            style={{
              fontFamily: 'var(--font-family-text)',
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-weight-medium)',
              borderRadius: 'var(--radius)',
              textDecoration: 'none',
            }}
          >
            View day 1 interactions
          </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
