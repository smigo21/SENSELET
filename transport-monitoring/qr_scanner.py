#!/usr/bin/env python3
# EATMS QR Code Scanner for Transport Monitoring
# Handles QR code scanning for shipment verification at checkpoints

import json
import requests
import qrcode
from io import BytesIO
from PIL import Image
import cv2
import numpy as np
from datetime import datetime
from typing import Dict, Optional, Tuple
import logging
from dataclasses import dataclass
from enum import Enum

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class VerificationStatus(Enum):
    """Enum for verification status"""
    SUCCESS = "SUCCESS"
    FAILED = "FAILED"
    NOT_FOUND = "NOT_FOUND"
    ALREADY_VERIFIED = "ALREADY_VERIFIED"
    INVALID_QR = "INVALID_QR"

@dataclass
class ShipmentInfo:
    """Data class for shipment information"""
    shipment_id: str
    shipment_number: str
    farmer_id: str
    farmer_name: str
    trader_id: str
    trader_name: str
    vehicle_id: str
    vehicle_license: str
    crop_type: str
    quantity: float
    pickup_location: str
    delivery_location: str
    scheduled_pickup: str
    estimated_delivery: str
    temperature_range: Tuple[float, float]
    humidity_range: Tuple[float, float]
    qr_code_data: str

