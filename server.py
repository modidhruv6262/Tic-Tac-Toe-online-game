import asyncio
import websockets
import os
import json
import random
import string

# Stores rooms: { "ABCD": { "capacity": 4, "players": [{"ws": websocket, "name": "Player1"}] } }
rooms = {}
player_rooms = {}

def generate_code():
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))

async def broadcast_lobby(room_code):
    if room_code in rooms:
        room = rooms[room_code]
        player_list = [p["name"] for p in room["players"]]
        
        for p in room["players"]:
            await p["ws"].send(json.dumps({
                "type": "lobby_update",
                "room": room_code,
                "players": player_list,
                "capacity": room["capacity"],
                "host": room["players"][0]["name"]
            }))
            
            # If the room is full, automatically transition everyone to the Game Hub
            if len(room["players"]) == room["capacity"]:
                await p["ws"].send(json.dumps({
                    "type": "hub_start",
                    "room": room_code,
                    "players": player_list,
                    "host": room["players"][0]["name"]
                }))

async def game_handler(websocket):
    try:
        async for message in websocket:
            data = json.loads(message)
            action = data.get("action")

            if action == "create":
                room_code = generate_code()
                capacity = int(data.get("capacity", 2))
                rooms[room_code] = {
                    "capacity": capacity,
                    "players": [{"ws": websocket, "name": data.get("name", "Host")}]
                }
                player_rooms[websocket] = room_code
                await websocket.send(json.dumps({"type": "room_created", "room": room_code}))
                await broadcast_lobby(room_code)

            elif action == "join":
                room_code = data.get("room", "").upper()
                if room_code in rooms:
                    room = rooms[room_code]
                    if len(room["players"]) < room["capacity"]:
                        room["players"].append({"ws": websocket, "name": data.get("name", "Guest")})
                        player_rooms[websocket] = room_code
                        await broadcast_lobby(room_code)
                    else:
                        await websocket.send(json.dumps({"type": "error", "message": "Room is full!"}))
                else:
                    await websocket.send(json.dumps({"type": "error", "message": "Invalid Code!"}))

            elif action == "launch_game":
                room_code = player_rooms.get(websocket)
                if room_code in rooms:
                    game = data.get("game")
                    room = rooms[room_code]
                    players = room["players"]

                    if game == "tictactoe":
                        # Matchmaking Roulette: Pick 2 random players to duel
                        active_players = random.sample(players, 2)
                        p1, p2 = active_players[0], active_players[1]
                        
                        for p in players:
                            role = "Spectator"
                            symbol = ""
                            if p == p1:
                                role = "Player 1"
                                symbol = "X"
                            elif p == p2:
                                role = "Player 2"
                                symbol = "O"
                            
                            await p["ws"].send(json.dumps({
                                "type": "launch_game",
                                "game": "tictactoe",
                                "role": role,
                                "symbol": symbol,
                                "p1": p1["name"],
                                "p2": p2["name"],
                                "all_players": [pl["name"] for pl in players]
                            }))

                    elif game == "ludo":
                        # Assign colors based on join order
                        colors = ["red", "green", "blue", "yellow"]
                        for i, p in enumerate(players):
                            await p["ws"].send(json.dumps({
                                "type": "launch_game",
                                "game": "ludo",
                                "role": "Player",
                                "color": colors[i],
                                "all_players": [{"name": pl["name"], "color": colors[idx]} for idx, pl in enumerate(players)]
                            }))
                    elif game == "dng":
                        for p in players:
                            await p["ws"].send(json.dumps({
                                "type": "launch_game",
                                "game": "dng",
                                "all_players": [{"name": pl["name"]} for pl in players]
                            }))
                    elif game == "tod":
                        for p in players:
                            await p["ws"].send(json.dumps({
                                "type": "launch_game",
                                "game": "tod",
                                "mode": data.get("mode", "both"),
                                "intensity": data.get("intensity", 3),
                                "language": data.get("language", "english"),
                                "all_players": [{"name": pl["name"]} for pl in players]
                            }))

            elif action == "request_leave":
                room_code = player_rooms.get(websocket)
                if room_code in rooms:
                    room = rooms[room_code]
                    for p in room["players"]:
                        await p["ws"].send(json.dumps({
                            "type": "leave_request",
                            "player": data.get("player"),
                            "leave_type": data.get("type")
                        }))
                    
            elif action == "approve_leave":
                room_code = player_rooms.get(websocket)
                if room_code in rooms:
                    room = rooms[room_code]
                    leave_type = data.get("leave_type")
                    target_player = data.get("player")
                    
                    if leave_type == "hub":
                        for p in room["players"]:
                            await p["ws"].send(json.dumps({"type": "return_hub"}))
                    elif leave_type == "room":
                        for p in room["players"]:
                            if p["name"] == target_player:
                                await p["ws"].send(json.dumps({"type": "leave_approved"}))
                                
            elif action == "deny_leave":
                room_code = player_rooms.get(websocket)
                if room_code in rooms:
                    room = rooms[room_code]
                    target_player = data.get("player")
                    for p in room["players"]:
                        if p["name"] == target_player:
                            await p["ws"].send(json.dumps({"type": "leave_denied"}))

            elif action == "return_hub":
                room_code = player_rooms.get(websocket)
                if room_code in rooms:
                    for p in rooms[room_code]["players"]:
                        await p["ws"].send(json.dumps({"type": "return_hub"}))

            elif action == "move":
                room_code = player_rooms.get(websocket)
                if room_code in rooms:
                    for p in rooms[room_code]["players"]:
                        await p["ws"].send(json.dumps({"type": "move", "index": data.get("index"), "symbol": data.get("symbol")}))

            elif action == "roll_dice":
                room_code = player_rooms.get(websocket)
                if room_code in rooms:
                    for p in rooms[room_code]["players"]:
                        await p["ws"].send(json.dumps({"type": "dice_rolled", "roller": data.get("roller"), "value": data.get("value")}))

            elif action == "ludo_move":
                room_code = player_rooms.get(websocket)
                if room_code in rooms:
                    for p in rooms[room_code]["players"]:
                        if p["ws"] != websocket: # Don't bounce back to the sender
                            await p["ws"].send(json.dumps({"type": "ludo_move", "roller": data.get("roller"), "token": data.get("token"), "roll": data.get("roll")}))

            elif action == "dng_draw" or action == "dng_clear":
                room_code = player_rooms.get(websocket)
                if room_code in rooms:
                    room = rooms[room_code]
                    for p in room["players"]:
                        if p["ws"] != websocket:
                            await p["ws"].send(message)
            elif action == "chat":
                room_code = player_rooms.get(websocket)
                if room_code in rooms:
                    sender_name = "Unknown"
                    for p in rooms[room_code]["players"]:
                        if p["ws"] == websocket:
                            sender_name = p["name"]
                            break
                    for p in rooms[room_code]["players"]:
                        await p["ws"].send(json.dumps({"type": "chat", "sender": sender_name, "message": data.get("message")}))

            elif action == "typing":
                room_code = player_rooms.get(websocket)
                if room_code in rooms:
                    for p in rooms[room_code]["players"]:
                        if p["ws"] != websocket:
                            await p["ws"].send(json.dumps(data))

            elif action == "tod_event" or action == "dng_event":
                room_code = player_rooms.get(websocket)
                if room_code in rooms:
                    for p in rooms[room_code]["players"]:
                        # Relay the exact data packet to all clients in the room
                        await p["ws"].send(json.dumps(data))

            elif action == "restart":
                room_code = player_rooms.get(websocket)
                if room_code in rooms:
                    for p in rooms[room_code]["players"]:
                        await p["ws"].send(json.dumps({"type": "restart"}))

            elif action == "leave":
                await handle_disconnect(websocket)

    except websockets.exceptions.ConnectionClosed:
        pass
    finally:
        await handle_disconnect(websocket)

async def handle_disconnect(websocket):
    room_code = player_rooms.get(websocket)
    if room_code in rooms:
        room = rooms[room_code]
        disconnected_name = "A player"
        
        # Remove the player
        for p in room["players"]:
            if p["ws"] == websocket:
                disconnected_name = p["name"]
                room["players"].remove(p)
                break
        
        if len(room["players"]) == 0:
            del rooms[room_code]
        else:
            # Tell remaining players someone left
            for p in room["players"]:
                await p["ws"].send(json.dumps({"type": "player_left", "name": disconnected_name}))
            # Broadcast updated lobby if they were in the waiting room
            await broadcast_lobby(room_code)
            
    if websocket in player_rooms:
        del player_rooms[websocket]

async def main():
    port = int(os.environ.get("PORT", 8000))
    async with websockets.serve(game_handler, "0.0.0.0", port):
        await asyncio.Future()

if __name__ == "__main__":
    asyncio.run(main())