import asyncio
import websockets
import os
import json

connected_players = set()

async def game_handler(websocket):
    connected_players.add(websocket)
    print(f"Player connected! Total players: {len(connected_players)}")
    
    try:
        async for message in websocket:
            # When one player moves, instantly send that move to everyone else
            websockets.broadcast(connected_players, message)
    except websockets.exceptions.ConnectionClosed:
        pass
    finally:
        connected_players.remove(websocket)
        print("Player disconnected.")

async def main():
    # Cloud servers assign their own ports dynamically
    port = int(os.environ.get("PORT", 8000))
    
    # 0.0.0.0 makes the server accessible to the global internet
    async with websockets.serve(game_handler, "0.0.0.0", port):
        print(f"Global server running on port {port}...")
        await asyncio.Future()

if __name__ == "__main__":
    asyncio.run(main())