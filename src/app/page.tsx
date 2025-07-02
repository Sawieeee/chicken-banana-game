import ChickenBananaGame from "@/components/ChickenBananaGame"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-yellow-100 via-orange-100 to-red-100">
      <div className="container mx-auto py-8 px-4">
        <div className="text-center mb-8">
          <h1 className="text-6xl font-bold text-gray-800 drop-shadow-lg mb-4">🐔 Chicken Banana Game 🍌</h1>
          <p className="text-xl text-gray-600 font-medium">A MineSweeper-style game for two players</p>
        </div>
        <ChickenBananaGame />
      </div>
    </main>
  )
}
