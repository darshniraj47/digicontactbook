import os
import sqlite3
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# MySQL Database configuration
DB_CONFIG = {
    'host': os.environ.get('DB_HOST', 'localhost'),
    'user': os.environ.get('DB_USER', 'root'),
    'password': os.environ.get('DB_PASSWORD', ''),
    'database': os.environ.get('DB_NAME', 'digital_contact_book'),
    'port': int(os.environ.get('DB_PORT', 3306))
}

# Track active database mode ('mysql' or 'sqlite')
CURRENT_DB_ENGINE = None

class SQLiteCursorWrapper:
    """Wrapper to make SQLite cursor behavior identical to MySQL dictionary cursor"""
    def __init__(self, cursor):
        self._cursor = cursor

    @property
    def lastrowid(self):
        return self._cursor.lastrowid

    @property
    def rowcount(self):
        return self._cursor.rowcount

    def execute(self, query, params=None):
        sqlite_query = query.replace('%s', '?')
        if params is None:
            return self._cursor.execute(sqlite_query)
        return self._cursor.execute(sqlite_query, params)

    def fetchone(self):
        row = self._cursor.fetchone()
        if row is None:
            return None
        return dict(row)

    def fetchall(self):
        rows = self._cursor.fetchall()
        return [dict(row) for row in rows]

    def close(self):
        try:
            self._cursor.close()
        except Exception:
            pass

class SQLiteConnectionWrapper:
    """Wrapper to make SQLite connection match MySQL connection interface"""
    def __init__(self, conn):
        self._conn = conn
        self._conn.row_factory = sqlite3.Row

    def cursor(self, dictionary=True):
        return SQLiteCursorWrapper(self._conn.cursor())

    def commit(self):
        return self._conn.commit()

    def rollback(self):
        return self._conn.rollback()

    def is_connected(self):
        return True

    def close(self):
        try:
            self._conn.close()
        except Exception:
            pass

def init_sqlite_db():
    """Initializes SQLite fallback database with identical schema"""
    db_path = os.path.join(os.path.dirname(__file__), 'digital_contact_book.db')
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS contacts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            phone TEXT NOT NULL,
            email TEXT,
            address TEXT,
            category TEXT DEFAULT "Other",
            is_favorite INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    ''')

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS user_preferences (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL UNIQUE,
            default_category TEXT DEFAULT "Other",
            contact_reminders INTEGER DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    ''')
    conn.commit()
    conn.close()
    return db_path

def init_mysql_tables(connection):
    """Automatically creates MySQL database and tables if missing"""
    try:
        cursor = connection.cursor()
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS `{DB_CONFIG['database']}`")
        cursor.execute(f"USE `{DB_CONFIG['database']}`")
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(120) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        ''')
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS contacts (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                name VARCHAR(100) NOT NULL,
                phone VARCHAR(20) NOT NULL,
                email VARCHAR(120) DEFAULT NULL,
                address TEXT DEFAULT NULL,
                category VARCHAR(50) DEFAULT 'Other',
                is_favorite BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT fk_contacts_user FOREIGN KEY (user_id) 
                    REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        ''')
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS user_preferences (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL UNIQUE,
                default_category VARCHAR(50) DEFAULT 'Other',
                contact_reminders BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT fk_user_preferences FOREIGN KEY (user_id) 
                    REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        ''')
        connection.commit()
        cursor.close()
        return True
    except Exception as e:
        print(f"[MySQL Init Error]: {e}")
        return False

def get_db_connection():
    global CURRENT_DB_ENGINE
    
    # Try MySQL first
    try:
        import mysql.connector
        connection = mysql.connector.connect(
            host=DB_CONFIG['host'],
            user=DB_CONFIG['user'],
            password=DB_CONFIG['password'],
            database=DB_CONFIG['database'],
            port=DB_CONFIG['port']
        )
        if connection.is_connected():
            CURRENT_DB_ENGINE = 'mysql'
            return connection
    except Exception as e:
        pass

    # SQLite fallback
    try:
        db_path = init_sqlite_db()
        conn = sqlite3.connect(db_path)
        CURRENT_DB_ENGINE = 'sqlite'
        return SQLiteConnectionWrapper(conn)
    except Exception as e:
        print(f"[Database Critical Error] Failed to connect: {e}")
        return None

def test_db_connection():
    global CURRENT_DB_ENGINE
    print("--------------------------------------------------")
    print(" Checking Database Connectivity...")
    
    # Test MySQL
    try:
        import mysql.connector
        mysql_conn = mysql.connector.connect(
            host=DB_CONFIG['host'],
            user=DB_CONFIG['user'],
            password=DB_CONFIG['password'],
            port=DB_CONFIG['port']
        )
        if mysql_conn.is_connected():
            init_mysql_tables(mysql_conn)
            print(f" [?] MySQL Server connected! (Database: {DB_CONFIG['database']})")
            mysql_conn.close()
            CURRENT_DB_ENGINE = 'mysql'
    except Exception as e:
        print(f" [!] MySQL not active on {DB_CONFIG['host']}:{DB_CONFIG['port']}")
        print(" [?] Seamless local storage activated for testing.")
        init_sqlite_db()
        CURRENT_DB_ENGINE = 'sqlite'
        
    print(f" Active Database Engine: {CURRENT_DB_ENGINE.upper() if CURRENT_DB_ENGINE else 'READY'}")
    print("--------------------------------------------------")
    return True
