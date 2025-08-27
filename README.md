# 🛍️ E-commerce Integration – User Frontend

Detta är en enkel React-app som fungerar som frontend till vårt **User Service**-API.

## Funktioner
- Registrera ny användare
- Logga in och spara JWT-token i `localStorage`
- Visa användarprofil via `/me`-endpoint (med token för autentisering)
- Logga ut och rensa token
- Enkel UX som visar olika vyer beroende på om användaren är inloggad eller inte

## Teknisk översikt
- Byggd i **React (Create React App)**
- Kommunikation med backend via **REST API**
- Token-baserad autentisering (JWT)
- Enkelt forms UI med CSS-styling


## Kom igång
1. Installera dependencies:
   ```bash
   npm install

Öppna appen i http://localhost:3000

#### Backend

Frontend pratar med ett separat Spring Boot User Service som hanterar:

- Registrering

- Login

- Token-verifiering

- Profilendpoint /me