import PrototypeViewer from "@/components/PrototypeViewer";
import type { PrototypeSpec } from "@/lib/schema";

type GeneratedResultContentProps = {
  spec: PrototypeSpec;
};

export default function GeneratedResultContent({ spec }: GeneratedResultContentProps) {
  return (
    <div className="focused-result">
      <section className="explanation-dashboard" aria-labelledby="explanation-title">
        <div className="explanation-intro">
          <div>
            <p className="eyebrow">The idea in one view</p>
            <h2 id="explanation-title">{spec.overallConcept}</h2>
          </div>
          <span className="confidence-badge">{Math.round(spec.confidence * 100)}% confidence</span>
        </div>

        <div className="explanation-facts">
          <div>
            <span>Who it is for</span>
            <p>{spec.inferredUser}</p>
          </div>
          <div>
            <span>What they need</span>
            <p>{spec.inferredUserGoal}</p>
          </div>
          <div>
            <span>How it helps</span>
            <p>{spec.interpretationSummary}</p>
          </div>
        </div>

        <div className="journey-summary" aria-label="Journey interpretation">
          {spec.stageInterpretations.map((stage, index) => (
            <article key={stage.stage}>
              <span>{index + 1}</span>
              <div>
                <h3>{stage.stage}</h3>
                <p>{stage.inferredMeaning}</p>
              </div>
            </article>
          ))}
        </div>

        <details className="assumptions-disclosure">
          <summary>Review assumptions and open questions</summary>
          <div>
            <section>
              <h3>Assumptions</h3>
              <ul>{spec.globalAssumptions.map((item) => <li key={item}>{item}</li>)}</ul>
            </section>
            <section>
              <h3>Open questions</h3>
              <ul>{spec.missingInformation.map((item) => <li key={item}>{item}</li>)}</ul>
            </section>
          </div>
        </details>
      </section>

      <section className="prototype-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Sample wireframe</p>
            <h2>See the idea in action</h2>
          </div>
          <p>Use the steps to move through the proposed experience.</p>
        </div>
        <PrototypeViewer prototype={spec.prototype} />
      </section>
    </div>
  );
}
