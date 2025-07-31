import React, { useEffect, useState } from "react";
import axios from "axios";

const tableStyle = {
  width: "90%",
  margin: "20px auto",
  borderCollapse: "collapse",
  fontFamily: "Arial, sans-serif",
};

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
  width: "300px",
  margin: "20px auto",
  display: "block",
  padding: "10px",
  fontSize: "16px",
};

const buttonStyle = {
  margin: "10px",
  padding: "8px 16px",
  fontSize: "14px",
  cursor: "pointer",
};

function InventoryTable() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");
  const [page, setPage] = useState(0);
  const itemsPerPage = 10;

  useEffect(() => {
    axios
      .get("http://localhost:3001/api/products")
      .then((response) => setProducts(response.data))
      .catch((error) => {
        console.error("Error fetching products:", error);
        setProducts([]);
      });
  }, []);

  // Search + Sort Logic
  const filteredProducts = products
    .filter((prod) =>
      prod.product_name.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (!sortKey) return 0;
      const aVal = a[sortKey] || "";
      const bVal = b[sortKey] || "";
      return sortOrder === "asc"
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    });

  const paginatedProducts = filteredProducts.slice(
    page * itemsPerPage,
    (page + 1) * itemsPerPage
  );

  const toggleSort = (key) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  return (
    <div>
      <h2 style={{ textAlign: "center", marginTop: "20px" }}>
        Inventory Table
      </h2>

      <input
        type="text"
        placeholder="Search by product name..."
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
            <th style={headerStyle}>Quantity</th>
            <th
              style={headerStyle}
              onClick={() => toggleSort("department_name")}
            >
              Department
            </th>
          </tr>
        </thead>
        <tbody>
          {paginatedProducts.length === 0 ? (
            <tr>
              <td colSpan="4" style={rowStyle}>
                No data found
              </td>
            </tr>
          ) : (
            paginatedProducts.map((prod, index) => (
              <tr key={index}>
                <td style={rowStyle}>{prod.product_id}</td>
                <td style={rowStyle}>{prod.product_name}</td>
                <td style={rowStyle}>--</td>
                <td style={rowStyle}>{prod.department_name}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Pagination */}
      <div style={{ textAlign: "center" }}>
        <button
          style={buttonStyle}
          onClick={() => setPage((p) => Math.max(p - 1, 0))}
          disabled={page === 0}
        >
          Prev
        </button>
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
        <p>
          Page {page + 1} of {Math.ceil(filteredProducts.length / itemsPerPage)}
        </p>
      </div>
    </div>
  );
}

export default InventoryTable;
