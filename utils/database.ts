import * as SQLite from 'expo-sqlite';

export interface SurveyResponse {
  id?: number;
  timestamp: string;
  sentiment_score: number;
  latitude: number | null;
  longitude: number | null;
}

export interface VlogEntry {
  id?: number;
  timestamp: string;
  video_uri: string;
  latitude: number | null;
  longitude: number | null;
}

let db: SQLite.SQLiteDatabase | null = null;

// Database initialization
export const initDatabase = async () => {
  try {
    if (db) {
      return db;
    }

    db = await SQLite.openDatabaseAsync('emogo.db');

    await db.execAsync(`
      PRAGMA journal_mode = WAL;

      CREATE TABLE IF NOT EXISTS surveys (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT NOT NULL,
        sentiment_score INTEGER NOT NULL,
        latitude REAL,
        longitude REAL
      );

      CREATE TABLE IF NOT EXISTS vlogs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT NOT NULL,
        video_uri TEXT NOT NULL,
        latitude REAL,
        longitude REAL
      );
    `);

    console.log('Database initialized successfully');
    return db;
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

// Get database instance
const getDb = async () => {
  if (!db) {
    await initDatabase();
  }
  return db!;
};

// Insert survey response
export const insertSurveyResponse = async (survey: Omit<SurveyResponse, 'id'>) => {
  try {
    const database = await getDb();
    const result = await database.runAsync(
      'INSERT INTO surveys (timestamp, sentiment_score, latitude, longitude) VALUES (?, ?, ?, ?)',
      [survey.timestamp, survey.sentiment_score, survey.latitude, survey.longitude]
    );
    console.log('Survey inserted with ID:', result.lastInsertRowId);
    return result.lastInsertRowId;
  } catch (error) {
    console.error('Error inserting survey:', error);
    throw error;
  }
};

// Insert vlog entry
export const insertVlogEntry = async (vlog: Omit<VlogEntry, 'id'>) => {
  try {
    const database = await getDb();
    const result = await database.runAsync(
      'INSERT INTO vlogs (timestamp, video_uri, latitude, longitude) VALUES (?, ?, ?, ?)',
      [vlog.timestamp, vlog.video_uri, vlog.latitude, vlog.longitude]
    );
    console.log('Vlog inserted with ID:', result.lastInsertRowId);
    return result.lastInsertRowId;
  } catch (error) {
    console.error('Error inserting vlog:', error);
    throw error;
  }
};

// Get all survey responses
export const getAllSurveys = async (): Promise<SurveyResponse[]> => {
  try {
    const database = await getDb();
    const surveys = await database.getAllAsync<SurveyResponse>(
      'SELECT * FROM surveys ORDER BY timestamp DESC'
    );
    return surveys;
  } catch (error) {
    console.error('Error getting surveys:', error);
    return [];
  }
};

// Get all vlog entries
export const getAllVlogs = async (): Promise<VlogEntry[]> => {
  try {
    const database = await getDb();
    const vlogs = await database.getAllAsync<VlogEntry>(
      'SELECT * FROM vlogs ORDER BY timestamp DESC'
    );
    return vlogs;
  } catch (error) {
    console.error('Error getting vlogs:', error);
    return [];
  }
};

// Get surveys by date range
export const getSurveysByDateRange = async (startDate: string, endDate: string): Promise<SurveyResponse[]> => {
  try {
    const database = await getDb();
    const surveys = await database.getAllAsync<SurveyResponse>(
      'SELECT * FROM surveys WHERE timestamp BETWEEN ? AND ? ORDER BY timestamp DESC',
      [startDate, endDate]
    );
    return surveys;
  } catch (error) {
    console.error('Error getting surveys by date range:', error);
    return [];
  }
};

// Get vlogs by date range
export const getVlogsByDateRange = async (startDate: string, endDate: string): Promise<VlogEntry[]> => {
  try {
    const database = await getDb();
    const vlogs = await database.getAllAsync<VlogEntry>(
      'SELECT * FROM vlogs WHERE timestamp BETWEEN ? AND ? ORDER BY timestamp DESC',
      [startDate, endDate]
    );
    return vlogs;
  } catch (error) {
    console.error('Error getting vlogs by date range:', error);
    return [];
  }
};

// Export all data as JSON
export const exportAllData = async () => {
  try {
    const surveys = await getAllSurveys();
    const vlogs = await getAllVlogs();

    return {
      export_date: new Date().toISOString(),
      total_surveys: surveys.length,
      total_vlogs: vlogs.length,
      surveys,
      vlogs,
    };
  } catch (error) {
    console.error('Error exporting data:', error);
    throw error;
  }
};

// Delete a survey (for testing purposes)
export const deleteSurvey = async (id: number) => {
  try {
    const database = await getDb();
    await database.runAsync('DELETE FROM surveys WHERE id = ?', [id]);
    console.log('Survey deleted:', id);
  } catch (error) {
    console.error('Error deleting survey:', error);
    throw error;
  }
};

// Delete a vlog (for testing purposes)
export const deleteVlog = async (id: number) => {
  try {
    const database = await getDb();
    await database.runAsync('DELETE FROM vlogs WHERE id = ?', [id]);
    console.log('Vlog deleted:', id);
  } catch (error) {
    console.error('Error deleting vlog:', error);
    throw error;
  }
};

// Clear all data (for testing purposes)
export const clearAllData = async () => {
  try {
    const database = await getDb();
    await database.execAsync(`
      DELETE FROM surveys;
      DELETE FROM vlogs;
    `);
    console.log('All data cleared');
  } catch (error) {
    console.error('Error clearing data:', error);
    throw error;
  }
};
