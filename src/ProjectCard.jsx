import { logoById } from './logos.js'
import './ProjectCard.css'

function TrendIcon({ className = '' }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
      />
    </svg>
  )
}

function ChevronDownIcon({ className = '' }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  )
}

function ChevronRightIcon({ className = '' }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  )
}

/**
 * Reusable “work/project” card.
 *
 * Props are intentionally data-driven so you can drop in any project:
 * - title, status, metrics, bars, timeframe, cta
 * - accent gradient colors (CSS vars) to differentiate projects
 */
export default function ProjectCard({
  title,
  eyebrow,
  status = { label: 'Live', tone: 'live' }, // tone: live | build | muted
  description,
  highlights = [],
  tags = [],
  logos = [],
  timeframe = 'Last 7 days',
  cta = { label: 'View details', href: '#contact' },
  accent = { from: '#6366f1', via: '#a855f7', to: '#ec4899' },
  icon,
}) {
  const style = {
    '--pc-from': accent.from,
    '--pc-via': accent.via,
    '--pc-to': accent.to,
  }

  const safeHighlights = Array.isArray(highlights) ? highlights.slice(0, 6) : []
  const allTags = Array.isArray(tags) ? tags : []
  const safeLogos = Array.isArray(logos) ? logos.slice(0, 10) : []
  const isComingSoon =
    typeof cta?.label === 'string' && cta.label.toLowerCase().includes('coming')

  return (
    <article className="projectCard" style={style} aria-label={title}>
      <div className="projectCard__glow" aria-hidden />
      <div className="projectCard__surface" aria-hidden />

      <div className="projectCard__content">
        <div className="projectCard__top">
          <div className="projectCard__titleRow">
            <div className="projectCard__icon">
              {icon ?? <TrendIcon className="projectCard__iconSvg" />}
            </div>
            <div className="projectCard__titleBlock">
              {eyebrow ? <div className="projectCard__eyebrow">{eyebrow}</div> : null}
              <h3 className="projectCard__title">{title}</h3>
            </div>
          </div>

          <span className={'projectCard__status projectCard__status--' + (status?.tone ?? 'live')}>
            <span className="projectCard__statusDot" aria-hidden />
            {status?.label ?? 'Live'}
          </span>
        </div>

        {description ? <p className="projectCard__desc">{description}</p> : null}

        {safeHighlights.length ? (
          <ul className="projectCard__highlights" aria-label="Highlights">
            {safeHighlights.map((h) => (
              <li className="projectCard__highlight" key={h}>
                <span className="projectCard__bullet" aria-hidden />
                <span className="projectCard__highlightText">{h}</span>
              </li>
            ))}
          </ul>
        ) : null}

        {allTags.length ? (
          <div className="projectCard__tags" aria-label="Technologies">
            {allTags.map((t) => (
              <span className="projectCard__tag" key={t}>
                {t}
              </span>
            ))}
          </div>
        ) : null}

        <div className="projectCard__footer">
          <div className="projectCard__bottom">
            <div className="projectCard__time">
              <span className="projectCard__timeLabel">{timeframe}</span>
              <ChevronDownIcon className="projectCard__timeIcon" />
            </div>

            {isComingSoon ? (
              <span
                className="projectCard__cta projectCard__cta--soon"
                role="button"
                aria-disabled="true"
              >
                {cta.label}
                <ChevronRightIcon className="projectCard__ctaIcon" />
              </span>
            ) : (
              <a className="projectCard__cta" href={cta.href}>
                {cta.label}
                <ChevronRightIcon className="projectCard__ctaIcon" />
              </a>
            )}
          </div>

          {safeLogos.length ? (
            <div className="projectCard__logoBox" aria-label="Primary tools">
              {safeLogos.map((id) => {
                const iconDef = logoById[id]
                const fallbackLabel =
                  typeof id === 'string'
                    ? id
                        .replace(/[-_]/g, ' ')
                        .replace(/\b\w/g, (c) => c.toUpperCase())
                    : 'Tool'

                if (!iconDef) {
                  return (
                    <div
                      className="projectCard__logoTile projectCard__logoTile--fallback"
                      key={id}
                      aria-label={fallbackLabel}
                      tabIndex={0}
                    >
                      <span className="projectCard__logoText" aria-hidden>
                        {String(id).slice(0, 2).toUpperCase()}
                      </span>
                      <span className="projectCard__logoTooltip" role="tooltip">
                        {fallbackLabel}
                      </span>
                    </div>
                  )
                }

                // Custom public logo: `{ title, src }`
                if (iconDef.src) {
                  return (
                    <div
                      className="projectCard__logoTile projectCard__logoTile--img"
                      key={id}
                      aria-label={iconDef.title ?? fallbackLabel}
                      tabIndex={0}
                    >
                      <img
                        className={
                          'projectCard__logoImg' +
                          (iconDef.mono === false ? '' : ' projectCard__logoImg--mono')
                        }
                        src={iconDef.src}
                        alt={iconDef.title ?? fallbackLabel}
                        loading="lazy"
                        decoding="async"
                      />
                      <span className="projectCard__logoTooltip" role="tooltip">
                        {iconDef.title ?? fallbackLabel}
                      </span>
                    </div>
                  )
                }

                return (
                  <div
                    className="projectCard__logoTile"
                    key={id}
                    aria-label={iconDef.title}
                    tabIndex={0}
                  >
                    <svg className="projectCard__logoSvg" viewBox="0 0 24 24" aria-hidden>
                      <path d={iconDef.path} fill="currentColor" />
                    </svg>
                    <span className="projectCard__logoTooltip" role="tooltip">
                      {iconDef.title}
                    </span>
                  </div>
                )
              })}
            </div>
          ) : null}
        </div>

      </div>
    </article>
  )
}

