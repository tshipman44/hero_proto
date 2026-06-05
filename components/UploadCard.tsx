import type { PosterImage } from "@/lib/imageUtils";
import { ACCEPTED_IMAGE_TYPES } from "@/lib/imageUtils";
import type { STAGES } from "@/lib/constants";

type StageConfig = (typeof STAGES)[number];

type UploadCardProps = {
  stage: StageConfig;
  image?: PosterImage;
  error?: string;
  maxBytes: number;
  onFileSelected: (file: File) => void;
  onClear: () => void;
};

export default function UploadCard({
  stage,
  image,
  error,
  maxBytes,
  onFileSelected,
  onClear
}: UploadCardProps) {
  const inputId = `${stage.id}-upload`;

  return (
    <article className="upload-card">
      <div className="upload-card-header">
        <div>
          <span className="stage-pill">{stage.shortName}</span>
          <h2>{stage.name}</h2>
        </div>
        {image ? (
          <button className="button button-ghost" type="button" onClick={onClear}>
            Remove
          </button>
        ) : null}
      </div>

      <p>{stage.hint}</p>

      <label className={image ? "upload-dropzone has-image" : "upload-dropzone"} htmlFor={inputId}>
        {image ? (
          <img alt={`${stage.name} poster preview`} src={image.dataUrl} />
        ) : (
          <span>Choose poster photo</span>
        )}
        <input
          accept={ACCEPTED_IMAGE_TYPES.join(",")}
          id={inputId}
          type="file"
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (file) {
              onFileSelected(file);
            }
          }}
        />
      </label>

      {image ? (
        <div className="upload-meta">
          <span>{image.fileName}</span>
          <span>{Math.ceil(image.sizeBytes / 1024)} KB compressed</span>
        </div>
      ) : (
        <div className="upload-meta">
          <span>Max request size per poster</span>
          <span>{Math.round(maxBytes / 1024)} KB</span>
        </div>
      )}

      {error ? <div className="field-error">{error}</div> : null}
    </article>
  );
}
