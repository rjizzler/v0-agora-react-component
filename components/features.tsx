import { Shield, RefreshCw, Globe } from "lucide-react"

export default function Features() {
  const features = [
    {
      icon: <Shield className="w-8 h-8 text-red-500" />,
      title: "Secure by Design",
      description: "Chats are tied to addresses, ensuring privacy and decentralization.",
    },
    {
      icon: <RefreshCw className="w-8 h-8 text-red-500" />,
      title: "Real-time Communication",
      description: "Messages appear instantly, connecting communities worldwide.",
    },
    {
      icon: <Globe className="w-8 h-8 text-red-500" />,
      title: "Community Driven",
      description: "Anyone can create or join chatrooms by contract or coin address.",
    },
  ]

  return (
    <section id="features" className="py-20 px-4 bg-[#121212] text-center">
      <h3 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-600 mb-12">
        Features
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {features.map((feature, index) => (
          <div
            key={index}
            className="bg-[#1E1E1E] p-6 rounded-2xl shadow-md hover:shadow-red-500/30 transition-all duration-300 hover:-translate-y-1"
          >
            <div className="mb-4 flex justify-center">{feature.icon}</div>
            <h4 className="text-xl font-semibold">{feature.title}</h4>
            <p className="text-gray-400 mt-2">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
