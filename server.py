import asyncio
import websockets
import os
import json
import random
import string

rooms = {}
player_rooms = {}
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
                player_names[websocket] = data.get("name", "Host")
                await websocket.send(json.dumps({"type": "room_created", "room": room_code}))
                
            elif action == "join":
                room_code = data.get("room").upper()
                if room_code in rooms and len(rooms[room_code]) == 1:
                    rooms[room_code].append(websocket) 
                    player_rooms[websocket] = room_code
                    player_names[websocket] = data.get("name", "Guest")
                    
                    player1 = rooms[room_code][0] # Host
                    player2 = rooms[room_code][1] # Guest
                    
                    p1_name = player_names.get(player1, "Host")
                    p2_name = player_names.get(player2, "Guest")
                    
                    await player1.send(json.dumps({"type": "hub_start", "room": room_code, "role": "Host", "opponent": p2_name}))
                    await player2.send(json.dumps({"type": "hub_start", "room": room_code, "role": "Guest", "opponent": p1_name}))
                else:
                    await websocket.send(json.dumps({"type": "error", "message": "Invalid Code or Room Full."}))
            
            # --- NEW: HOST REMOTE CONTROL ROUTING ---
            elif action == "launch_game":
                room_code = player_rooms.get(websocket)
                if room_code in rooms:
                    for ws in rooms[room_code]:
                        await ws.send(json.dumps({
                            "type": "launch_game",
                            "game": data.get("game")
                        }))
            
            elif action == "return_hub":
                room_code = player_rooms.get(websocket)
                if room_code in rooms:
                    for ws in rooms[room_code]:
                        await ws.send(json.dumps({"type": "return_hub"}))
                        
            # Standard Game Actions
            elif action == "move":
                room_code = player_rooms.get(websocket)
                if room_code in rooms:
                    for ws in rooms[room_code]:
                        await ws.send(json.dumps({"type": "move", "index": data.get("index"), "symbol": data.get("symbol")}))
            
            elif action == "chat":
                room_code = player_rooms.get(websocket)
                if room_code in rooms:
                    sender_name = player_names.get(websocket, "Unknown")
                    for ws in rooms[room_code]:
                        await ws.send(json.dumps({"type": "chat", "sender": sender_name, "message": data.get("message")}))
            
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
        if websocket in player_names:
            del player_names[websocket]

async def main():
    port = int(os.environ.get("PORT", 8000))
    async with websockets.serve(game_handler, "0.0.0.0", port):
        print(f"Global server running on port {port}...")
        await asyncio.Future()

if __name__ == "__main__":
    asyncio.run(main())