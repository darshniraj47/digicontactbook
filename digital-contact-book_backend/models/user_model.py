from database import get_db_connection
from werkzeug.security import generate_password_hash, check_password_hash

class UserModel:
    @staticmethod
    def create_user(name, email, password):
        """
        Hashes password and inserts a new user into the database.
        """
        connection = get_db_connection()
        if not connection:
            return None, "Unable to connect to the database. Please check the backend configuration."

        try:
            cursor = connection.cursor(dictionary=True)
            
            # Check if user already exists
            cursor.execute("SELECT id FROM users WHERE email = %s", (email,))
            existing_user = cursor.fetchone()
            if existing_user:
                return None, "Email is already registered"

            # Hash the password
            hashed_password = generate_password_hash(password)

            # Insert user
            query = "INSERT INTO users (name, email, password) VALUES (%s, %s, %s)"
            cursor.execute(query, (name, email, hashed_password))
            connection.commit()
            
            user_id = cursor.lastrowid
            return {"id": user_id, "name": name, "email": email}, None
        except Exception as e:
            print(f"[Error] create_user failed: {e}")
            return None, str(e)
        finally:
            if connection and connection.is_connected():
                cursor.close()
                connection.close()

    @staticmethod
    def get_user_by_email(email):
        """
        Retrieves a user by email address.
        """
        connection = get_db_connection()
        if not connection:
            return None

        try:
            cursor = connection.cursor(dictionary=True)
            cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
            user = cursor.fetchone()
            if user and 'created_at' in user and user['created_at']:
                if hasattr(user['created_at'], 'strftime'):
                    user['created_at'] = user['created_at'].strftime('%Y-%m-%d %H:%M:%S')
                else:
                    user['created_at'] = str(user['created_at'])
            return user
        except Exception as e:
            print(f"[Error] get_user_by_email: {e}")
            return None
        finally:
            if connection and connection.is_connected():
                cursor.close()
                connection.close()

    @staticmethod
    def get_user_by_id(user_id):
        """
        Retrieves user details by user ID (excluding password).
        """
        connection = get_db_connection()
        if not connection:
            return None

        try:
            cursor = connection.cursor(dictionary=True)
            cursor.execute("SELECT id, name, email, created_at FROM users WHERE id = %s", (user_id,))
            user = cursor.fetchone()
            if user and 'created_at' in user and user['created_at']:
                if hasattr(user['created_at'], 'strftime'):
                    user['created_at'] = user['created_at'].strftime('%Y-%m-%d %H:%M:%S')
                else:
                    user['created_at'] = str(user['created_at'])
            return user
        except Exception as e:
            print(f"[Error] get_user_by_id: {e}")
            return None
        finally:
            if connection and connection.is_connected():
                cursor.close()
                connection.close()

    @staticmethod
    def verify_password(stored_password_hash, provided_password):
        """
        Verifies plaintext password against hashed password.
        """
        return check_password_hash(stored_password_hash, provided_password)
