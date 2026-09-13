from flask import Blueprint, request, jsonify
import re
from models.user_model import UserModel

auth_bp = Blueprint('auth', __name__)

def is_valid_email(email):
    pattern = r'^[\w\.-]+@[\w\.-]+\.\w+$'
    return re.match(pattern, email) is not None

@auth_bp.route('/register', methods=['POST'])
def register():
    """
    Handles new user registration.
    Expected JSON: { name, email, password, confirm_password }
    """
    data = request.get_json() or {}
    name = data.get('name', '').strip()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    confirm_password = data.get('confirm_password', '')

    # Validations
    if not name or not email or not password:
        return jsonify({
            "success": False,
            "message": "All required fields (Name, Email, Password) must be filled."
        }), 200

    if not is_valid_email(email):
        return jsonify({
            "success": False,
            "message": "Please enter a valid email address."
        }), 200

    if confirm_password and password != confirm_password:
        return jsonify({
            "success": False,
            "message": "Password and Confirm Password do not match."
        }), 200

    if len(password) < 6:
        return jsonify({
            "success": False,
            "message": "Password should be at least 6 characters long."
        }), 200

    user, error = UserModel.create_user(name, email, password)
    if error:
        return jsonify({
            "success": False,
            "message": error
        }), 200

    return jsonify({
        "success": True,
        "message": "Registration successful! Please login.",
        "user": user
    }), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    """
    Handles user login.
    Expected JSON: { email, password }
    """
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    if not email or not password:
        return jsonify({
            "success": False,
            "message": "Please provide both email and password."
        }), 200

    user = UserModel.get_user_by_email(email)
    if not user:
        return jsonify({
            "success": False,
            "message": "Invalid email or password."
        }), 200

    if not UserModel.verify_password(user['password'], password):
        return jsonify({
            "success": False,
            "message": "Invalid email or password."
        }), 200

    # Return safe user data without password
    safe_user = {
        "id": user['id'],
        "name": user['name'],
        "email": user['email']
    }

    return jsonify({
        "success": True,
        "message": "Login successful!",
        "user": safe_user
    }), 200
