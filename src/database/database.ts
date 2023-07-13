import { FeedbackPayload } from "@/types";
import { createClient } from "@supabase/supabase-js";
import getConfig from "next/config";

// Access the environment variables
const { publicRuntimeConfig } = getConfig();
const SUPABASE_URL = publicRuntimeConfig.SUPABASE_URL;
const SUPABASE_ANON_KEY = publicRuntimeConfig.SUPABASE_ANON_KEY;
const DB_NAME = publicRuntimeConfig.DB_NAME;

// Initialize Supabase client
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
    payload.question = payload.question.toLowerCase();
    payload.author_name = payload.author_name.toLowerCase();
    const { data, error } = await supabase.from(DB_NAME).insert([payload]);
    if (error) {
      console.error("Error inserting Q&A:", error);
    } else {
      console.log("Q&A inserted.");
    }
  }
  async addFeedback(payload: FeedbackPayload) {
    const { answerQuality, feedbackId, rating, timestamp } = payload;
    const { data, error, status } = await supabase
      .from(DB_NAME)
      .update({
        answerQuality,
        rating,
        updatedAt: timestamp,
      })
      .eq("uniqueId", feedbackId);

    if (error) {
      console.error("Error inserting rating:", error);
    }
    if (data) {
      console.log("Q&A rating updated:", data);
    }
    return { data, error, status };
  }
  async getAnswerByQuestion(question: string, author?: string) {
    const oneDayBefore = new Date();
    oneDayBefore.setDate(oneDayBefore.getDate() - 1);
    let query = supabase
      .from(DB_NAME)
      .select("answer, createdAt")
      .eq('question', question);

      // If author exists, add .eq('author_name', author) to the query
      if(author){
          query = query.eq('author_name', author);
      }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching answer:", error);
      return null;
    } else {
      // filter data where createdAt is one day before
      const filteredData = data.filter(d => new Date(d.createdAt) >= oneDayBefore);
      // order filtered data
      const orderedData = filteredData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      // Here we return null if no data found or orderedData if found
      return orderedData.length > 0 ? orderedData : null;
    }
  }
}
