import React, { useEffect, useState } from "react";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

const App = () => {
  const [data, setData] = useState([]);
  const [selectedTradeCode, setSelectedTradeCode] = useState("");
  const [chartInstance, setChartInstance] = useState(null);
  const [pieChartInstance, setPieChartInstance] = useState(null);

  // Fetch all the stocks from db
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "https://stock-market-backend-fpzz.onrender.com/stocks"
        );
        const jsonData = await response.json();
        setData(jsonData);

        // Set initial trade code
        const initialTradeCode = jsonData[0]?.trade_code;
        setSelectedTradeCode(initialTradeCode);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!data.length || !selectedTradeCode) return;

    const filteredData = data
      .filter((item) => item.trade_code === selectedTradeCode)
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    const labels = filteredData.map((item) => item.date);
    const closeValues = filteredData.map((item) => parseFloat(item.close));
    const volumeValues = filteredData.map((item) =>
      parseFloat(item.volume.replace(/,/g, ""))
    );

    const priceChanges = filteredData.map((item, index) => {
      if (index === 0) return "No Change";
      const prevClose = parseFloat(filteredData[index - 1].close);
      const currentClose = parseFloat(item.close);
      if (currentClose > prevClose) return "Increase";
      if (currentClose < prevClose) return "Decrease";
      return "No Change";
    });

    const priceChangeCounts = {
      Increase: priceChanges.filter((change) => change === "Increase").length,
      Decrease: priceChanges.filter((change) => change === "Decrease").length,
      "No Change": priceChanges.filter((change) => change === "No Change")
        .length,
    };

    if (chartInstance) chartInstance.destroy();
    if (pieChartInstance) pieChartInstance.destroy();

    const ctx = document.getElementById("myChart").getContext("2d");
    const newChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            type: "line",
            label: "Close Price",
            data: closeValues,
            borderColor: "#1D4ED8",
            borderWidth: 3,
            tension: 0.4,
            yAxisID: "y",
            fill: false,
          },
          {
            type: "bar",
            label: "Volume",
            data: volumeValues,
            backgroundColor: "rgba(75, 192, 192, 0.6)",
            yAxisID: "y1",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            position: "left",
            title: {
              display: true,
              text: "Close Price (USD)",
            },
          },
          y1: {
            position: "right",
            title: {
              display: true,
              text: "Volume",
            },
            grid: {
              drawOnChartArea: false,
            },
          },
        },
      },
    });
    setChartInstance(newChart);

    const pieCtx = document
      .getElementById("priceChangePieChart")
      .getContext("2d");
    const newPieChart = new Chart(pieCtx, {
      type: "pie",
      data: {
        labels: ["Increase", "Decrease", "No Change"],
        datasets: [
          {
            data: [
              priceChangeCounts.Increase,
              priceChangeCounts.Decrease,
              priceChangeCounts["No Change"],
            ],
            backgroundColor: ["#36A2EB", "#FF6384", "#FFCE56"],
            hoverOffset: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
      },
    });
    setPieChartInstance(newPieChart);
  }, [data, selectedTradeCode]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6 space-y-8">
      <h1 className="text-5xl font-extrabold text-gray-900 mb-6">
        Select Trade Code
      </h1>

      <select
        value={selectedTradeCode}
        onChange={(e) => setSelectedTradeCode(e.target.value)}
        className="px-6 py-3 rounded-lg border-2 border-gray-300 focus:ring-4 focus:ring-blue-500 text-gray-800 bg-white w-full max-w-lg"
      >
        {[...new Set(data.map((item) => item.trade_code))].map((code) => (
          <option key={code} value={code}>
            {code}
          </option>
        ))}
      </select>

      <div className="flex flex-col md:flex-row w-full max-w-6xl space-y-8 md:space-y-0 md:space-x-8">
        <div className="flex-1 bg-white shadow-lg rounded-lg p-6 h-96">
          <canvas id="myChart"></canvas>
        </div>
        <div className="flex-1 bg-white shadow-lg rounded-lg p-6 h-96">
          <canvas id="priceChangePieChart"></canvas>
        </div>
      </div>
    </div>
  );
};

export default App;
