# Architecture Documentation

## Overview
A classic three-tier architecture: React Single Page Application (SPA) on Vercel communicating with an Express REST API on Render, backed by a persistent MySQL relational database.

`
React / Vite SPA (Vercel)
       | HTTPS + credentials: include
       v
Express REST API (Render)
  +-- Middleware: session, CORS, auth, role-guard, validation, error handler
  +-- Routes -> Controllers -> Services -> Models (mysql2 raw SQL)
       |
       v
MySQL Database
`
