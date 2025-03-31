const express = require('express');
const router = express.Router();

router.get("/500-error", (req,res,next) => {
    const error = new Error("My intentional 500 error!");
    error.status = 500;
    next(error);
});

module.exports = router;