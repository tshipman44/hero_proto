import PrototypeViewer from "@/components/PrototypeViewer";
import StageInterpretation from "@/components/StageInterpretation";
import type { PosterImage } from "@/lib/imageUtils";
import type { PrototypeSpec } from "@/lib/schema";

type GeneratedResultContentProps = {
  spec: PrototypeSpec;
  posters?: PosterImage[];
};

export default function GeneratedResultContent({
  spec,
  posters
}: GeneratedResultContentProps) {
  return (
    <>
      <section className="interpretation-grid">
        <article className="concept-card">
          <p className="eyebrow">Inferred concept</p>
          <h2>{spec.overallConcept}</h2>
          <dl>
            <div>
              <dt>Inferred user</dt>
              <dd>{spec.inferredUser}</dd>
            </div>
            <div>
              <dt>User goal</dt>
              <dd>{spec.inferredUserGoal}</dd>
            </div>
          </dl>
        </article>

        <article className="assumption-card">
          <h2>Assumptions and uncertainty</h2>
          <h3>Global assumptions</h3>
          <ul>
            {spec.globalAssumptions.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <h3>Missing information</h3>
          <ul>
            {spec.missingInformation.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
      </section>

      <section className="stage-interpretations">
        <div className="section-heading">
          <p className="eyebrow">Poster-to-feature bridge</p>
          <h2>How the AI read each stage</h2>
        </div>
        <div className="stage-interpretation-grid">
          {spec.stageInterpretations.map((stage, index) => (
            <StageInterpretation
              interpretation={stage}
              key={stage.stage}
              poster={posters?.[index]}
            />
          ))}
        </div>
      </section>

      <section className="prototype-section">
        <div className="section-heading">
          <p className="eyebrow">Clickable prototype</p>
          <h2>Four responsive screens</h2>
        </div>
        <PrototypeViewer prototype={spec.prototype} />
      </section>
    </>
  );
}
