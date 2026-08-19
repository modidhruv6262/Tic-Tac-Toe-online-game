import asyncio
import websockets
import os
import json
import random
import string

# We now use a list to keep track of player order [player1, player2]
rooms = {}
player_rooms = {}

def generate_code():
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=5))

async def game_handler(websocket):
    try:
        async for message in websocket:
            data = json.loads(message)
            action = data.get("action")

            if action == "create":
                room_code = generate_code()
                rooms[room_code] = [websocket]  # Player 1 is first in the list
                player_rooms[websocket] = room_code
                
                await websocket.send(json.dumps({"type": "room_created", "room": room_code}))
                
            elif action == "join":
                room_code = data.get("room").upper()
                if room_code in rooms and len(rooms[room_code]) == 1:
                    rooms[room_code].append(websocket) # Player 2 joins the list
                    player_rooms[websocket] = room_code
                    
                    # Assign roles: Player 1 gets 'X', Player 2 gets 'O'
                    player1 = rooms[room_code][0]
                    player2 = rooms[room_code][1]
                    
                    await player1.send(json.dumps({"type": "game_start", "room": room_code, "role": "X"}))
                    await player2.send(json.dumps({"type": "game_start", "room": room_code, "role": "O"}))
                else:
                    await websocket.send(json.dumps({"type": "error", "message": "Room full or invalid code."}))
                    
            elif action == "move":
                room_code = player_rooms.get(websocket)
                if room_code in rooms:
                    for ws in rooms[room_code]:
                        await ws.send(json.dumps({
                            "type": "move",
                            "index": data.get("index"),
                            "symbol": data.get("symbol")
                        }))
                        
    except websockets.exceptions.ConnectionClosed:
        pass
    finally:
        room_code = player_rooms.get(websocket)
        if room_code:
            if websocket in rooms.get(room_code, []):
                rooms[room_code].remove(websocket)
            
            if len(rooms[room_code]) == 0:
                del rooms[room_code]
            else:
                for ws in rooms[room_code]:
                    await ws.send(json.dumps({"type": "player_left"}))
                    
        if websocket in player_rooms:
            del player_rooms[websocket]

async def main():
    port = int(os.environ.get("PORT", 8000))
    async with websockets.serve(game_handler, "0.0.0.0", port):
        print(f"Global server running on port {port}...")
        await asyncio.Future()

if __name__ == "__main__":
    asyncio.run(main())