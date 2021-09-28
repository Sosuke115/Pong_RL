const path = require("path");
const express = require('express');
const router = express.Router();


const rlPath = __dirname + "/../../client/js/rl";

router.get("/train", (req, res) => {
  res.sendFile(path.resolve(rlPath + "/train.html"));
});

router.get("/test", (req, res) => {
  res.sendFile(path.resolve(rlPath + "/test.html"));
});

router.use("/public", express.static(path.resolve(rlPath + "/public")));

module.exports = router;
