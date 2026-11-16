"use client";

import { useId, useRef, useState, type KeyboardEvent } from "react";
import {
  ArrowDown,
  ArrowUpRight,
  Check,
  Crown,
  FileCheck2,
  GitPullRequest,
  MessageSquare,
  ShieldCheck,
  ListChecks,
} from "lucide-react";
import "./court-demo.css";

const scenarios = [
  {
    id: "fix",
    label: "Fix a bug",
    request: "Fix the CSV export and prepare a PR.",
    queen: "Keep the request in view",
    secretary: "Assign the fix. Arrange a fresh review.",
    agents: [
      { name: "00-fix", job: "Find and fix the bug" },
      { name: "00-tests", job: "Check the export" },
      { name: "00-review", job: "Review the change" },
    ],
    result:
      "The fix is ready for review. Here’s what changed, what passed, and the PR.",
    note: "A behavior change outside your brief? That comes back to you first.",
    receipt: "Reviewed work + evidence",
  },
  {
    id: "feature",
    label: "Plan a feature",
    request: "Let people save their favorite searches.",
    queen: "Keep the goal in view",
    secretary: "Gather the context. Compare approaches.",
    agents: [
      { name: "00-research", job: "Read the codebase" },
      { name: "00-design", job: "Work through the flow" },
      { name: "00-review", job: "Check the proposal" },
    ],
    result:
      "Here’s the proposed flow. One choice needs your call: private favorites or shared lists?",
    note: "You make the call once. The Secretary carries your answer into the work.",
    receipt: "A decision worth your time",
  },
  {
    id: "handoff",
    label: "Pass the crown",
    request: "Pick this up in a fresh session.",
    queen: "Same request. Fresh context.",
    secretary: "Prepare the handoff. Verify the successor.",
    agents: [
      { name: "00-records", job: "Preserve the evidence" },
      { name: "00-audit", job: "Check unfinished work" },
      { name: "00-review", job: "Verify the handoff" },
    ],
    result:
      "The handoff is checked and the successor has accepted ownership. Your open decisions are still open.",
    note: "A supervised handoff keeps ownership clear. It doesn’t grant new authority.",
    receipt: "Context + accountable ownership",
  },
] as const;

/** An illustrative walkthrough of the agents, not a live agent dashboard. */
export function CourtDemo() {
  const [selected, setSelected] = useState(0);
  const id = useId();
  const tabs = useRef<Array<HTMLButtonElement | null>>([]);
  const scenario = scenarios[selected];

  function onTabKey(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next: number;
    if (event.key === "ArrowRight") next = (index + 1) % scenarios.length;
    else if (event.key === "ArrowLeft")
      next = (index + scenarios.length - 1) % scenarios.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = scenarios.length - 1;
    else return;
    event.preventDefault();
    setSelected(next);
    tabs.current[next]?.focus();
  }

  return (
    <div className="court-demo">
      <div className="court-demo-toolbar">
        <span className="court-demo-label">
          <span aria-hidden="true" /> An example, from request to result
        </span>
        <div
          className="court-demo-tabs"
          role="tablist"
          aria-label="Explore how your agents work"
        >
          {scenarios.map((item, index) => (
            <button
              key={item.id}
              ref={(element) => {
                tabs.current[index] = element;
              }}
              id={`${id}-tab-${item.id}`}
              aria-controls={`${id}-panel`}
              role="tab"
              aria-selected={selected === index}
              tabIndex={selected === index ? 0 : -1}
              onClick={() => setSelected(index)}
              onKeyDown={(event) => onTabKey(event, index)}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div
        className="court-demo-panel"
        id={`${id}-panel`}
        role="tabpanel"
        aria-labelledby={`${id}-tab-${scenario.id}`}
        tabIndex={0}
      >
        <div className="court-demo-scene" key={scenario.id}>
          <div className="court-demo-request">
            <span className="court-demo-you">You</span>
            <p>{scenario.request}</p>
            <ArrowUpRight size={15} strokeWidth={1.5} aria-hidden="true" />
          </div>
          <div
            className="court-demo-stem court-demo-stem-first"
            aria-hidden="true"
          />

          <div className="court-demo-queen">
            <div className="court-demo-queen-mark">
              <Crown size={21} strokeWidth={1.5} aria-hidden="true" />
            </div>
            <div>
              <span className="court-demo-node-name">The Queen</span>
              <span className="court-demo-node-detail">{scenario.queen}</span>
            </div>
            <MessageSquare
              size={16}
              strokeWidth={1.5}
              className="court-demo-queen-chat"
              aria-hidden="true"
            />
          </div>

          <div className="court-demo-delegation">
            <div className="court-demo-stem" aria-hidden="true" />
            <span>Behind the scenes</span>
            <div className="court-demo-stem" aria-hidden="true" />
          </div>
          <div className="court-demo-secretary">
            <FileCheck2 size={17} strokeWidth={1.5} aria-hidden="true" />
            <div>
              <span className="court-demo-node-name">The Secretary</span>
              <span className="court-demo-node-detail">
                {scenario.secretary}
              </span>
            </div>
          </div>
          <div className="court-demo-branches" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <ul className="court-demo-agents" aria-label="Specialist 00 Agents">
            {scenario.agents.map((agent, index) => (
              <li key={agent.name}>
                <span className="court-demo-agent-icon" aria-hidden="true">
                  {index === 0 ? (
                    <GitPullRequest size={17} strokeWidth={1.5} />
                  ) : index === 1 ? (
                    <ListChecks size={17} strokeWidth={1.5} />
                  ) : (
                    <ShieldCheck size={17} strokeWidth={1.5} />
                  )}
                </span>
                <span className="court-demo-agent-name">{agent.name}</span>
                <span className="court-demo-agent-job">{agent.job}</span>
              </li>
            ))}
          </ul>
        </div>

        <div
          className="court-demo-return"
          aria-live="polite"
          aria-atomic="true"
        >
          <div className="court-demo-return-heading">
            <span>
              <ArrowDown size={13} strokeWidth={1.5} aria-hidden="true" /> Back
              in your conversation
            </span>
            <span className="court-demo-receipt">
              <Check size={12} strokeWidth={1.5} aria-hidden="true" />{" "}
              {scenario.receipt}
            </span>
          </div>
          <p>{scenario.result}</p>
          <span className="court-demo-return-note">{scenario.note}</span>
        </div>
      </div>
    </div>
  );
}
