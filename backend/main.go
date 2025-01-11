package main

import (
	"fmt"
	"log"
	"net/http"
	"github.com/gorilla/websocket"
	"github.com/google/uuid"
	"sync"
	"time"
)

type Game struct {
	ID          string
	Players     map[string]*Player
	Deck        []string
	State       string
	CurrentTurn string
	ChatHistory []string
}

type Player struct {
	ID   string
	Name string
	Score int
	Conn *websocket.Conn
}

var games = make(map[string]*Game)
var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}
var mutex = &sync.Mutex{}

func main() {
	http.HandleFunc("/create-room", createRoom)
	http.HandleFunc("/join-room", joinRoom)
	http.HandleFunc("/game", handleGame)
	http.ListenAndServe(":8080", nil)
}

// createRoom handles room creation
func createRoom(w http.ResponseWriter, r *http.Request) {
	roomID := uuid.New().String() 
	game := &Game{
		ID:          roomID,
		Players:     make(map[string]*Player),
		Deck:        []string{"EC2", "Lambda", "S3", "RDS", "EC2", "Lambda", "S3", "RDS"},
		State:       "waiting",
		CurrentTurn: "",
		ChatHistory: []string{},
	}

	mutex.Lock()
	games[roomID] = game
	mutex.Unlock()

	fmt.Fprintf(w, "Room created successfully! Room ID: %s\n", roomID)
}

// joinRoom handles player joining a game
func joinRoom(w http.ResponseWriter, r *http.Request) {
	roomID := r.URL.Query().Get("roomID")
	playerName := r.URL.Query().Get("playerName")

	mutex.Lock()
	game, exists := games[roomID]
	mutex.Unlock()

	if !exists {
		http.Error(w, "Room not found", http.StatusNotFound)
		return
	}

	playerID := uuid.New().String()
	player := &Player{
		ID:   playerID,
		Name: playerName,
		Score: 0,
	}

	game.Players[playerID] = player
	fmt.Fprintf(w, "Player %s joined the room. Player ID: %s\n", playerName, playerID)
}

// handleGame manages game flow and chat communication
func handleGame(w http.ResponseWriter, r *http.Request) {
	roomID := r.URL.Query().Get("roomID")
	playerID := r.URL.Query().Get("playerID")

	mutex.Lock()
	game, exists := games[roomID]
	mutex.Unlock()

	if !exists {
		http.Error(w, "Room not found", http.StatusNotFound)
		return
	}

	player, exists := game.Players[playerID]
	if !exists {
		http.Error(w, "Player not found", http.StatusNotFound)
		return
	}

	// Upgrade HTTP connection to WebSocket
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("Error upgrading to WebSocket:", err)
		return
	}
	defer conn.Close()

	player.Conn = conn
	fmt.Printf("Player %s connected via WebSocket\n", player.Name)

	// Handle game and chat interaction
	go handleChat(game, player, conn)
	handleGameInteraction(game, player, conn)
}

// handleChat listens for chat messages and broadcasts them to all players in the room
func handleChat(game *Game, player *Player, conn *websocket.Conn) {
	for {
		_, message, err := conn.ReadMessage()
		if err != nil {
			log.Println("Error reading chat message:", err)
			break
		}
		// Broadcast message to all players in the room
		game.ChatHistory = append(game.ChatHistory, fmt.Sprintf("%s: %s", player.Name, string(message)))
		// Send chat history to all players
		for _, p := range game.Players {
			if err := p.Conn.WriteMessage(websocket.TextMessage, []byte(fmt.Sprintf("%s: %s", player.Name, string(message)))); err != nil {
				log.Println("Error sending chat message:", err)
			}
		}
	}
}

// handleGameInteraction listens for game interactions (card flips, etc.)
func handleGameInteraction(game *Game, player *Player, conn *websocket.Conn) {
	for {
		if game.CurrentTurn != player.ID {
			time.Sleep(1 * time.Second)
			continue
		}

		conn.WriteMessage(websocket.TextMessage, []byte("It's your turn! Choose a card to flip (e.g., EC2, Lambda):"))
		_, message, err := conn.ReadMessage()
		if err != nil {
			log.Println("Error reading game message:", err)
			break
		}

		selectedCard := string(message)
		if processTurn(game, player, selectedCard) {
			conn.WriteMessage(websocket.TextMessage, []byte(fmt.Sprintf("You matched a card! Your current score is: %d\n", player.Score)))
		} else {
			conn.WriteMessage(websocket.TextMessage, []byte("No match! Try again next turn."))
		}

		// Change turn to the next player
		game.CurrentTurn = getNextPlayer(game, player.ID)
	}
}

// processTurn processes a player's card flip
func processTurn(game *Game, player *Player, selectedCard string) bool {
	for i, card := range game.Deck {
		if card == selectedCard {
			game.Deck[i] = "" // Remove the matched card
			player.Score++
			return true
		}
	}
	return false
}

// getNextPlayer returns the next player's ID
func getNextPlayer(game *Game, currentPlayerID string) string {
	var nextPlayerID string
	for playerID := range game.Players {
		if playerID != currentPlayerID {
			nextPlayerID = playerID
			break
		}
	}
	return nextPlayerID
}
