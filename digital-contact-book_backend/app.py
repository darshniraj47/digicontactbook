from flask import Flask, jsonify
from flask_cors import CORS
from database import test_db_connection
from routes.auth_routes import auth_bp
from routes.contact_routes import contact_bp
from routes.profile_routes import profile_bp

# Initialize Flask application
app = Flask(__name__)

# Configure Cross-Origin Resource Sharing (CORS)
CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)

# Register Blueprints for modular route management
app.register_blueprint(auth_bp, url_prefix='/api')
app.register_blueprint(contact_bp, url_prefix='/api/contacts')
app.register_blueprint(profile_bp, url_prefix='/api')

@app.route('/', methods=['GET'])
def index():
    return jsonify({
        "success": True,
        "message": "Welcome to Digital Contact Book Backend API",
        "version": "1.0.0"
    }), 200

# Error Handlers
@app.errorhandler(404)
def not_found_error(error):
    return jsonify({
        "success": False,
        "message": "The requested resource or endpoint was not found"
    }), 404

@app.errorhandler(500)
def internal_server_error(error):
    return jsonify({
        "success": False,
        "message": "An internal server error occurred. Please check server logs."
    }), 500

if __name__ == '__main__':
    print("==================================================")
    print(" DIGITAL CONTACT BOOK - FLASK BACKEND SERVER")
    print("==================================================")
    test_db_connection()
    print(" Backend running at: http://localhost:5000")
    print("==================================================")
    app.run(host='0.0.0.0', port=5000, debug=True)
