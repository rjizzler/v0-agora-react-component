export default function HowItWorks() {
  const steps = [
    {
      number: "1️⃣",
      text: "Enter a Coin or Contract Address",
    },
    {
      number: "2️⃣",
      text: "Open or Join a Room",
    },
    {
      number: "3️⃣",
      text: "Start Chatting Live with Others",
    },
  ]

  return (
    <section id="how" className="py-20 px-4 bg-black text-center">
      <h3 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-600 mb-12">
        How It Works
      </h3>
      <div className="flex flex-col md:flex-row justify-center gap-8 max-w-5xl mx-auto">
        {steps.map((step, index) => (
          <div
            key={index}
            className="bg-[#1E1E1E] p-6 rounded-xl transform transition-all duration-300 hover:scale-105"
          >
            <div className="text-3xl mb-2">{step.number}</div>
            <p>{step.text}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
