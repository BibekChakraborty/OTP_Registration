const { Schema, model } = require("mongoose");

const userSchema = Schema(
  {
    number: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports.User = model('User', userSchema);
