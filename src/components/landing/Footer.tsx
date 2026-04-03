import Link from "next/link";

const footerLinks = {
  Product: ["Features", "How It Works", "Pricing", "Changelog"],
  Resources: ["Study Guides", "HOSA Events", "Blog", "Help Center"],
  Company: ["About", "Contact", "Privacy Policy", "Terms of Service"],
};

export default function Footer() {
  return (
    <footer className="bg-[#070D1A] border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg gradient-btn flex items-center justify-center">
                <span className="text-white font-bold text-sm">P</span>
              </div>
              <span className="text-xl font-bold gradient-text">PinPoint</span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
              The AI-powered study platform built for competitive HOSA members
              who are serious about placing.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-sm font-semibold text-white mb-4">
                {category}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link}>
                    <Link
                      href="#"
                      className="text-sm text-gray-500 hover:text-gray-300 transition-colors duration-200"
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-600">
            © {new Date().getFullYear()} PinPoint. All rights reserved.
          </p>
          <p className="text-sm text-gray-600">
            Built for{" "}
            <span className="text-gray-400">HOSA — Future Health Professionals</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
