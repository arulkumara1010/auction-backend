const supabase = require("../config/supabase");

const registerUser = async (name, username, password) => {
  return await supabase
    .from("users")
    .insert([{ name, username, password, role: "user" }]);
};

const findUserByUsername = async (username) => {
  return await supabase
    .from("users")
    .select("*")
    .eq("username", username)
    .single();
};

module.exports = { registerUser, findUserByUsername };
