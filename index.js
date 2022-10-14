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
app.get("/ping", (req,res) => {
    
    res.sendFile(__dirname + "/public/index.html")
})

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
        res.write("data: " + "connection establised \n\n");

        event.on("messageReceived", (username, message) => {
            let data = JSON.stringify({username, message});
            res.write("data: " + `${data}\n\n`)
        });
        
        event.on("typing_public", (username) => {
            let data = JSON.stringify({event: "typing", message: `${username} is typing ...`});
            res.write(`data: ${data} \n\n`);
        })

        event.on("not_typing_public", (username) => {
            let data = JSON.stringify({ event: "not_typing" })
            res.write("data: " + data + "\n\n");
        })

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

        event.on("typing_private", (room, username) => {
            if(current_room != room) return;
            const data = JSON.stringify({event: "typing", message: `${username} is typing ...`});
            res.write(`data: ${data} \n\n`);

        })

        event.on("not_typing_private", (room, username) => {
            if(current_room != room) return;
            const data = JSON.stringify({event: "not_typing"});
            res.write(`data: ${data} \n\n`);

        })

    } catch (error) {
        console.log(error);
        res.status(500).json({error: "Something went wrong."})
    }
});

/*
    listen to user typing
*/
app.get("/typing", (req , res) => {
    try {
        const { room, username } = req.query;
        if(!room || !username) {
            event.emit("typing_public", username);
        }
        else {
            event.emit("typing_private", room, username);
        }

        res.end();

    } catch (error) {
        console.log(error);
        res.status(500).json({error: "Something went wrong."})
    }
})


/*
    listen to user stop typing
*/
app.get("/not-typing", (req , res) => {
    try {
        
        const { room, username } = req.query;
        if(!room || !username) {
            event.emit("not_typing_public", username);
        }
        else {
            event.emit("tnot_yping_private", room, username);
        }

        res.end();

    } catch (error) {
        console.log(error);
        res.status(500).json({error: "Something went wrong."})
    }
})


app.listen(process.env.PORT || PORT || 9000, () => {
    console.log("listening on port " + process.env.PORT || PORT || 9000)
});
