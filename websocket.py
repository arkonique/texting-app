import websocket
import threading
import time

# Define the function to be executed on message
def on_message(ws, message):
    print("Received message: ", message)
    my_function()

# Define the function to be executed (just an empty function for this example)
def my_function():
    print("Function executed.")

# Define other WebSocket event handlers
def on_error(ws, error):
    print("Error: ", error)

def on_close(ws, close_status_code, close_msg):
    print("Connection closed.")

def on_open(ws):
    print("Connection opened.")

# Function to start the WebSocket listener
def start_websocket_listener():
    websocket_url = "wss://somethingsomething.com"
    ws = websocket.WebSocketApp(websocket_url,
                                on_message=on_message,
                                on_error=on_error,
                                on_close=on_close)
    ws.on_open = on_open
    ws.run_forever()

# Run the WebSocket listener in a separate thread
if __name__ == "__main__":
    ws_thread = threading.Thread(target=start_websocket_listener)
    ws_thread.start()

    # Main thread can perform other tasks or just wait
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("Exiting...")
