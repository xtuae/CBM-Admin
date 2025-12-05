Project Name

Credits-Based Marketplace & Managed Settlement Platform

Purpose

The system is a credits-based digital marketplace where users purchase platform credits using traditional payment methods.
Credits are later settled internally by administrators through controlled blockchain-based reward transfers.

The platform must not function as a public crypto exchange and must remain bank and payment-gateway compliant at all times.

Core Principles

Payments represent digital credits / services only

No public crypto trading, swapping, or on-chain payment flows

All blockchain-related activity is admin-controlled and back-office only

Every credit movement is tracked via an immutable ledger

System must be auditable, scalable, and secure

Bank-safe wording must be used across UI, APIs, and invoices

User Roles
Guest

View public pages

View credit pack offerings

User

Register and login

Purchase credit packs

View credit balance and ledger

Manage wallet address(es) for reward settlement tracking

View reward settlement history

Admin

Full system access

Manage users and balances

Manage credit packs

Process and record reward settlements

View and audit all transactions and ledger entries

Functional Scope
User Features

Email/password authentication

User dashboard with:

Credit balance

Purchase history

Credit ledger

Reward settlement history

Credit pack purchase via payment gateway

Wallet address management

Admin Features

Admin dashboard

User management

Credit pack creation and management

Admin-only settlement workflow:

Select user

Enter credits used

Enter reward amount (e.g. $NILA)

Enter network and wallet address

Record blockchain transaction hash

Audit and reporting tools

Compliance & Positioning

Use terminology: Credits, Digital Assets, Platform Balance

Avoid terms: Crypto Exchange, Swap, Buy Token, On-ramp

No user-initiated blockchain transfers

No automated fiat-to-crypto conversion

Blockchain rewards are discretionary and processed internally

System Architecture
Client Layer

Web-based frontend

Public area, user dashboard, admin panel

Communicates with API via HTTPS

Application Layer

REST API (Node.js + TypeScript)

Authentication & authorization

Business rules and validation

Credit ledger enforcement

Admin-only settlement logic

Data Layer

PostgreSQL (Supabase-compatible)

Core tables:

profiles

credit_packs

orders

credit_ledger

nila_transfers

wallet_addresses

Integration Layer

Payment gateway via webhook-based confirmation

Admin-controlled blockchain reward settlement

No direct user-to-blockchain integration

Data Integrity Rules

Credit balance must never go below zero

Every credit change must create a ledger record

Orders must be paid before credits are added

Settlement requires sufficient credit balance

Admin actions must be auditable

API Standards

RESTful API under /api/v1

JWT-based authentication

Role-based access control

JSON request/response format

Secure webhook handling

Non-Functional Requirements

Bank and payment gateway friendly

Secure by default (no anonymous access)

Scalable architecture

Clear audit trail

Production-ready MVP

Timeline

Target delivery: 2–3 weeks

MVP-first approach

Admin settlement and credits system prioritized over UI polish

AI-Assisted Development

AI-assisted development tools will be used to accelerate delivery

OpenRouter credits allocation:

Minimum: USD 100

Buffer: USD 100

Out of Scope

Public crypto exchange

Automated fiat-to-crypto on/off-ramps

DeFi, staking, liquidity pools

Regulatory licensing or legal opinions

Success Criteria

Users can successfully purchase credits

Credits correctly update balances and ledger

Admin can process and record settlements

System remains bank-compliant

Full auditability of all transactions