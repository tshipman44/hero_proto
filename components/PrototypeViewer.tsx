"use client";

import { useState } from "react";
import PrototypeScreen from "@/components/PrototypeScreen";
import { STAGES } from "@/lib/constants";
import type { PrototypeSpec } from "@/lib/schema";

type PrototypeViewerProps = {
  prototype: PrototypeSpec["prototype"];
};

export default function PrototypeViewer({ prototype }: PrototypeViewerProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const screens = prototype.screens.slice(0, 4);
  const activeScreen = screens[activeIndex];

  function goNext() {
    setActiveIndex((current) => Math.min(current + 1, screens.length - 1));
  }

  function goBack() {
    setActiveIndex((current) => Math.max(current - 1, 0));
  }

  function handlePrimaryAction() {
    setActiveIndex((current) => (current >= screens.length - 1 ? 0 : current + 1));
  }

  return (
    <div className="prototype-viewer">
      <div className="prototype-toolbar">
        <div className="progress-track" aria-label="Hero's Journey stages">
          {STAGES.map((stage, index) => (
            <button
              aria-current={activeIndex === index ? "step" : undefined}
              className={activeIndex === index ? "progress-step active" : "progress-step"}
              key={stage.id}
              type="button"
              onClick={() => setActiveIndex(index)}
            >
              <span>{index + 1}</span>
              {stage.shortName}
            </button>
          ))}
        </div>

        <div className="prototype-nav">
          <button className="button button-secondary" disabled={activeIndex === 0} type="button" onClick={goBack}>
            Back
          </button>
          <button
            className="button button-secondary"
            disabled={activeIndex === screens.length - 1}
            type="button"
            onClick={goNext}
          >
            Next
          </button>
        </div>
      </div>

      <PrototypeScreen screen={activeScreen} screenIndex={activeIndex} onPrimaryAction={handlePrimaryAction} />

      <div className="transition-note">
        <span>Transition</span>
        <p>{activeScreen.transitionToNext}</p>
      </div>
    </div>
  );
}
