export function Footer() {
  return (
    <footer className="border-t border-terminal-dark px-4 py-4 mt-12">
      <div className="max-w-5xl mx-auto text-terminal-dim text-xs">
        <div className="flex flex-col sm:flex-row justify-between gap-2">
          <div>
            ORIGIN DAO LLC © 2026 | Built on{" "}
            <a href="https://base.org" target="_blank" className="text-terminal-green hover:text-terminal-amber">
              Base
            </a>
          </div>
          <div className="flex gap-4">
            <a href="/contracts" className="hover:text-terminal-amber">
              [contracts]
            </a>
            <a href="https://github.com/origindao" target="_blank" className="hover:text-terminal-amber">
              [github]
            </a>
            <a href="/whitepaper" className="hover:text-terminal-amber">
              [whitepaper]
            </a>
          </div>
        </div>
        <div className="mt-2 text-terminal-dark">
          {">"} The first identity protocol for AI agents. Secured by Suppi 🐾
        </div>
      </div>
    </footer>
  );
}
