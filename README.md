# EATMS (Ethiopian Agri-Chain Transparency and Monitoring System)

A comprehensive digital platform for transparent agricultural supply chain management in Ethiopia, connecting farmers, traders, transporters, and government officials through a secure, real-time monitoring system.

## Overview

EATMS is a multi-component system designed to digitize and monitor the agricultural supply chain in Ethiopia. The system eliminates intermediaries, ensures fair pricing, provides real-time tracking, and enables government oversight of agricultural activities.

## Features

- **Digital Marketplace**: Direct farmer-to-trader connections
- **Real-time Tracking**: GPS-enabled shipment monitoring
- **Quality Assurance**: Standardized grading and certification
- **Government Oversight**: Regulatory compliance and reporting
- **Mobile Access**: USSD/SMS support for feature phones
- **Analytics Dashboard**: Data-driven insights for stakeholders

## Architecture

```
EATMS/
├── mobile-app/                    # React Native app (farmers, traders, transporters)
├── backend/                       # Django REST + Channels backend
├── web-dashboard/                 # Government dashboard (React/TypeScript)
├── infra/                         # Infrastructure and deployment
│   ├── nginx/                     # Reverse proxy configs
│   ├── docker/                    # Docker configurations
│   └── deploy/                    # CI/CD pipelines
├── docker-compose.yml             # Local development setup
├── .env.example                   # Environment variables template
└── README.md
```

## Components

### Mobile App (`mobile-app/`)
- **Framework**: React Native with TypeScript
- **Features**:
  - Role-based interfaces (Farmer, Trader, Transporter, Government)
  - Real-time notifications and updates
  - QR code scanning for checkpoints
  - Offline-capable operations
  - USSD/SMS integration for feature phones

### Backend (`backend/`)
- **Framework**: Django REST Framework + Django Channels
- **Features**:
  - RESTful APIs for all operations
  - WebSocket support for real-time updates
  - User authentication and authorization
  - Database models for crops, shipments, users
  - SMS/USSD gateway integration

### Web Dashboard (`web-dashboard/`)
- **Framework**: React with TypeScript
- **Features**:
  - Government oversight dashboard
  - Real-time supply chain monitoring
  - Analytics and reporting
  - Regulatory compliance tools

### Infrastructure (`infra/`)
- **Deployment**: Docker containerization
- **Reverse Proxy**: Nginx configuration
- **CI/CD**: Automated deployment pipelines

## Technology Stack

- **Frontend**: React Native, React, TypeScript
- **Backend**: Django, Django REST Framework, Django Channels
- **Database**: PostgreSQL
- **Real-time**: WebSockets (Django Channels)
- **Mobile**: React Native, Redux Toolkit
- **Deployment**: Docker, Nginx
- **Communication**: SMS/USSD gateways

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js (v16+) for local development
- Python 3.9+ for backend development
- Git

### Quick Start with Docker

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd eatms
   ```

2. Copy environment file:
   ```bash
   cp .env.example .env
   ```

3. Configure environment variables in `.env`

4. Start all services:
   ```bash
   docker-compose up -d
   ```

### Local Development

#### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

#### Mobile App Setup
```bash
cd mobile-app
npm install
npm run android  # or npm run ios
```

#### Web Dashboard Setup
```bash
cd web-dashboard
npm install
npm run dev
```

## Environment Configuration

Create a `.env` file with the following variables:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/eatms

# Django
SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# External Services
SMS_GATEWAY_URL=https://api.sms-gateway.com
SMS_API_KEY=your-sms-api-key
MAP_API_KEY=your-map-api-key

# Redis (for WebSockets)
REDIS_URL=redis://localhost:6379
```

## API Documentation

Once the backend is running, API documentation is available at:
- Swagger UI: `http://localhost:8000/api/docs/`
- ReDoc: `http://localhost:8000/api/redoc/`

## Testing

### Backend Tests
```bash
cd backend
python manage.py test
```

### Mobile App Tests
```bash
cd mobile-app
npm test
```

### Web Dashboard Tests
```bash
cd web-dashboard
npm test
```

## Deployment

### Production Deployment

1. Build Docker images:
   ```bash
   docker-compose -f docker-compose.prod.yml build
   ```

2. Deploy with Docker Compose:
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

### Infrastructure Setup

See `infra/` directory for:
- Nginx reverse proxy configuration
- SSL/TLS setup
- Docker production configurations
- CI/CD pipeline configurations

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style and structure
- Write tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR

## Security

- JWT-based authentication
- Role-based access control (RBAC)
- Data encryption in transit and at rest
- Regular security audits
- GDPR compliance for data handling

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, questions, or contributions:

- Create an issue in this repository
- Contact the development team
- Check the documentation in each component's README

## Roadmap

- [ ] Mobile app beta release
- [ ] Web dashboard MVP
- [ ] Backend API v1.0
- [ ] Pilot deployment in select regions
- [ ] SMS/USSD integration
- [ ] Advanced analytics features
- [ ] Multi-language support
- [ ] Offline-first capabilities

---

**EATMS** - Building transparent agricultural supply chains for Ethiopia's future.
