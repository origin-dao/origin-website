export function Footer() {
  return (
    <footer className="border-t border-[rgba(0,240,255,0.08)] px-4 py-4 mt-12">
      <div className="max-w-5xl mx-auto text-[#2a3548] text-xs" style={{ fontFamily: "'Share Tech Mono', monospace", letterSpacing: "1px" }}>
        <div className="flex flex-col sm:flex-row justify-between gap-2">
          <div>
            ORIGIN DAO LLC © 2026 | Built on{" "}
            <a href="https://base.org" target="_blank" className="text-[#00f0ff] hover:text-[#ff003c]">
              Base
            </a>
          </div>
          <div className="flex gap-4">
            <a href="/contracts" className="hover:text-[#00f0ff]">
              [contracts]
            </a>
            <a href="https://github.com/origindao" target="_blank" className="hover:text-[#00f0ff]">
              [github]
            </a>
            <a href="/whitepaper" className="hover:text-[#00f0ff]">
              [whitepaper]
            </a>
          </div>
        </div>
        <div className="mt-2 text-[#1a2535]">
          {">"} The first identity protocol for AI agents. Secured by Suppi 🐾
        </div>
      </div>
    </footer>
  );
}
