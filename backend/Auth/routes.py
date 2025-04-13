from flask import request, Blueprint
from flask_jwt_extended import jwt_required , get_jwt_identity,create_access_token,create_refresh_token,get_jwt
from Database.db_utils import create_student_user,create_teacher_user,authenticate_user
from flask_cors import CORS

auth_bp = Blueprint('auth_bp',__name__,url_prefix = '/auth')

CORS(auth_bp)

@auth_bp.route("/refresh", methods=["POST"])
@jwt_required(refresh=True)
def refresh():
    email = get_jwt_identity()
    access_token = create_access_token(identity=email, fresh=False)
    return {"access_token": access_token}, 200


@auth_bp.route("/register", methods=["POST"])
def register():
        data = request.get_json()
        username = data.get("username")
        password = data.get("password")
        email = data.get("email")
        response = None
        if email:
            response = create_teacher_user(username, password, email)
        if response["message"].startswith("DuplicateKeyError") or response[
            "message"
        ].startswith("OperationFailure"):
            return response, 409

        access_token = create_access_token(identity=response["id"], fresh=True)
        refresh_token = create_refresh_token(identity=response["id"])
        return {
            "message": response["message"],
            "access_token": access_token,
            "refresh_token": refresh_token,
        }

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")
    response = authenticate_user(email, password)
    if response.get("message") == "User authenticated successfully.":
        access_token = create_access_token(identity=response["id"], fresh=True)
        refresh_token = create_refresh_token(identity=response["id"])
        return {
            "message": "Logged in successfully",
            "access_token": access_token,
            "refresh_token": refresh_token,
        }, 200
    else:
        return {"message": "Invalid credentials"}, 401