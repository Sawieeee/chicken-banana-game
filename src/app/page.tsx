import ChickenBananaGame from "@/components/ChickenBananaGame"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-yellow-100 to-orange-100 p-4">
      <div className="container mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">🐔 Chicken Banana Game 🍌</h1>
        <ChickenBananaGame />
      </div>
    </main>
  )
}