#!/usr/bin/env python3
# EATMS IoT Device Simulator
# Simulates IoT device communication with the backend API

import json
import time
import random
import requests
import uuid
from datetime import datetime, timedelta
import argparse
import logging
from threading import Thread, Event
from queue import Queue
import math
import paho.mqtt.client as mqtt
from dataclasses import dataclass
from typing import Dict, List, Optional

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@dataclass
class DeviceConfig:
    """Configuration for an IoT device"""
    device_id: str
    vehicle_id: str
    api_endpoint: str
    api_token: str
    mqtt_broker: Optional[str] = None
    mqtt_port: int = 1883
    mqtt_topic: Optional[str] = None
    update_interval: int = 30  # seconds
    simulate_gps: bool = True
    simulate_temperature: bool = True
    simulate_humidity: bool = True
    simulate_motion: bool = True

class IoTDeviceSimulator:
    """Simulates an IoT device sending data to the EATMS backend"""
    
    def __init__(self, config: DeviceConfig):
        self.config = config
        self.running = False
        self.stop_event = Event()
        self.data_queue = Queue()
        self.session = requests.Session()
        self.session.headers.update({
            'Authorization': f'Token {config.api_token}',
            'Content-Type': 'application/json'
        })
        
        # Initialize position and state
        self.current_lat = 9.1450  # Start near Addis Ababa
        self.current_lon = 38.7672
        self.current_altitude = 2350  # meters
        self.current_speed = 0
        self.current_heading = 0
        self.battery_level = 85.0
        self.fuel_level = 75.0
        
        # Environment simulation
        self.current_temp = 20.0
        self.current_humidity = 65.0
        self.pressure = 1013.25
        
        # Motion sensors
        self.acceleration_x = 0.0
        self.acceleration_y = 0.0
        self.acceleration_z = 0.0
        self.shock_detected = False
        
        # Route simulation
        self.waypoints = self._generate_route()
        self.current_waypoint_idx = 0
        
        # MQTT client (if configured)
        self.mqtt_client = None
        if config.mqtt_broker:
            self._setup_mqtt()
    
    def _generate_route(self) -> List[Dict]:
        """Generate a sample route between waypoints"""
        # Simple route from Gondar to Addis Ababa with waypoints
        return [
            {"lat": 12.6044, "lon": 37.4693, "name": "Gondar"},  # Gondar
            {"lat": 11.1549, "lon": 38.7630, "name": "Debre Tabor"},
            {"lat": 10.6410, "lon": 39.2816, "name": "Weldiya"},
            {"lat": 10.0500, "lon": 39.6800, "name": "Kemise"},
            {"lat": 9.1450, "lon": 38.7672, "name": "Addis Ababa"}  # Addis Ababa
        ]
    
    def _setup_mqtt(self):
        """Setup MQTT client for real-time communication"""
        self.mqtt_client = mqtt.Client()
        self.mqtt_client.on_connect = self._on_mqtt_connect
        self.mqtt_client.on_disconnect = self._on_mqtt_disconnect
        self.mqtt_client.on_message = self._on_mqtt_message
        
        try:
            self.mqtt_client.connect(self.config.mqtt_broker, self.config.mqtt_port, 60)
            logger.info(f"Connected to MQTT broker at {self.config.mqtt_broker}")
        except Exception as e:
            logger.error(f"Failed to connect to MQTT broker: {e}")
            self.mqtt_client = None
    
    def _on_mqtt_connect(self, client, userdata, flags, rc):
        """Callback for MQTT connection"""
        if rc == 0:
            logger.info("MQTT client connected")
            if self.config.mqtt_topic:
                client.subscribe(self.config.mqtt_topic)
                logger.info(f"Subscribed to MQTT topic: {self.config.mqtt_topic}")
        else:
            logger.error(f"MQTT connection failed with code {rc}")
    
    def _on_mqtt_disconnect(self, client, userdata, rc):
        """Callback for MQTT disconnection"""
        logger.warning(f"MQTT client disconnected with code {rc}")
    
    def _on_mqtt_message(self, client, userdata, msg):
        """Callback for MQTT messages"""
        try:
            payload = json.loads(msg.payload.decode())
            logger.info(f"Received MQTT message: {payload}")
            
            # Handle commands from backend
            if payload.get('command'):
                self._handle_command(payload)
        except Exception as e:
            logger.error(f"Error processing MQTT message: {e}")
    
    def _handle_command(self, command_data: Dict):
        """Handle commands received from backend"""
        command = command_data.get('command')
        parameters = command_data.get('parameters', {})
        
        logger.info(f"Received command: {command} with params: {parameters}")
        
        # Example command handling
        if command == 'SET_INTERVAL':
            interval = parameters.get('interval', self.config.update_interval)
            self.config.update_interval = interval
            logger.info(f"Update interval set to {interval} seconds")
        
        elif command == 'START_GPS':
            self.config.simulate_gps = True
            logger.info("GPS simulation started")
        
        elif command == 'STOP_GPS':
            self.config.simulate_gps = False
            logger.info("GPS simulation stopped")
        
        elif command == 'SET_ROUTE':
            if 'waypoints' in parameters:
                self.waypoints = parameters['waypoints']
                self.current_waypoint_idx = 0
                logger.info("Route updated")
    
    def _update_position(self):
        """Update GPS position based on route"""
        if not self.config.simulate_gps or not self.waypoints:
            return
        
        # Get current target waypoint
        if self.current_waypoint_idx >= len(self.waypoints):
            # Loop back to beginning
            self.current_waypoint_idx = 0
        
        target = self.waypoints[self.current_waypoint_idx]
        
        # Calculate distance to target
        lat_diff = target['lat'] - self.current_lat
        lon_diff = target['lon'] - self.current_lon
        distance = math.sqrt(lat_diff**2 + lon_diff**2) * 111000  # Approximate meters
        
        # If close to waypoint, move to next
        if distance < 1000:  # 1km threshold
            self.current_waypoint_idx += 1
            if self.current_waypoint_idx < len(self.waypoints):
                target = self.waypoints[self.current_waypoint_idx]
                lat_diff = target['lat'] - self.current_lat
                lon_diff = target['lon'] - self.current_lon
                distance = math.sqrt(lat_diff**2 + lon_diff**2) * 111000
        
        # Calculate movement
        if distance > 0:
            # Move towards target
            move_distance = min(distance, self.current_speed * self.config.update_interval / 3.6)
            
            if move_distance > 0:
                # Calculate new position
                ratio = move_distance / distance
                self.current_lat += lat_diff * ratio
                self.current_lon += lon_diff * ratio
                
                # Update heading
                self.current_heading = math.degrees(math.atan2(lon_diff, lat_diff))
    
    def _update_environment(self):
        """Update environmental sensors"""
        if self.config.simulate_temperature:
            # Simulate temperature changes based on time of day and altitude
            hour = datetime.now().hour
            base_temp = 15 + (hour - 6) * 1.5 if 6 <= hour <= 18 else 15 - (hour - 18) * 0.5
            altitude_factor = (self.current_altitude - 1000) * -0.006  # Lapse rate
            self.current_temp = base_temp + altitude_factor + random.uniform(-1, 1)
        
        if self.config.simulate_humidity:
            # Simulate humidity changes
            self.current_humidity = max(30, min(90, 
                self.current_humidity + random.uniform(-2, 2)))
        
        # Update pressure based on altitude
        self.pressure = 1013.25 * math.exp(-self.current_altitude / 8400)
    
    def _update_motion_sensors(self):
        """Update motion sensors based on vehicle movement"""
        if not self.config.simulate_motion:
            return
        
        # Simulate acceleration based on speed changes
        old_speed = self.current_speed
        speed_change = random.uniform(-5, 5)
        self.current_speed = max(0, min(120, old_speed + speed_change))
        
        # Update accelerations based on movement
        if self.current_speed > 0:
            self.acceleration_x = random.uniform(-0.5, 0.5)
            self.acceleration_y = random.uniform(-0.5, 0.5)
            self.acceleration_z = random.uniform(-0.2, 0.2)
            
            # Detect shock (sudden deceleration or rough movement)
            if speed_change < -3 or random.random() < 0.05:  # 5% chance of shock
                self.shock_detected = True
                self.acceleration_z = random.uniform(-2, -0.5)
            else:
                self.shock_detected = False
        else:
            self.acceleration_x = 0
            self.acceleration_y = 0
            self.acceleration_z = 0
            self.shock_detected = False
    
    def _update_battery_and_fuel(self):
        """Update battery and fuel levels"""
        # Simulate battery drain
        if self.current_speed > 0:
            self.battery_level -= 0.01  # Small drain when moving
        else:
            self.battery_level -= 0.005  # Smaller drain when idle
        
        self.battery_level = max(0, min(100, self.battery_level))
        
        # Simulate fuel consumption
        if self.current_speed > 0:
            # Higher consumption at higher speeds
            consumption_rate = 0.1 + (self.current_speed / 100) * 0.2
            self.fuel_level -= consumption_rate * self.config.update_interval / 3600
        else:
            self.fuel_level -= 0.001  # Idle consumption
        
        self.fuel_level = max(0, min(100, self.fuel_level))
    
    def _generate_sensor_data(self) -> Dict:
        """Generate a sensor data reading"""
        data = {
            "device_id": self.config.device_id,
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "location": {
                "latitude": self.current_lat,
                "longitude": self.current_lon
            },
            "speed": self.current_speed,
            "heading": self.current_heading,
            "altitude": self.current_altitude,
            "battery_level": self.battery_level,
            "fuel_level": self.fuel_level,
        }
        
        # Add environmental sensors if enabled
        if self.config.simulate_temperature or self.config.simulate_humidity:
            data["environment"] = {}
            if self.config.simulate_temperature:
                data["environment"]["temperature"] = round(self.current_temp, 2)
            if self.config.simulate_humidity:
                data["environment"]["humidity"] = round(self.current_humidity, 2)
            if "pressure" in self.__dict__:
                data["environment"]["pressure"] = round(self.pressure, 2)
        
        # Add motion sensors if enabled
        if self.config.simulate_motion:
            data["motion"] = {
                "acceleration_x": round(self.acceleration_x, 3),
                "acceleration_y": round(self.acceleration_y, 3),
                "acceleration_z": round(self.acceleration_z, 3),
                "shock_detected": self.shock_detected
            }
        
        # Add status info
        data["status"] = {
            "simulator_running": self.running,
            "update_interval": self.config.update_interval,
            "waypoint_progress": f"{self.current_waypoint_idx}/{len(self.waypoints)}",
            "next_destination": self.waypoints[self.current_waypoint_idx]['name'] if self.current_waypoint_idx < len(self.waypoints) else "Complete"
        }
        
        return data
    
    def _send_data_to_api(self, data: Dict) -> bool:
        """Send sensor data to the API endpoint"""
        try:
            # Send to bulk sensor data endpoint
            url = f"{self.config.api_endpoint}/api/iot-monitoring/sensor-data/bulk-create/"
            
            # Format data for API
            api_data = [{
                "device": self.config.vehicle_id,  # This should be the actual vehicle UUID
                "shipment": None,  # Could be populated if associated with a shipment
                "location": f"POINT ({data['location']['longitude']} {data['location']['latitude']})",
                "speed": data.get("speed", 0),
                "heading": data.get("heading", 0),
                "altitude": data.get("altitude", 0),
                "temperature": data.get("environment", {}).get("temperature") if data.get("environment") else None,
                "humidity": data.get("environment", {}).get("humidity") if data.get("environment") else None,
                "pressure": data.get("environment", {}).get("pressure") if data.get("environment") else None,
                "acceleration_x": data.get("motion", {}).get("acceleration_x") if data.get("motion") else None,
                "acceleration_y": data.get("motion", {}).get("acceleration_y") if data.get("motion") else None,
                "acceleration_z": data.get("motion", {}).get("acceleration_z") if data.get("motion") else None,
                "shock_detected": data.get("motion", {}).get("shock_detected", False) if data.get("motion") else False,
                "fuel_level": data.get("fuel_level", 0),
                "signal_strength": random.randint(-80, -20),  # Simulate signal strength
                "raw_data": json.dumps(data)  # Store original data for debugging
            }]
            
            response = self.session.post(url, json=api_data)
            
            if response.status_code == 201:
                logger.debug(f"Data sent successfully. Response: {response.json()}")
                return True
            else:
                logger.error(f"Failed to send data. Status: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            logger.error(f"Error sending data to API: {e}")
            return False
    
    def _send_data_to_mqtt(self, data: Dict):
        """Send sensor data via MQTT"""
        if not self.mqtt_client or not self.config.mqtt_topic:
            return
        
        try:
            payload = json.dumps(data)
            self.mqtt_client.publish(self.config.mqtt_topic, payload)
            logger.debug(f"Data sent to MQTT topic {self.config.mqtt_topic}")
        except Exception as e:
            logger.error(f"Error sending data to MQTT: {e}")
    
    def _send_heartbeat(self):
        """Send device heartbeat"""
        try:
            url = f"{self.config.api_endpoint}/api/iot-monitoring/devices/{self.config.device_id}/heartbeat/"
            
            # Update device last heartbeat in database
            # This would typically be handled by a separate heartbeat mechanism
            logger.debug("Sending heartbeat...")
            
        except Exception as e:
            logger.error(f"Error sending heartbeat: {e}")
    
    def _simulation_loop(self):
        """Main simulation loop"""
        last_heartbeat = time.time()
        last_data_send = time.time()
        
        while not self.stop_event.is_set():
            try:
                # Update sensor values
                self._update_position()
                self._update_environment()
                self._update_motion_sensors()
                self._update_battery_and_fuel()
                
                # Generate sensor data
                sensor_data = self._generate_sensor_data()
                
                # Send data periodically
                current_time = time.time()
                if current_time - last_data_send >= self.config.update_interval:
                    success = self._send_data_to_api(sensor_data)
                    if success:
                        last_data_send = current_time
                    
                    # Also send via MQTT if configured
                    self._send_data_to_mqtt(sensor_data)
                
                # Send heartbeat every 5 minutes
                if current_time - last_heartbeat >= 300:  # 5 minutes
                    self._send_heartbeat()
                    last_heartbeat = current_time
                
                # Log data periodically for debugging
                if current_time - last_data_send < 1:  # Right after sending
                    logger.info(f"Sensor data - Lat: {self.current_lat:.4f}, Lon: {self.current_lon:.4f}, "
                              f"Speed: {self.current_speed:.1f} km/h, Temp: {self.current_temp:.1f}°C")
                
                # Sleep for the configured interval
                self.stop_event.wait(self.config.update_interval)
                
            except Exception as e:
                logger.error(f"Error in simulation loop: {e}")
                time.sleep(5)  # Wait before retrying
    
    def start(self):
        """Start the device simulation"""
        if self.running:
            logger.warning("Device simulation is already running")
            return
        
        self.running = True
        logger.info(f"Starting IoT device simulation for {self.config.device_id}")
        
        # Start MQTT client if configured
        if self.mqtt_client:
            self.mqtt_client.loop_start()
        
        # Start simulation in a separate thread
        simulation_thread = Thread(target=self._simulation_loop)
        simulation_thread.daemon = True
        simulation_thread.start()
        
        logger.info("Device simulation started")
    
    def stop(self):
        """Stop the device simulation"""
        if not self.running:
            return
        
        self.running = False
        self.stop_event.set()
        
        # Stop MQTT client if running
        if self.mqtt_client:
            self.mqtt_client.loop_stop()
        
        logger.info("Device simulation stopped")
    
    def send_command(self, command: str, parameters: Dict = None):
        """Send a command to the device (simulated)"""
        logger.info(f"Simulating command to device: {command} with params: {parameters}")
        
        # In a real implementation, this would send a command via MQTT or direct connection
        # For simulation, we'll just update the internal state
        if command == "SET_SPEED":
            if parameters and "speed" in parameters:
                self.current_speed = max(0, min(120, parameters["speed"]))
                logger.info(f"Speed set to {self.current_speed} km/h")
        
        elif command == "STOP":
            self.current_speed = 0
            logger.info("Vehicle stopped")
        
        elif command == "RESUME":
            self.current_speed = 60  # Resume to 60 km/h
            logger.info("Vehicle resumed at 60 km/h")
        
        elif command == "SET_ROUTE":
            if parameters and "waypoints" in parameters:
                self.waypoints = parameters["waypoints"]
                self.current_waypoint_idx = 0
                logger.info("Route updated")

def main():
    """Main function to run the simulator"""
    parser = argparse.ArgumentParser(description="EATMS IoT Device Simulator")
    parser.add_argument("--device-id", required=True, help="Device ID")
    parser.add_argument("--vehicle-id", required=True, help="Vehicle ID")
    parser.add_argument("--api-endpoint", required=True, help="Backend API endpoint")
    parser.add_argument("--api-token", required=True, help="API authentication token")
    parser.add_argument("--mqtt-broker", help="MQTT broker address")
    parser.add_argument("--mqtt-port", type=int, default=1883, help="MQTT broker port")
    parser.add_argument("--mqtt-topic", help="MQTT topic for device")
    parser.add_argument("--interval", type=int, default=30, help="Update interval in seconds")
    parser.add_argument("--no-gps", action="store_true", help="Disable GPS simulation")
    parser.add_argument("--no-temp", action="store_true", help="Disable temperature simulation")
    parser.add_argument("--no-humidity", action="store_true", help="Disable humidity simulation")
    parser.add_argument("--no-motion", action="store_true", help="Disable motion sensor simulation")
    
    args = parser.parse_args()
    
    # Create device configuration
    config = DeviceConfig(
        device_id=args.device_id,
        vehicle_id=args.vehicle_id,
        api_endpoint=args.api_endpoint,
        api_token=args.api_token,
        mqtt_broker=args.mqtt_broker,
        mqtt_port=args.mqtt_port,
        mqtt_topic=args.mqtt_topic,
        update_interval=args.interval,
        simulate_gps=not args.no_gps,
        simulate_temperature=not args.no_temp,
        simulate_humidity=not args.no_humidity,
        simulate_motion=not args.no_motion
    )
    
    # Create and start simulator
    simulator = IoTDeviceSimulator(config)
    
    try:
        simulator.start()
        
        # Keep the main thread alive
        while True:
            time.sleep(1)
            
    except KeyboardInterrupt:
        logger.info("Received keyboard interrupt, stopping simulator...")
        simulator.stop()
    
    logger.info("Simulator stopped")

if __name__ == "__main__":
    main()
