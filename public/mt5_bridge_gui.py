
"""
MT5 Trading Bridge with GUI - FastAPI Server
This script connects to your local MT5 terminal and provides an API for trading operations.
Includes a modern GUI for easy monitoring and control.

Requirements:
pip install MetaTrader5 fastapi uvicorn requests websockets tkinter

Usage:
python mt5_bridge_gui.py

The server will run on http://localhost:8000
"""

import MetaTrader5 as mt5
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import threading
import time
import random
from typing import Optional, Dict, Any
import logging
import tkinter as tk
from tkinter import ttk, scrolledtext, messagebox
from datetime import datetime
import queue

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="MT5 Trading Bridge", version="1.0.0")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables
mt5_connected = False
auto_trading_active = False
auto_trading_settings = {}
auto_trading_thread = None
server_thread = None
server_running = False
log_queue = queue.Queue()

# Pydantic models
class ConnectionRequest(BaseModel):
    server: str
    account_number: int
    password: str

class OrderRequest(BaseModel):
    symbol: str
    trade_type: str
    volume: float
    price: Optional[float] = None
    stop_loss: Optional[float] = None
    take_profit: Optional[float] = None
    comment: Optional[str] = ""
    magic_number: Optional[int] = 12345

class CloseOrderRequest(BaseModel):
    ticket: int

class AutoTradingRequest(BaseModel):
    symbol: str
    lot_size: float
    stop_loss_pips: int
    take_profit_pips: int
    max_trades: int
    trading_strategy: str

def log_to_gui(message):
    """Add log message to GUI queue"""
    timestamp = datetime.now().strftime("%H:%M:%S")
    log_queue.put(f"[{timestamp}] {message}")

@app.post("/connect")
async def connect_mt5(request: ConnectionRequest):
    global mt5_connected
    
    try:
        # Initialize MT5
        if not mt5.initialize():
            log_to_gui("Failed to initialize MT5")
            return {"success": False, "error": "Failed to initialize MT5"}
        
        # Login to account
        login_result = mt5.login(
            login=request.account_number,
            password=request.password,
            server=request.server
        )
        
        if not login_result:
            error_code = mt5.last_error()
            log_to_gui(f"Login failed: {error_code}")
            return {"success": False, "error": f"Login failed: {error_code}"}
        
        # Get account info
        account_info = mt5.account_info()
        if account_info is None:
            log_to_gui("Failed to get account info")
            return {"success": False, "error": "Failed to get account info"}
        
        mt5_connected = True
        log_to_gui(f"Connected to MT5 account {request.account_number}")
        
        return {
            "success": True,
            "account_info": {
                "name": account_info.name,
                "company": account_info.company,
                "currency": account_info.currency,
                "balance": account_info.balance,
                "equity": account_info.equity,
                "margin": account_info.margin,
                "free_margin": account_info.margin_free,
                "margin_level": account_info.margin_level,
                "leverage": account_info.leverage
            }
        }
        
    except Exception as e:
        log_to_gui(f"Connection error: {str(e)}")
        return {"success": False, "error": str(e)}

@app.post("/place_order")
async def place_order(request: OrderRequest):
    if not mt5_connected:
        return {"success": False, "error": "MT5 not connected"}
    
    try:
        # Get current price if not provided
        if request.price is None:
            tick = mt5.symbol_info_tick(request.symbol)
            if tick is None:
                return {"success": False, "error": f"Failed to get price for {request.symbol}"}
            request.price = tick.ask if request.trade_type == "BUY" else tick.bid
        
        # Prepare order request
        order_type = mt5.ORDER_TYPE_BUY if request.trade_type == "BUY" else mt5.ORDER_TYPE_SELL
        
        order_request = {
            "action": mt5.TRADE_ACTION_DEAL,
            "symbol": request.symbol,
            "volume": request.volume,
            "type": order_type,
            "price": request.price,
            "deviation": 20,
            "magic": request.magic_number,
            "comment": request.comment,
            "type_time": mt5.ORDER_TIME_GTC,
            "type_filling": mt5.ORDER_FILLING_IOC,
        }
        
        if request.stop_loss:
            order_request["sl"] = request.stop_loss
        if request.take_profit:
            order_request["tp"] = request.take_profit
        
        # Send order
        result = mt5.order_send(order_request)
        
        if result.retcode != mt5.TRADE_RETCODE_DONE:
            log_to_gui(f"Order failed: {result.comment}")
            return {"success": False, "error": f"Order failed: {result.comment}"}
        
        log_to_gui(f"Order placed: {request.trade_type} {request.volume} {request.symbol}")
        return {
            "success": True,
            "trade_info": {
                "ticket": result.order,
                "open_price": result.price
            }
        }
        
    except Exception as e:
        log_to_gui(f"Place order error: {str(e)}")
        return {"success": False, "error": str(e)}

