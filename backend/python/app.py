from flask import Flask, jsonify
from flask_cors import CORS
import pandas as pd
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend calls

# Load datasets
base_dir = os.path.join(os.path.dirname(__file__), 'data')

datasets = {
    'products': pd.read_csv(os.path.join(base_dir, 'inventory_items.csv')),
    'orders': pd.read_csv(os.path.join(base_dir, 'orders.csv')),
    'order_items': pd.read_csv(os.path.join(base_dir, 'order_items.csv')),
    'users': pd.read_csv(os.path.join(base_dir, 'users.csv')),
    'distribution_centers': pd.read_csv(os.path.join(base_dir, 'distribution_centers.csv')),
}

# Routes
@app.route('/')
def index():
    return "Flask backend is running"

@app.route('/api/products')
def get_products():
    return jsonify(datasets['products'].head(100).to_dict(orient='records'))

@app.route('/api/orders')
def get_orders():
    return jsonify(datasets['orders'].head(100).to_dict(orient='records'))

@app.route('/api/users')
def get_users():
    return jsonify(datasets['users'].head(100).to_dict(orient='records'))

@app.route('/api/order-items')
def get_order_items():
    return jsonify(datasets['order_items'].head(100).to_dict(orient='records'))

@app.route('/api/distribution-centers')
def get_distribution_centers():
    return jsonify(datasets['distribution_centers'].head(100).to_dict(orient='records'))

if __name__ == '__main__':
    app.run(debug=True, port=3001)
