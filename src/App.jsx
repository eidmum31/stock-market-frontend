import DataTable from "./components/DataTable";
import Chart from "./components/Chart";
// Apllication Layout Created
const App = () => {
  return (
    <div className="container mx-auto p-3">
      <Chart />
      <DataTable />
    </div>
  );
};

export default App;
