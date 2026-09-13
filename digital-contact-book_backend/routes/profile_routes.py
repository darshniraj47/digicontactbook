from flask import Blueprint, request, jsonify
import re
from database import get_db_connection
from models.user_model import UserModel
from werkzeug.security import generate_password_hash, check_password_hash

profile_bp = Blueprint('profile', __name__)

def get_current_user_id():
    user_id = request.headers.get('X-User-Id')
    if not user_id:
        user_id = request.args.get('user_id')
    if not user_id and request.is_json:
        data = request.get_json(silent=True) or {}
        user_id = data.get('user_id')
    
    if user_id:
        try:
            return int(user_id)
        except ValueError:
            return None
    return None

def is_valid_email(email):
    pattern = r'^[\w\.-]+@[\w\.-]+\.\w+$'
    return re.match(pattern, email) is not None

@profile_bp.route('/profile', methods=['GET'])
def get_profile():
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({"success": False, "message": "Unauthorized"}), 401

    user = UserModel.get_user_by_id(user_id)
    if not user:
        return jsonify({"success": False, "message": "User not found"}), 404

    return jsonify({"success": True, "user": user}), 200

@profile_bp.route('/profile', methods=['PUT'])
def update_profile():
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({"success": False, "message": "Unauthorized"}), 401

    data = request.get_json() or {}
    name = data.get('name', '').strip()
    email = data.get('email', '').strip().lower()

    if not name or not email:
        return jsonify({"success": False, "message": "Name and email are required."}), 400

    if not is_valid_email(email):
        return jsonify({"success": False, "message": "Please enter a valid email address."}), 400

    connection = get_db_connection()
    if not connection:
        return jsonify({"success": False, "message": "Database connection error."}), 500

    try:
        cursor = connection.cursor(dictionary=True)
        # Check if email taken by another user
        cursor.execute("SELECT id FROM users WHERE email = %s AND id != %s", (email, user_id))
        existing = cursor.fetchone()
        if existing:
            return jsonify({"success": False, "message": "Email is already in use by another account."}), 400

        cursor.execute("UPDATE users SET name = %s, email = %s WHERE id = %s", (name, email, user_id))
        connection.commit()

        updated_user = {"id": user_id, "name": name, "email": email}
        return jsonify({
            "success": True,
            "message": "Profile updated successfully",
            "user": updated_user
        }), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        if connection and connection.is_connected():
            cursor.close()
            connection.close()

@profile_bp.route('/profile/password', methods=['PUT'])
def change_password():
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({"success": False, "message": "Unauthorized"}), 401

    data = request.get_json() or {}
    current_password = data.get('current_password', '')
    new_password = data.get('new_password', '')
    confirm_new_password = data.get('confirm_new_password', '')

    if not current_password or not new_password:
        return jsonify({"success": False, "message": "All password fields are required."}), 400

    if new_password != confirm_new_password:
        return jsonify({"success": False, "message": "New password and confirmation do not match."}), 400

    if len(new_password) < 6:
        return jsonify({"success": False, "message": "New password must be at least 6 characters long."}), 400

    connection = get_db_connection()
    if not connection:
        return jsonify({"success": False, "message": "Database connection error."}), 500

    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT password FROM users WHERE id = %s", (user_id,))
        user = cursor.fetchone()
        if not user or not check_password_hash(user['password'], current_password):
            return jsonify({"success": False, "message": "Incorrect current password."}), 400

        hashed = generate_password_hash(new_password)
        cursor.execute("UPDATE users SET password = %s WHERE id = %s", (hashed, user_id))
        connection.commit()

        return jsonify({"success": True, "message": "Password updated successfully"}), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        if connection and connection.is_connected():
            cursor.close()
            connection.close()

@profile_bp.route('/preferences', methods=['GET'])
def get_preferences():
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({"success": False, "message": "Unauthorized"}), 401

    connection = get_db_connection()
    if not connection:
        return jsonify({"success": False, "message": "Database error"}), 500

    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT default_category, contact_reminders FROM user_preferences WHERE user_id = %s", (user_id,))
        prefs = cursor.fetchone()
        if not prefs:
            prefs = {"default_category": "Other", "contact_reminders": True}
        else:
            prefs["contact_reminders"] = bool(prefs.get("contact_reminders", 1))

        return jsonify({"success": True, "preferences": prefs}), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        if connection and connection.is_connected():
            cursor.close()
            connection.close()

@profile_bp.route('/preferences', methods=['PUT'])
def update_preferences():
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({"success": False, "message": "Unauthorized"}), 401

    data = request.get_json() or {}
    default_category = data.get('default_category', 'Other')
    contact_reminders = 1 if data.get('contact_reminders', True) else 0

    connection = get_db_connection()
    if not connection:
        return jsonify({"success": False, "message": "Database error"}), 500

    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT id FROM user_preferences WHERE user_id = %s", (user_id,))
        existing = cursor.fetchone()
        if existing:
            cursor.execute("""
                UPDATE user_preferences 
                SET default_category = %s, contact_reminders = %s 
                WHERE user_id = %s
            """, (default_category, contact_reminders, user_id))
        else:
            cursor.execute("""
                INSERT INTO user_preferences (user_id, default_category, contact_reminders)
                VALUES (%s, %s, %s)
            """, (user_id, default_category, contact_reminders))
        connection.commit()

        return jsonify({
            "success": True,
            "message": "Preferences saved successfully",
            "preferences": {
                "default_category": default_category,
                "contact_reminders": bool(contact_reminders)
            }
        }), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        if connection and connection.is_connected():
            cursor.close()
            connection.close()

@profile_bp.route('/account', methods=['DELETE'])
def delete_account():
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({"success": False, "message": "Unauthorized"}), 401

    connection = get_db_connection()
    if not connection:
        return jsonify({"success": False, "message": "Database error"}), 500

    try:
        cursor = connection.cursor()
        # Delete user (foreign keys with cascade handle contacts and preferences)
        cursor.execute("DELETE FROM contacts WHERE user_id = %s", (user_id,))
        cursor.execute("DELETE FROM user_preferences WHERE user_id = %s", (user_id,))
        cursor.execute("DELETE FROM users WHERE id = %s", (user_id,))
        connection.commit()

        return jsonify({"success": True, "message": "Account and all associated contacts permanently deleted."}), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        if connection and connection.is_connected():
            cursor.close()
            connection.close()
