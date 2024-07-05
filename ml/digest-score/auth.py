import os
import jwt
from flask import request, jsonify
from functools import wraps
from datetime import datetime, timedelta

SECRET_KEY = os.getenv('JWT_SECRET')
ADMIN_SECRET_KEY = os.getenv('JWT_ADMIN_SECRET_KEY')

def generate_admin_token():
  expiration_time = datetime.utcnow() + timedelta(minutes=5)
  payload = {
      'role': 'admin',
      'exp': expiration_time
  }

  token = jwt.encode(payload, ADMIN_SECRET_KEY, algorithm="HS256")
  return token


def user_token_required(f):
  @wraps(f)
  def decorated(*args, **kwargs):
    token = None
    if 'Authorization' in request.headers:
      token = request.headers['Authorization'].split(" ")[1]
    if not token:
      return jsonify({'message': 'Token is missing!'}), 401
    try:
      data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
      request.user_id = data['uid']
    except jwt.ExpiredSignatureError:
      return jsonify({'message': 'Token has expired!'}), 401
    except jwt.InvalidTokenError:
      return jsonify({'message': 'Token is invalid!'}), 401
    return f(*args, **kwargs)
  return decorated

def admin_token_required(f):
  @wraps(f)
  def decorated(*args, **kwargs):
    token = None
    if 'Authorization' in request.headers:
      token = request.headers['Authorization'].split(" ")[1]
    if not token:
      return jsonify({'message': 'Token is missing!'}), 401
    try:
      data = jwt.decode(token, ADMIN_SECRET_KEY, algorithms=["HS256"])
      if data['role'] != 'admin':
          return jsonify({'message': 'Admin token required!'}), 403
    except jwt.ExpiredSignatureError:
      return jsonify({'message': 'Token has expired!'}), 401
    except jwt.InvalidTokenError:
      return jsonify({'message': 'Token is invalid!'}), 401
    return f(*args, **kwargs)
  return decorated