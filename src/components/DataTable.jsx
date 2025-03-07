import React from "react";
import { useEffect, useState } from "react";

const DataTable = () => {
  const [data, setData] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [newEntry, setNewEntry] = useState({
    Date: "",
    "Trade Code": "",
    High: "",
    Low: "",
    Open: "",
    Close: "",
    Volume: "",
  });
  useEffect(() => {
    fetch("stock_market_data.json")
      .then((response) => response.json())
      .then((jsonData) => setData(jsonData));
  }, []);
  return <div></div>;
};

export default DataTable;
