\# Automobile Industry Production \& Factory Management System



An enterprise-oriented full-stack Factory Management System designed for automobile manufacturing environments.



The system provides centralized management of production, workers, machinery, robotics, maintenance, inventory, payroll, quality control, expenses, safety, analytics, and factory operations.



\---



\## 📌 Project Overview



The Automobile Industry Production \& Factory Management System is a REST API based industrial ERP application.



It combines a React frontend with a FastAPI backend and PostgreSQL database to provide a centralized platform for managing automobile factory operations.



\### Main Objectives



\- Production management

\- Worker management

\- Machinery and robotics tracking

\- Maintenance management

\- Inventory management

\- Vehicle production tracking

\- Attendance management

\- Payroll management

\- Cost and expense tracking

\- Quality control

\- Warehouse management

\- Supplier management

\- Safety incident management

\- Reports and analytics

\- Factory monitoring

\- Advanced IoT and AI support



\---



\# 🛠️ Technology Stack



\## Frontend



\- React JS

\- Tailwind CSS

\- Axios

\- React Router

\- React Hook Form

\- Recharts

\- React Icons

\- Vite



\## Backend



\- FastAPI

\- Python

\- SQLAlchemy

\- PostgreSQL

\- JWT Authentication

\- Pydantic

\- Uvicorn



\## Database



\- PostgreSQL

\- pgAdmin



\## DevOps



\- Docker

\- Docker Compose

\- Git

\- GitHub

\- GitHub Actions



\---



\# 🏗️ System Architecture



```text

&#x20;                   ┌─────────────────────┐

&#x20;                   │       User          │

&#x20;                   └──────────┬──────────┘

&#x20;                              │

&#x20;                              ▼

&#x20;                   ┌─────────────────────┐

&#x20;                   │   React Frontend    │

&#x20;                   │  Tailwind CSS + Vite│

&#x20;                   └──────────┬──────────┘

&#x20;                              │

&#x20;                              │ REST API

&#x20;                              ▼

&#x20;                   ┌─────────────────────┐

&#x20;                   │    FastAPI Backend  │

&#x20;                   │ Authentication/JWT  │

&#x20;                   │ Routers \& Services   │

&#x20;                   └──────────┬──────────┘

&#x20;                              │

&#x20;                              ▼

&#x20;                   ┌─────────────────────┐

&#x20;                   │     SQLAlchemy      │

&#x20;                   │        ORM          │

&#x20;                   └──────────┬──────────┘

&#x20;                              │

&#x20;                              ▼

&#x20;                   ┌─────────────────────┐

&#x20;                   │     PostgreSQL      │

&#x20;                   │      Database       │

&#x20;                   └─────────────────────┘

