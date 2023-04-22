import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const DB_NAME = process.env.DB_NAME;
let supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Example usage: Fetch all rows from a table named "tasks"
export class SupaBaseDatabase {
  static getInstance() {
    return new SupaBaseDatabase();
  }

  async fetchData() {
    const { data, error } = await supabase.from(DB_NAME).select("*");

    if (error) {
      console.error("Error fetching tasks:", error);
    } else {
      console.log("Fetched tasks:", data);
    }
  }
  async insertData(payload: any) {
    const { data, error } = await supabase.from(DB_NAME).insert([payload]);

    if (error) {
      console.error("Error inserting Q&A:", error);
    } else {
      console.log("Q&A inserted:", data);
    }
  }
  async updateData(rate: string, id: string) {
    const { data, error } = await supabase
      .from(DB_NAME)
      .update({ rating: rate })
      .eq("uniqueId", id);

    if (error) {
      console.error("Error inserting rating:", error);
    } else {
      console.log("Q&A rating updated:", data);
    }
  }
}
