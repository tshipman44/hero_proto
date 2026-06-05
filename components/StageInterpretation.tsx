import type { PosterImage } from "@/lib/imageUtils";
import type { StageInterpretation as StageInterpretationType } from "@/lib/schema";

type StageInterpretationProps = {
  interpretation: StageInterpretationType;
  poster?: PosterImage;
};

export default function StageInterpretation({ interpretation, poster }: StageInterpretationProps) {
  return (
    <article className="interpretation-card">
      <div className="interpretation-image">
        {poster ? <img alt={`${interpretation.stage} poster thumbnail`} src={poster.dataUrl} /> : null}
      </div>
      <div className="interpretation-body">
        <span className="stage-pill">{interpretation.stage}</span>
        <h3>{interpretation.inferredMeaning}</h3>
        <p>{interpretation.imageDescription}</p>
        <h4>Evidence</h4>
        <ul>
          {interpretation.evidence.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        {interpretation.assumptions.length > 0 ? (
          <>
            <h4>Assumptions</h4>
            <ul>
              {interpretation.assumptions.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </>
        ) : null}
        <div className="uncertainty-note">{interpretation.uncertainty}</div>
      </div>
    </article>
  );
}
