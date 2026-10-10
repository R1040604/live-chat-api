require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const Message = require("./models/message.model");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

// Startpagina
app.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Live Chat API werkt.",
    data: {
      endpoint: "/api/v1/messages"
    }
  });
});

// GET /api/v1/messages
// GET /api/v1/messages?user=Pikachu
app.get("/api/v1/messages", async (req, res) => {
  try {
    const { user } = req.query;

    const filter = user
      ? { user: { $regex: `^${user}$`, $options: "i" } }
      : {};

    const messages = await Message.find(filter).sort({ createdAt: 1 });

    res.status(200).json({
      status: "success",
      message: user
        ? `Messages from user ${user}`
        : "GETTING messages",
      data: {
        messages
      }
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      status: "error",
      message: "Unable to communicate with database"
    });
  }
});

// GET /api/v1/messages/:id
app.get("/api/v1/messages/:id", async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(404).json({
        status: "fail",
        data: {
          id: "Invalid message id"
        }
      });
    }

    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({
        status: "fail",
        data: {
          id: "Message not found"
        }
      });
    }

    res.status(200).json({
      status: "success",
      message: "GETTING message",
      data: {
        message
      }
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      status: "error",
      message: "Unable to communicate with database"
    });
  }
});

// POST /api/v1/messages
app.post("/api/v1/messages", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.user || !message.text) {
      return res.status(400).json({
        status: "fail",
        data: {
          message: "user and text are required"
        }
      });
    }

    const newMessage = await Message.create({
      user: message.user,
      text: message.text
    });

    res.status(201).json({
      status: "success",
      message: "Message saved",
      data: {
        message: newMessage
      }
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      status: "error",
      message: "Unable to save message"
    });
  }
});

// PUT /api/v1/messages/:id
app.put("/api/v1/messages/:id", async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(404).json({
        status: "fail",
        data: {
          id: "Invalid message id"
        }
      });
    }

    const { message } = req.body;

    if (!message || (!message.user && !message.text)) {
      return res.status(400).json({
        status: "fail",
        data: {
          message: "Provide user or text to update"
        }
      });
    }

    const update = {};

    if (message.user) {
      update.user = message.user;
    }

    if (message.text) {
      update.text = message.text;
    }

    const updatedMessage = await Message.findByIdAndUpdate(
      req.params.id,
      update,
      {
        new: true,
        runValidators: true
      }
    );

    if (!updatedMessage) {
      return res.status(404).json({
        status: "fail",
        data: {
          id: "Message not found"
        }
      });
    }

    res.status(200).json({
      status: "success",
      message: "Message updated",
      data: {
        message: updatedMessage
      }
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      status: "error",
      message: "Unable to update message"
    });
  }
});

// DELETE /api/v1/messages/:id
app.delete("/api/v1/messages/:id", async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(404).json({
        status: "fail",
        data: {
          id: "Invalid message id"
        }
      });
    }

    const deletedMessage = await Message.findByIdAndDelete(req.params.id);

    if (!deletedMessage) {
      return res.status(404).json({
        status: "fail",
        data: {
          id: "Message not found"
        }
      });
    }

    res.status(200).json({
      status: "success",
      message: "Message deleted",
      data: {
        message: {
          _id: deletedMessage._id
        }
      }
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      status: "error",
      message: "Unable to delete message"
    });
  }
});

// Niet-bestaande route
app.use((req, res) => {
  res.status(404).json({
    status: "fail",
    data: {
      route: `${req.method} ${req.originalUrl}`
    }
  });
});

// Algemene foutafhandeling
app.use((error, req, res, next) => {
  console.error(error);

  res.status(500).json({
    status: "error",
    message: "Internal server error"
  });
});

async function startServer() {
  try {
await mongoose.connect(process.env.MONGO_URI);

    console.log("Verbonden met MongoDB.");

    app.listen(PORT, () => {
      console.log(`API draait op http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("MongoDB-verbinding mislukt:", error.message);
    process.exit(1);
  }
}

startServer();