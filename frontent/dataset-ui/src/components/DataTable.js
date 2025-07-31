import React, { useEffect, useState } from "react";
import axios from "axios";

const DataTable = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:3001/api/products") // Replace with your Flask API
      .then((res) => {
        console.log("API Response:", res.data);
        setData(res.data.data); // <<✅ key fix: access inner array
      })
      .catch((err) => {
        console.error("Error fetching data:", err);
      });
  }, []);

  if (!Array.isArray(data)) {
    return <div className="text-red-500">Invalid data</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Fetched Data</h1>
      <table className="w-full border border-collapse border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-4 py-2">ID</th>
            <th className="border px-4 py-2">Name</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.id}>
              <td className="border px-4 py-2">{item.id}</td>
              <td className="border px-4 py-2">{item.name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