@app.post("/close_order")
async def close_order(request: CloseOrderRequest):
    if not mt5_connected:
        return {"success": False, "error": "MT5 not connected"}
    
    try:
        # Get position info
        positions = mt5.positions_get(ticket=request.ticket)
        if not positions:
            return {"success": False, "error": "Position not found"}
        
        position = positions[0]
        
        # Prepare close request
        close_request = {
            "action": mt5.TRADE_ACTION_DEAL,
            "symbol": position.symbol,
            "volume": position.volume,
            "type": mt5.ORDER_TYPE_SELL if position.type == mt5.ORDER_TYPE_BUY else mt5.ORDER_TYPE_BUY,
            "position": request.ticket,
            "deviation": 20,
            "magic": position.magic,
            "comment": "Close position",
            "type_time": mt5.ORDER_TIME_GTC,
            "type_filling": mt5.ORDER_FILLING_IOC,
        }
        
        # Get current price
        tick = mt5.symbol_info_tick(position.symbol)
        if tick is None:
            return {"success": False, "error": "Failed to get current price"}
        
        close_request["price"] = tick.bid if position.type == mt5.ORDER_TYPE_BUY else tick.ask
        
        # Close position
        result = mt5.order_send(close_request)
        
        if result.retcode != mt5.TRADE_RETCODE_DONE:
            log_to_gui(f"Close failed: {result.comment}")
            return {"success": False, "error": f"Close failed: {result.comment}"}
        
        log_to_gui(f"Position #{request.ticket} closed")
        return {
            "success": True,
            "close_price": result.price,
            "profit": position.profit
        }
        
    except Exception as e:
        log_to_gui(f"Close order error: {str(e)}")
        return {"success": False, "error": str(e)}

@app.post("/account_info")
async def get_account_info():
    if not mt5_connected:
        return {"success": False, "error": "MT5 not connected"}
    
    try:
        account_info = mt5.account_info()
        if account_info is None:
            return {"success": False, "error": "Failed to get account info"}
        
        return {
            "success": True,
            "account_info": {
                "balance": account_info.balance,
                "equity": account_info.equity,
                "margin": account_info.margin,
                "free_margin": account_info.margin_free,
                "margin_level": account_info.margin_level
            }
        }
        
    except Exception as e:
        return {"success": False, "error": str(e)}

@app.post("/positions")
async def get_positions():
    if not mt5_connected:
        return {"success": False, "error": "MT5 not connected"}
    
    try:
        positions = mt5.positions_get()
        if positions is None:
            return {"success": True, "positions": []}
        
        position_list = []
        for pos in positions:
            position_list.append({
                "ticket": pos.ticket,
                "symbol": pos.symbol,
                "type": "BUY" if pos.type == mt5.ORDER_TYPE_BUY else "SELL",
                "volume": pos.volume,
                "price_open": pos.price_open,
                "profit": pos.profit,
                "swap": pos.swap,
                "comment": pos.comment
            })
        
        return {"success": True, "positions": position_list}
        
    except Exception as e:
        return {"success": False, "error": str(e)}

