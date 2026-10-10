import { site } from "@/content/site"

export function HowItWorks() {
  const { how, person } = site
  const [talk, build, check, live] = how.steps
  const client = site.what.app.clientInitial
  return (
    <section className="how" id="how">
      <div className="how-h rv">
        <span className="eyebrow">{how.eyebrow}</span>
        <h2 style={{ marginTop: 14 }}>{how.title}</h2>
      </div>
      <div className="bento rv">
        <div className="cell">
          <Step {...talk} />
          <div className="vg" aria-hidden="true">
            <div className="invite">
              <div className="t"><i />{how.invite.app}</div>
              <b>{how.invite.title}</b>
              <div className="d">{how.invite.when}</div>
              <div className="row">
                <span className="ppl"><span className="av l">{person.initial}</span><span className="av d">{client}</span></span>
                <span className="join">{how.invite.join}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="cell">
          <Step {...build} />
          <div className="vg" aria-hidden="true">
            <div className="phone">
              <div className="phone-in">
                <div className="pl">{how.preview.logo}</div>
                <div className="ph">{how.preview.headline}</div>
                <span className="pb">{how.preview.button}</span>
                <div className="pm"><i /><i /></div>
              </div>
              <div className="ptoast">
                <span className="av l">{person.initial}</span>
                <span><b>{how.preview.toastName}</b>{how.preview.toastText}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="cell">
          <Step {...check} />
          <div className="vg" aria-hidden="true">
            <div className="thread">
              <div className="cm"><span className="av d">{client}</span><p>{how.thread.ask}</p></div>
              <div className="cm me">
                <span className="av l">{person.initial}</span>
                <p>{how.thread.reply} <span className="done">{how.thread.done}</span></p>
              </div>
            </div>
          </div>
        </div>
        <div className="cell">
          <Step {...live} />
          <div className="vg" aria-hidden="true">
            <ul className="log">
              {how.log.map((entry) => (
                <li key={entry.what}><i /><span>{entry.what}</span><span>{entry.when}</span></li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}

function Step({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <div>
      <span className="n">{n}</span>
      <h3>{title}</h3>
      <p>{body}</p>
    </div>
  )
}
