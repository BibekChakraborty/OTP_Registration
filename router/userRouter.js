const router = require("express").Router();

const { signUp, verify } = require("../controller/userController");

router.route("/signup").post(signUp); 
router.route("/signup/verify").post(verify);

module.exports = router;
