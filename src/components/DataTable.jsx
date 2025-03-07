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
    date: "",
    trade_code: "",
    high: "",
    low: "",
    open: "",
    close: "",
    volume: "",
  });
  //fetching from backend
  useEffect(() => {
    fetch("https://stock-market-backend-fpzz.onrender.com/stocks") // Assuming My FastAPI server is running locally
      .then((response) => response.json())
      .then((jsonData) => setData(jsonData));
  }, []);

  const handleEdit = (index) => {
    setEditIndex(index);
  };
  //api request for update
  const handleSave = (index) => {
    // PUT request to update stock data
    const updatedStock = data[index];
    fetch(
      `https://stock-market-backend-fpzz.onrender.com/stocks/${updatedStock.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedStock),
      }
    )
      .then((response) => response.json())
      .then((updatedData) => {
        const updatedDataList = [...data];
        updatedDataList[index] = updatedData;
        setData(updatedDataList);
      })
      .catch((error) => console.error("Error updating stock:", error));

    setEditIndex(null);
  };
  //make trade code uneditable
  const handleChange = (e, index, key) => {
    if (key === "trade_code") return;
    const updatedData = [...data];
    updatedData[index][key] = e.target.value;
    setData(updatedData);
  };

  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(parseInt(e.target.value));
    setCurrentPage(1);
  };
  //handle pagination requested by the user
  const totalPages = Math.ceil(data.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentData = data.slice(startIndex, startIndex + rowsPerPage);

  const handleDelete = (index) => {
    setShowDeleteModal(true);
    setDeleteIndex(index);
  };
  //delete api call
  const confirmDelete = () => {
    const stockToDelete = data[deleteIndex];
    fetch(
      `https://stock-market-backend-fpzz.onrender.com/stocks/${stockToDelete.id}`,
      {
        method: "DELETE",
      }
    )
      .then(() => {
        const updatedData = data.filter((_, index) => index !== deleteIndex);
        setData(updatedData);
        setShowDeleteModal(false);
        setDeleteIndex(null);
      })
      .catch((error) => console.error("Error deleting stock:", error));
  };
  //handle cancel request of delete a entry
  const cancelDelete = () => {
    setShowDeleteModal(false);
    setDeleteIndex(null);
  };
  //toogle add new entry between visible and not visible
  const handleAddNew = () => {
    setShowForm(true);
  };

  const handleFormChange = (e) => {
    setNewEntry({ ...newEntry, [e.target.name]: e.target.value });
  };
  //api call of nadd new entry
  const handleFormSubmit = (e) => {
    e.preventDefault();
    fetch("https://stock-market-backend-fpzz.onrender.com/stocks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newEntry),
    })
      .then((response) => response.json())
      .then((addedData) => {
        setData([...data, addedData]);
        setShowForm(false);
        console.log(setNewEntry);
        setNewEntry({
          date: "",
          trade_code: "",
          high: "",
          low: "",
          open: "",
          close: "",
          volume: "",
        });
      })
      .catch((error) => console.error("Error adding stock:", error));
  };

  return (
    <div className="overflow-x-auto">
      <h1 className="text-7xl font-semibold text-center mt-10 text-gray-800 mb-6">
        Trade Data Table
      </h1>

      <div className="mb-6 flex justify-between items-center">
        <label className="text-3xl text-gray-700">Rows per page:</label>
        <select
          value={rowsPerPage}
          onChange={handleRowsPerPageChange}
          className="border border-gray-300 rounded p-2 text-lg"
        >
          <option value={20}>20</option>
          <option value={40}>40</option> {/*  pagination form */}
          <option value={50}>50</option>
          <option value={data.length}>All</option>
        </select>

        <button
          onClick={handleAddNew}
          className="bg-blue-600 text-white py-2 px-4 rounded"
        >
          Insert New Entry
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleFormSubmit}
          className="mb-6 p-4 border rounded-lg shadow"
        >
          {Object.keys(newEntry).map((key) => (
            <div key={key} className="mb-4">
              <label className="block text-lg font-medium mb-2">{key}</label>
              <input
                name={key}
                value={newEntry[key]}
                onChange={handleFormChange}
                className="border border-gray-300 rounded p-2 w-full text-lg"
                required
              />
            </div>
          ))}
          <button
            type="submit"
            className="bg-green-600 text-white py-2 px-4 rounded"
          >
            Submit
          </button>
        </form>
      )}

      <table className="min-w-full border-collapse bg-white shadow-md rounded-lg overflow-hidden">
        <thead>
          <tr className="bg-gray-200">
            {" "}
            {/*table header*/}
            {[
              "Date",
              "Trade Code",
              "High",
              "Low",
              "Open",
              "Close",
              "Volume",
              "ID",
              "Actions",
            ].map((header) => (
              <th
                key={header}
                className="py-2 px-4 text-lg text-gray-600 font-medium text-left border-b"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {currentData.map((row, index) => (
            <tr
              key={index}
              className={`${
                index % 2 === 0 ? "bg-[#f4f8fb]" : "bg-white"
              } hover:bg-[#e0f7fa]`}
            >
              {Object.keys(row).map((key) => (
                <td key={key} className="py-3 px-4">
                  {/*make trade code and id assinged by db uneditable*/}
                  {editIndex === index &&
                  key !== "trade_code" &&
                  key !== "id" ? (
                    <input
                      value={row[key]}
                      onChange={(e) => handleChange(e, index, key)}
                      className="border border-gray-300 rounded p-2 w-full text-lg"
                    />
                  ) : (
                    row[key]
                  )}
                </td>
              ))}
              <td className="py-3 px-4 flex items-center space-x-2">
                {editIndex === index ? (
                  <button
                    onClick={() => handleSave(index)}
                    className="bg-green-500 text-white py-1 px-3 rounded"
                  >
                    Save
                  </button>
                ) : (
                  <button
                    onClick={() => handleEdit(index)}
                    className="bg-blue-500 text-white py-1 px-3 rounded"
                  >
                    Edit
                  </button>
                )}
                <button
                  onClick={() => handleDelete(index)}
                  className="bg-red-500 text-white p-1 rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showDeleteModal /*delet model */ && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <p className="text-xl mb-4">
              Are you sure you want to delete this entry?
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={cancelDelete}
                className="bg-gray-300 px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="bg-red-500 text-white px-4 py-2 rounded"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
