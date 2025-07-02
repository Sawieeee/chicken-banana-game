"use client"

import { useState, useEffect, useCallback } from "react"

type CellType = "chicken" | "banana" | "empty"
type PlayerType = "chicken" | "banana"
type GameState = "setup" | "waiting" | "ready" | "playing" | "finished"

interface Cell {
  type: CellType
  isRevealed: boolean
}

interface Player {
  name: string
  type: PlayerType
  score: number
  isReady: boolean
  hasLost: boolean
}

const GRID_SIZE = 6
const CHICKEN_COUNT = 8
const BANANA_COUNT = 8

export default function ChickenBananaGame() {
  const [grid, setGrid] = useState<Cell[][]>([])
  const [players, setPlayers] = useState<Player[]>([
    { name: "Chicken Player", type: "chicken", score: 0, isReady: false, hasLost: false },
    { name: "Banana Player", type: "banana", score: 0, isReady: false, hasLost: false },
  ])
  const [gameState, setGameState] = useState<GameState>("setup")
  const [winner, setWinner] = useState<Player | null>(null)
  const [gameTime, setGameTime] = useState(0)
  const [isTimerRunning, setIsTimerRunning] = useState(false)

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isTimerRunning && gameState === "playing") {
      interval = setInterval(() => {
        setGameTime((prev) => prev + 1)
      }, 100) // Update every 100ms for more precision
    }
    return () => clearInterval(interval)
  }, [isTimerRunning, gameState])

  // Initialize game grid with random placement
  const initializeGrid = useCallback(() => {
    const newGrid: Cell[][] = Array(GRID_SIZE)
      .fill(null)
      .map(() =>
        Array(GRID_SIZE)
          .fill(null)
          .map(() => ({
            type: "empty" as CellType,
            isRevealed: false,
          })),
      )

    // Create array of all positions
    const positions: Array<[number, number]> = []
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        positions.push([i, j])
      }
    }

    // Shuffle positions using Fisher-Yates algorithm for complete randomization
    for (let i = positions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[positions[i], positions[j]] = [positions[j], positions[i]]
    }

    // Place chickens in first positions
    for (let i = 0; i < CHICKEN_COUNT; i++) {
      const [row, col] = positions[i]
      newGrid[row][col].type = "chicken"
    }

    // Place bananas in next positions
    for (let i = CHICKEN_COUNT; i < CHICKEN_COUNT + BANANA_COUNT; i++) {
      const [row, col] = positions[i]
      newGrid[row][col].type = "banana"
    }

    // No number calculations needed - empty cells stay empty

    setGrid(newGrid)
  }, [])

  // Start new game
  const startNewGame = () => {
    initializeGrid()
    setPlayers([
      { name: "Chicken Player", type: "chicken", score: 0, isReady: false, hasLost: false },
      { name: "Banana Player", type: "banana", score: 0, isReady: false, hasLost: false },
    ])
    setGameState("waiting")
    setWinner(null)
    setGameTime(0)
    setIsTimerRunning(false)
  }

  // Player ready toggle
  const togglePlayerReady = (playerType: PlayerType) => {
    const newPlayers = players.map((player) =>
      player.type === playerType ? { ...player, isReady: !player.isReady } : player,
    )
    setPlayers(newPlayers)

    // Check if both players are ready
    if (newPlayers.every((player) => player.isReady)) {
      setGameState("ready")
      // Start countdown
      setTimeout(() => {
        setGameState("playing")
        setIsTimerRunning(true)
      }, 1000)
    } else {
      setGameState("waiting")
    }
  }

  // Handle cell click - Both players can click simultaneously
  const handleCellClick = (row: number, col: number) => {
    if (gameState !== "playing" || grid[row][col].isRevealed) return

    const newGrid = [...grid]
    const cell = newGrid[row][col]
    cell.isRevealed = true

    const newPlayers = [...players]

    if (cell.type === "chicken") {
      // Chicken player gets a point, banana player loses immediately
      const chickenPlayerIndex = newPlayers.findIndex((p) => p.type === "chicken")
      const bananaPlayerIndex = newPlayers.findIndex((p) => p.type === "banana")

      newPlayers[chickenPlayerIndex].score += 1

      // Check if chicken player wins by finding all chickens
      if (newPlayers[chickenPlayerIndex].score === CHICKEN_COUNT) {
        setWinner(newPlayers[chickenPlayerIndex])
        setGameState("finished")
        setIsTimerRunning(false)
      }
    } else if (cell.type === "banana") {
      // Banana player gets a point, chicken player loses immediately
      const chickenPlayerIndex = newPlayers.findIndex((p) => p.type === "chicken")
      const bananaPlayerIndex = newPlayers.findIndex((p) => p.type === "banana")

      newPlayers[bananaPlayerIndex].score += 1

      // Check if banana player wins by finding all bananas
      if (newPlayers[bananaPlayerIndex].score === BANANA_COUNT) {
        setWinner(newPlayers[bananaPlayerIndex])
        setGameState("finished")
        setIsTimerRunning(false)
      }
    } else {
      // Empty cell clicked - no penalty, just reveal the number
    }

    setGrid(newGrid)
    setPlayers(newPlayers)
  }

  // Handle wrong click (player clicks opponent's tile)
  const handleWrongClick = (clickedType: CellType, row: number, col: number) => {
    if (gameState !== "playing" || grid[row][col].isRevealed) return

    const newGrid = [...grid]
    const cell = newGrid[row][col]
    cell.isRevealed = true

    const newPlayers = [...players]

    if (clickedType === "chicken") {
      // Banana player clicked chicken tile - banana player loses
      const chickenPlayerIndex = newPlayers.findIndex((p) => p.type === "chicken")
      newPlayers[chickenPlayerIndex].score += 1
      setWinner(newPlayers[chickenPlayerIndex])
    } else if (clickedType === "banana") {
      // Chicken player clicked banana tile - chicken player loses
      const bananaPlayerIndex = newPlayers.findIndex((p) => p.type === "banana")
      newPlayers[bananaPlayerIndex].score += 1
      setWinner(newPlayers[bananaPlayerIndex])
    }

    setGameState("finished")
    setIsTimerRunning(false)
    setGrid(newGrid)
    setPlayers(newPlayers)
  }

  useEffect(() => {
    initializeGrid()
  }, [initializeGrid])

  const getCellContent = (cell: Cell) => {
    if (!cell.isRevealed) return "?"
    if (cell.type === "chicken") return "🐔"
    if (cell.type === "banana") return "🍌"
    return "" // Empty cells show nothing when revealed
  }

  const getCellStyle = (cell: Cell) => {
    let style =
      "w-14 h-14 border-2 border-gray-400 flex items-center justify-center text-lg font-bold cursor-pointer transition-all duration-200 hover:scale-105 game-cell "

    if (!cell.isRevealed) {
      style += "bg-gray-300 hover:bg-gray-200 shadow-lg "
    } else {
      if (cell.type === "chicken") style += "bg-yellow-200 border-yellow-400 "
      else if (cell.type === "banana") style += "bg-yellow-300 border-yellow-500 "
      else style += "bg-gray-100 border-gray-300 " // Empty cells when revealed
    }

    return style
  }

  const formatTime = (time: number) => {
    const seconds = Math.floor(time / 10)
    const milliseconds = time % 10
    return `${seconds}.${milliseconds}s`
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-4">
      {/* Game Header */}
      <div className="text-center">
        <h1 className="text-5xl font-bold text-gray-800 mb-4">🐔 Chicken-Banana Game 🍌</h1>
        <p className="text-xl text-gray-600">Two-Player Timed Tile-Clicking Challenge</p>
      </div>

      {/* Timer */}
      {(gameState === "playing" || gameState === "finished") && (
        <div className="text-center">
          <div className="inline-block bg-black text-white px-6 py-3 rounded-lg text-3xl font-mono">
            ⏱️ {formatTime(gameTime)}
          </div>
        </div>
      )}

      {/* Game Controls */}
      <div className="text-center">
        {gameState === "setup" && (
          <button
            onClick={startNewGame}
            className="px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            🎮 Setup New Game
          </button>
        )}

        {gameState === "waiting" && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800">Players Must Agree to Start!</h2>
            <div className="flex justify-center gap-4">
              {players.map((player) => (
                <button
                  key={player.type}
                  onClick={() => togglePlayerReady(player.type)}
                  className={`px-6 py-3 rounded-lg font-bold text-lg transition-all ${
                    player.isReady ? "bg-green-500 text-white shadow-lg" : "bg-gray-300 text-gray-700 hover:bg-gray-400"
                  }`}
                >
                  {player.type === "chicken" ? "🐔" : "🍌"} {player.name}{" "}
                  {player.isReady ? "✅ Ready!" : "❌ Not Ready"}
                </button>
              ))}
            </div>
          </div>
        )}

        {gameState === "ready" && (
          <div className="text-center">
            <h2 className="text-3xl font-bold text-green-600 animate-pulse">🚀 GET READY! STARTING...</h2>
          </div>
        )}

        {gameState === "finished" && (
          <button
            onClick={startNewGame}
            className="px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            🔄 Play Again
          </button>
        )}
      </div>

      {/* Player Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {players.map((player, index) => (
          <div
            key={index}
            className={`rounded-xl border-2 bg-white shadow-lg p-6 transition-all duration-300 ${
              gameState === "playing" ? "border-blue-500 ring-2 ring-blue-200" : "border-gray-200"
            }`}
          >
            <div className="flex items-center gap-4 mb-4">
              <span className="text-5xl">{player.type === "chicken" ? "🐔" : "🍌"}</span>
              <div className="flex-1">
                <h3 className="font-bold text-2xl">{player.name}</h3>
                <p className="text-gray-600">Click all your {player.type}s to win!</p>
                {gameState === "waiting" && (
                  <span
                    className={`inline-block mt-2 px-3 py-1 text-sm rounded-full font-semibold ${
                      player.isReady ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}
                  >
                    {player.isReady ? "✅ Ready to Play" : "❌ Waiting for Agreement"}
                  </span>
                )}
              </div>
              {winner === player && <span className="text-5xl animate-bounce-slow">🏆</span>}
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-700">Progress:</span>
                <span className="font-bold text-2xl">
                  {player.score}/{player.type === "chicken" ? CHICKEN_COUNT : BANANA_COUNT}
                </span>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
                <div
                  className={`h-6 rounded-full transition-all duration-500 ${
                    player.type === "chicken" ? "bg-yellow-500" : "bg-yellow-600"
                  }`}
                  style={{
                    width: `${(player.score / (player.type === "chicken" ? CHICKEN_COUNT : BANANA_COUNT)) * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Instructions */}
      {gameState === "setup" && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-6 shadow-lg">
          <h3 className="font-bold text-2xl mb-4 text-center text-gray-800">🎯 Game Rules</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <p className="flex items-center gap-2">
                <span className="text-xl">👥</span>
                <strong>Two Players:</strong> Chicken Player vs Banana Player
              </p>
              <p className="flex items-center gap-2">
                <span className="text-xl">🤝</span>
                <strong>Agreement Required:</strong> Both players must agree to start
              </p>
              <p className="flex items-center gap-2">
                <span className="text-xl">⚡</span>
                <strong>Simultaneous Play:</strong> Click your tiles as fast as possible!
              </p>
            </div>
            <div className="space-y-2">
              <p className="flex items-center gap-2">
                <span className="text-xl">🏆</span>
                <strong>Win Condition:</strong> First to click ALL your tiles wins
              </p>
              <p className="flex items-center gap-2">
                <span className="text-xl">❌</span>
                <strong>Instant Loss:</strong> Click opponent's tile = immediate defeat
              </p>
              <p className="flex items-center gap-2">
                <span className="text-xl">🔄</span>
                <strong>Random Layout:</strong> New positions every game
              </p>
            </div>
          </div>
          <div className="mt-4 p-3 bg-yellow-100 rounded-lg border border-yellow-300">
            <p className="text-center font-bold text-yellow-800">
              🐔 Find 8 Chickens | 🍌 Find 8 Bananas | ⏱️ Speed & Accuracy Matter!
            </p>
          </div>
        </div>
      )}

      {/* Winner */}
      {winner && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-4 border-yellow-400 rounded-xl p-8 text-center shadow-xl">
          <div className="text-6xl mb-4 animate-bounce-slow">🏆</div>
          <h2 className="text-4xl font-bold text-yellow-700 mb-2">🎉 {winner.name} Wins! 🎉</h2>
          <p className="text-xl text-yellow-600 font-semibold mb-4">Victory achieved in {formatTime(gameTime)}!</p>
          <div className="bg-white rounded-lg p-4 inline-block shadow-md">
            <div className="text-sm text-gray-600 space-y-1">
              <p className="font-semibold">
                Final Score: {winner.score}/{winner.type === "chicken" ? CHICKEN_COUNT : BANANA_COUNT}
              </p>
              <p>Time: {formatTime(gameTime)}</p>
              <p>Player: {winner.type === "chicken" ? "🐔 Chicken" : "🍌 Banana"}</p>
            </div>
          </div>
        </div>
      )}

      {/* Game Grid */}
      {gameState !== "setup" && (
        <div className="bg-white rounded-xl shadow-xl p-6 border">
          <h3 className="text-2xl font-bold text-center mb-4">🎮 6×6 Game Board</h3>
          {gameState === "playing" && (
            <div className="text-center mb-6">
              <p className="text-lg text-red-600 font-bold mb-2">⚠️ RACE IN PROGRESS! Click your tiles only! ⚠️</p>
              <p className="text-sm text-gray-600">
                🐔 Chicken Player: Click chickens only | 🍌 Banana Player: Click bananas only
              </p>
            </div>
          )}
          <div className="grid grid-cols-6 gap-2 max-w-md mx-auto p-4 bg-gray-100 rounded-lg">
            {grid.map((row, rowIndex) =>
              row.map((cell, colIndex) => (
                <button
                  key={`${rowIndex}-${colIndex}`}
                  className={getCellStyle(cell)}
                  onClick={() => {
                    if (cell.type === "chicken" || cell.type === "banana") {
                      handleCellClick(rowIndex, colIndex)
                    } else {
                      handleCellClick(rowIndex, colIndex)
                    }
                  }}
                  disabled={gameState !== "playing"}
                  title={`Cell ${rowIndex + 1}-${colIndex + 1}`}
                >
                  {getCellContent(cell)}
                </button>
              )),
            )}
          </div>

          {gameState === "playing" && (
            <div className="mt-6 text-center text-sm text-gray-600">
              <p>
                Grid: {GRID_SIZE}×{GRID_SIZE} | 🐔 Chickens: {CHICKEN_COUNT} | 🍌 Bananas: {BANANA_COUNT}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Click to reveal chickens or bananas - avoid opponent's tiles!
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
