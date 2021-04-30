"use strict";

const express = require("express");
const app = express();
const path = require("path");
const PORT = process.env.PORT || 5000;

app.use(express.static(path.join(__dirname, "/pub")));

app.listen(PORT, () => {
    console.log(`Listening on PORT ${PORT}...`);
});