class QRCodeScanner:
    """Handles QR code scanning and verification for transport monitoring"""
    
    def __init__(self, api_endpoint: str, api_token: str):
        """
        Initialize the QR code scanner
        
        Args:
            api_endpoint: Backend API endpoint
            api_token: API authentication token
        """
        self.api_endpoint = api_endpoint.rstrip('/')
        self.api_token = api_token
        self.session = requests.Session()
        self.session.headers.update({
            'Authorization': f'Token {api_token}',
            'Content-Type': 'application/json'
        })
        
        # Initialize camera and QR code detector
        self.qr_detector = cv2.QRCodeDetector()
        
    def scan_qr_code_from_image(self, image_path: str) -> Optional[str]:
        """
        Scan QR code from an image file
        
        Args:
            image_path: Path to the image file
            
        Returns:
            QR code data if successful, None otherwise
        """
        try:
            # Read the image
            image = cv2.imread(image_path)
            if image is None:
                logger.error(f"Could not read image from {image_path}")
                return None
            
            # Detect and decode QR code
            data, bbox, _ = self.qr_detector.detectAndDecode(image)
            
            if data:
                logger.info(f"Successfully scanned QR code: {data}")
                return data
            else:
                logger.warning("No QR code found in the image")
                return None
                
        except Exception as e:
            logger.error(f"Error scanning QR code: {e}")
            return None
    
    def scan_qr_code_from_camera(self) -> Optional[str]:
        """
        Scan QR code from live camera feed
        
        Returns:
            QR code data if successful, None otherwise
        """
        try:
            # Initialize camera
            cap = cv2.VideoCapture(0)
            
            if not cap.isOpened():
                logger.error("Could not open camera")
                return None
            
            logger.info("Starting QR code scanning from camera...")
            
            while True:
                # Read frame from camera
                ret, frame = cap.read()
                if not ret:
                    logger.error("Failed to read frame from camera")
                    break
                
                # Detect and decode QR code
                data, bbox, _ = self.qr_detector.detectAndDecode(frame)
                
                if data:
                    logger.info(f"Successfully scanned QR code: {data}")
                    cap.release()
                    return data
                
                # Display the frame
                cv2.imshow('QR Code Scanner', frame)
                
                # Break on 'q' key press
                if cv2.waitKey(1) & 0xFF == ord('q'):
                    logger.info("QR code scanning cancelled by user")
                    break
            
            cap.release()
            cv2.destroyAllWindows()
            return None
            
        except Exception as e:
            logger.error(f"Error scanning QR code from camera: {e}")
            return None
    
    def decode_shipment_info(self, qr_data: str) -> Optional[ShipmentInfo]:
        """
        Decode shipment information from QR code data
        
        Args:
            qr_data: QR code data string
            
        Returns:
            ShipmentInfo object if successful, None otherwise
        """
        try:
            # The QR code should contain JSON data
            shipment_data = json.loads(qr_data)
            
            required_fields = [
                'shipment_id', 'shipment_number', 'farmer_id', 'farmer_name',
                'trader_id', 'trader_name', 'vehicle_id', 'vehicle_license',
                'crop_type', 'quantity', 'pickup_location', 'delivery_location',
                'scheduled_pickup', 'estimated_delivery', 'temperature_range',
                'humidity_range', 'qr_code_data'
            ]
            
            # Validate all required fields
            for field in required_fields:
                if field not in shipment_data:
                    logger.error(f"Missing required field in QR data: {field}")
                    return None
            
            # Parse temperature and humidity ranges
            temp_range = (
                float(shipment_data['temperature_range'][0]),
                float(shipment_data['temperature_range'][1])
            )
            
            humidity_range = (
                float(shipment_data['humidity_range'][0]),
                float(shipment_data['humidity_range'][1])
            )
            
            return ShipmentInfo(
                shipment_id=shipment_data['shipment_id'],
                shipment_number=shipment_data['shipment_number'],
                farmer_id=shipment_data['farmer_id'],
                farmer_name=shipment_data['farmer_name'],
                trader_id=shipment_data['trader_id'],
                trader_name=shipment_data['trader_name'],
                vehicle_id=shipment_data['vehicle_id'],
                vehicle_license=shipment_data['vehicle_license'],
                crop_type=shipment_data['crop_type'],
                quantity=float(shipment_data['quantity']),
                pickup_location=shipment_data['pickup_location'],
                delivery_location=shipment_data['delivery_location'],
                scheduled_pickup=shipment_data['scheduled_pickup'],
                estimated_delivery=shipment_data['estimated_delivery'],
                temperature_range=temp_range,
                humidity_range=humidity_range,
                qr_code_data=qr_data
            )
            
        except json.JSONDecodeError as e:
            logger.error(f"Invalid JSON in QR data: {e}")
            return None
        except (KeyError, ValueError, TypeError) as e:
            logger.error(f"Invalid shipment data format: {e}")
            return None
        except Exception as e:
            logger.error(f"Error decoding shipment info: {e}")
            return None
    
    def verify_shipment_at_checkpoint(self, 
                                    checkpoint_id: str,
                                    checkpoint_name: str,
                                    officer_id: str,
                                    officer_name: str,
                                    qr_data: str,
                                    current_location: Dict[str, float],
                                    notes: str = "") -> Tuple[VerificationStatus, str]:
        """
        Verify shipment at a checkpoint
        
        Args:
            checkpoint_id: ID of the checkpoint
            checkpoint_name: Name of the checkpoint
            officer_id: ID of the verifying officer
            officer_name: Name of the verifying officer
            qr_data: QR code data
            current_location: Current GPS location {latitude, longitude}
            notes: Additional notes about verification
            
        Returns:
            Tuple of (VerificationStatus, message)
        """
        try:
            # Decode shipment information
            shipment_info = self.decode_shipment_info(qr_data)
            if not shipment_info:
                return VerificationStatus.INVALID_QR, "Invalid QR code data"
            
            # Check if shipment has already been verified at this checkpoint
            verification_status = self._check_previous_verification(
                shipment_info.shipment_id, checkpoint_id
            )
            
            if verification_status == VerificationStatus.ALREADY_VERIFIED:
                return VerificationStatus.ALREADY_VERIFIED, "Shipment already verified at this checkpoint"
            
            # Record verification
            verification_data = {
                "shipment_id": shipment_info.shipment_id,
                "checkpoint_id": checkpoint_id,
                "checkpoint_name": checkpoint_name,
                "officer_id": officer_id,
                "officer_name": officer_name,
                "verification_time": datetime.utcnow().isoformat() + "Z",
                "location": current_location,
                "notes": notes,
                "vehicle_condition": "GOOD",  # This would be captured from UI
                "cargo_temperature": None,  # This would be captured from IoT device
                "cargo_humidity": None,     # This would be captured from IoT device
                "verified_qr_data": qr_data
            }
            
            # Send verification to backend
            response = self.session.post(
                f"{self.api_endpoint}/api/transport/checkpoints/verify/",
                json=verification_data
            )
            
            if response.status_code == 201:
                logger.info(f"Successfully verified shipment {shipment_info.shipment_number} at checkpoint {checkpoint_name}")
                return VerificationStatus.SUCCESS, "Shipment verified successfully"
            else:
                logger.error(f"Failed to verify shipment: {response.status_code} - {response.text}")
                return VerificationStatus.FAILED, "Failed to verify shipment"
                
        except Exception as e:
            logger.error(f"Error verifying shipment: {e}")
            return VerificationStatus.FAILED, f"Error: {str(e)}"
    
    def _check_previous_verification(self, shipment_id: str, checkpoint_id: str) -> VerificationStatus:
        """
        Check if shipment has been previously verified at the same checkpoint
        
        Args:
            shipment_id: ID of the shipment
            checkpoint_id: ID of the checkpoint
            
        Returns:
            VerificationStatus
        """
        try:
            response = self.session.get(
                f"{self.api_endpoint}/api/transport/checkpoints/verifications/",
                params={
                    "shipment_id": shipment_id,
                    "checkpoint_id": checkpoint_id
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("count", 0) > 0:
                    return VerificationStatus.ALREADY_VERIFIED
            return VerificationStatus.SUCCESS
            
        except Exception as e:
            logger.error(f"Error checking previous verification: {e}")
            return VerificationStatus.SUCCESS  # Default to success if check fails
    
    def generate_qr_code(self, data: Dict, output_path: str = None) -> Optional[str]:
        """
        Generate QR code from shipment data
        
        Args:
            data: Dictionary containing shipment data
            output_path: Path to save QR code image (optional)
            
        Returns:
            QR code data string if successful, None otherwise
        """
        try:
            # Convert data to JSON string
            json_data = json.dumps(data, separators=(',', ':'))
            
            # Generate QR code
            qr = qrcode.QRCode(
                version=1,
                error_correction=qrcode.constants.ERROR_CORRECT_L,
                box_size=10,
                border=4,
            )
            qr.add_data(json_data)
            qr.make(fit=True)
            
            # Create image
            img = qr.make_image(fill_color="black", back_color="white")
            
            # Save if output path provided
            if output_path:
                img.save(output_path)
                logger.info(f"QR code saved to {output_path}")
            
            return json_data
            
        except Exception as e:
            logger.error(f"Error generating QR code: {e}")
            return None
    
    def get_shipment_details(self, shipment_id: str) -> Optional[Dict]:
        """
        Get detailed information about a shipment
        
        Args:
            shipment_id: ID of the shipment
            
        Returns:
            Dictionary with shipment details if successful, None otherwise
        """
        try:
            response = self.session.get(
                f"{self.api_endpoint}/api/shipments/{shipment_id}/"
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                logger.error(f"Failed to get shipment details: {response.status_code}")
                return None
                
        except Exception as e:
            logger.error(f"Error getting shipment details: {e}")
            return None
    
    def get_checkpoint_verification_history(self, shipment_id: str) -> Optional[List[Dict]]:
        """
        Get verification history for a shipment
        
        Args:
            shipment_id: ID of the shipment
            
        Returns:
            List of verification records if successful, None otherwise
        """
        try:
            response = self.session.get(
                f"{self.api_endpoint}/api/transport/checkpoints/verifications/",
                params={"shipment_id": shipment_id}
            )
            
            if response.status_code == 200:
                data = response.json()
                return data.get("results", [])
            else:
                logger.error(f"Failed to get verification history: {response.status_code}")
                return None
                
        except Exception as e:
            logger.error(f"Error getting verification history: {e}")
            return None

class MobileQRScanner(QRCodeScanner):
    """Mobile-specific QR code scanner implementation"""
    
    def __init__(self, api_endpoint: str, api_token: str):
        super().__init__(api_endpoint, api_token)
    
    def scan_from_mobile_camera(self) -> Optional[str]:
        """
        Scan QR code from mobile camera
        
        Returns:
            QR code data if successful, None otherwise
        """
        # In a real implementation, this would integrate with mobile camera APIs
        # For now, we'll simulate the functionality
        logger.info("Mobile QR code scanning initiated")
        
        # This would typically use:
        # - React Native Camera for iOS/Android
        # - ML Kit Vision for QR code detection
        # - Or other mobile-specific libraries
        
        # Simulated scan
        simulated_qr_data = '{"shipment_id": "123", "test": true}'
        logger.info(f"Simulated QR code scan: {simulated_qr_data}")
        return simulated_qr_data

def main():
    """Main function for command-line usage"""
    import argparse
    
    parser = argparse.ArgumentParser(description="EATMS QR Code Scanner")
    parser.add_argument("--api-endpoint", required=True, help="Backend API endpoint")
    parser.add_argument("--api-token", required=True, help="API authentication token")
    parser.add_argument("--scan-from-image", help="Path to image file to scan")
    parser.add_argument("--scan-from-camera", action="store_true", help="Scan from camera")
    parser.add_argument("--generate-qr", help="Generate QR code from JSON file")
    parser.add_argument("--output", help="Output path for generated QR code")
    
    args = parser.parse_args()
    
    # Initialize scanner
    scanner = QRCodeScanner(args.api_endpoint, args.api_token)
    
    if args.scan_from_image:
        # Scan from image file
        qr_data = scanner.scan_qr_code_from_image(args.scan_from_image)
        if qr_data:
            print(f"Scanned QR code: {qr_data}")
            shipment_info = scanner.decode_shipment_info(qr_data)
            if shipment_info:
                print("\nShipment Information:")
                print(f"Shipment Number: {shipment_info.shipment_number}")
                print(f"Farmer: {shipment_info.farmer_name}")
                print(f"Trader: {shipment_info.trader_name}")
                print(f"Vehicle: {shipment_info.vehicle_license}")
                print(f"Crop: {shipment_info.crop_type}")
                print(f"Quantity: {shipment_info.quantity} kg")
            else:
                print("Failed to decode shipment information")
        else:
            print("Failed to scan QR code from image")
    
    elif args.scan_from_camera:
        # Scan from camera
        print("Press 'q' to quit scanning")
        qr_data = scanner.scan_qr_code_from_camera()
        if qr_data:
            print(f"Scanned QR code: {qr_data}")
            shipment_info = scanner.decode_shipment_info(qr_data)
            if shipment_info:
                print("\nShipment Information:")
                print(f"Shipment Number: {shipment_info.shipment_number}")
                print(f"Farmer: {shipment_info.farmer_name}")
                print(f"Trader: {shipment_info.trader_name}")
                print(f"Vehicle: {shipment_info.vehicle_license}")
                print(f"Crop: {shipment_info.crop_type}")
                print(f"Quantity: {shipment_info.quantity} kg")
            else:
                print("Failed to decode shipment information")
        else:
            print("Failed to scan QR code from camera")
    
    elif args.generate_qr:
        # Generate QR code
        try:
            with open(args.generate_qr, 'r') as f:
                data = json.load(f)
            
            qr_data = scanner.generate_qr_code(data, args.output)
            if qr_data:
                print(f"Generated QR code with data: {qr_data}")
                if args.output:
                    print(f"QR code saved to: {args.output}")
        except Exception as e:
            print(f"Error generating QR code: {e}")
    
    else:
        parser.print_help()

if __name__ == "__main__":
    main()
