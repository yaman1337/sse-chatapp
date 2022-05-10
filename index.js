const express = require("express");
const path = require("path");
const app = express();

const EventEmitter = require("events");
const event = new EventEmitter();

const { PORT } = require("./config");

app.use(express.static("public"));
app.use(express.json());

/*
    This endpoint receives message from the client and emits messageReceived event.
*/
app.post("/send", (req, res) => {
    try {
        const { username,  message } = req.body;

        if(!username || !message) return res.status(400).json({error: "Invalid input."});

        event.emit("messageReceived", username, message);

        res.end();

        
    } catch (error) {
        console.log(error);
        res.status(500).json({error: "Something went wrong."})
    }
});

/*
    endpoint for event source. sends chunked data without closing the connection.
*/
app.get("/messages", (req , res) => {
    try {

        res.setHeader("Content-Type", "text/event-stream");
        res.write("data: " + "connection establised \n\n")
        event.on("messageReceived", (username, message) => {
            let data = JSON.stringify({username, message});
            res.write("data: " + `${data}\n\n`)
        });
        
    } catch (error) {
        console.log(error);
        res.status(500).json({error: "Something went wrong."})
    }
});

/*
    Chat room feature
*/
app.post("/send-private", (req , res) => {
    try {

        const { username, message, room } = req.body;
        if(!username || !message || !room) return res.status(400).json({error: "Invalid input."})

        event.emit("privateMessageReceived", username, message, room);

        res.end();
        
    } catch (error) {
        console.log(error);
        res.status(500).json({error: "Something went wrong."})
    }
});

app.get("/room-messages", (req ,res) => {
    try {

        const current_room = req.query.room;
        
        res.setHeader("Content-Type", "text/event-stream");
        res.write("data: connection establised \n\n");

        event.on("privateMessageReceived", (username, message, room) => {
            if(current_room != room) return;
            const data = JSON.stringify({username, message});
            res.write(`data: ${data} \n\n`);
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({error: "Something went wrong."})
    }
});



app.listen(process.env.PORT || PORT || 9000, () => {
    console.log("listening on port " + PORT)
});