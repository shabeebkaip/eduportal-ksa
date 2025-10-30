import { supabase } from './lib/customSupabaseClient.js';

async function getGeoRoles() {
  try {
    const { data, error } = await supabase
      .from('teachers')
      .select('role, assignments')
      .eq('email', 'geo@teast.com')
      .single(); // Use .single() if you expect only one result

    if (error) {
      if (error.code === 'PGRST116') { // No rows found
        console.log("No teacher found with the email geo@teast.com");
        return null;
      }
      throw error;
    }

    if (data) {
      console.log("Assigned Roles for geo@teast.com:");
      console.log("Roles:", data.role);
      console.log("Assignments:", data.assignments);
      return data;
    } else {
      console.log("No teacher found with the email geo@teast.com");
      return null;
    }
  } catch (error) {
    console.error("Error fetching roles for geo@teast.com:", error.message);
    return null;
  }
}

getGeoRoles();