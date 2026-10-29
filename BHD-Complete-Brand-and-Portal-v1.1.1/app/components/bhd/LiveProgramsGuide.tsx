"use client";

import { InstantLink } from "../InstantLink";
import { BhdAppIcon } from "./BhdAppIcon";
import { publicProgramApps } from "../../lib/bhd/public-apps";
import { useLiveCatalog } from "../../lib/bhd/use-live-catalog";
import { useEffect, useState } from "react";

export function LiveProgramsGuide() {
  const catalog = useLiveCatalog();
  const [origin, setOrigin] = useState("");
  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);
  const programs = publicProgramApps(catalog, origin || undefined);

  return (
    <section className="programs-guide" aria-label="شرح برامج BHD">
      {programs.map((product) => (
        <article
          key={product.id}
          className="program-card"
          style={{ "--accent": product.accent, "--soft": product.soft } as React.CSSProperties}
        >
          <header>
            <BhdAppIcon
              id={product.id}
              title={product.nameAr}
              logoUrl={product.logoUrl}
              mark={product.mark}
              accent={product.accent}
              soft={product.soft}
            />
            <div>
              <small>
                {product.categoryAr || "BHD"} · {product.statusAr}
              </small>
              <h2>{product.nameAr}</h2>
            </div>
          </header>
          {product.descriptionAr ? <p>{product.descriptionAr}</p> : null}
          {product.capabilitiesAr.length ? (
            <div>
              <p className="program-label">الفوائد</p>
              <ul>
                {product.capabilitiesAr.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {product.howAr ? (
            <div>
              <p className="program-label">كيف يعمل</p>
              <p>{product.howAr}</p>
            </div>
          ) : null}
          {product.href.startsWith("http") ? (
            <a href={product.href} target="_blank" rel="noopener noreferrer">
              فتح البرنامج
            </a>
          ) : (
            <InstantLink href={product.href}>تعرّف على البرنامج</InstantLink>
          )}
        </article>
      ))}
    </section>
  );
}