def auto_trading_bot():
    """Auto trading bot logic"""
    global auto_trading_active, auto_trading_settings
    
    log_to_gui("Auto trading bot started")
    
    while auto_trading_active:
        try:
            if not mt5_connected:
                time.sleep(5)
                continue
            
            settings = auto_trading_settings
            symbol = settings.get("symbol", "EURUSD")
            lot_size = settings.get("lot_size", 0.01)
            strategy = settings.get("trading_strategy", "scalping")
            max_trades = settings.get("max_trades", 5)
            
            # Get current positions count
            positions = mt5.positions_get(symbol=symbol)
            current_positions = len(positions) if positions else 0
            
            # Check if we can place more trades
            if current_positions >= max_trades:
                time.sleep(10)
                continue
            
            # Get market data
            tick = mt5.symbol_info_tick(symbol)
            if tick is None:
                time.sleep(5)
                continue
            
            # Simple trading logic based on strategy
            if strategy == "scalping":
                # Random scalping strategy (for demo purposes)
                if random.random() > 0.95:  # 5% chance to trade each cycle
                    trade_type = "BUY" if random.random() > 0.5 else "SELL"
                    price = tick.ask if trade_type == "BUY" else tick.bid
                    
                    # Calculate SL and TP
                    pip_value = 0.0001 if "JPY" not in symbol else 0.01
                    sl_pips = settings.get("stop_loss_pips", 50)
                    tp_pips = settings.get("take_profit_pips", 100)
                    
                    if trade_type == "BUY":
                        stop_loss = price - (sl_pips * pip_value)
                        take_profit = price + (tp_pips * pip_value)
                    else:
                        stop_loss = price + (sl_pips * pip_value)
                        take_profit = price - (tp_pips * pip_value)
                    
                    # Place order
                    order_request = {
                        "action": mt5.TRADE_ACTION_DEAL,
                        "symbol": symbol,
                        "volume": lot_size,
                        "type": mt5.ORDER_TYPE_BUY if trade_type == "BUY" else mt5.ORDER_TYPE_SELL,
                        "price": price,
                        "sl": stop_loss,
                        "tp": take_profit,
                        "deviation": 20,
                        "magic": 99999,
                        "comment": f"Auto Bot - {strategy}",
                        "type_time": mt5.ORDER_TIME_GTC,
                        "type_filling": mt5.ORDER_FILLING_IOC,
                    }
                    
                    result = mt5.order_send(order_request)
                    if result.retcode == mt5.TRADE_RETCODE_DONE:
                        log_to_gui(f"Auto trade placed: {trade_type} {lot_size} {symbol} at {price}")
            
            # Sleep before next cycle
            time.sleep(5)
            
        except Exception as e:
            log_to_gui(f"Auto trading error: {e}")
            time.sleep(10)
    
    log_to_gui("Auto trading bot stopped")

@app.post("/start_auto_trading")
async def start_auto_trading(request: AutoTradingRequest):
    global auto_trading_active, auto_trading_settings, auto_trading_thread
    
    if not mt5_connected:
        return {"success": False, "error": "MT5 not connected"}
    
    if auto_trading_active:
        return {"success": False, "error": "Auto trading already active"}
    
    try:
        auto_trading_settings = request.dict()
        auto_trading_active = True
        
        # Start trading thread
        auto_trading_thread = threading.Thread(target=auto_trading_bot)
        auto_trading_thread.daemon = True
        auto_trading_thread.start()
        
        log_to_gui(f"Auto trading started: {request.symbol} - {request.trading_strategy}")
        return {"success": True, "message": "Auto trading started"}
        
    except Exception as e:
        log_to_gui(f"Start auto trading error: {str(e)}")
        return {"success": False, "error": str(e)}

@app.post("/stop_auto_trading")
async def stop_auto_trading():
    global auto_trading_active
    
    auto_trading_active = False
    log_to_gui("Auto trading stopped")
    return {"success": True, "message": "Auto trading stopped"}

@app.get("/status")
async def get_status():
    return {
        "mt5_connected": mt5_connected,
        "auto_trading_active": auto_trading_active,
        "auto_trading_settings": auto_trading_settings
    }

