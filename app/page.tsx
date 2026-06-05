import Link from "next/link";
import { STAGES } from "@/lib/constants";

export default function Home() {
  return (
    <main className="page-shell landing-shell">
      <section className="landing-hero">
        <div className="hero-copy">
          <p className="eyebrow">Workshop interpretation tool</p>
          <h1>Hero Prototype Interpreter</h1>
          <p className="hero-lede">
            Convert four wordless Hero's Journey posters into an AI interpretation bridge and a clickable
            four-screen web prototype.
          </p>
          <div className="hero-actions">
            <Link className="button button-primary" href="/upload">
              Start a prototype
            </Link>
          </div>
        </div>

        <div className="hero-preview" aria-label="Prototype preview">
          <div className="poster-row">
            {STAGES.map((stage, index) => (
              <div className="mini-poster" key={stage.id}>
                <span>{index + 1}</span>
              </div>
            ))}
          </div>
          <div className="preview-window">
            <div className="preview-nav">
              <span />
              <span />
              <span />
            </div>
            <div className="preview-hero-line" />
            <div className="preview-grid">
              <div />
              <div />
              <div />
            </div>
          </div>
        </div>
      </section>

      <section className="stage-band">
        {STAGES.map((stage, index) => (
          <article className="stage-card" key={stage.id}>
            <div className="stage-index">{index + 1}</div>
            <h2>{stage.name}</h2>
            <p>{stage.hint}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
