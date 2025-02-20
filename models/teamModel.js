const supabase = require("../config/supabase");

const getAllTeams = async () => {
    return await supabase.from("teams").select("*");
};

const getTeamById = async (team_id) => {
    return await supabase
        .from("teams")
        .select("*")
        .eq("id", team_id);
};

const assignTeamToUser = async (team_id, user_id) => {
    return await supabase
        .from("teams")
        .update({ owner_id: user_id })
        .eq("id", team_id);
};

const countAssignedTeams = async () => {
    return await supabase
        .from("teams")
        .select("owner_id", { count: "exact", head: true })
        .not("owner_id", "is", null);
};

module.exports = { getAllTeams, getTeamById, assignTeamToUser, countAssignedTeams };
