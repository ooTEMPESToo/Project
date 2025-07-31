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

# Load CSVs
datasets = {
    'products': clean_df(pd.read_csv(os.path.join(base_dir, 'inventory_items.csv'))),
    'orders': clean_df(pd.read_csv(os.path.join(base_dir, 'orders.csv'))),
    'order_items': clean_df(pd.read_csv(os.path.join(base_dir, 'order_items.csv'))),
    'users': clean_df(pd.read_csv(os.path.join(base_dir, 'users.csv'))),
    'distribution_centers': clean_df(pd.read_csv(os.path.join(base_dir, 'distribution_centers.csv'))),
}

# Create departments table from unique values in 'product_department'
departments_df = datasets['products'][['product_department']].dropna().drop_duplicates().reset_index(drop=True)
departments_df['id'] = departments_df.index + 1
departments_df.rename(columns={'product_department': 'name'}, inplace=True)

# Map department names to department_id
dept_map = dict(zip(departments_df['name'], departments_df['id']))
datasets['products']['department_id'] = datasets['products']['product_department'].map(dept_map)

# Join department name into products for API
products_merged = pd.merge(
    datasets['products'],
    departments_df,
    left_on='department_id',
    right_on='id',
    how='left',
    suffixes=('', '_dept')
)
products_merged.rename(columns={'name': 'department_name'}, inplace=True)

# Safe JSON response
def safe_json_response(dataframe):
    try:
        data = dataframe.head(100).to_dict(orient='records')
        json_data = json.dumps(data, allow_nan=False)
        return Response(json_data, mimetype='application/json')
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Routes
@app.route('/')
def index():
    return "Flask backend is running"

@app.route('/api/products')
def get_products():
    return safe_json_response(products_merged)

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

# Optional: Get departments directly
@app.route('/api/departments')
def get_departments():
    return safe_json_response(departments_df)

if __name__ == '__main__':
    app.run(debug=True, port=3001)
