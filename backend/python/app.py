from flask import Flask, jsonify, Response
from flask_cors import CORS
import pandas as pd
import os
import json
import numpy as np

app = Flask(__name__)
CORS(app)

# Load datasets
base_dir = os.path.join(os.path.dirname(__file__), 'data')

def clean_df(df):
    return df.replace({np.nan: None, np.inf: None, -np.inf: None})

datasets = {
    'products': clean_df(pd.read_csv(os.path.join(base_dir, 'inventory_items.csv'))),
    'orders': clean_df(pd.read_csv(os.path.join(base_dir, 'orders.csv'))),
    'order_items': clean_df(pd.read_csv(os.path.join(base_dir, 'order_items.csv'))),
    'users': clean_df(pd.read_csv(os.path.join(base_dir, 'users.csv'))),
    'distribution_centers': clean_df(pd.read_csv(os.path.join(base_dir, 'distribution_centers.csv'))),
}

# Safe JSON response
def safe_json_response(dataframe):
    try:
        data = dataframe.head(100).to_dict(orient='records')
        json_data = json.dumps(data, allow_nan=False)
        return Response(json_data, mimetype='application/json')
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/')
def index():
    return "Flask backend is running"

@app.route('/api/products')
def get_products():
    return safe_json_response(datasets['products'])

@app.route('/api/orders')
def get_orders():
    return safe_json_response(datasets['orders'])

@app.route('/api/users')
def get_users():
    return safe_json_response(datasets['users'])

@app.route('/api/order-items')
def get_order_items():
    return safe_json_response(datasets['order_items'])

@app.route('/api/distribution-centers')
def get_distribution_centers():
    return safe_json_response(datasets['distribution_centers'])

if __name__ == '__main__':
    app.run(debug=True, port=3001)
