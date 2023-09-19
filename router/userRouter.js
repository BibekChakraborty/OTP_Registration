const router = require("express").Router();

const { signUp, verify } = require("../controller/userController");

router.route("/signup").post(signUp); // Corrected the route path
router.route("/signup/verify").post(verify);

module.exports = router;
