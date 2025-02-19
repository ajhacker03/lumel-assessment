import HierarchicalTable from './components/HierarchicalTable'
import { HashRouter } from "react-router-dom"; 

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <HierarchicalTable />
    </div>
  );
}