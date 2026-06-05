import type { PrototypeComponent, PrototypeScreen as PrototypeScreenType } from "@/lib/schema";

type PrototypeScreenProps = {
  screen: PrototypeScreenType;
  screenIndex: number;
  onPrimaryAction: () => void;
};

export default function PrototypeScreen({
  screen,
  screenIndex,
  onPrimaryAction
}: PrototypeScreenProps) {
  return (
    <article className={`prototype-screen ${screen.layoutType}`}>
      <div className="prototype-screen-copy">
        <span className="screen-stage">
          {screenIndex + 1}. {screen.stage}
        </span>
        <h3>{screen.title}</h3>
        <p>{screen.subtitle}</p>
        <div className="user-state">{screen.userState}</div>
        <button className="button button-primary" type="button" onClick={onPrimaryAction}>
          {screen.primaryActionLabel}
        </button>
      </div>

      <div className="prototype-component-grid">
        {screen.components.map((component, index) => (
          <PrototypeComponentCard component={component} key={`${component.type}-${component.title}-${index}`} />
        ))}
      </div>
    </article>
  );
}

function PrototypeComponentCard({ component }: { component: PrototypeComponent }) {
  if (component.type === "metric") {
    return (
      <div className="prototype-component metric-component">
        <span>{component.label}</span>
        <strong>{component.value}</strong>
        <p>{component.body}</p>
      </div>
    );
  }

  if (component.type === "form") {
    return (
      <div className="prototype-component form-component">
        <h4>{component.title}</h4>
        <p>{component.body}</p>
        <div className="faux-form-grid">
          {(component.items.length ? component.items : [component.label]).map((item) => (
            <label key={item}>
              <span>{item}</span>
              <div>{component.value || "Ready"}</div>
            </label>
          ))}
        </div>
      </div>
    );
  }

  if (component.type === "confirmation") {
    return (
      <div className="prototype-component confirmation-component">
        <div className="confirmation-mark">OK</div>
        <h4>{component.title}</h4>
        <p>{component.body}</p>
        <ComponentItems items={component.items} ordered={false} />
      </div>
    );
  }

  if (component.type === "steps" || component.type === "timeline") {
    return (
      <div className="prototype-component">
        <span className="component-label">{component.label}</span>
        <h4>{component.title}</h4>
        <p>{component.body}</p>
        <ComponentItems items={component.items} ordered />
      </div>
    );
  }

  return (
    <div className={`prototype-component ${component.type}-component`}>
      <span className="component-label">{component.label}</span>
      <h4>{component.title}</h4>
      <p>{component.body}</p>
      <ComponentItems items={component.items} ordered={false} />
      {component.value ? <strong className="component-value">{component.value}</strong> : null}
    </div>
  );
}

function ComponentItems({ items, ordered }: { items: string[]; ordered: boolean }) {
  if (!items.length) {
    return null;
  }

  const ListTag = ordered ? "ol" : "ul";

  return (
    <ListTag>
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ListTag>
  );
}
