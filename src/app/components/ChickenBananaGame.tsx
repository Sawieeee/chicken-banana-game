"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RotateCcw, Trophy, AlertCircle } from "lucide-react"

type CellType = "chicken" | "banana" | "empty"
type PlayerType = "chicken" | "banana"
type GameState = "setup" | "playing" | "finished"

interface Cell {
  type: CellType
  isRevealed: boolean
  number: number
}

interface Player {
  name: string
  type: PlayerType
  score: number
  mistakes: number
  isActive: boolean
}

const GRID_SIZE = 8
const CHICKEN_COUNT = 10
const BANANA_COUNT = 10

export default function ChickenBananaGame() {
  const [grid, setGrid] = useState<Cell[][]>([])
  const [players, setPlayers] = useState<Player[]>([
    { name: "Player 1", type: "chicken", score: 0, mistakes: 0, isActive: true },
    { name: "Player 2", type: "banana", score: 0, mistakes: 0, isActive: true },
  ])
  const [gameState, setGameState] = useState<GameState>("setup")
  const [winner, setWinner] = useState<Player | null>(null)
  const [currentPlayer, setCurrentPlayer] = useState<PlayerType>("chicken")
  const [gameStats, setGameStats] = useState({
    chickenFound: 0,
    bananaFound: 0,
    totalChickens: CHICKEN_COUNT,
    totalBananas: BANANA_COUNT,
  })

  // Initialize game grid
  const initializeGrid = useCallback(() => {
    const newGrid: Cell[][] = Array(GRID_SIZE)
      .fill(null)
      .map(() =>
        Array(GRID_SIZE)
          .fill(null)
          .map(() => ({
            type: "empty" as CellType,
            isRevealed: false,
            number: 0,
          })),
      )

    // Randomly place chickens and bananas
    const positions: Array<[number, number]> = []
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        positions.push([i, j])
      }
    }

    // Shuffle positions
    for (let i = positions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[positions[i], positions[j]] = [positions[j], positions[i]]
    }

    // Place chickens
    for (let i = 0; i < CHICKEN_COUNT; i++) {
      const [row, col] = positions[i]
      newGrid[row][col].type = "chicken"
    }

    // Place bananas
    for (let i = CHICKEN_COUNT; i < CHICKEN_COUNT + BANANA_COUNT; i++) {
      const [row, col] = positions[i]
      newGrid[row][col].type = "banana"
    }

    // Calculate numbers for each cell
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        if (newGrid[i][j].type === "empty") {
          let count = 0
          for (let di = -1; di <= 1; di++) {
            for (let dj = -1; dj <= 1; dj++) {
              const ni = i + di
              const nj = j + dj
              if (ni >= 0 && ni < GRID_SIZE && nj >= 0 && nj < GRID_SIZE) {
                if (newGrid[ni][nj].type !== "empty") {
                  count++
                }
              }
            }
          }
          newGrid[i][j].number = count
        }
      }
    }

    setGrid(newGrid)
    setGameStats({
      chickenFound: 0,
      bananaFound: 0,
      totalChickens: CHICKEN_COUNT,
      totalBananas: BANANA_COUNT,
    })
  }, [])

  // Start new game
  const startNewGame = () => {
    initializeGrid()
    setPlayers([
      { name: "Player 1", type: "chicken", score: 0, mistakes: 0, isActive: true },
      { name: "Player 2", type: "banana", score: 0, mistakes: 0, isActive: true },
    ])
    setGameState("playing")
    setWinner(null)
    setCurrentPlayer("chicken")
  }

  // Handle cell click
  const handleCellClick = (row: number, col: number) => {
    if (gameState !== "playing" || grid[row][col].isRevealed) return

    const newGrid = [...grid]
    const cell = newGrid[row][col]
    cell.isRevealed = true

    const currentPlayerData = players.find((p) => p.type === currentPlayer)!
    const newPlayers = [...players]
    const playerIndex = newPlayers.findIndex((p) => p.type === currentPlayer)

    // Check if player clicked their target or made a mistake
    if (cell.type === currentPlayer) {
      // Correct click
      newPlayers[playerIndex].score += 1
      const newStats = { ...gameStats }
      if (currentPlayer === "chicken") {
        newStats.chickenFound += 1
      } else {
        newStats.bananaFound += 1
      }
      setGameStats(newStats)

      // Check if player won
      if (newPlayers[playerIndex].score === (currentPlayer === "chicken" ? CHICKEN_COUNT : BANANA_COUNT)) {
        setWinner(newPlayers[playerIndex])
        setGameState("finished")
      }
    } else if (cell.type !== "empty") {
      // Wrong target clicked (clicked opponent's target)
      newPlayers[playerIndex].mistakes += 1
      newPlayers[playerIndex].isActive = false

      // Other player wins by default
      const otherPlayerIndex = playerIndex === 0 ? 1 : 0
      setWinner(newPlayers[otherPlayerIndex])
      setGameState("finished")
    }

    setGrid(newGrid)
    setPlayers(newPlayers)

    // Switch turns
    setCurrentPlayer(currentPlayer === "chicken" ? "banana" : "chicken")
  }

  // Initialize grid on component mount
  useEffect(() => {
    initializeGrid()
  }, [initializeGrid])

  const getCellContent = (cell: Cell) => {
    if (!cell.isRevealed) {
      return "?"
    }

    if (cell.type === "chicken") return "🐔"
    if (cell.type === "banana") return "🍌"
    return cell.number > 0 ? cell.number.toString() : ""
  }

  const getCellStyle = (cell: Cell, row: number, col: number) => {
    let baseStyle =
      "w-12 h-12 border-2 border-gray-300 flex items-center justify-center text-sm font-bold cursor-pointer transition-all duration-200 hover:scale-105 "

    if (!cell.isRevealed) {
      baseStyle += "bg-gray-200 hover:bg-gray-300 shadow-md "
    } else {
      if (cell.type === "chicken") {
        baseStyle += "bg-yellow-200 "
      } else if (cell.type === "banana") {
        baseStyle += "bg-yellow-300 "
      } else {
        baseStyle += "bg-white "
      }
    }

    return baseStyle
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Game Controls */}
      <div className="flex justify-center gap-4">
        <Button onClick={startNewGame} className="flex items-center gap-2">
          <RotateCcw className="w-4 h-4" />
          {gameState === "setup" ? "Start Game" : "New Game"}
        </Button>
      </div>

      {/* Player Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {players.map((player, index) => (
          <Card
            key={index}
            className={`${currentPlayer === player.type && gameState === "playing" ? "ring-2 ring-blue-500" : ""}`}
          >
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  {player.type === "chicken" ? "🐔" : "🍌"} {player.name}
                  {currentPlayer === player.type && gameState === "playing" && (
                    <Badge variant="secondary">Your Turn</Badge>
                  )}
                </span>
                {winner === player && <Trophy className="w-5 h-5 text-yellow-500" />}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Found:</span>
                  <span className="font-bold">
                    {player.score}/{player.type === "chicken" ? CHICKEN_COUNT : BANANA_COUNT}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Mistakes:</span>
                  <span className={`font-bold ${player.mistakes > 0 ? "text-red-500" : "text-green-500"}`}>
                    {player.mistakes}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      player.type === "chicken" ? "bg-yellow-500" : "bg-yellow-600"
                    }`}
                    style={{
                      width: `${(player.score / (player.type === "chicken" ? CHICKEN_COUNT : BANANA_COUNT)) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Game Instructions */}
      {gameState === "setup" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Game Instructions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p>
                • <strong>Chicken Player (🐔):</strong> Find all 10 chickens hidden in the grid
              </p>
              <p>
                • <strong>Banana Player (🍌):</strong> Find all 10 bananas hidden in the grid
              </p>
              <p>• Players take turns clicking tiles</p>
              <p>• Numbers show how many chickens/bananas are adjacent to that tile</p>
              <p>• First to find all their targets wins!</p>
              <p>• If you click the wrong target, your opponent wins!</p>
              <p>
                • <strong>Winner gets +5 bonus points!</strong>
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Winner Announcement */}
      {winner && (
        <Card className="border-yellow-400 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <Trophy className="w-12 h-12 text-yellow-500 mx-auto" />
              <h2 className="text-2xl font-bold text-yellow-700">🎉 {winner.name} Wins! 🎉</h2>
              <p className="text-yellow-600">Congratulations! You get +5 bonus points!</p>
              <div className="text-sm text-gray-600 mt-4">
                <p>
                  Final Score: {winner.score}/{winner.type === "chicken" ? CHICKEN_COUNT : BANANA_COUNT}
                </p>
                <p>Mistakes: {winner.mistakes}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Game Grid */}
      {gameState !== "setup" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Game Board</CardTitle>
            {gameState === "playing" && (
              <p className="text-center text-sm text-gray-600">
                Current Turn: {currentPlayer === "chicken" ? "🐔 Chicken Player" : "🍌 Banana Player"}
              </p>
            )}
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-8 gap-1 max-w-md mx-auto">
              {grid.map((row, rowIndex) =>
                row.map((cell, colIndex) => (
                  <button
                    key={`${rowIndex}-${colIndex}`}
                    className={getCellStyle(cell, rowIndex, colIndex)}
                    onClick={() => handleCellClick(rowIndex, colIndex)}
                    disabled={gameState !== "playing"}
                  >
                    {getCellContent(cell)}
                  </button>
                )),
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
