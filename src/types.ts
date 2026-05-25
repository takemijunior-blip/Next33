/**
 * Types declarations for Next Fitness Tracker
 */

export interface UserProfile {
  name: string;
  weight: number;      // weight in kg
  weightGoal: number;  // weight target in kg
  height: number;      // height in meters
  calorieGoal: number; // daily max or burn goal in kcal
  waterGoal: number;   // daily water goal in Litros (L)
}

export interface WaterLog {
  id: string;
  amount: number;       // in mL, e.g. 250
  timestamp: string;    // ISO date string
}

export interface CalorieLog {
  id: string;
  amount: number;       // in kcal
  type: "consumed" | "burned";
  description: string;  // e.g., "Leg Press e Cardio", "Café da manhã"
  timestamp: string;    // ISO date string
}

export interface ProgressPhoto {
  id: string;
  imageUrl: string;     // Base64 Data URL or blob
  timestamp: string;    // ISO date
  category?: "front" | "side" | "back";
  note?: string;
}

export interface CoachMessage {
  id: string;
  text: string;
  sender: "user" | "coach";
  timestamp: string;
}

export interface CustomGoal {
  id: string;
  name: string;
  completed: boolean;
}

export interface DailyTracking {
  workoutDone: boolean;
  waterDone: boolean;
  caloriesReached: boolean;
  photoDone: boolean;
  sleepWell: boolean;
  customGoals: CustomGoal[];
}

export interface TranslationHistory {
  id: string;
  originText: string;
  translatedText: string;
  fromLang: string;
  toLang: string;
  timestamp: string;
}

export type ActiveTab = 
  | "inicio" 
  | "agua" 
  | "foto" 
  | "coach" 
  | "idiomas" 
  | "metas" 
  | "pdf" 
  | "admin";