class MT5BridgeGUI:
    def __init__(self):
        self.root = tk.Tk()
        self.root.title("MT5 Trading Bridge Server")
        self.root.geometry("800x600")
        
        # Configure style
        style = ttk.Style()
        style.theme_use('clam')
        
        self.setup_ui()
        self.update_status_loop()
        
    def setup_ui(self):
        # Main frame
        main_frame = ttk.Frame(self.root)
        main_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        # Status frame
        status_frame = ttk.LabelFrame(main_frame, text="Server Status", padding=10)
        status_frame.pack(fill=tk.X, pady=(0, 10))
        
        # Server status
        self.server_status_label = ttk.Label(status_frame, text="Server: Stopped", font=("Arial", 12, "bold"))
        self.server_status_label.pack(anchor=tk.W)
        
        # MT5 status
        self.mt5_status_label = ttk.Label(status_frame, text="MT5: Disconnected")
        self.mt5_status_label.pack(anchor=tk.W)
        
        # Auto trading status
        self.auto_trading_status_label = ttk.Label(status_frame, text="Auto Trading: Inactive")
        self.auto_trading_status_label.pack(anchor=tk.W)
        
        # Control buttons frame
        control_frame = ttk.Frame(main_frame)
        control_frame.pack(fill=tk.X, pady=(0, 10))
        
        self.start_button = ttk.Button(control_frame, text="Start Server", command=self.start_server, style="Accent.TButton")
        self.start_button.pack(side=tk.LEFT, padx=(0, 5))
        
        self.stop_button = ttk.Button(control_frame, text="Stop Server", command=self.stop_server, state=tk.DISABLED)
        self.stop_button.pack(side=tk.LEFT, padx=(0, 5))
        
        self.clear_logs_button = ttk.Button(control_frame, text="Clear Logs", command=self.clear_logs)
        self.clear_logs_button.pack(side=tk.RIGHT)
        
        # Logs frame
        logs_frame = ttk.LabelFrame(main_frame, text="Server Logs", padding=10)
        logs_frame.pack(fill=tk.BOTH, expand=True)
        
        # Logs text area
        self.logs_text = scrolledtext.ScrolledText(logs_frame, wrap=tk.WORD, height=20)
        self.logs_text.pack(fill=tk.BOTH, expand=True)
        
        # Initial log message
        self.add_log("MT5 Trading Bridge GUI initialized")
        self.add_log("Click 'Start Server' to begin")
        
    def start_server(self):
        global server_thread, server_running
        
        if not server_running:
            server_running = True
            server_thread = threading.Thread(target=self.run_server)
            server_thread.daemon = True
            server_thread.start()
            
            self.start_button.config(state=tk.DISABLED)
            self.stop_button.config(state=tk.NORMAL)
            self.add_log("Starting MT5 Trading Bridge server on http://localhost:8000")
            
    def run_server(self):
        try:
            uvicorn.run(app, host="127.0.0.1", port=8000, log_level="info")
        except Exception as e:
            self.add_log(f"Server error: {str(e)}")
            
    def stop_server(self):
        global server_running, auto_trading_active
        
        server_running = False
        auto_trading_active = False
        
        self.start_button.config(state=tk.NORMAL)
        self.stop_button.config(state=tk.DISABLED)
        self.add_log("Server stopped")
        
        # Force close the application
        self.root.after(1000, self.root.quit)
        
    def clear_logs(self):
        self.logs_text.delete(1.0, tk.END)
        
    def add_log(self, message):
        timestamp = datetime.now().strftime("%H:%M:%S")
        self.logs_text.insert(tk.END, f"[{timestamp}] {message}\n")
        self.logs_text.see(tk.END)
        
    def update_status_loop(self):
        # Update server status
        if server_running:
            self.server_status_label.config(text="Server: Running on http://localhost:8000", foreground="green")
        else:
            self.server_status_label.config(text="Server: Stopped", foreground="red")
            
        # Update MT5 status
        if mt5_connected:
            self.mt5_status_label.config(text="MT5: Connected", foreground="green")
        else:
            self.mt5_status_label.config(text="MT5: Disconnected", foreground="red")
            
        # Update auto trading status
        if auto_trading_active:
            symbol = auto_trading_settings.get("symbol", "N/A")
            strategy = auto_trading_settings.get("trading_strategy", "N/A")
            self.auto_trading_status_label.config(text=f"Auto Trading: Active ({symbol} - {strategy})", foreground="green")
        else:
            self.auto_trading_status_label.config(text="Auto Trading: Inactive", foreground="red")
            
        # Process log queue
        try:
            while True:
                log_message = log_queue.get_nowait()
                self.add_log(log_message)
        except queue.Empty:
            pass
            
        # Schedule next update
        self.root.after(1000, self.update_status_loop)
        
    def run(self):
        try:
            self.root.mainloop()
        except KeyboardInterrupt:
            self.stop_server()

if __name__ == "__main__":
    print("Starting MT5 Trading Bridge with GUI...")
    gui = MT5BridgeGUI()
    gui.run()
