from flask import Flask, jsonify, Response
from flask_cors import CORS
import pandas as pd
import os
import json
import numpy as np

app = Flask(__name__)
CORS(app)

# --- Data Loading and Preparation ---

# Load datasets from the 'data' subfolder
base_dir = os.path.join(os.path.dirname(__file__), 'data')

def clean_df(df):
    """Replace NaN/infinity with None for JSON compatibility."""
    return df.replace({np.nan: None, np.inf: None, -np.inf: None})

# Load all necessary CSV files into pandas DataFrames
try:
    datasets = {
        'products': clean_df(pd.read_csv(os.path.join(base_dir, 'inventory_items.csv'))),
        'orders': clean_df(pd.read_csv(os.path.join(base_dir, 'orders.csv'))),
        'order_items': clean_df(pd.read_csv(os.path.join(base_dir, 'order_items.csv'))),
        'users': clean_df(pd.read_csv(os.path.join(base_dir, 'users.csv'))),
        'distribution_centers': clean_df(pd.read_csv(os.path.join(base_dir, 'distribution_centers.csv'))),
    }
except FileNotFoundError as e:
    print(f"Error loading CSV files: {e}. Make sure they are in a 'data' subfolder.")
    # Exit or handle gracefully if files are missing
    exit()


# --- Department Data Processing ---

# Create a virtual 'departments' table from unique values in 'product_department'
departments_df = datasets['products'][['product_department']].dropna().drop_duplicates().reset_index(drop=True)
departments_df['id'] = departments_df.index + 1
departments_df.rename(columns={'product_department': 'name'}, inplace=True)

# Create a mapping from department name to the new department_id
dept_map = dict(zip(departments_df['name'], departments_df['id']))
# Add the 'department_id' to the main products DataFrame
datasets['products']['department_id'] = datasets['products']['product_department'].map(dept_map)

# Create a final products DataFrame for the API that includes the department name
products_merged = pd.merge(
    datasets['products'],
    departments_df,
    left_on='department_id',
    right_on='id',
    how='left',
    suffixes=('', '_dept')
)
products_merged.rename(columns={'name': 'department_name'}, inplace=True)

# Calculate product count for each department
product_counts = products_merged.groupby('department_name').size().reset_index(name='product_count')
# Merge the counts into the main departments DataFrame
departments_with_counts = pd.merge(
    departments_df,
    product_counts,
    left_on='name',
    right_on='department_name',
    how='left'
).fillna(0)
# Clean up the final departments DataFrame
departments_with_counts.drop('department_name', axis=1, inplace=True)
departments_with_counts['product_count'] = departments_with_counts['product_count'].astype(int)


# --- Helper Function for API Responses ---

def safe_json_response(data):
    """Convert Python dict/list to a JSON Response, handling potential errors."""
    try:
        json_data = json.dumps(data, allow_nan=False)
        return Response(json_data, mimetype='application/json')
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# --- API Routes ---

@app.route('/')
def index():
    return "Flask backend is running"

# --- Department API Endpoints ---

@app.route('/api/departments', methods=['GET'])
def get_departments():
    """
    GET /api/departments - Lists all departments with their product counts.
    """
    # NEW: Convert DataFrame to list of dicts
    departments_list = departments_with_counts.to_dict(orient='records')
    # NEW: Wrap the list in an object with a 'departments' key
    response_data = {'departments': departments_list}
    return safe_json_response(response_data)


@app.route('/api/departments/<int:department_id>', methods=['GET'])
def get_department_by_id(department_id):
    """
    GET /api/departments/{id} - Gets details for a specific department.
    """
    department_series = departments_with_counts[departments_with_counts['id'] == department_id]
    if department_series.empty:
        return jsonify({'error': 'Department not found'}), 404
    # Convert the single-row DataFrame to a dictionary
    department_dict = department_series.to_dict(orient='records')[0]
    return safe_json_response(department_dict)


@app.route('/api/departments/<int:department_id>/products', methods=['GET'])
def get_products_by_department(department_id):
    """
    GET /api/departments/{id}/products - Gets all products in a specific department.
    """
    # Find the department details first to get the name
    department_series = departments_with_counts[departments_with_counts['id'] == department_id]
    if department_series.empty:
        return jsonify({'error': 'Department not found'}), 404
    
    department_name = department_series.iloc[0]['name']
    
    # Filter products based on the department_id
    department_products_df = products_merged[products_merged['department_id'] == department_id]
    
    # Convert the products DataFrame to a list of dicts
    products_list = department_products_df.head(100).to_dict(orient='records')

    # NEW: Structure the response as requested
    response_data = {
        'department': department_name,
        'products': products_list
    }
    
    return safe_json_response(response_data)


# --- Existing API Endpoints (Unchanged) ---

@app.route('/api/products')
def get_products():
    return safe_json_response(products_merged.head(100).to_dict(orient='records'))

@app.route('/api/orders')
def get_orders():
    return safe_json_response(datasets['orders'].head(100).to_dict(orient='records'))

@app.route('/api/users')
def get_users():
    return safe_json_response(datasets['users'].head(100).to_dict(orient='records'))

@app.route('/api/order-items')
def get_order_items():
    return safe_json_response(datasets['order_items'].head(100).to_dict(orient='records'))

@app.route('/api/distribution-centers')
def get_distribution_centers():
    return safe_json_response(datasets['distribution_centers'].head(100).to_dict(orient='records'))


if __name__ == '__main__':
    app.run(debug=True, port=3001)
