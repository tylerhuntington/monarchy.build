import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  MessageSquare,
  GitBranch,
  RotateCcw,
  Terminal,
} from "lucide-react";
import { CourtDemo } from "@/components/court-demo";
import { CopyButton } from "@/components/copy-button";
import { Crown } from "@/components/brand";
const clone = "git clone https://github.com/tylerhuntington/monarchy.git";
export default function Home() {
  return (
    <>
      <main id="main">
        <section className="hero page-width">
          <div className="hero-eyebrow">
            <span className="tiny-crown">
              <Crown size={14} />
            </span>{" "}
            AN OPEN-SOURCE COURT FOR CODING AGENTS
          </div>
          <h1>
            Keep calm.
            <br /> <span className="hero-second">DM the Queen.</span>
          </h1>
          <p className="hero-description">
            Rule an empire of coding agents through one conversation.
            <br className="desktop-break" /> You set the direction. The court
            takes care of the coordination.
          </p>
          <div className="hero-actions">
            <Link className="button button-primary" href="/docs/quickstart/">
              Start a court <ArrowRight size={16} />
            </Link>
            <a
              className="button button-secondary"
              href="https://github.com/tylerhuntington/monarchy"
            >
              Explore the source <ArrowUpRight size={15} />
            </a>
          </div>
          <p className="hero-note">
            Your agents. Your project. One place to talk.
          </p>
        </section>
        <section
          className="court-section page-width"
          aria-labelledby="court-heading"
        >
          <div className="section-kicker">
            <span id="court-heading">
              A little hierarchy. A lot less tab-hopping.
            </span>
            <span className="mono subtle">MEET THE ROYAL COURT</span>
          </div>
          <CourtDemo />
        </section>
        <section
          className="principles page-width"
          aria-label="How Monarchy helps"
        >
          <article>
            <MessageSquare size={20} />
            <h2>
              One conversation.
              <br /> The whole picture.
            </h2>
            <p>
              Ask for a fix. Check on a feature. Change your mind. It all goes
              to the Queen, so you can stop carrying messages between agents.
            </p>
            <Link href="/docs/how-it-works/">
              Meet your court <ArrowRight size={14} />
            </Link>
          </article>
          <article>
            <GitBranch size={20} />
            <h2>
              Delegate the work.
              <br /> Keep the decisions.
            </h2>
            <p>
              The Secretary handles assignments, follow-ups, and reviews.
              Results and decisions that need you come back to the throne for
              sign-off.
            </p>
            <Link href="/docs/skills/">
              See the skills <ArrowRight size={14} />
            </Link>
          </article>
          <article>
            <RotateCcw size={20} />
            <h2>
              New session.
              <br /> Same kingdom.
            </h2>
            <p>
              Even Queens run out of context. A checked handoff carries the
              goal, your decisions, and unfinished work into the next session.
            </p>
            <Link href="/docs/succession/">
              Pass the crown <ArrowRight size={14} />
            </Link>
          </article>
        </section>
        <section className="under-hood page-width">
          <div className="under-hood-copy">
            <span className="eyebrow">ORDER IN THE COURT</span>
            <h2>
              A crown is optional.
              <br /> A paper trail isn’t.
            </h2>
            <p>
              Monarchy gives agents a way to record assignments, surface
              decisions, and check what actually got done. Open the journal when
              you want the details. Stay with the Queen when you don’t.
            </p>
            <Link className="text-link" href="/docs/runtime/">
              Look under the hood <ArrowRight size={15} />
            </Link>
          </div>
          <div className="journal-preview">
            <div className="terminal-title">
              <Terminal size={15} />
              <span>THE COURT’S WORKING RECORD</span>
              <span className="example-label">Example</span>
            </div>
            <div className="journal-row">
              <span className="journal-symbol">↳</span>
              <div>
                <strong>Assignment</strong>
                <span>00-tests · reproduce the failing case</span>
              </div>
              <span className="journal-tag">scoped</span>
            </div>
            <div className="journal-row">
              <span className="journal-symbol">◇</span>
              <div>
                <strong>Decision</strong>
                <span>A change in scope needs your call</span>
              </div>
              <span className="journal-tag">to Queen</span>
            </div>
            <div className="journal-row">
              <span className="journal-symbol">✓</span>
              <div>
                <strong>Outcome</strong>
                <span>Checked result, with source evidence</span>
              </div>
              <span className="journal-tag">verified</span>
            </div>
            <div className="journal-foot">
              An explicit Python + SQLite runtime. No hidden daemon.
            </div>
          </div>
        </section>
        <section className="start-section page-width">
          <div>
            <span className="eyebrow">YOUR MOVE</span>
            <h2>
              A royal pain,
              <br /> meet a royal court.
            </h2>
            <p>Start with one project and one task. Build from there.</p>
            <Link className="button button-primary" href="/docs/quickstart/">
              Read the quickstart <ArrowRight size={16} />
            </Link>
          </div>
          <div className="start-code">
            <div className="clone-command">
              <span aria-hidden="true">$</span>
              <code>{clone}</code>
              <CopyButton text={clone} label="Copy clone command" />
            </div>
            <p>
              Instructions first. Runtime when you’re ready.
              <br />{" "}
              <Link href="/docs/limits/">
                Read what’s supported today <ArrowUpRight size={13} />
              </Link>
            </p>
          </div>
        </section>
      </main>
      <footer className="site-footer page-width">
        <Link className="brand" href="/">
          <Crown size={20} />
          <span>monarchy</span>
        </Link>
        <p>Keep calm and DM the Queen.</p>
        <div>
          <Link href="/docs/">Docs</Link>
          <a href="https://github.com/tylerhuntington/monarchy">GitHub ↗</a>
        </div>
      </footer>
    </>
  );
}
