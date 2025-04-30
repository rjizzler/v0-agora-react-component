import { Github, Twitter } from "lucide-react"

export default function Footer() {
  return (
    <footer className="py-8 bg-[#121212] text-center text-gray-500 border-t border-gray-800">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-center space-x-6 mb-4">
          <a href="#" className="hover:text-red-400 transition-colors">
            <Github size={20} />
          </a>
          <a href="#" className="hover:text-red-400 transition-colors">
            <Twitter size={20} />
          </a>
        </div>
        <p>&copy; 2025 AGORA. Built for open communication.</p>
      </div>
    </footer>
  )
}
