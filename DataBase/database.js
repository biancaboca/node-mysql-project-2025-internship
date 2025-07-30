require('dotenv').config();
const mysql = require('mysql2/promise');

class Database {
  constructor() {
    this.connection = null;
  }

  async connect() {
    try {
      console.log('Attempting to connect with settings:', {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        database: process.env.DB_DATABASE
      });

      this.connection = await mysql.createPool({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        enableKeepAlive: true,
        keepAliveInitialDelay: 0,
        charset: 'utf8mb4'
      });
      
      // Test the connection
      await this.connection.execute('SELECT 1');
      console.log('Connected to the database successfully');
      return this.connection;
    } catch (error) {
      console.error('Error connecting to the database:', {
        message: error.message,
        code: error.code,
        errno: error.errno,
        sqlState: error.sqlState,
        sqlMessage: error.sqlMessage
      });
      throw error;
    }
  }

  async query(sql, params = []) {
    if (!this.connection) {
      throw new Error('Database not connected. Call connect() first.');
    }
    
    try {
      console.log('Executing SQL:', sql);
      console.log('With parameters:', params);
      
      const [results] = await this.connection.execute(sql, params);
      console.log('Query successful, affected rows:', results?.affectedRows || results?.length);
      return results;
    } catch (error) {
      console.error('Database query error:', {
        message: error.message,
        code: error.code,
        errno: error.errno,
        sqlState: error.sqlState,
        sqlMessage: error.sqlMessage,
        sql: error.sql
      });
      throw error;
    }
  }

  async close() {
    if (this.connection) {
      await this.connection.end();
      console.log('Database connection closed');
    }
  }
}

// Export singleton instance
const database = new Database();
module.exports = database;