const express = require("express");
const cors = require("cors");
import mongoose from "mongoose";
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Tijdelijke array als fake database
let messages = [
  {
    id: 1,
    user: "Pikachu",
    text: "Hallo, dit is mijn eerste bericht."
  },
  {
    id: 2,
    user: "Charmander",
    text: "Node.js is eigenlijk best leuk."
  },
  {
    id: 3,
    user: "Pikachu",
    text: "Ik kan later in een live chat verschijnen."
  }
];

// Zoekt een bericht op id.
function findMessageIndex(id) {
  return messages.findIndex((message) => message.id === Number(id));
}

// GET /api/v1/messages
// GET /api/v1/messages?user=Pikachu
app.get("/api/v1/messages", (req, res) => {
  const { user } = req.query;

  let result = messages;

  if (user) {
    result = messages.filter(
      (message) => message.user.toLowerCase() === user.toLowerCase()
    );
  }

  res.status(200).json({
    status: "success",
    message: user
      ? `Berichten van ${user} opgehaald.`
      : "Alle berichten opgehaald.",
    data: {
      messages: result
    }
  });
});

// GET /api/v1/messages/:id
app.get("/api/v1/messages/:id", (req, res) => {
  const messageIndex = findMessageIndex(req.params.id);

  if (messageIndex === -1) {
    return res.status(404).json({
      status: "fail",
      message: "Bericht niet gevonden.",
      data: {
        id: "Er bestaat geen bericht met deze id."
      }
    });
  }

  res.status(200).json({
    status: "success",
    message: "Bericht opgehaald.",
    data: {
      message: messages[messageIndex]
    }
  });
});

// POST /api/v1/messages
app.post("/api/v1/messages", (req, res) => {
  const { message } = req.body;

  if (!message || !message.user || !message.text) {
    return res.status(400).json({
      status: "fail",
      message: "Validatie mislukt.",
      data: {
        message: "Geef een user en text mee in message."
      }
    });
  }

  const newMessage = {
    id: messages.length + 1,
    user: message.user,
    text: message.text
  };

  messages.push(newMessage);

  res.status(201).json({
    status: "success",
    message: "Bericht succesvol aangemaakt.",
    data: {
      message: newMessage
    }
  });
});

// PUT /api/v1/messages/:id
app.put("/api/v1/messages/:id", (req, res) => {
  const messageIndex = findMessageIndex(req.params.id);

  if (messageIndex === -1) {
    return res.status(404).json({
      status: "fail",
      message: "Bericht niet gevonden.",
      data: {
        id: "Er bestaat geen bericht met deze id."
      }
    });
  }

  const { message } = req.body;

  if (!message || (!message.user && !message.text)) {
    return res.status(400).json({
      status: "fail",
      message: "Validatie mislukt.",
      data: {
        message: "Geef minstens user of text mee."
      }
    });
  }

  if (message.user) {
    messages[messageIndex].user = message.user;
  }

  if (message.text) {
    messages[messageIndex].text = message.text;
  }

  res.status(200).json({
    status: "success",
    message: "Bericht succesvol aangepast.",
    data: {
      message: messages[messageIndex]
    }
  });
});

// DELETE /api/v1/messages/:id
app.delete("/api/v1/messages/:id", (req, res) => {
  const messageIndex = findMessageIndex(req.params.id);

  if (messageIndex === -1) {
    return res.status(404).json({
      status: "fail",
      message: "Bericht niet gevonden.",
      data: {
        id: "Er bestaat geen bericht met deze id."
      }
    });
  }

  messages.splice(messageIndex, 1);

  res.status(200).json({
    status: "success",
    message: "Bericht succesvol verwijderd.",
    data: null
  });
});

// Niet-bestaande route
app.use((req, res) => {
  res.status(404).json({
    status: "fail",
    message: "Route niet gevonden.",
    data: {
      route: `${req.method} ${req.originalUrl}`
    }
  });
});

app.listen(PORT, () => {
  console.log(`API draait op http://localhost:${PORT}`);
});