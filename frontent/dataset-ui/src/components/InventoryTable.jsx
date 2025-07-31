import React, { useEffect, useState } from "react";

const InventoryTable = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3001/api/products")
      .then((res) => res.json())
      .then((json) => {
        console.log("Fetched Data:", json);
        setData(json);
      })
      .catch((err) => console.error("Error fetching data:", err));
  }, []);

  const tableStyle = {
    width: "90%",
    margin: "30px auto",
    borderCollapse: "collapse",
    fontFamily: "Arial, sans-serif",
  };

  const thStyle = {
    backgroundColor: "#4CAF50",
    color: "white",
    padding: "12px",
    border: "1px solid #ddd",
    textAlign: "left",
  };

  const tdStyle = {
    padding: "10px",
    border: "1px solid #ddd",
  };

  const rowStyle = {
    backgroundColor: "#f9f9f9",
  };

  const headingStyle = {
    textAlign: "center",
    marginTop: "20px",
    fontSize: "26px",
    fontWeight: "bold",
    fontFamily: "Arial, sans-serif",
    color: "#333",
  };

  return (
    <div>
      <h1 style={headingStyle}>Inventory Table</h1>
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>ID</th>
            <th style={thStyle}>Name</th>
            <th style={thStyle}>Quantity</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(data) && data.length > 0 ? (
            data.map((item, index) => (
              <tr key={index} style={index % 2 === 0 ? rowStyle : {}}>
                <td style={tdStyle}>{item.id || item.ID || "N/A"}</td>
                <td style={tdStyle}>
                  {item.name || item.Name || item.title || "No name"}
                </td>
                <td style={tdStyle}>
                  {item.quantity || item.Quantity || "N/A"}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" style={{ ...tdStyle, textAlign: "center" }}>
                No data found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default InventoryTable;
