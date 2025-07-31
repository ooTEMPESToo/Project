import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useParams,
  Link,
  NavLink,
} from "react-router-dom";
import axios from "axios";

// --- Reusable Components ---

const Spinner = () => (
  <div style={{ display: "flex", justifyContent: "center", padding: "40px" }}>
    <div
      style={{
        border: "4px solid #f3f3f3",
        borderTop: "4px solid #3498db",
        borderRadius: "50%",
        width: "40px",
        height: "40px",
        animation: "spin 1s linear infinite",
      }}
    ></div>
    <style>{`
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `}</style>
  </div>
);

const ErrorMessage = ({ message }) => (
  <div
    style={{
      color: "#721c24",
      backgroundColor: "#f8d7da",
      border: "1px solid #f5c6cb",
      padding: "15px",
      borderRadius: "5px",
      margin: "20px 0",
    }}
  >
    <strong>Error:</strong> {message}
  </div>
);

// --- Page Components ---

/**
 * Component to display the list of departments in a sidebar.
 */
function DepartmentsList() {
  const [departments, setDepartments] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("http://localhost:3001/api/departments")
      .then((response) => setDepartments(response.data.departments || []))
      .catch((err) => {
        console.error("Error fetching departments:", err);
        setError("Could not load departments.");
      })
      .finally(() => setLoading(false));
  }, []);

  const linkStyle = {
    display: "block",
    padding: "10px 15px",
    textDecoration: "none",
    color: "#333",
    borderRadius: "5px",
    marginBottom: "5px",
  };

  const activeLinkStyle = {
    ...linkStyle,
    backgroundColor: "#007bff",
    color: "white",
    fontWeight: "bold",
  };

  if (loading) return <Spinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <nav>
      <NavLink
        to="/"
        style={({ isActive }) => (isActive ? activeLinkStyle : linkStyle)}
        end // 'end' ensures this only matches the exact root path
      >
        All Products
      </NavLink>
      {departments.map((dept) => (
        <NavLink
          key={dept.id}
          to={`/departments/${dept.id}`}
          style={({ isActive }) => (isActive ? activeLinkStyle : linkStyle)}
        >
          {dept.name} ({dept.product_count})
        </NavLink>
      ))}
    </nav>
  );
}

/**
 * Component to display a grid of products.
 * Includes logic for searching, sorting, and pagination.
 */
function ProductGrid({ products, departmentName }) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");
  const [page, setPage] = useState(0);
  const itemsPerPage = 10;

  // Reset page and search when products change (i.e., department changes)
  useEffect(() => {
    setPage(0);
    setSearch("");
  }, [products]);

  const filteredProducts = products
    .filter((prod) =>
      (prod.product_name || "").toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (!sortKey) return 0;
      const aVal = a[sortKey] || "";
      const bVal = b[sortKey] || "";
      return sortOrder === "asc"
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });

  const paginatedProducts = filteredProducts.slice(
    page * itemsPerPage,
    (page + 1) * itemsPerPage
  );

  const toggleSort = (key) => {
    setSortKey(key);
    setSortOrder(sortKey === key && sortOrder === "asc" ? "desc" : "asc");
  };

  // Styles
  const tableStyle = { width: "100%", borderCollapse: "collapse" };
  const headerStyle = {
    backgroundColor: "#f4f4f4",
    fontWeight: "bold",
    padding: "12px",
    border: "1px solid #ccc",
    cursor: "pointer",
  };
  const rowStyle = {
    border: "1px solid #ccc",
    padding: "10px",
    textAlign: "center",
  };
  const searchStyle = {
    width: "100%",
    boxSizing: "border-box",
    padding: "10px",
    fontSize: "16px",
    marginBottom: "20px",
  };
  const buttonStyle = {
    margin: "10px",
    padding: "8px 16px",
    cursor: "pointer",
  };

  return (
    <div>
      <h2 style={{ marginBottom: "5px" }}>
        {departmentName || "All Products"}
      </h2>
      <p style={{ color: "#666", marginTop: "0", marginBottom: "20px" }}>
        Showing {filteredProducts.length} products
      </p>

      <input
        type="text"
        placeholder="Search within this department..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={searchStyle}
      />

      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={headerStyle} onClick={() => toggleSort("product_id")}>
              ID
            </th>
            <th style={headerStyle} onClick={() => toggleSort("product_name")}>
              Name
            </th>
            <th
              style={headerStyle}
              onClick={() => toggleSort("department_name")}
            >
              Department
            </th>
          </tr>
        </thead>
        <tbody>
          {paginatedProducts.length > 0 ? (
            paginatedProducts.map((prod) => (
              <tr key={prod.id}>
                <td style={rowStyle}>{prod.product_id}</td>
                <td style={rowStyle}>{prod.product_name}</td>
                <td style={rowStyle}>{prod.department_name}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" style={rowStyle}>
                No products found.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <button
          style={buttonStyle}
          onClick={() => setPage((p) => Math.max(p - 1, 0))}
          disabled={page === 0}
        >
          Prev
        </button>
        <span>
          Page {page + 1} of {Math.ceil(filteredProducts.length / itemsPerPage)}
        </span>
        <button
          style={buttonStyle}
          onClick={() =>
            setPage((p) =>
              (p + 1) * itemsPerPage < filteredProducts.length ? p + 1 : p
            )
          }
          disabled={(page + 1) * itemsPerPage >= filteredProducts.length}
        >
          Next
        </button>
      </div>
    </div>
  );
}

/**
 * A smart component that fetches product data based on the URL
 * and then renders the ProductGrid.
 */
function ProductPage() {
  const { departmentId } = useParams(); // Get departmentId from URL
  const [products, setProducts] = useState([]);
  const [departmentName, setDepartmentName] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const url = departmentId
      ? `http://localhost:3001/api/departments/${departmentId}/products`
      : "http://localhost:3001/api/products";

    axios
      .get(url)
      .then((response) => {
        if (departmentId) {
          setProducts(response.data.products || []);
          setDepartmentName(response.data.department || "");
        } else {
          setProducts(response.data || []);
          setDepartmentName(""); // Clear department name for "All Products"
        }
      })
      .catch((err) => {
        console.error("Error fetching products:", err);
        setError("Could not load products for this department.");
      })
      .finally(() => setLoading(false));
  }, [departmentId]); // Refetch whenever the departmentId in the URL changes

  if (loading) return <Spinner />;
  if (error) return <ErrorMessage message={error} />;

  return <ProductGrid products={products} departmentName={departmentName} />;
}

/**
 * The main App component that sets up the layout and routing.
 */
function App() {
  const appStyle = {
    display: "grid",
    gridTemplateColumns: "250px 1fr",
    gap: "20px",
    fontFamily: "Arial, sans-serif",
    padding: "20px",
    maxWidth: "1400px",
    margin: "0 auto",
  };
  const sidebarStyle = {
    borderRight: "1px solid #ccc",
    paddingRight: "20px",
  };

  return (
    <Router>
      <div style={appStyle}>
        <aside style={sidebarStyle}>
          <h1 style={{ marginTop: 0 }}>Departments</h1>
          <DepartmentsList />
        </aside>
        <main>
          <Routes>
            <Route path="/" element={<ProductPage />} />
            <Route
              path="/departments/:departmentId"
              element={<ProductPage />}
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
