const marks = {
  dotF: "/brand/dot-f.svg",
  wave: "/brand/dot-wave.svg",
  gate: "/brand/gap-gate.svg",
  pause: "/brand/pause.svg",
  orbit: "/brand/open-orbit.svg",
  restart: "/brand/restart-loop.svg",
  belong: "/brand/five-signals.svg",
  micro: "/brand/micro-trace.svg",
};

const collections = [
  {
    index: "01",
    name: "START",
    chinese: "启动系列",
    description: "轻量结构、开放接缝，为第一步留出空间。",
    mark: marks.gate,
    className: "collection-start",
  },
  {
    index: "02",
    name: "PAUSE",
    chinese: "停顿系列",
    description: "让节奏变慢，不让身体停下。",
    mark: marks.pause,
    className: "collection-pause",
  },
  {
    index: "03",
    name: "RESTART",
    chinese: "再出发系列",
    description: "回到附近，但永远不回到原点。",
    mark: marks.restart,
    className: "collection-restart",
  },
];

export default function Home() {
  return (
    <main>
      <header className="site-header">
        <a className="wordmark" href="#top" aria-label="FORM 首页">
          FORM<span>·</span>
        </a>
        <nav aria-label="主导航">
          <a href="#collections">COLLECTIONS</a>
          <a href="#philosophy">OPEN TRACE</a>
          <a href="#community">COMMUNITY</a>
        </nav>
        <a className="header-cta" href="#collections">
          SHOP / 26
        </a>
      </header>

      <section className="hero" id="top">
        <div className="hero-meta">
          <span>FORM / OPEN TRACE</span>
          <span>SHANGHAI · 2026</span>
        </div>

        <div className="hero-title" aria-label="Every move belongs">
          <div>EVERY</div>
          <div className="hero-title-row">
            <span>MOVE</span>
            <span className="signal-dot" aria-hidden="true" />
          </div>
          <div>BELONGS.</div>
        </div>

        <div className="hero-bottom">
          <p>
            不为更快，不为更强。
            <br />
            为每一种正在发生的身体。
          </p>
          <div className="hero-mark">
            <img src={marks.orbit} alt="FORM 开放轨迹标志" />
          </div>
          <a className="round-link" href="#philosophy">
            <span>ENTER THE TRACE</span>
            <span aria-hidden="true">↘</span>
          </a>
        </div>

        <div className="trace-line" aria-hidden="true">
          {Array.from({ length: 13 }, (_, index) => (
            <i key={index} />
          ))}
        </div>
      </section>

      <div className="ticker" aria-label="品牌宣言">
        <div>
          DOT / GAP / PAUSE / RESTART / EVERY MOVE BELONGS&nbsp;&nbsp;—&nbsp;&nbsp;
          DOT / GAP / PAUSE / RESTART / EVERY MOVE BELONGS&nbsp;&nbsp;—&nbsp;&nbsp;
        </div>
      </div>

      <section className="philosophy" id="philosophy">
        <div className="section-kicker">
          <span>01 / OPEN TRACE</span>
          <span>品牌不是终点，是一条开放轨迹</span>
        </div>
        <div className="philosophy-grid">
          <div className="philosophy-symbol">
            <img src={marks.wave} alt="十三点开放轨迹标志" />
            <span>13 DAILY MOVEMENTS</span>
          </div>
          <div className="manifesto">
            <p className="manifesto-en">
              We make clothes for the space between <em>starting</em> and{" "}
              <em>becoming.</em>
            </p>
            <p className="manifesto-cn">
              FORM 相信，运动不是一种标准答案。跑步、拉伸、停顿、重启——
              每一个真实的节奏，都属于同一条开放轨迹。
            </p>
          </div>
        </div>
        <div className="principles">
          <article>
            <span>DOT</span>
            <h3>每一个点，都是一次决定。</h3>
          </article>
          <article>
            <span>GAP</span>
            <h3>留白不是缺失，是入口。</h3>
          </article>
          <article>
            <span>RESTART</span>
            <h3>再次开始，也是一种前进。</h3>
          </article>
        </div>
      </section>

      <section className="collections" id="collections">
        <div className="section-heading">
          <div>
            <span>02 / MOVEMENT SYSTEM</span>
            <h2>MADE TO MOVE<br />YOUR WAY.</h2>
          </div>
          <p>
            三组日常装备，适配不同速度。
            <br />
            每一件都保留身体自己的答案。
          </p>
        </div>

        <div className="collection-grid">
          {collections.map((collection) => (
            <article className={`collection-card ${collection.className}`} key={collection.name}>
              <div className="card-top">
                <span>{collection.index} / 03</span>
                <span>FORM SYSTEM</span>
              </div>
              <div className="card-mark">
                <img src={collection.mark} alt={`${collection.name} 系列标志`} />
              </div>
              <div className="card-copy">
                <span>{collection.chinese}</span>
                <h3>{collection.name}</h3>
                <p>{collection.description}</p>
              </div>
              <a href="#community" aria-label={`探索 ${collection.name} 系列`}>
                EXPLORE <span aria-hidden="true">↗</span>
              </a>
            </article>
          ))}
        </div>
      </section>

      <section className="field-notes">
        <div className="notes-head">
          <span>03 / FIELD NOTES</span>
          <span>日常运动观察 · ISSUE 001</span>
        </div>
        <div className="notes-layout">
          <div className="notes-title">
            <span>NO STARTING LINE</span>
            <h2>你不需要先成为谁，<br />才能开始移动。</h2>
          </div>
          <div className="notes-mark">
            <img src={marks.belong} alt="FORM Every Move Belongs 社群标志" />
          </div>
          <div className="notes-copy">
            <p>
              我们记录城市里没有奖牌的运动：下班后的散步、凌晨的舞步、
              公园里的拉伸，和每一次想重新开始的时刻。
            </p>
            <div className="notes-stats">
              <span><b>05</b> MOVEMENTS</span>
              <span><b>13</b> SIGNALS</span>
              <span><b>∞</b> RHYTHMS</span>
            </div>
          </div>
        </div>
      </section>

      <section className="community" id="community">
        <div className="community-orbit">
          <img src={marks.micro} alt="" />
        </div>
        <div className="community-copy">
          <span>FORM COMMUNITY / SHANGHAI</span>
          <h2>MOVE WITH<br />NO FINISH LINE.</h2>
          <p>加入每周开放训练、城市漫游与恢复计划。</p>
          <a href="mailto:hello@form.run">
            JOIN THE NEXT MOVE <span aria-hidden="true">↗</span>
          </a>
        </div>
        <div className="community-index">04 / JOIN</div>
      </section>

      <footer>
        <div className="footer-word">FORM<span>·</span></div>
        <div className="footer-links">
          <a href="#top">INSTAGRAM</a>
          <a href="#top">XIAOHONGSHU</a>
          <a href="mailto:hello@form.run">CONTACT</a>
        </div>
        <div className="footer-meta">
          <span>EVERY MOVE BELONGS.</span>
          <span>© 2026 FORM / OPEN TRACE</span>
        </div>
      </footer>
    </main>
  );
}
