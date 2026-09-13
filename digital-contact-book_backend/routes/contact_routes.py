from flask import Blueprint, request, jsonify, Response
import re
import csv
import io
from models.contact_model import ContactModel

contact_bp = Blueprint('contacts', __name__)

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
    if not email:
        return True
    pattern = r'^[\w\.-]+@[\w\.-]+\.\w+$'
    return re.match(pattern, email) is not None

def is_valid_phone(phone):
    pattern = r'^[+0-9\s\-()]{7,20}$'
    return re.match(pattern, phone) is not None

@contact_bp.route('', methods=['GET'])
@contact_bp.route('/', methods=['GET'])
def get_contacts():
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({"success": False, "message": "Unauthorized"}), 401

    search = request.args.get('search', '').strip()
    category = request.args.get('category', '').strip()
    favorites_only = request.args.get('favorites_only', 'false').lower() == 'true'

    contacts = ContactModel.get_all_contacts(
        user_id=user_id,
        search_query=search if search else None,
        category=category if category else None,
        favorites_only=favorites_only
    )

    return jsonify({"success": True, "count": len(contacts), "contacts": contacts}), 200

@contact_bp.route('/export', methods=['GET'])
def export_contacts():
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({"success": False, "message": "Unauthorized"}), 401

    contacts = ContactModel.get_all_contacts(user_id=user_id)
    
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(['Name', 'Phone', 'Email', 'Address', 'Category', 'Favorite', 'Created Date'])
    
    for c in contacts:
        writer.writerow([
            c.get('name', ''),
            c.get('phone', ''),
            c.get('email', '') or '',
            c.get('address', '') or '',
            c.get('category', 'Other'),
            'Yes' if c.get('is_favorite') else 'No',
            c.get('created_at', '')
        ])
    
    output.seek(0)
    return Response(
        output.getvalue(),
        mimetype="text/csv",
        headers={"Content-Disposition": "attachment;filename=contacts_export.csv"}
    )

@contact_bp.route('/<int:contact_id>', methods=['GET'])
def get_contact(contact_id):
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({"success": False, "message": "Unauthorized"}), 401

    contact = ContactModel.get_contact_by_id(contact_id, user_id)
    if not contact:
        return jsonify({"success": False, "message": "Contact not found"}), 404

    return jsonify({"success": True, "contact": contact}), 200

@contact_bp.route('', methods=['POST'])
@contact_bp.route('/', methods=['POST'])
def add_contact():
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({"success": False, "message": "Unauthorized"}), 401

    data = request.get_json() or {}
    name = data.get('name', '').strip()
    phone = data.get('phone', '').strip()
    email = data.get('email', '').strip()
    address = data.get('address', '').strip()
    category = data.get('category', 'Other').strip()
    is_favorite = bool(data.get('is_favorite', False))

    if not name or not phone:
        return jsonify({"success": False, "message": "Name and phone number are required."}), 400

    if not is_valid_phone(phone):
        return jsonify({"success": False, "message": "Please enter a valid phone number."}), 400

    if email and not is_valid_email(email):
        return jsonify({"success": False, "message": "Please enter a valid email address."}), 400

    valid_categories = ['Family', 'Friends', 'College', 'Work', 'Other']
    if category not in valid_categories:
        category = 'Other'

    contact, error = ContactModel.create_contact(
        user_id=user_id,
        name=name,
        phone=phone,
        email=email if email else None,
        address=address if address else None,
        category=category,
        is_favorite=is_favorite
    )

    if error:
        return jsonify({"success": False, "message": error}), 500

    return jsonify({"success": True, "message": "Contact added successfully", "contact": contact}), 201

@contact_bp.route('/<int:contact_id>', methods=['PUT'])
def update_contact(contact_id):
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({"success": False, "message": "Unauthorized"}), 401

    data = request.get_json() or {}
    name = data.get('name', '').strip()
    phone = data.get('phone', '').strip()
    email = data.get('email', '').strip()
    address = data.get('address', '').strip()
    category = data.get('category', 'Other').strip()

    if not name or not phone:
        return jsonify({"success": False, "message": "Name and phone number are required."}), 400

    if not is_valid_phone(phone):
        return jsonify({"success": False, "message": "Please enter a valid phone number."}), 400

    if email and not is_valid_email(email):
        return jsonify({"success": False, "message": "Please enter a valid email address."}), 400

    valid_categories = ['Family', 'Friends', 'College', 'Work', 'Other']
    if category not in valid_categories:
        category = 'Other'

    success, error = ContactModel.update_contact(
        contact_id=contact_id,
        user_id=user_id,
        name=name,
        phone=phone,
        email=email if email else None,
        address=address if address else None,
        category=category
    )

    if error:
        return jsonify({"success": False, "message": error}), 500

    return jsonify({"success": True, "message": "Contact updated successfully"}), 200

@contact_bp.route('/<int:contact_id>/favorite', methods=['PUT'])
def toggle_favorite(contact_id):
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({"success": False, "message": "Unauthorized"}), 401

    new_status, error = ContactModel.toggle_favorite(contact_id, user_id)
    if error:
        return jsonify({"success": False, "message": error}), 404

    return jsonify({
        "success": True,
        "message": "Favorite status updated successfully",
        "is_favorite": new_status
    }), 200

@contact_bp.route('/<int:contact_id>', methods=['DELETE'])
def delete_contact(contact_id):
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({"success": False, "message": "Unauthorized"}), 401

    success, error = ContactModel.delete_contact(contact_id, user_id)
    if error:
        return jsonify({"success": False, "message": error}), 404

    return jsonify({"success": True, "message": "Contact deleted successfully"}), 200
