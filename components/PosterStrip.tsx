import { STAGES } from "@/lib/constants";
import type { PosterImage } from "@/lib/imageUtils";

type PosterStripProps = {
  images: PosterImage[];
};

export default function PosterStrip({ images }: PosterStripProps) {
  return (
    <section className="poster-strip">
      <div className="section-heading">
        <p className="eyebrow">Original posters</p>
        <h2>Visual story in order</h2>
      </div>
      <div className="poster-grid">
        {STAGES.map((stage, index) => {
          const image = images.find((item) => item.stage === stage.name);
          return (
            <article className="poster-card" key={stage.id}>
              <div className="poster-frame">
                {image ? <img alt={`${stage.name} poster`} src={image.dataUrl} /> : <span>Missing image</span>}
              </div>
              <div>
                <span>{index + 1}</span>
                <h3>{stage.name}</h3>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
