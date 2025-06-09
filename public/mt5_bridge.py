
"""
MT5 Trading Bridge - FastAPI Server
This script connects to your local MT5 terminal and provides an API for trading operations.

Requirements:
pip install MetaTrader5 fastapi uvicorn requests websockets

Usage:
python mt5_bridge.py

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

@app.post("/connect")
async def connect_mt5(request: ConnectionRequest):
    global mt5_connected
    
    try:
        # Initialize MT5
        if not mt5.initialize():
            return {"success": False, "error": "Failed to initialize MT5"}
        
        # Login to account
        login_result = mt5.login(
            login=request.account_number,
            password=request.password,
            server=request.server
        )
        
        if not login_result:
            error_code = mt5.last_error()
            return {"success": False, "error": f"Login failed: {error_code}"}
        
        # Get account info
        account_info = mt5.account_info()
        if account_info is None:
            return {"success": False, "error": "Failed to get account info"}
        
        mt5_connected = True
        
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
            return {"success": False, "error": f"Order failed: {result.comment}"}
        
        return {
            "success": True,
            "trade_info": {
                "ticket": result.order,
                "open_price": result.price
            }
        }
        
    except Exception as e:
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
            return {"success": False, "error": f"Close failed: {result.comment}"}
        
        return {
            "success": True,
            "close_price": result.price,
            "profit": position.profit
        }
        
    except Exception as e:
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
    
    logger.info("Auto trading bot started")
    
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
                        logger.info(f"Auto trade placed: {trade_type} {lot_size} {symbol} at {price}")
            
            # Sleep before next cycle
            time.sleep(5)
            
        except Exception as e:
            logger.error(f"Auto trading error: {e}")
            time.sleep(10)
    
    logger.info("Auto trading bot stopped")

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
        
        return {"success": True, "message": "Auto trading started"}
        
    except Exception as e:
        return {"success": False, "error": str(e)}

@app.post("/stop_auto_trading")
async def stop_auto_trading():
    global auto_trading_active
    
    auto_trading_active = False
    return {"success": True, "message": "Auto trading stopped"}

@app.get("/status")
async def get_status():
    return {
        "mt5_connected": mt5_connected,
        "auto_trading_active": auto_trading_active,
        "auto_trading_settings": auto_trading_settings
    }

if __name__ == "__main__":
    print("Starting MT5 Trading Bridge...")
    print("Server will run on http://localhost:8000")
    print("Make sure MT5 terminal is running and 'Allow automated trading' is enabled")
    uvicorn.run(app, host="127.0.0.1", port=8000)
