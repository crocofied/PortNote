import packageJson from "@/package.json"

export default function Footer() {
    return(
      <div className="mt-auto pt-4">
        <footer className="footer sm:footer-horizontal footer-center bg-base-200 text-base-content p-4">
          <aside>
            <p><a href="https://github.com/crocofied/PortNote" target="_blank" rel="noopener noreferrer" >PortNote v{packageJson.version} | Copyright © {new Date().getFullYear()} - All right reserved by PortNote</a></p>
          </aside>
        </footer>
      </div>
    )
  }