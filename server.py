import asyncio
import websockets
import os
import json
import random
import string

rooms = {}
player_rooms = {}
# NEW: Store names!
player_names = {} 

def generate_code():
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=5))

async def game_handler(websocket):
    try:
        async for message in websocket:
            data = json.loads(message)
            action = data.get("action")

            if action == "create":
                room_code = generate_code()
                rooms[room_code] = [websocket]  
                player_rooms[websocket] = room_code
                
                # Save their name
                player_names[websocket] = data.get("name", "Player 1")
                
                await websocket.send(json.dumps({"type": "room_created", "room": room_code}))
                
            elif action == "join":
                room_code = data.get("room").upper()
                if room_code in rooms and len(rooms[room_code]) == 1:
                    rooms[room_code].append(websocket) 
                    player_rooms[websocket] = room_code
                    
                    # Save their name
                    player_names[websocket] = data.get("name", "Player 2")
                    
                    player1 = rooms[room_code][0]
                    player2 = rooms[room_code][1]
                    
                    p1_name = player_names.get(player1, "Player 1")
                    p2_name = player_names.get(player2, "Player 2")
                    
                    # Send each player the OTHER player's name!
                    await player1.send(json.dumps({"type": "game_start", "room": room_code, "role": "X", "opponent": p2_name}))
                    await player2.send(json.dumps({"type": "game_start", "room": room_code, "role": "O", "opponent": p1_name}))
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
            
            elif action == "restart":
                room_code = player_rooms.get(websocket)
                if room_code in rooms:
                    for ws in rooms[room_code]:
                        await ws.send(json.dumps({"type": "restart"}))
            
            elif action == "leave":
                room_code = player_rooms.get(websocket)
                if room_code:
                    if websocket in rooms.get(room_code, []):
                        rooms[room_code].remove(websocket)
                    
                    if len(rooms[room_code]) == 0:
                        del rooms[room_code]
                    else:
                        for ws in rooms[room_code]:
                            await ws.send(json.dumps({"type": "player_left"}))
                    
                    del player_rooms[websocket]

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
            
        # Clean up name memory
        if websocket in player_names:
            del player_names[websocket]

async def main():
    port = int(os.environ.get("PORT", 8000))
    async with websockets.serve(game_handler, "0.0.0.0", port):
        print(f"Global server running on port {port}...")
        await asyncio.Future()

if __name__ == "__main__":
    asyncio.run(main())